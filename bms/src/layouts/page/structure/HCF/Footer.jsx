export default function Footer() {
  return (
    <footer
      className="w-full h-14 border-t border-gray-100 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-4 sm:px-6 sticky bottom-0 z-40 flex items-center"
      style={{ boxShadow: "0 -1px 16px rgba(99,102,241,0.04)" }}
    >
      <div
        className="w-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 tracking-wide text-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        ©DevRuss 2026. Budget Management System.
      </div>
    </footer>
  );
}