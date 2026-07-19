import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { navItems } from "../../../../constants/navigation";
import { ICONS, DEFAULT_ICON } from "../../../../constants/nav-icons";
import { usePermissions } from "../../../../hooks/usePermissions";

export default function SidebarMenu({ onItemClick, collapsed = false, horizontal = false }) {
  const { hasAnyRole } = usePermissions();
  const visibleItems = navItems.filter(
    (item) => !item.roles || hasAnyRole(item.roles)
  );

  if (horizontal) {
    return <HorizontalNav items={visibleItems} onItemClick={onItemClick} />;
  }

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {visibleItems.map((item) => {
        const Icon = ICONS[item.icon] || DEFAULT_ICON;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onItemClick}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                collapsed ? "justify-center px-0" : ""
              } ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
                  : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/60"
              }`
            }
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Icon sx={{ fontSize: 20 }} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HorizontalNav({ items, onItemClick }) {
  const location = useLocation();
  const containerRef = useRef(null);
  const itemRefs = useRef({});
  const [x, setX] = useState(null);

  const activeItem = items.find((item) => location.pathname.startsWith(item.path));
  const activeId = activeItem?.id;

  const measure = () => {
    const el = itemRefs.current[activeId];
    const container = containerRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setX(elRect.left - containerRect.left + elRect.width / 2 - 32); // 32 = half of w-16
    }
  };

  useLayoutEffect(() => {
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, items.length]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)"; // smooth glide, no bounce/overshoot
  const DURATION = "550ms";
  const NOTCH_SIZE = 74;
  const INDICATOR_SIZE = 64;
  const notchOffset = (NOTCH_SIZE - INDICATOR_SIZE) / 2; // 5px

  return (
    <nav
      ref={containerRef}
      className="
        relative flex items-center justify-around w-full h-16 px-2
        bg-white dark:bg-slate-800
        rounded-t-2xl
        border border-b-0 border-gray-100 dark:border-slate-700
        shadow-[0_-4px_24px_rgba(99,102,241,0.08)]
        overflow-visible
      "
    >
      {/* Notch: half-circle cutout, overlaps slightly past center to fully cover the border line */}
      <div
        className={`
          absolute left-0 top-0 rounded-full pointer-events-none z-5
          bg-slate-100 dark:bg-slate-900
          will-change-transform
          ${x === null ? "opacity-0" : "opacity-100 transition-opacity duration-200"}
        `}
        style={{
          width: NOTCH_SIZE,
          height: NOTCH_SIZE,
          transform: `translate(${(x ?? 0) - notchOffset}px, calc(-2rem - ${notchOffset}px))`,
          transition: `transform ${DURATION} ${EASE}`,
          clipPath: "inset(44% 0 0 0)",
        }}
      />

      {/* Floating circle indicator: slides horizontally, smooth glide */}
      <div
        className={`
          absolute left-0 top-0 w-16 h-16 rounded-full z-6
          bg-white dark:bg-slate-800
          shadow-md shadow-indigo-500/15
          will-change-transform
          ${x === null ? "opacity-0" : "opacity-100 transition-opacity duration-200"}
        `}
        style={{
          transform: `translate(${x ?? 0}px, -2rem)`,
          transition: `transform ${DURATION} ${EASE}`,
        }}
      />

      {items.map((item) => {
        const Icon = ICONS[item.icon] || DEFAULT_ICON;
        const isActive = item.id === activeId;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onItemClick}
            title={item.label}
            ref={(el) => (itemRefs.current[item.id] = el)}
            className={`
              relative z-10 flex items-center justify-center w-16 h-16
              text-slate-500 dark:text-slate-400
              hover:text-indigo-600 dark:hover:text-indigo-400
              ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}
            `}
            style={{ transition: "color 300ms ease-out" }}
          >
            <Icon
              sx={{ fontSize: 26 }}
              className="will-change-transform"
              style={{
                transform: isActive ? "translateY(-2rem)" : "translateY(0)",
                transition: `transform ${DURATION} ${EASE}`,
              }}
            />
          </NavLink>
        );
      })}
    </nav>
  );
}