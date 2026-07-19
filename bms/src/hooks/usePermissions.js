import { useAuth } from "./useAuth";
import { isAdmin, hasRole, hasAnyRole } from "../utils/auth/permissions";

export function usePermissions() {
  const { user } = useAuth();

  return {
    isAdmin: isAdmin(user),
    hasRole: (role) => hasRole(user, role),
    hasAnyRole: (roles) => hasAnyRole(user, roles),
  };
}