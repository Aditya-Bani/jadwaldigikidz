import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/displayNames";
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileBarChart2, 
  Award, 
  Users, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Jadwal", path: "/kalender", icon: CalendarDays },
  { name: "Activity Reports", path: "/reports", icon: FileBarChart2 },
  { name: "Sertifikat", path: "/sertifikat", icon: Award },
  { name: "Parent Portal", path: "/parent", icon: Users, external: true },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || getDisplayName(user?.email || '') || 'Admin';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const getCurrentTitle = () => {
    if (location.pathname === '/') return 'Dashboard Overview';
    if (location.pathname.startsWith('/kalender')) return 'Jadwal Mingguan';
    if (location.pathname.startsWith('/reports')) return 'Activity Reports';
    if (location.pathname.startsWith('/sertifikat')) return 'Sertifikat Murid';
    return 'Admin';
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 font-sans text-foreground dark:text-slate-100 overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 500,
            height: 500,
            top: -160,
            left: -80,
            background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(37,99,235,0) 70%)',
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 450,
            height: 450,
            bottom: -100,
            right: -80,
            background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0) 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      <div className="relative z-10 flex h-screen w-full">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <nav
          className={`fixed left-0 top-0 h-full z-50 flex flex-col justify-between transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 w-[240px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 p-4 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
        >
          {/* Top section: Logo & Nav */}
          <div className="space-y-6">
            {/* Close button for mobile */}
            <button 
              className="md:hidden absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3 px-2 pt-1">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] p-1 flex items-center justify-center">
                  <img
                    alt="Digikidz"
                    className="w-full h-full object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRKHynERf5wOA8tgfU9v2Phn0cnFl1t-odrlzqRW66eyM8P0bMiNRphbcj1RAVJGu9EVTIXLyYtTtPbYU669zpPfC23q9DzpaDGoRmMqTyGw6ke6OA5_D8jVPGde8PdzqcTXpWahYDQhqnG728r8IUIhFl56Jav5htmRGNxIRIiAKRfnvbt3gFZnB30uNbPUQtt5_AAXj3H_MZiF1fNP2wMOaeJFMyf-y70wbcc9SAxYphc0y52ejfmTxR2sRnnGV2v1kndz3uQvE"
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                  DigiKidz
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  Learning Studio
                </div>
              </div>
            </div>

            {/* System Status Pill */}
            <div className="px-2">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Online System</span>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40">
                  Ready
                </Badge>
              </div>
            </div>

            {/* Nav Items */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isExternal = 'external' in item && item.external;
                const isActive = !isExternal && (
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path))
                );

                if (isExternal) {
                  return (
                    <a
                      key={item.path}
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-transparent hover:border-amber-200/60 transition-all no-underline"
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComponent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>{item.name}</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all no-underline ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-white/70" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer: User profile & Logout */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Administrator
                </p>
              </div>
            </div>

            <button
              onClick={() => { setSidebarOpen(false); signOut(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </nav>

        {/* ── Main Content Container ── */}
        <main className="relative flex-1 flex flex-col h-full overflow-x-hidden transition-all duration-300 md:ml-[240px]">
          {/* Top Navbar */}
          <header className="flex items-center justify-between absolute top-0 left-0 w-full z-30 px-4 sm:px-6 md:px-8 py-3.5 bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] safe-area-top">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button 
                className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {getCurrentTitle()}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  <Sparkles className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                  Management Suite
                </span>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2.5">
              <Link
                to="/parent"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all no-underline"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Parent Portal</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Link>
              
              <div
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-blue-500/20"
                title={displayName}
              >
                {initials}
              </div>
            </div>
          </header>

          {/* Scrollable Page Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 md:px-8 pb-8 pt-[74px] md:pt-[84px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

