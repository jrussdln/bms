import { NavLink } from "react-router-dom";
import { navItems } from "../../../../constants/navigation";
import { usePermissions } from "../../../../hooks/usePermissions";

export default function HeaderMenu({ mobile = false, onItemClick }) {
  const { hasAnyRole } = usePermissions();
  const visibleItems = navItems.filter(
    (item) => !item.roles || hasAnyRole(item.roles)
  );
  if (mobile) {
    return (
      <div className="flex flex-col py-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              `text-left px-6 py-3 text-sm transition ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 font-medium"
                  : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
              }`
            }
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    );
  }
  return (
    <nav className="hidden lg:flex items-center gap-1">
      {visibleItems.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            `relative px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
                : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/60"
            }`
          }
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}