import React, { useState, useMemo } from 'react';
import { TrustedSeller, SellerRole } from '../types';
import { ShieldCheck, MessageCircle, ExternalLink, Copy, Check, Search, Shield } from 'lucide-react';

interface TrustedSellersGridProps {
  sellers: TrustedSeller[];
}

export const TrustedSellersGrid: React.FC<TrustedSellersGridProps> = ({ sellers }) => {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const roles: ('All' | SellerRole)[] = [
    'All',
    'Official Middleman',
    'Diamond Top-Up',
    'Account Dealer',
    'Guild Leader',
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSellers = useMemo(() => {
    return sellers.filter((seller) => {
      const matchesRole = selectedRole === 'All' || seller.role === selectedRole;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        seller.name.toLowerCase().includes(q) ||
        seller.whatsapp.includes(q) ||
        seller.freefireUid.includes(q) ||
        seller.paymentMethods.some((p) => p.toLowerCase().includes(q));
      return matchesRole && matchesSearch;
    });
  }, [sellers, selectedRole, searchQuery]);

  return (
    <section id="trusted-sellers" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase font-gaming font-semibold tracking-widest text-yellow-400 mb-2">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            <span>Community Verified Registry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-gaming text-white uppercase tracking-tight">
            Trusted Sellers & Official Middlemen
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
            Vetted Sri Lankan Free Fire dealers with verified National ID, phone numbers, and proven transaction histories.
          </p>
        </div>

        {/* Search within trusted */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter trusted by name or UID..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:border-yellow-400 outline-none"
          />
        </div>
      </div>

      {/* Role Filter Tabs (Functional segmented buttons) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900/80 border border-zinc-800 rounded-lg mb-8 max-w-2xl">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
              selectedRole === role
                ? 'bg-yellow-400 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredSellers.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/30 rounded border border-zinc-800">
          <p className="text-zinc-400 text-sm">No trusted sellers match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSellers.map((seller) => (
            <div
              key={seller.id}
              className={`bg-zinc-900/70 border rounded-lg p-5 flex flex-col justify-between transition-all hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.08)] ${
                seller.isOfficialMiddleman ? 'border-yellow-500/40' : 'border-zinc-800'
              }`}
            >
              <div>
                {/* Top Row: Name and Middleman status */}
                <div className="flex items-start justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                      {seller.name}
                      <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0" />
                    </h3>
                    <div className="text-xs text-yellow-400/90 font-medium mt-0.5">
                      {seller.role}
                    </div>
                  </div>
                  {seller.isOfficialMiddleman && (
                    <span className="text-[10px] uppercase font-bold font-gaming tracking-wider px-2 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-500/30 rounded">
                      Official MM
                    </span>
                  )}
                </div>

                {/* Metadata Row: Zero-pill discipline */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 py-3 border-b border-zinc-800/60">
                  <span className="font-mono tabular-nums text-zinc-300">★ {seller.rating.toFixed(1)}</span>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="font-mono tabular-nums text-yellow-400 font-semibold">{seller.vouchesCount}+ Deals</span>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="text-zinc-500 text-[11px]">Since {seller.verifiedDate.slice(0, 4)}</span>
                </div>

                {/* Information Fields */}
                <div className="space-y-2.5 my-3 text-xs">
                  <div className="flex items-center justify-between bg-zinc-950/60 px-3 py-2 rounded border border-zinc-800/80">
                    <span className="text-zinc-500">Free Fire UID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-zinc-200">{seller.freefireUid}</span>
                      <button
                        onClick={() => handleCopy(seller.freefireUid, `uid-${seller.id}`)}
                        className="text-zinc-400 hover:text-white p-0.5"
                        title="Copy UID"
                      >
                        {copiedId === `uid-${seller.id}` ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-950/60 px-3 py-2 rounded border border-zinc-800/80">
                    <span className="text-zinc-500">WhatsApp</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-yellow-400 font-semibold">{seller.whatsapp}</span>
                      <button
                        onClick={() => handleCopy(seller.whatsapp, `wa-${seller.id}`)}
                        className="text-zinc-400 hover:text-white p-0.5"
                        title="Copy WhatsApp"
                      >
                        {copiedId === `wa-${seller.id}` ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-950/40 p-2.5 rounded border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                      Payment Channels
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px] text-zinc-300">
                      {seller.paymentMethods.map((pm, idx) => (
                        <span key={idx} className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                          {pm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {seller.notes && (
                    <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                      &ldquo;{seller.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-800 flex items-center gap-2">
                <a
                  href={`https://wa.me/94${seller.whatsapp.replace(/\D/g, '').replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-500 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Direct WhatsApp</span>
                </a>

                {seller.facebookUrl && (
                  <a
                    href={seller.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded border border-zinc-700 transition-colors"
                    title="Open Facebook Profile"
                    aria-label="Open Facebook Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
