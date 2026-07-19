import { useState, useRef, useCallback, useEffect } from "react";

const STAGE = 260; // preview size in px (square)
const OUTPUT = 512; // exported image size in px (square)
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

/**
 * Circular crop + zoom editor for an image. Drag to pan, use the slider
 * (or scroll/pinch) to zoom. Doesn't render its own buttons — drop it in a
 * panel/card and wire up Cancel/Save separately, calling the
 * `getCroppedFile` function this hands back via `onReady` once the image
 * has loaded.
 *
 * Give it ONE of:
 * - `file`: a freshly-picked File (e.g. from an <input type="file">)
 * - `imageUrl`: an existing image URL to re-crop (e.g. the current avatar)
 *
 * <ImageCropper
 *   file={selectedFile}
 *   onReady={(getCroppedFile) => (cropperRef.current = getCroppedFile)}
 * />
 *
 * getCroppedFile() returns a Promise<File|null> — a square JPEG cropped to
 * whatever's inside the circle, sized OUTPUTxOUTPUT px. It resolves null
 * if the crop couldn't be read out (see the `imageUrl` caveat below).
 *
 * Caveat with `imageUrl`: reading pixels back out of a cross-origin image
 * requires that image to be served with permissive CORS headers. We set
 * crossOrigin="anonymous" on the <img> so this succeeds whenever the host
 * allows it; if the host does NOT send CORS headers, the browser will
 * still display the image (so the user can pan/zoom) but the canvas
 * export will fail (browsers block reading "tainted" canvases). Same-
 * origin avatar URLs are unaffected either way. If export fails, `onReady`
 * still fires but the resulting `getCroppedFile()` resolves null — callers
 * should treat a null result as "couldn't re-crop this image" and fall
 * back to asking the user to use "Change" instead.
 */
export default function ImageCropper({ file, imageUrl, onReady }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [naturalSize, setNaturalSize] = useState(null); // { w, h }
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const dragState = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    setNaturalSize(null);
    setZoom(MIN_ZOOM);

    if (file) {
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      return () => URL.revokeObjectURL(url);
    }
    if (imageUrl) {
      setImgSrc(imageUrl);
    }
  }, [file, imageUrl]);

  const coverScale = naturalSize
    ? Math.max(STAGE / naturalSize.w, STAGE / naturalSize.h)
    : 1;
  const displayWidth = naturalSize ? naturalSize.w * coverScale * zoom : STAGE;
  const displayHeight = naturalSize
    ? naturalSize.h * coverScale * zoom
    : STAGE;

  const clamp = useCallback(
    (left, top, dw = displayWidth, dh = displayHeight) => {
      const minLeft = Math.min(STAGE - dw, 0);
      const minTop = Math.min(STAGE - dh, 0);
      return {
        left: Math.min(0, Math.max(minLeft, left)),
        top: Math.min(0, Math.max(minTop, top)),
      };
    },
    [displayWidth, displayHeight]
  );

  const getCroppedFile = useCallback(() => {
    return new Promise((resolve) => {
      if (!imgRef.current || !naturalSize) {
        resolve(null);
        return;
      }
      const scaleFactor = displayWidth / naturalSize.w;
      const sourceX = -pos.left / scaleFactor;
      const sourceY = -pos.top / scaleFactor;
      const sourceSize = STAGE / scaleFactor;

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT;
      canvas.height = OUTPUT;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        imgRef.current,
        sourceX,
        sourceY,
        sourceSize,
        sourceSize,
        0,
        0,
        OUTPUT,
        OUTPUT
      );
      try {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(null);
              return;
            }
            resolve(
              new File([blob], file?.name || "avatar.jpg", {
                type: "image/jpeg",
              })
            );
          },
          "image/jpeg",
          0.92
        );
      } catch {
        // Tainted canvas (cross-origin image without CORS headers) — caller
        // should treat a null result as "couldn't re-crop this image".
        resolve(null);
      }
    });
  }, [displayWidth, naturalSize, pos, file]);

  const handleImgLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    setNaturalSize({ w, h });
    const cover = Math.max(STAGE / w, STAGE / h);
    const dw = w * cover;
    const dh = h * cover;
    setPos({ left: (STAGE - dw) / 2, top: (STAGE - dh) / 2 });
  };

  // Let the parent grab the crop function once it exists / whenever it changes.
  useEffect(() => {
    if (naturalSize) onReady?.(getCroppedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naturalSize, getCroppedFile]);

  // Re-clamp the pan position whenever zoom changes size.
  useEffect(() => {
    setPos((p) => clamp(p.left, p.top));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const handlePointerDown = (e) => {
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      left: pos.left,
      top: pos.top,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos(clamp(dragState.current.left + dx, dragState.current.top + dy));
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="relative overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 cursor-grab active:cursor-grabbing touch-none select-none"
        style={{ width: STAGE, height: STAGE }}
      >
        {imgSrc && (
          <img
            ref={imgRef}
            src={imgSrc}
            alt="Crop preview"
            onLoad={handleImgLoad}
            draggable={false}
            crossOrigin="anonymous"
            className="absolute pointer-events-none max-w-none"
            style={{
              left: pos.left,
              top: pos.top,
              width: displayWidth,
              height: displayHeight,
            }}
          />
        )}
      </div>

      <div className="flex w-full max-w-65 items-center gap-3">
        <span className="text-xs text-slate-400 dark:text-slate-500">−</span>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full accent-indigo-600"
          aria-label="Zoom"
        />
        <span className="text-xs text-slate-400 dark:text-slate-500">+</span>
      </div>
    </div>
  );
}