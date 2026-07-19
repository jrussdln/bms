import { Routes, Route, Navigate } from "react-router-dom";
import RequireRoleRoute from "./RequireRoleRoute";
import Layout from "../layouts/page";
import PrivateRoute from "../routes/PrivateRoute";
import Dashboard from "../pages/dashboard/Dashboard";
import FinanceEntryView from "../pages/finance-entry";
import Users from "../pages/users";
import Settings from "../pages/settings";
import Index from "../pages/index";
import LoginPage from "../pages/auth/LoginPage";
import { ROUTES } from "../constants/routes";
import { USER_ROLE } from "../constants/user-roles";

export default function AppRoute() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="finance-entry" element={<FinanceEntryView />} />
          {/* Admin-only */}
          <Route element={<RequireRoleRoute roles={[USER_ROLE.ADMIN]} />}>
            <Route path="users" element={<Users />} />
          </Route>
          <Route path="*" element={<Index />} />
        </Route>
      </Route>
    </Routes>
  );
}
