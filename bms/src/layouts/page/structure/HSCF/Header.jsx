import { Avatar } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import MediaRoute from "../../../../routes/MediaRoute";
import { useTheme } from "../../../../hooks/useTheme";
import { useAuth } from "../../../../hooks/useAuth";
import { getAvatarUrl } from "../../../../services/uploadService";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const initials = `${user?.strFName?.[0] ?? ""}${user?.strLName?.[0] ?? ""}`.toUpperCase();
  const avatarUrl = getAvatarUrl(user?.strProfileImage);

  return (
    <header
      className="
        w-full h-16 sticky top-0 z-50
        bg-white/90 dark:bg-slate-800/90 backdrop-blur-md
        rounded-b-2xl lg:rounded-none
        border border-t-0 lg:border-t-0 lg:border-x-0 border-gray-100 dark:border-slate-700 lg:border-b
      "
      style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.08)" }}
    >
      <div className="w-full h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={MediaRoute.logo}
            alt="Logo"
            className="w-9 h-9 lg:w-10 lg:h-10"
          />
          <div>
            <h1 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
              Budget Management System
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              VER 01.00.00
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition"
          >
            {isDark ? (
              <LightModeOutlinedIcon fontSize="small" />
            ) : (
              <DarkModeOutlinedIcon fontSize="small" />
            )}
          </button>

          <Avatar
            src={avatarUrl || undefined}
            sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 600 }}
            className="ring-2! ring-white! dark:ring-slate-700!"
          >
            {!avatarUrl && initials}
          </Avatar>
        </div>
      </div>
    </header>
  );
}