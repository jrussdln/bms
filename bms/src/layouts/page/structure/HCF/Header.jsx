import { useState } from "react";
import MediaRoute from "../../../../routes/MediaRoute";
import HeaderMenu from "./HeaderMenu";

export default function Header() {
  const [openNav, setOpenNav] = useState(false);
  return (
    <>
      <style>{`
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #7c3aed);
          border-radius: 99px;
          transition: width .25s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
      <header className="w-full border-b border-gray-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-4 lg:px-6 py-2.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={MediaRoute.logo}
              alt="Logo"
              className="w-9 h-9 lg:w-10 lg:h-10"
            />
            <div>
              <h1 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
                Budget Management System
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">VER 01.00.00</p>
            </div>
          </div>
          {/* Desktop HeaderMenu */}
          <HeaderMenu />
          {/* Mobile Button */}
          <button
            onClick={() => setOpenNav(!openNav)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
          >
            ☰
          </button>
        </div>
        {/* Mobile HeaderMenu */}
        {openNav && (
          <div className="lg:hidden border-t border-gray-100 dark:border-slate-700">
            <HeaderMenu mobile onItemClick={() => setOpenNav(false)} />
          </div>
        )}
      </header>
    </>
  );
}