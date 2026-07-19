import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { hasAnyRole } from "../utils/auth/permissions";
import { ROUTES } from "../constants/routes";

export default function RequireRoleRoute({ roles }) {
  const { user } = useAuth();

  if (!hasAnyRole(user, roles)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}