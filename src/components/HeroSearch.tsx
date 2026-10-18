import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, ArrowRight, Shield } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (query: string) => void;
  trustedCount: number;
  scamCount: number;
  onOpenReportModal: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  trustedCount,
  scamCount,
  onOpenReportModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-zinc-800 bg-gradient-to-b from-zinc-950 via-[#0c0c10] to-[#09090b]">
      {/* Background Subtle Cyber Glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-yellow-500/5 blur-[120px] pointer-events-none rounded-full" 
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Anti-Slop Title & Kicker */}
        <div className="inline-flex items-center gap-2 text-xs uppercase font-gaming font-semibold tracking-widest text-yellow-400 mb-3">
          <Shield className="w-4 h-4 text-yellow-400" />
          <span>Official Sri Lanka Free Fire Community Anti-Scam Registry</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-gaming tracking-tight text-white uppercase max-w-3xl mx-auto leading-tight">
          Verify Before You <span className="text-yellow-400">Trade or Pay</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Instantly search any Free Fire seller, middleman, or buyer in Sri Lanka. Check verified trusted statuses or expose blacklisted fraudsters using phone numbers, UIDs, or bank accounts.
        </p>

        {/* Big Search Form */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                <Search className="w-5 h-5 text-yellow-400/80" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Seller Name, WhatsApp, FB link, Game UID, or Bank details..."
                className="w-full pl-11 pr-4 py-3.5 bg-zinc-900 border border-zinc-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-zinc-950 font-gaming font-bold text-sm tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.25)]"
            >
              <span>Check Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-Click Suggestions */}
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
            <span className="text-zinc-500">Quick Test:</span>
            <button
              onClick={() => handleQuickSearch('Kasun')}
              className="text-yellow-400/90 hover:text-yellow-300 underline decoration-yellow-500/40"
            >
              Kasun (Trusted MM)
            </button>
            <span className="text-zinc-700">·</span>
            <button
              onClick={() => handleQuickSearch('0779911223')}
              className="text-red-400/90 hover:text-red-300 underline decoration-red-500/40"
            >
              0779911223 (Scammer)
            </button>
            <span className="text-zinc-700">·</span>
            <button
              onClick={() => handleQuickSearch('Diamond Hub')}
              className="text-yellow-400/90 hover:text-yellow-300 underline decoration-yellow-500/40"
            >
              Diamond Hub
            </button>
            <span className="text-zinc-700">·</span>
            <button
              onClick={() => handleQuickSearch('8009283746')}
              className="text-red-400/90 hover:text-red-300 underline decoration-red-500/40"
            >
              Bank Slip Scammer
            </button>
          </div>
        </div>

        {/* Clean Metric Bar (Anti-Slop, No Cockpit Hallucinations) */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-zinc-800/80">
          <div className="p-4 bg-zinc-900/40 rounded border border-zinc-800 text-left">
            <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Sellers</span>
            </div>
            <div className="text-2xl font-bold font-gaming text-white mt-1 tabular-nums">
              {trustedCount} Registered
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">Vetted identity & escrow</div>
          </div>

          <div className="p-4 bg-zinc-900/40 rounded border border-zinc-800 text-left">
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Blacklisted Scammers</span>
            </div>
            <div className="text-2xl font-bold font-gaming text-white mt-1 tabular-nums">
              {scamCount} Confirmed
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">With police & proof logs</div>
          </div>

          <div className="p-4 bg-zinc-900/40 rounded border border-zinc-800 text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Community Defense
            </div>
            <div className="text-2xl font-bold font-gaming text-white mt-1 tabular-nums">
              Rs. 2.4M+
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">Estimated fraud prevented</div>
          </div>

          <div className="p-4 bg-zinc-900/40 rounded border border-zinc-800 text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Got Scammed?
            </div>
            <button
              onClick={onOpenReportModal}
              className="text-sm font-bold text-yellow-400 hover:text-yellow-300 mt-1.5 flex items-center gap-1 uppercase tracking-wide"
            >
              <span>Submit Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="text-xs text-zinc-500 mt-0.5">Help blacklist thieves</div>
          </div>
        </div>
      </div>
    </section>
  );
};
