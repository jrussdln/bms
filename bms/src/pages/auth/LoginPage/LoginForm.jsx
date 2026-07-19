import { useRef } from "react";
import { Link } from "react-router-dom";
import { Box, Button, CircularProgress, Divider } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import ParentCard from "../../../components/card/ParentCard";
import Fields from "../../../components/form/Fields";
import { useTheme } from "../../../hooks/useTheme";
import { ROUTES } from "../../../constants/routes";

const LOGIN_FIELDS = [
  { name: "strEmail", label: "Email", type: "email", xs: 12 },
  { name: "strPassword", label: "Password", type: "password", xs: 12 },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.5H24v7h11.3C33.7 31.6 29.3 34.5 24 34.5c-6.9 0-12.5-5.6-12.5-12.5S17.1 9.5 24 9.5c3.2 0 6.1 1.2 8.3 3.2l5-5C33.9 4.5 29.2 2.5 24 2.5 12.4 2.5 3 11.9 3 23.5S12.4 44.5 24 44.5c11 0 20.5-8 20.5-20.5 0-1.4-.1-2.4-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l5.7 4.2C13.6 15.1 18.4 12 24 12c3.2 0 6.1 1.2 8.3 3.2l5-5C33.9 6.5 29.2 4.5 24 4.5c-7.6 0-14.1 4.3-17.7 10.2z"
      />
      <path
        fill="#4CAF50"
        d="M24 44.5c5.1 0 9.8-1.9 13.3-5.1l-6.1-5c-2 1.4-4.6 2.1-7.2 2.1-5.3 0-9.7-3.4-11.3-8.1l-6 4.6C10.1 39.5 16.6 44.5 24 44.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.5H24v7h11.3c-1 2.8-2.8 5.1-5.1 6.7l6.1 5C40.1 35.4 44.5 30 44.5 23.5c0-1.4-.1-2.4-.9-3z"
      />
    </svg>
  );
}

export default function LoginForm({
  form,
  error,
  loading,
  onChange,
  onSubmit,
  onGoogleClick,
}) {
  const submitRef = useRef(null);
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="absolute -top-3 -right-3 w-9 h-9 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition"
      >
        {isDark ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </button>

      <ParentCard
        title="Sign In"
        columns="grid-cols-1"
        className="p-5 shadow-sm"
      >
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <Box component="form" onSubmit={onSubmit} className="mt-5">
          <Fields
            fields={LOGIN_FIELDS}
            formData={form}
            errors={{}}
            handleChange={onChange}
            onLastFieldTab={() => submitRef.current?.focus()}
          />

          <div className="flex justify-end mt-1.5">
            <Link
              to={ROUTES.FORGOT_PASSWORD ?? "/forgot-password"}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            ref={submitRef}
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 2.5 }}
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Box>

        <Divider>
          <span className="text-xs text-slate-400 dark:text-slate-500 px-2">
            or continue with
          </span>
        </Divider>

        <Button
          type="button"
          fullWidth
          variant="outlined"
          onClick={onGoogleClick}
          startIcon={<GoogleIcon />}
          sx={{
            textTransform: "none",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          Continue with Google
        </Button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            to={ROUTES.REGISTER ?? "/register"}
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </ParentCard>
    </div>
  );
}