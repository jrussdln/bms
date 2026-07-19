import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { useTrackPresence } from "../hooks/useTrackPresence";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useTrackPresence(); // add this

  const login = async (credentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Merge partial fields (e.g. a fresh strProfileImage after an avatar
  // upload) into the shared user object so every consumer of useAuth()
  // — Header, Settings, anywhere else — re-renders with the new value
  // immediately, without waiting for a full page reload or a refetch.
  const updateUser = (patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      authService.setCurrentUser?.(next); // keep localStorage/cache in sync, if supported
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
