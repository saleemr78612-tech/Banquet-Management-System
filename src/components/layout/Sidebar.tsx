import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarClock,
  Users,
  Calendar,
  Wallet,
  BarChart3,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/bookings", label: "Bookings", icon: CalendarClock },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { settings } = useData();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-maroon-500 text-gold-300 font-display text-lg font-semibold overflow-hidden">
            {settings.logoDataUrl ? (
              <img src={settings.logoDataUrl} alt={settings.banquetName} className="h-full w-full object-cover" />
            ) : (
              settings.banquetName.charAt(0)
            )}
          </div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-ink-800 dark:text-ivory-100 truncate max-w-[150px]">
              {settings.banquetName}
            </p>
            <p className="text-[11px] text-ink-400">Management Console</p>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="md:hidden rounded-full p-1.5 text-ink-400 hover:bg-ivory-200 dark:hover:bg-ink-600"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-maroon-500 text-ivory-50 shadow-card"
                  : "text-ink-600 dark:text-ivory-300 hover:bg-ivory-200 dark:hover:bg-ink-600/40"
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4">
        <div className="seal-divider mb-4" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-maroon-600 font-medium text-sm shrink-0">
              SM
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-sm font-medium text-ink-800 dark:text-ivory-100 truncate">Saleem Raza</p>
              <p className="text-xs text-ink-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="shrink-0 rounded-lg p-2 text-ink-400 hover:bg-ivory-200 dark:hover:bg-ink-600 hover:text-danger-500 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-ink-100 dark:border-ink-600 bg-ivory-50 dark:bg-ink-900 shrink-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-ivory-50 dark:bg-ink-900 shadow-card-hover">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
