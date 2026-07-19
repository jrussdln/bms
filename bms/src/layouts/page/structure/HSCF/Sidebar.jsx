import { useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SidebarMenu from "./SidebarMenu";

export default function Sidebar({ hiddenOnMobile = false }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={`
        ${hiddenOnMobile ? "hidden lg:block" : ""}
        group ${collapsed ? "relative" : "absolute"} lg:relative top-0 left-0 z-30
        ${collapsed ? "w-16" : "w-56 lg:w-64"}
        h-[calc(100%-1rem)] lg:h-[calc(100%-2rem)]
        bg-white dark:bg-slate-800
        mt-2 mb-2 lg:mt-4 lg:mb-4
        rounded-r-2xl
        border border-l-0 border-gray-100 dark:border-slate-700
        shadow-[4px_0_24px_rgba(99,102,241,0.08)]
        transition-all duration-300 ease-out
      `}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          flex items-center justify-center
          absolute -right-3 top-6 z-10
          w-6 h-6 rounded-full
          bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600
          shadow-md
          text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-500
          transition-all duration-200
          opacity-100 lg:opacity-0 lg:group-hover:opacity-100
          ${!collapsed ? "lg:opacity-100" : ""}
        `}
      >
        <ChevronLeftIcon
          sx={{ fontSize: 16 }}
          className={`transition-transform duration-300 ${
            collapsed ? "rotate-180" : ""
          }`}
        />
      </button>
      <div className="flex flex-col h-full overflow-hidden rounded-r-2xl">
        <SidebarMenu collapsed={collapsed} />
      </div>
    </aside>
  );
}