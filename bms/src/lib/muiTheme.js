import { createTheme } from "@mui/material/styles";

export function getMuiTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: "#4f46e5" }, // indigo-600
      ...(mode === "dark"
        ? {
            background: {
              default: "#0f172a", // slate-900
              paper: "#1e293b",   // slate-800
            },
            divider: "#334155",   // slate-600
            text: {
              primary: "#f1f5f9",   // slate-100
              secondary: "#94a3b8", // slate-400
              disabled: "#64748b",  // slate-500
            },
            action: {
              hover: "rgba(148, 163, 184, 0.08)", // subtle slate hover, not black
            },
          }
        : {
            background: {
              default: "#f8fafc",
              paper: "#ffffff",
            },
          }),
    },
  });
}