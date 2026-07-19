import React, { useEffect, useRef, useState } from "react";
import {
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Switch,
  Typography,
  InputAdornment,
  IconButton,
  Skeleton,
  Box,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
// ── Custom field type icons ───────────────────────────────────────────────────
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined"; // TIN
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined"; // Bank
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"; // Password
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail"; // Email
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined"; // Phone
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"; // Username

// ── Icon map for special field types ─────────────────────────────────────────
const FIELD_TYPE_META = {
  tin: {
    icon: BadgeOutlinedIcon,
    inputMode: "numeric",
    placeholder: "000-000-000-00000",
  },
  bank: {
    icon: AccountBalanceOutlinedIcon,
    inputMode: "numeric",
    placeholder: "Account number",
  },
  password: { icon: LockOutlinedIcon, inputMode: undefined, placeholder: "" },
  email: {
    icon: AlternateEmailIcon,
    inputMode: "email",
    placeholder: "you@example.com",
  },
  phone: {
    icon: PhoneIphoneOutlinedIcon,
    inputMode: "tel",
    placeholder: "0900-000-0000",
  },
  username: {
    icon: AccountCircleOutlinedIcon,
    inputMode: undefined,
    placeholder: "Username",
  },
};

// PH TIN is grouped as 3-3-3-5 (9-digit base + 5-digit branch code)
const TIN_GROUP_SIZES = [3, 3, 3, 5];
const TIN_MAX_DIGITS = TIN_GROUP_SIZES.reduce((a, b) => a + b, 0);

const BANK_MAX_DIGITS = 16;
const PHONE_MAX_DIGITS = 11;

const ICON_SX = { fontSize: "1rem", color: "text.secondary" };

/** Formats a raw digit string into PH TIN grouping, e.g. 123456789 -> "123-456-789". */
function formatTin(rawDigits) {
  const digits = rawDigits.replace(/\D/g, "").slice(0, TIN_MAX_DIGITS);
  const parts = [];
  let cursor = 0;
  for (const size of TIN_GROUP_SIZES) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  return parts.join("-");
}

export default function Fields({
  fields = [],
  switches = [],
  formData = {},
  errors = {},
  handleChange,
  handleSwitchChange,
  onLastFieldTab,
  autoFocus = true,
}) {
  const firstInputRef = useRef(null);
  const inputRefs = useRef([]);
  const [showPassword, setShowPassword] = useState({});
  const [pesoDisplayValues, setPesoDisplayValues] = useState({});
  const [selectSearch, setSelectSearch] = useState({});
  const [focusedDate, setFocusedDate] = useState({});

  const togglePasswordVisibility = (name) =>
    setShowPassword((prev) => ({ ...prev, [name]: !prev[name] }));

  // Reset firstInputRef before fields are re-mapped
  firstInputRef.current = null;
  useEffect(() => {
    if (autoFocus === false) return undefined;
    const timer = setTimeout(() => firstInputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [autoFocus]);

  const focusAdjacent = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex >= 0 && nextIndex < inputRefs.current.length) {
      inputRefs.current[nextIndex]?.focus();
    } else if (direction > 0 && onLastFieldTab) {
      onLastFieldTab();
    }
  };

  const handleKeyDown = (e, index, multiline) => {
    if (multiline) return;

    if (e.key === "Enter") {
      e.preventDefault();
      focusAdjacent(index, 1);
      return;
    }

    if (e.key === "Tab") {
      // Only intercept forward Tab; let Shift+Tab use native backward navigation
      // so users aren't stuck unable to move to a previous field.
      if (e.shiftKey) return;
      e.preventDefault();
      focusAdjacent(index, 1);
    }
  };

  // ── Special typed field renderer ─────────────────────────────────────────
  const renderSpecialField = (field, index) => {
    const meta = FIELD_TYPE_META[field.type];
    const IconComp = meta.icon;
    const isPassword = field.type === "password";
    const visible = showPassword[field.name];

    const handleTinChange = (e) => {
      handleChange({
        target: { name: field.name, value: formatTin(e.target.value) },
      });
    };

    const handleNumericChange = (e) => {
      const max = field.type === "bank" ? BANK_MAX_DIGITS : PHONE_MAX_DIGITS;
      const raw = e.target.value.replace(/\D/g, "").slice(0, max);
      handleChange({ target: { name: field.name, value: raw } });
    };

    const changeHandler =
      field.type === "tin"
        ? handleTinChange
        : field.type === "bank" || field.type === "phone"
          ? handleNumericChange
          : handleChange;

    return (
      <Grid size={{ xs: 12, sm: field.xs || 12 }} key={field.name}>
        <TextField
          label={field.label}
          name={field.name}
          fullWidth
          size="small"
          type={isPassword ? (visible ? "text" : "password") : "text"}
          inputMode={meta.inputMode}
          value={formData[field.name] || ""}
          error={!!errors[field.name]}
          helperText={errors[field.name] || field.helperText || ""}
          disabled={field.disabled}
          placeholder={field.placeholder ?? meta.placeholder}
          inputRef={(el) => {
            inputRefs.current[index] = el;
            if (!firstInputRef.current) firstInputRef.current = el;
          }}
          onKeyDown={(e) => handleKeyDown(e, index, false)}
          onChange={changeHandler}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconComp sx={ICON_SX} />
                </InputAdornment>
              ),
              ...(isPassword && {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility(field.name)}
                      edge="end"
                      size="small"
                      disabled={field.disabled}
                      aria-label={visible ? "Hide password" : "Show password"}
                    >
                      {visible ? (
                        <Visibility sx={ICON_SX} />
                      ) : (
                        <VisibilityOff sx={ICON_SX} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }),
            },
          }}
        />
      </Grid>
    );
  };

  return (
    <Grid container spacing={1.5}>
      {fields.map((field, index) => {
        // ── Special icon fields ──────────────────────────────────────────────
        if (FIELD_TYPE_META[field.type]) {
          return renderSpecialField(field, index);
        }

        const isDateField = ["date", "time", "datetime-local"].includes(
          field.type,
        );
        const disabled = field.dependsOn ? !formData[field.dependsOn] : false;

        // ── Custom render ─────────────────────────────────────────────────────────
        if (field.type === "custom" && field.render) {
          return (
            <Grid size={{ xs: 12, sm: field.xs || 12 }} key={field.name}>
              {field.render()}
            </Grid>
          );
        }

        // ── Date field ─────────────────────────────────────────────────────
        if (field.type === "date") {
          const isFocused = !!focusedDate[field.name];
          const rawValue = formData[field.name] || "";
          const isFieldDisabled = field.disabled || disabled;

          return (
            <Grid size={{ xs: 12, sm: field.xs || 12 }} key={field.name}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  label={field.label}
                  name={field.name}
                  type={isFocused ? "date" : "text"}
                  fullWidth
                  size="small"
                  value={
                    isFocused
                      ? rawValue
                      : rawValue
                        ? new Date(rawValue + "T00:00:00").toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "2-digit" },
                          )
                        : ""
                  }
                  onChange={handleChange}
                  error={!!errors[field.name]}
                  helperText={errors[field.name] || field.helperText || ""}
                  disabled={isFieldDisabled}
                  placeholder={field.placeholder || ""}
                  inputRef={(el) => {
                    inputRefs.current[index] = el;
                    if (!firstInputRef.current) firstInputRef.current = el;
                  }}
                  onKeyDown={(e) => handleKeyDown(e, index, false)}
                  onFocus={() =>
                    setFocusedDate((prev) => ({ ...prev, [field.name]: true }))
                  }
                  onBlur={() =>
                    setFocusedDate((prev) => ({
                      ...prev,
                      [field.name]: false,
                    }))
                  }
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: {
                      min: field.minDate,
                      max: field.maxDate,
                      readOnly: !isFocused,
                    },
                  }}
                />
                {!isFocused && !isFieldDisabled && (
                  <Box
                    component="button"
                    type="button"
                    aria-label={`Open ${field.label} picker`}
                    onClick={() =>
                      setFocusedDate((prev) => ({
                        ...prev,
                        [field.name]: true,
                      }))
                    }
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                )}
              </Box>
            </Grid>
          );
        }
        // ── Date / Time / DateTime field ────────────────────────────────────
        if (["date", "time", "datetime-local"].includes(field.type)) {
          const isFocused = !!focusedDate[field.name];
          const rawValue = formData[field.name] || "";
          const isFieldDisabled = field.disabled || disabled;

          const formatDisplay = () => {
            if (!rawValue) return "";

            if (field.type === "date") {
              return new Date(rawValue + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                },
              );
            }

            if (field.type === "time") {
              const [h, m] = rawValue.split(":");
              const d = new Date();
              d.setHours(Number(h), Number(m));
              return d.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
            }

            // datetime-local: "2026-07-13T14:30" -> "Jul 13, 2026, 2:30 PM"
            return new Date(rawValue).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
          };

          return (
            <Grid size={{ xs: 12, sm: field.xs || 12 }} key={field.name}>
              <Box sx={{ position: "relative" }}>
                <TextField
                  label={field.label}
                  name={field.name}
                  type={isFocused ? field.type : "text"}
                  fullWidth
                  size="small"
                  value={isFocused ? rawValue : formatDisplay()}
                  onChange={handleChange}
                  error={!!errors[field.name]}
                  helperText={errors[field.name] || field.helperText || ""}
                  disabled={isFieldDisabled}
                  placeholder={field.placeholder || ""}
                  inputRef={(el) => {
                    inputRefs.current[index] = el;
                    if (!firstInputRef.current) firstInputRef.current = el;
                  }}
                  onKeyDown={(e) => handleKeyDown(e, index, false)}
                  onFocus={() =>
                    setFocusedDate((prev) => ({ ...prev, [field.name]: true }))
                  }
                  onBlur={() =>
                    setFocusedDate((prev) => ({ ...prev, [field.name]: false }))
                  }
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: {
                      min: field.minDate,
                      max: field.maxDate,
                      step: field.step, // e.g. 60 for whole-minute steps, 1 for seconds
                      readOnly: !isFocused,
                    },
                  }}
                />
                {!isFocused && !isFieldDisabled && (
                  <Box
                    component="button"
                    type="button"
                    aria-label={`Open ${field.label} picker`}
                    onClick={() =>
                      setFocusedDate((prev) => ({
                        ...prev,
                        [field.name]: true,
                      }))
                    }
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                )}
              </Box>
            </Grid>
          );
        }
        // ── Peso field ───────────────────────────────────────────────────────
        if (field.type === "peso") {
          const rawStored = formData[field.name];
          const displayValue =
            pesoDisplayValues[field.name] !== undefined
              ? pesoDisplayValues[field.name]
              : rawStored !== undefined && rawStored !== ""
                ? Number(rawStored).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "";

          return (
            <Grid size={{ xs: 12, sm: field.xs || 12 }} key={field.name}>
              <TextField
                label={field.label}
                name={field.name}
                type="text"
                fullWidth
                size="small"
                value={displayValue}
                error={!!errors[field.name]}
                helperText={errors[field.name] || field.helperText || ""}
                disabled={field.disabled || disabled}
                placeholder={field.placeholder || "0.00"}
                inputRef={(el) => {
                  inputRefs.current[index] = el;
                  if (!firstInputRef.current) firstInputRef.current = el;
                }}
                onKeyDown={(e) => {
                  handleKeyDown(e, index, false);
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                    "Enter",
                    ".",
                  ];
                  if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key))
                    e.preventDefault();
                }}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, "");
                  if (/^\d*\.?\d{0,2}$/.test(raw)) {
                    setPesoDisplayValues((prev) => ({
                      ...prev,
                      [field.name]: raw,
                    }));
                    handleChange({ target: { name: field.name, value: raw } });
                  }
                }}
                onBlur={() => {
                  const raw = formData[field.name];
                  setPesoDisplayValues((prev) => {
                    const updated = { ...prev };
                    delete updated[field.name];
                    return updated;
                  });
                  if (raw !== "" && raw !== undefined && !isNaN(Number(raw))) {
                    handleChange({
                      target: {
                        name: field.name,
                        value: Number(raw).toFixed(2),
                      },
                    });
                  }
                }}
                onFocus={() => {
                  const raw = formData[field.name];
                  const unformatted =
                    raw !== "" && raw !== undefined && !isNaN(Number(raw))
                      ? String(Number(raw))
                      : "";
                  setPesoDisplayValues((prev) => ({
                    ...prev,
                    [field.name]: unformatted,
                  }));
                }}
                slotProps={{
                  input: {
                    readOnly: field.readOnly,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          ₱
                        </Typography>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          );
        }

        // ── Select field ─────────────────────────────────────────────────────
        if (field.type === "select") {
          const options = field.options || [];
          const isLoadingOptions = field.loading === true;
          const searchTerm = (selectSearch[field.name] || "").toLowerCase();
          const filteredOptions = options.filter((opt) =>
            opt.label?.toLowerCase().includes(searchTerm),
          );

          return (
            <Grid size={{ xs: 12, sm: field.xs || 12 }} key={field.name}>
              <TextField
                select
                fullWidth
                size="small"
                label={field.label}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                error={!!errors[field.name]}
                helperText={errors[field.name] || ""}
                disabled={field.disabled || disabled}
                inputRef={(el) => {
                  inputRefs.current[index] = el;
                  if (!firstInputRef.current) firstInputRef.current = el;
                }}
                slotProps={{
                  select: {
                    MenuProps: {
                      slotProps: {
                        paper: { sx: { maxHeight: 300 } },
                        list: { autoFocusItem: false }, // 👈 stop MUI from stealing focus for its own typeahead
                      },
                      autoFocus: false,
                    },
                    onOpen: () => {
                      if (options.length > 8) {
                        setTimeout(() => {
                          const input = document.getElementById(
                            `select-search-${field.name}`,
                          );
                          input?.focus();
                        }, 50);
                      }
                    },
                    onClose: () =>
                      setSelectSearch((prev) => ({
                        ...prev,
                        [field.name]: "",
                      })),
                  },
                }}
              >
                {options.length > 8 && (
                  <MenuItem
                    disableRipple
                    disableTouchRipple
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()} // 👈 prevent click from "selecting" this row
                    sx={{
                      p: 0,
                      "&:hover": { backgroundColor: "transparent" },
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      backgroundColor: "background.paper",
                    }}
                  >
                    <TextField
                      id={`select-search-${field.name}`}
                      size="small"
                      placeholder="Search..."
                      fullWidth
                      autoFocus // 👈 grab focus as soon as it mounts
                      value={selectSearch[field.name] || ""}
                      onChange={(e) =>
                        setSelectSearch((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()} // 👈 typeahead also listens on keyup in some MUI versions
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()} // 👈 stop the click-to-select-item behavior
                      sx={{
                        px: 1,
                        py: 0.5,
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "background.default",
                          color: "text.primary",
                          "& fieldset": { borderColor: "divider" },
                          "&:hover fieldset": { borderColor: "text.secondary" },
                          "&.Mui-focused fieldset": {
                            borderColor: "primary.main",
                          },
                        },
                        "& .MuiInputBase-input::placeholder": {
                          color: "text.secondary",
                          opacity: 1,
                        },
                      }}
                      autoComplete="off"
                    />
                  </MenuItem>
                )}

                {isLoadingOptions ? (
                  [1, 2, 3].map((i) => (
                    <MenuItem key={i} disabled sx={{ py: 0.8 }}>
                      <Skeleton
                        variant="text"
                        width={`${45 + i * 15}%`}
                        height={14}
                        sx={{ borderRadius: 1 }}
                      />
                    </MenuItem>
                  ))
                ) : filteredOptions.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="caption" color="text.disabled">
                      No data available
                    </Typography>
                  </MenuItem>
                ) : (
                  filteredOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
          );
        }

        // ── Section label ────────────────────────────────────────────────────
        if (field.type === "label") {
          return (
            <Grid size={{ xs: 12 }} key={`label-${field.name || index}`}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 200, color: "text.primary" }}
              >
                {field.label}
              </Typography>
            </Grid>
          );
        }

        // ── Checkbox ─────────────────────────────────────────────────────────
        if (field.type === "checkbox") {
          return (
            <Grid size={{ xs: field.xs || 12 }} key={field.name}>
              <FormControlLabel
                control={
                  <Checkbox
                    name={field.name}
                    checked={!!formData[field.name]}
                    onChange={handleChange}
                    color="primary"
                    disabled={field.disabled || disabled}
                  />
                }
                label={field.label || ""}
              />
            </Grid>
          );
        }

        // ── Multiline (plain textarea only — no rich text) ─────────────────────
        if (field.multiline) {
          return (
            <Grid size={{ xs: 12, sm: field.xs || 12 }} key={field.name}>
              <TextField
                label={field.label}
                name={field.name}
                placeholder={field.placeholder}
                fullWidth
                size="small"
                multiline
                minRows={field.minRows || 3}
                maxRows={field.maxRows}
                value={formData[field.name] || ""}
                onChange={handleChange}
                error={!!errors[field.name]}
                helperText={errors[field.name] || field.helperText || ""}
                disabled={field.disabled || disabled}
                inputRef={(el) => {
                  inputRefs.current[index] = el;
                  if (!firstInputRef.current) firstInputRef.current = el;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation(); // allow newline, don't trigger form submit/tab-jump
                    return;
                  }
                  handleKeyDown(e, index, true);
                }}
              />
            </Grid>
          );
        }

        // ── Normal TextField (including legacy password without icon) ─────────
        const isPassword = field.type === "password";
        return (
          <Grid size={{ xs: 12, sm: field.xs || 12 }} key={field.name}>
            <TextField
              label={field.label}
              name={field.name}
              type={
                isPassword
                  ? showPassword[field.name]
                    ? "text"
                    : "password"
                  : field.type || "text"
              }
              fullWidth
              size="small"
              value={formData[field.name] || ""}
              error={!!errors[field.name]}
              helperText={errors[field.name] || field.helperText || ""}
              disabled={field.disabled || disabled}
              placeholder={field.placeholder || ""}
              inputRef={(el) => {
                inputRefs.current[index] = el;
                if (!firstInputRef.current) firstInputRef.current = el;
              }}
              onKeyDown={(e) => {
                handleKeyDown(e, index, field.multiline);
                if (field.numberOnly) {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                    "Enter",
                  ];
                  if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key))
                    e.preventDefault();
                }
              }}
              onChange={(e) => {
                let value = e.target.value;
                if (field.numberOnly) value = value.replace(/[^0-9]/g, "");
                handleChange({ target: { name: field.name, value } });
              }}
              slotProps={{
                ...(isDateField && { inputLabel: { shrink: true } }),
                ...(isPassword && {
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => togglePasswordVisibility(field.name)}
                          edge="end"
                          disabled={field.disabled || disabled}
                          aria-label={
                            showPassword[field.name]
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showPassword[field.name] ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }),
              }}
            />
          </Grid>
        );
      })}

      {switches.map((sw) => (
        <Grid size={{ xs: sw.xs || 12 }} key={sw.name}>
          <FormControlLabel
            control={
              <Switch
                name={sw.name}
                checked={!!formData[sw.name]}
                onChange={handleSwitchChange}
                color="primary"
                disabled={sw.disabled}
              />
            }
            label={
              sw.mobileLabel ? (
                <Box component="span">
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    {sw.label}
                  </Box>
                  <Box component="span" sx={{ display: { sm: "none" } }}>
                    {sw.mobileLabel}
                  </Box>
                </Box>
              ) : (
                sw.label || ""
              )
            }
          />
        </Grid>
      ))}
    </Grid>
  );
}

Fields.displayName = "Fields";
