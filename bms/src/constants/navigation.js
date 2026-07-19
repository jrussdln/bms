import { ROUTES } from "./routes";
import { USER_ROLE } from "./user-roles";

export const navItems = [
  { id: "dashboard", label: "Dashboard", path: ROUTES.DASHBOARD, icon: "dashboard" },
  { id: "finance-entry", label: "Finance Entry", path: ROUTES.FINANCE_ENTRY, icon: "records" },
  { id: "users", label: "Users", path: ROUTES.USERS, roles: [USER_ROLE.ADMIN], icon: "users" },
  { id: "settings", label: "Settings", path: ROUTES.SETTINGS, icon: "settings" },
];