import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { MOBILE_NAV_MODE } from "../../../../constants/layoutConfig";

export default function Layout() {
  const footerBarOnMobile = MOBILE_NAV_MODE === "footerBar";

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden">
      <Header />
      <div className="relative flex flex-1 min-h-0">
        <Sidebar hiddenOnMobile={footerBarOnMobile} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Footer showNavOnMobile={footerBarOnMobile} />
    </div>
  );
}