import { useRef, useState } from "react";
import { Avatar, CircularProgress } from "@mui/material";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FloatingCard from "../../card/FloatingCard";
import ImageCropper from "./ImageCropper";
import Button from "../../form/Buttons";

const MAX_SIZE_MB = 2;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Circular avatar with a hover overlay.
 *
 * - mode="edit" (default): hover shows a camera icon + "Change". Clicking
 *   opens the file picker directly; a valid selection opens a crop/zoom
 *   step (drag to pan, slider to zoom) in a centered FloatingCard.
 *   Confirming crops the image client-side and calls onUpload(croppedFile).
 *
 * - mode="view": read-only entry point. Hover shows an eye icon + "View".
 *   Clicking opens a centered FloatingCard with the photo shown large,
 *   and "Edit" / "Change" buttons underneath:
 *     - "Edit" re-opens the crop/zoom step on the CURRENT photo (no new
 *       upload needed) and calls onUpload(croppedFile) when confirmed.
 *     - "Change" opens the file picker to pick a brand new photo, then
 *       drops into the same crop/zoom step before calling onUpload.
 *   An optional onView() callback still fires (e.g. for analytics) when
 *   the viewer opens.
 */
export default function AvatarUpload({
  currentUrl,
  name = "",
  onUpload,
  onView,
  uploading = false,
  size = 96,
  mode = "edit",
}) {
  const inputRef = useRef(null);
  const cropperGetterRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [pendingFile, setPendingFile] = useState(null); // raw file awaiting crop
  const [cropping, setCropping] = useState(false);
  const [editingCurrent, setEditingCurrent] = useState(false); // re-cropping existing photo
  const [viewing, setViewing] = useState(false); // "view" mode photo viewer card
  const [saveError, setSaveError] = useState("");

  const isView = mode === "view";
  const displayUrl = preview ?? currentUrl;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const resetCropState = () => {
    setCropping(false);
    setPendingFile(null);
    setEditingCurrent(false);
    setSaveError("");
    cropperGetterRef.current = null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setValidationError("JPG, PNG, or WEBP only.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setValidationError(`Must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    cropperGetterRef.current = null;
    setPendingFile(file);
    setEditingCurrent(false);
    setSaveError("");
    setViewing(false);
    setCropping(true);

    // Allow re-selecting the same file later (e.g. after a cancelled crop)
    e.target.value = "";
  };

  const handleClick = () => {
    if (isView) {
      setViewing(true);
      onView?.();
    } else {
      inputRef.current?.click();
    }
  };

  const handleChangeClick = () => {
    inputRef.current?.click();
  };

  const handleEditClick = () => {
    setViewing(false);
    setEditingCurrent(true);
    setSaveError("");
    setCropping(true);
  };

  const handleCancelCrop = () => {
    resetCropState();
    // Came from the photo viewer (Edit or Change) — go back to it instead
    // of closing everything.
    if (isView) setViewing(true);
  };

  const handleConfirmCrop = async () => {
    if (!cropperGetterRef.current) return;
    setSaveError("");
    const croppedFile = await cropperGetterRef.current();
    if (!croppedFile) {
      // Most common cause: re-cropping an existing photo (Edit) whose URL
      // doesn't send CORS headers, so the browser won't let us read the
      // canvas back out. Uploading a fresh file (Change) always works.
      setSaveError(
        editingCurrent
          ? "Couldn't save this edit. Try \"Change\" to upload a new photo instead."
          : "Couldn't save this photo. Please try again."
      );
      return;
    }
    setPreview(URL.createObjectURL(croppedFile));
    onUpload?.(croppedFile);
    resetCropState();
    if (isView) setViewing(true);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        aria-label={isView ? "View profile photo" : "Change profile photo"}
        className="group relative rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
        style={{ width: size, height: size }}
      >
        <Avatar
          src={displayUrl || undefined}
          sx={{
            width: size,
            height: size,
            fontSize: size / 2.5,
            fontWeight: 600,
          }}
          className="ring-4! ring-white! dark:ring-slate-800! shadow-md! transition-transform duration-200 group-hover:scale-[1.03]"
        >
          {!displayUrl && initials}
        </Avatar>

        {/* Hover / uploading overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity duration-200 ${
            uploading
              ? "opacity-100 bg-black/50"
              : "opacity-0 group-hover:opacity-100 bg-black/40"
          }`}
        >
          {uploading ? (
            <CircularProgress size={size / 3.2} sx={{ color: "white" }} />
          ) : (
            <div className="flex flex-col items-center gap-0.5 text-white">
              {isView ? (
                <VisibilityOutlinedIcon sx={{ fontSize: size / 4 }} />
              ) : (
                <CameraAltOutlinedIcon sx={{ fontSize: size / 4 }} />
              )}
              <span className="text-[10px] font-medium">
                {isView ? "View" : "Change"}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Hidden file input — used directly in edit mode, and via the
          "Change" button inside the view-mode photo viewer. */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />

      {!isView && validationError && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {validationError}
        </p>
      )}

      {/* View-mode photo viewer: large centered photo with Edit / Change
          actions underneath. */}
      {isView && (
        <FloatingCard
          open={viewing}
          onClose={() => setViewing(false)}
          position="center"
          title="Profile Photo"
          maxWidth="max-w-sm"
          padding="p-6"
          footer={
            <div className="flex justify-end gap-2">
              {displayUrl && (
                <Button
                  label="Edit"
                  actionColor="default"
                  onClick={handleEditClick}
                />
              )}
              <Button
                label="Change"
                actionColor="save"
                onClick={handleChangeClick}
              />
            </div>
          }
        >
          <div className="flex flex-col items-center gap-3">
            <Avatar
              src={displayUrl || undefined}
              sx={{
                width: 220,
                height: 220,
                fontSize: 220 / 2.5,
                fontWeight: 600,
              }}
              className="ring-4! ring-white! dark:ring-slate-800! shadow-md!"
            >
              {!displayUrl && initials}
            </Avatar>

            {validationError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {validationError}
              </p>
            )}
          </div>
        </FloatingCard>
      )}

      {/* Crop/zoom step — reused for both a freshly picked file (Change)
          and re-cropping the current photo (Edit). */}
      <FloatingCard
        open={cropping}
        onClose={handleCancelCrop}
        position="center"
        title="Adjust Photo"
        maxWidth="max-w-sm"
        padding="p-6"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              actionColor="default"
              onClick={handleCancelCrop}
            />
            <Button label="Save" actionColor="save" onClick={handleConfirmCrop} />
          </div>
        }
      >
        <div className="flex flex-col items-center gap-3">
          {cropping && (pendingFile || editingCurrent) && (
            <ImageCropper
              file={editingCurrent ? undefined : pendingFile}
              imageUrl={editingCurrent ? currentUrl : undefined}
              onReady={(getCroppedFile) => {
                cropperGetterRef.current = getCroppedFile;
              }}
            />
          )}
          {saveError && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center">
              {saveError}
            </p>
          )}
        </div>
      </FloatingCard>
    </div>
  );
}