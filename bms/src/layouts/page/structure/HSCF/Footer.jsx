import SidebarMenu from "./SidebarMenu";

export default function Footer({ showNavOnMobile = false }) {
  return (
    <footer className={`w-full sticky bottom-0 z-40 ${showNavOnMobile ? "lg:h-14" : "h-14"}`}>
      {showNavOnMobile ? (
        <>
          {/* Mobile: icon bar with notch-cutout floating indicator */}
          <div className="lg:hidden w-full">
            <SidebarMenu horizontal />
          </div>

          {/* Desktop: normal footer bar with copyright text (sidebar already visible) */}
          <div
            className="
              hidden lg:flex w-full h-full items-center justify-center
              border-t border-gray-100 dark:border-slate-700
              bg-white/90 dark:bg-slate-800/90
              text-xs text-slate-400 dark:text-slate-500 tracking-wide text-center
            "
            style={{
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 -1px 16px rgba(99,102,241,0.04)",
            }}
          >
            ©DevRuss 2026. Budget Management System.
          </div>
        </>
      ) : (
        <div
          className="
            w-full h-full flex items-center justify-center
            border-t border-gray-100 dark:border-slate-700
            bg-white/90 dark:bg-slate-800/90
            text-xs text-slate-400 dark:text-slate-500 tracking-wide text-center
          "
          style={{
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 -1px 16px rgba(99,102,241,0.04)",
          }}
        >
          ©DevRuss 2026. Budget Management System.
        </div>
      )}
    </footer>
  );
}