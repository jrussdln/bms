import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../api/endpoints/auth.api";
import { usersApi } from "../../api/endpoints/users.api";
import { ROLE_LABELS } from "../../constants/user-roles";
import echo from "../../lib/echo";
import { getItem, setItem, clearAll } from "../../utils/storage/localStorage";
import { uploadAvatar, getAvatarUrl } from "../../services/uploadService";

const TABS = [
  { id: "personal", label: "Personal Information" },
  { id: "account", label: "Account" },
  { id: "appearance", label: "Appearance" },
];

const ME_CACHE_KEY = "me";

export default function useSettings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("personal");
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Current user (GET /me) ───────────────────────────────────────────
  const cachedMe = getItem(ME_CACHE_KEY);

  const [user, setUser] = useState(cachedMe ?? null);
  const [loadingUser, setLoadingUser] = useState(!cachedMe);
  const [userError, setUserError] = useState(null);

  // Shared fetch logic — `showLoading` lets callers decide whether this
  // should show the loading spinner (initial mount, no cache) or update
  // silently in the background (cached mount, live sync broadcasts).
  const loadMe = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoadingUser(true);
      setUserError(null);
      try {
        const res = await authApi.getProfile();
        setUser(res.data.data);
        setItem(ME_CACHE_KEY, res.data.data);
        // Keep the shared auth user (Header, etc.) in sync too — this hook
        // keeps its own "me" copy, but it's not the only consumer of the
        // logged-in user's data.
        updateUser(res.data.data);
      } catch (err) {
        setUserError(
          err.response?.data?.message ?? "Failed to load your profile.",
        );
      } finally {
        if (showLoading) setLoadingUser(false);
      }
    },
    [updateUser],
  );

  // Public fetchMe (used by initial mount when there's no cache).
  const fetchMe = useCallback(() => loadMe(true), [loadMe]);

  // Silent refetch — used when we already have cached data to show,
  // and by the broadcast listener. No loading flicker.
  const refetchMeSilently = useCallback(() => loadMe(false), [loadMe]);

  useEffect(() => {
    // If we already showed cached data, refresh silently in the background.
    // Otherwise do a normal loading fetch.
    if (cachedMe) {
      refetchMeSilently();
    } else {
      fetchMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Live sync: refresh "me" if this account gets updated elsewhere ---
  // (e.g. an admin edits this user's role/status from the Users page, or
  // this same account is open in another tab and profile info changes there)
  useEffect(() => {
    if (!user?.nUserId) return;

    const channel = echo.channel("users");

    channel.listen(".user.updated", (e) => {
      if (e.action === "deleted") return; // not relevant here — you're logged in
      if (e.userId === user.nUserId) {
        console.log("Own profile updated elsewhere, refreshing:", e);
        refetchMeSilently();
      }
    });

    return () => {
      channel.stopListening(".user.updated");
      echo.leave("users");
    };
  }, [user?.nUserId, refetchMeSilently]);

  const profile = {
    name: user?.strName ?? "",
    email: user?.strEmail ?? "",
    role: user ? (ROLE_LABELS[user.cUserRole] ?? user.cUserRole) : "",
    initials: user
      ? `${user.strFName?.[0] ?? ""}${user.strLName?.[0] ?? ""}`.toUpperCase()
      : "",
    avatarUrl: user?.strProfileImage
      ? `/storage/avatars/${user.strProfileImage}`
      : null,
  };

  // ── Avatar upload ─────────────────────────────────────────────────────
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const handleAvatarUpload = async (file) => {
    if (!user) return;
    setUploadingAvatar(true);
    setAvatarError("");
    try {
      const updated = await uploadAvatar(user.nUserId, file);
      setUser(updated);
      setItem(ME_CACHE_KEY, updated);
      // This is the fix for Header not syncing: AuthContext's user is a
      // separate copy from this hook's local `user` state, and nothing
      // was telling it about the new avatar before now.
      updateUser(updated);
    } catch (err) {
      setAvatarError(err.response?.data?.message ?? "Failed to upload photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const [profileForm, setProfileForm] = useState({
    strFName: "",
    strMName: "",
    strLName: "",
    strEName: "",
    strPhoneNumber: "",
    strEmail: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      strFName: user.strFName ?? "",
      strMName: user.strMName ?? "",
      strLName: user.strLName ?? "",
      strEName: user.strEName ?? "",
      strPhoneNumber: user.strPhoneNumber ?? "",
      strEmail: user.strEmail ?? "",
    });
  }, [user]);

  const handleProfileFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    setProfileErrors({});
    try {
      await usersApi.update(user.nUserId, {
        strFName: profileForm.strFName,
        strMName: profileForm.strMName,
        strLName: profileForm.strLName,
        strEName: profileForm.strEName,
        strPhoneNumber: profileForm.strPhoneNumber,
        strEmail: profileForm.strEmail,
      });
      // No fetchMe() here — the "user.updated" broadcast (filtered to this
      // user's own nUserId above) will refresh the profile (and cache,
      // and now the shared auth user too) automatically.
    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data.errors ?? {};
        setProfileErrors({
          strFName: backendErrors.strFName?.[0],
          strMName: backendErrors.strMName?.[0],
          strLName: backendErrors.strLName?.[0],
          strEName: backendErrors.strEName?.[0],
          strPhoneNumber: backendErrors.strPhoneNumber?.[0],
          strEmail: backendErrors.strEmail?.[0],
        });
      } else {
        alert(err.response?.data?.message ?? "Failed to save profile.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Account (password change) ────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [updatingAccount, setUpdatingAccount] = useState(false);

  const handlePasswordFieldChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleUpdateAccount = async () => {
    if (!user) return;

    if (!passwordForm.password || !passwordForm.confirmPassword) {
      setPasswordErrors({
        password: !passwordForm.password ? "Required." : undefined,
        confirmPassword: !passwordForm.confirmPassword
          ? "Required."
          : undefined,
      });
      return;
    }

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setUpdatingAccount(true);
    setPasswordErrors({});
    try {
      await usersApi.update(user.nUserId, {
        strPassword: passwordForm.password,
        strPassword_confirmation: passwordForm.confirmPassword,
      });
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data.errors ?? {};
        setPasswordErrors({ password: backendErrors.strPassword?.[0] });
      } else {
        alert(err.response?.data?.message ?? "Failed to update account.");
      }
    } finally {
      setUpdatingAccount(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("token");
      // Clear every cached dataset (finance records, users, profile, etc.)
      // so nothing from this account lingers for the next person on this device.
      clearAll();
      setLoggingOut(false);
      navigate("/login");
    }
  };

  return {
    tabs: TABS,
    activeTab,
    setActiveTab,
    profile,
    loadingUser,
    userError,
    uploadingAvatar,
    avatarError,
    handleAvatarUpload,
    profileForm,
    profileErrors,
    savingProfile,
    handleProfileFieldChange,
    handleSaveProfile,
    passwordForm,
    passwordErrors,
    updatingAccount,
    handlePasswordFieldChange,
    handleUpdateAccount,
    theme,
    setTheme,
    loggingOut,
    handleLogout,
  };
}
