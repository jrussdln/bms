import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// Positional classes only ever set inset (top/left/right/bottom) — never
// `transform`. The transform (centering translate + enter/exit animation)
// is computed as one combined value in `getTransform`, applied via inline
// style. Stacking separate Tailwind translate-x / translate-y / scale
// classes for this would fight over the same `transform` property and
// silently clobber each other depending on generated CSS order.
const POSITION_CLASSES = {
  center: "top-1/2 left-1/2",
  bottom: "bottom-4 left-1/2",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  top: "top-4 left-1/2",
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
};

const EDGE_MARGIN = 12; // min gap kept from the viewport edge
const ANCHOR_GAP = 8; // gap between the anchor element and the card
const DEFAULT_ANCHORED_WIDTH = 320;
const ENTER_OFFSET = 12; // px the card travels in from during enter/exit

function getTransform(position, visible) {
  switch (position) {
    case "center":
      return `translate(-50%, -50%) scale(${visible ? 1 : 0.95})`;
    case "bottom":
      return `translate(-50%, ${visible ? 0 : ENTER_OFFSET}px)`;
    case "top":
      return `translate(-50%, ${visible ? 0 : -ENTER_OFFSET}px)`;
    case "bottom-right":
    case "bottom-left":
      return `translateY(${visible ? 0 : ENTER_OFFSET}px)`;
    case "top-right":
    case "top-left":
      return `translateY(${visible ? 0 : -ENTER_OFFSET}px)`;
    default:
      return undefined;
  }
}

/**
 * Elevated card that floats above page content, e.g. a pinned summary bar,
 * a "new data available" prompt, a quick-action panel, or a popover anchored
 * to whatever button/element the user clicked.
 *
 * Anchored to a click (recommended for popovers/edit panels):
 * <FloatingCard anchorRef={editButtonRef} open={open} onClose={...}>
 *   ...
 * </FloatingCard>
 * Pass a ref on the element that was clicked (e.g. the edit button). The
 * card measures itself and the anchor, then places itself just below (or
 * above, if there isn't room) and centered on that element, clamped so it
 * never runs off-screen. It repositions on scroll/resize while open.
 *
 * Fixed-corner / centered (no anchor, e.g. a pinned summary bar or a modal):
 * <FloatingCard title="This Month" onClose={() => setOpen(false)}>
 *   <p className="text-sm text-slate-600 dark:text-slate-300">
 *     You're on track to save ₱4,200 this month.
 *   </p>
 * </FloatingCard>
 *
 * - `anchorRef`: a ref to the DOM element the card should appear next to.
 *   When provided, this takes priority over `position`.
 * - `open` (default true) controls mount + enter/exit transition. Pass a
 *   state variable here so closing animates out instead of vanishing.
 * - `position` (used only without `anchorRef`): "center" | "bottom" |
 *   "bottom-right" | "bottom-left" | "top" | "top-right" | "top-left".
 *   Defaults to "bottom". "center" behaves like a modal, dead-center of
 *   the viewport.
 * - `onClose`, if provided, renders a small dismiss button in the header,
 *   and (when `backdrop` is on) is also called when the backdrop is clicked.
 * - `title` / `action`: quick default header — title text plus an optional
 *   element (button, badge, etc.) next to it. Ignored if `header` is passed.
 * - `header`: full custom replacement for the header row (overrides
 *   `title`/`action`/`onClose`'s default layout — include your own close
 *   button in here if you need one). Has its own fixed padding and a
 *   bottom border, independent of `padding`.
 * - `footer`: optional content pinned below the body, e.g. action buttons.
 *   Has its own fixed padding and a top border, independent of `padding`.
 * - `padding` (default "p-4"): Tailwind padding class for the **body only**
 *   (the `children` content) — does not affect header/footer padding, which
 *   is fixed so those regions stay compact. Bump this (e.g. "p-6" or "p-8")
 *   when the body content needs more breathing room, like a large avatar.
 * - `elevated` (default true) adds a stronger shadow suited to floating
 *   above content; set false for a flatter look on busy backgrounds.
 * - `maxWidth` (default "max-w-sm", ignored when `anchorRef` is set): Tailwind
 *   max-width class for the card. Widen this (e.g. "max-w-md") to match
 *   larger content so it isn't cramped against the edges.
 * - `backdrop` (default true) dims and slightly blurs the page behind the
 *   card while it's open, fading in/out together with the card, so the
 *   card's content stays the visual focus. Clicking the backdrop calls
 *   `onClose` if provided. Set false for lightweight, non-modal anchored
 *   popovers where the rest of the page should stay crisp and interactive.
 */
export default function FloatingCard({
  title,
  action,
  onClose,
  header,
  footer,
  children,
  position = "bottom",
  anchorRef,
  elevated = true,
  className = "",
  padding = "p-4",
  maxWidth = "max-w-sm",
  open = true,
  backdrop = true,
}) {
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState(null);

  const isAnchored = Boolean(anchorRef);

  const updateCoords = useCallback(() => {
    if (!anchorRef?.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const panelRect = panelRef.current?.getBoundingClientRect();
    const width = Math.min(
      panelRect?.width || DEFAULT_ANCHORED_WIDTH,
      window.innerWidth - EDGE_MARGIN * 2
    );
    const height = panelRect?.height || 0;

    let left = anchorRect.left + anchorRect.width / 2 - width / 2;
    left = Math.min(
      Math.max(left, EDGE_MARGIN),
      window.innerWidth - width - EDGE_MARGIN
    );

    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const placeAbove =
      spaceBelow < height + ANCHOR_GAP && anchorRect.top > height + ANCHOR_GAP;

    let top = placeAbove
      ? anchorRect.top - height - ANCHOR_GAP
      : anchorRect.bottom + ANCHOR_GAP;
    top = Math.min(
      Math.max(top, EDGE_MARGIN),
      Math.max(window.innerHeight - height - EDGE_MARGIN, EDGE_MARGIN)
    );

    setCoords({ top, left, width });
  }, [anchorRef]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timeout = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timeout);
  }, [open]);

  // Measure and (re)position once the panel has actually rendered, and keep
  // it pinned to the anchor on scroll/resize while open.
  useLayoutEffect(() => {
    if (!mounted || !isAnchored) return;
    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);
    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
    };
  }, [mounted, isAnchored, updateCoords]);

  if (!mounted) return null;

  const anchoredReady = isAnchored && coords;

  const wrapperStyle = anchoredReady
    ? { top: coords.top, left: coords.left, width: coords.width }
    : { transform: getTransform(position, visible) };

  return createPortal(
    <>
      {backdrop && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className={`fixed inset-0 z-9998 backdrop-blur-[2px] bg-white/30 dark:bg-slate-950/40 transition-opacity duration-200 ease-out ${
            visible ? "opacity-100" : "opacity-0"
          } ${onClose ? "cursor-pointer" : ""}`}
        />
      )}
      <div
        style={wrapperStyle}
        className={`fixed z-9999 transition-all duration-200 ease-out ${
          anchoredReady ? "" : POSITION_CLASSES[position]
        } ${visible ? "opacity-100" : "opacity-0"}`}
      >
        <div
          ref={panelRef}
          className={`${
            anchoredReady ? "w-full" : `w-[calc(100vw-2rem)] ${maxWidth}`
          } rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur overflow-hidden ${
            elevated ? "shadow-xl" : "shadow-sm"
          } ${className}`}
        >
          {(header || title || action || onClose) && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              {header ? (
                header
              ) : (
                <>
                  {title && (
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {title}
                    </h3>
                  )}
                  <div className="flex items-center gap-2">
                    {action}
                    {onClose && (
                      <button
                        type="button"
                        onClick={onClose}
                        aria-label="Dismiss"
                        className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <div className={padding}>{children}</div>

          {footer && (
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}