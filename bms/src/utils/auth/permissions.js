import { USER_ROLE } from "../../constants/user-roles";

export function isAdmin(user) {
  return user?.cUserRole === USER_ROLE.ADMIN;
}

export function hasRole(user, role) {
  return user?.cUserRole === role;
}

export function hasAnyRole(user, roles = []) {
  return roles.includes(user?.cUserRole);
}