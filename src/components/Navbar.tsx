import React from 'react';
import { ShieldCheck, ShieldAlert, Lock, UserCheck, Search, LogOut } from 'lucide-react';

interface NavbarProps {
  isAdminVisible: boolean;
  isAdminLoggedIn: boolean;
  onOpenAdminModal: () => void;
  onOpenAdminDashboard: () => void;
  onLogoutAdmin: () => void;
  onOpenReportModal: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdminVisible,
  isAdminLoggedIn,
  onOpenAdminModal,
  onOpenAdminDashboard,
  onLogoutAdmin,
  onOpenReportModal,
  activeSection,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
          >
            <div className="w-9 h-9 rounded bg-yellow-400 text-black flex items-center justify-center font-black tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.35)] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-gaming font-bold text-lg tracking-wider text-white uppercase group-hover:text-yellow-400 transition-colors">
                FF SAFE ZONE <span className="text-yellow-400">LK</span>
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links (Single-line, concise) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-yellow-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeSection === 'home' ? 'text-yellow-400 font-semibold' : ''
              }`}
            >
              <Search className="w-4 h-4" />
              Search Database
            </button>
            <button
              onClick={() => onNavigate('trusted')}
              className={`hover:text-yellow-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeSection === 'trusted' ? 'text-yellow-400 font-semibold' : ''
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Trusted Sellers
            </button>
            <button
              onClick={() => onNavigate('blacklist')}
              className={`hover:text-red-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeSection === 'blacklist' ? 'text-red-400 font-semibold' : ''
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Scam Blacklist
            </button>
            <button
              onClick={() => onNavigate('guide')}
              className={`hover:text-yellow-400 transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'guide' ? 'text-yellow-400 font-semibold' : ''
              }`}
            >
              Safety Rules
            </button>
          </nav>

          {/* Zone 3: Primary Action & Hidden Admin Button */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Contact Admin WhatsApp Link (+94768303937) */}
            <a
              href="https://wa.me/94768303937"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-green-300 bg-green-950/40 border border-green-500/40 hover:bg-green-900/40 rounded items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              title="Contact Founder / Admin on WhatsApp (+94 76 830 3937)"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>WhatsApp Admin</span>
            </a>

            {/* Report Scam Button */}
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-950 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 transition-colors rounded shadow-[0_0_10px_rgba(250,204,21,0.25)] flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Report Scam
            </button>

            {/* CRITICAL HIDDEN ADMIN BUTTON (Shown when ?id=admin or authenticated) */}
            {isAdminVisible && (
              <>
                {isAdminLoggedIn ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenAdminDashboard}
                      className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-yellow-400 bg-yellow-950/40 border border-yellow-500/50 hover:bg-yellow-900/50 rounded flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                      title="Open Admin Control Panel"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Admin Panel
                    </button>
                    <button
                      onClick={onLogoutAdmin}
                      className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors rounded hover:bg-zinc-800"
                      title="Logout Admin"
                      aria-label="Logout Admin"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onOpenAdminModal}
                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-zinc-900 border border-amber-400/60 hover:bg-zinc-800 hover:border-amber-400 rounded flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(251,191,36,0.2)] whitespace-nowrap shrink-0"
                    title="Hidden Admin Login (?id=admin detected)"
                  >
                    <Lock className="w-3.5 h-3.5 text-yellow-400" />
                    Admin
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2.5 border-t border-zinc-800/80 text-xs overflow-x-auto gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap px-2 py-1 ${activeSection === 'home' ? 'text-yellow-400 font-bold' : 'text-zinc-400'}`}
          >
            Search
          </button>
          <button
            onClick={() => onNavigate('trusted')}
            className={`whitespace-nowrap px-2 py-1 ${activeSection === 'trusted' ? 'text-yellow-400 font-bold' : 'text-zinc-400'}`}
          >
            Trusted Sellers
          </button>
          <button
            onClick={() => onNavigate('blacklist')}
            className={`whitespace-nowrap px-2 py-1 ${activeSection === 'blacklist' ? 'text-red-400 font-bold' : 'text-zinc-400'}`}
          >
            Blacklist
          </button>
          <button
            onClick={() => onNavigate('guide')}
            className={`whitespace-nowrap px-2 py-1 ${activeSection === 'guide' ? 'text-yellow-400 font-bold' : 'text-zinc-400'}`}
          >
            Safety Rules
          </button>
        </div>
      </div>
    </header>
  );
};
