import { Dialog, IconButton, Typography, Box, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckIcon from "@mui/icons-material/Check";
import Button from "../../components/form/Buttons";

/**
 * Reusable modal component built on MUI Dialog, styled as detached
 * rounded "bubble" pieces: a standalone circular icon bubble on top
 * (reflecting the modal type), a content bubble with header/body/footer
 * attached together, and a standalone circular close button beneath.
 *
 * Props:
 * - open: boolean — controls visibility
 * - onClose: () => void — called when the close icon, backdrop, or Escape is triggered
 * - type: "add" | "edit" | "delete" | "view" — determines the icon bubble, default "add"
 * - title: string | ReactNode — header title (left-aligned)
 * - subtitle: string | ReactNode — optional text under the title
 * - children: ReactNode — modal body content
 * - onSave: () => void — called when the built-in Save button is clicked
 * - saveLabel: string — label for the Save button, default "Save"
 * - saving: boolean — shows a saving state and disables the Save button
 * - maxWidth: MUI breakpoint size, default "sm" ("xs" | "sm" | "md" | "lg" | "xl")
 * - fullWidth: boolean, default true
 * - disableClose: boolean — hides the close button and disables backdrop/Escape close
 *
 * Example:
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   type="edit"
 *   title="Record Income"
 *   subtitle="Add a new income entry to your budget."
 *   onSave={handleSave}
 *   saving={saving}
 * >
 *   <Fields fields={incomeFields} formData={formData} handleChange={handleChange} />
 * </Modal>
 */

// Shared "bubble" styling — each detached piece is its own floating rounded card.
const bubbleSx = {
  borderRadius: "1rem",
  bgcolor: "background.paper",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
};

const TYPE_ICON = {
  add: AddCircleOutlineIcon,
  edit: EditOutlinedIcon,
  delete: DeleteOutlineIcon,
  view: VisibilityOutlinedIcon,
};

const TYPE_COLOR = {
  add: "#0284c7",
  edit: "#d97706",
  delete: "#dc2626",
  view: "#2563eb",
};

export default function Modal({
  open,
  onClose,
  type = "add",
  title,
  subtitle,
  children,
  onSave,
  saveLabel = "Save",
  saving = false,
  maxWidth = "sm",
  fullWidth = true,
  disableClose = false,
}) {
  const handleClose = (_event, reason) => {
    if (disableClose) return;
    if (saving && (reason === "backdropClick" || reason === "escapeKeyDown"))
      return;
    onClose?.();
  };

  const TypeIcon = TYPE_ICON[type] ?? TYPE_ICON.add;
  const typeColor = TYPE_COLOR[type] ?? TYPE_COLOR.add;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 0,
            bgcolor: "transparent",
            boxShadow: "none",
            backgroundImage: "none",
          },
        },
        backdrop: {
          sx: {
            backdropFilter: "blur(2px)",
            backgroundColor: "rgba(15, 23, 42, 0.35)", // slate-900 @ 35%
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          p: 1,
        }}
      >
        {/* Standalone circular type icon bubble — same style as close/save below */}
        <Box
          sx={{
            ...bubbleSx,
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TypeIcon sx={{ fontSize: 18, color: typeColor }} />
        </Box>

{/* Title/subtitle bubble — single row, compact rounded container */}
        <Box
          sx={{
            ...bubbleSx,
            width: "fit-content",
            maxWidth: "100%",
            display: "flex",
            alignItems: "baseline",
            gap: 0.75,
            px: 1.5,
            py: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.primary", whiteSpace: "nowrap", fontSize: "0.75rem" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", whiteSpace: "nowrap", fontSize: "0.7rem" }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Content bubble — body only */}
        <Box sx={{ ...bubbleSx, width: "100%", px: 3, py: 2.5 }}>
          {children}
        </Box>

        {/* Bottom row — standalone close button + Save button, same circular bubble style */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {!disableClose && (
            <IconButton
              onClick={onClose}
              disabled={saving}
              size="small"
              sx={{
                ...bubbleSx,
                width: 40,
                height: 40,
                borderRadius: "50%",
                color: "text.secondary",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}

          {onSave && (
            <IconButton
              onClick={onSave}
              disabled={saving}
              size="small"
              sx={{
                ...bubbleSx,
                width: 40,
                height: 40,
                borderRadius: "50%",
                color: TYPE_COLOR[type] ?? TYPE_COLOR.add,
              }}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}