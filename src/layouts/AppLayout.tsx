import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { ToastContainer } from "../components/ui/Toast";

const titleByPath: Record<string, string> = {
  "/": "Dashboard",
  "/bookings": "Bookings",
  "/customers": "Customers",
  "/calendar": "Calendar",
  "/payments": "Payments",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const title =
    titleByPath[location.pathname] ??
    (location.pathname.startsWith("/bookings/") ? "Booking Details" : "Al-Noor Banquet");

  return (
    <div className="flex h-screen bg-ivory-100 dark:bg-ink-900">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenMobileMenu={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
