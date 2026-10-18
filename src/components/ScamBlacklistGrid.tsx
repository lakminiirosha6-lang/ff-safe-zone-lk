import React, { useState, useMemo } from 'react';
import { ScamRecord } from '../types';
import { ShieldAlert, ExternalLink, Copy, Check, Search, ShieldX, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';

interface ScamBlacklistGridProps {
  scams: ScamRecord[];
  onOpenReportModal: () => void;
}

export const ScamBlacklistGrid: React.FC<ScamBlacklistGridProps> = ({ scams, onOpenReportModal }) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const scamTypes = [
    'All',
    'Fake Middleman Impersonation',
    'Account Sale Scam (Took money, no login)',
    'Account Recovery Fraud (Retrieved after sale)',
    'Fake Payment Slip / FriMi Scam',
    'Diamond Top-Up Scam',
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredScams = useMemo(() => {
    return scams.filter((scam) => {
      const matchesType = selectedType === 'All' || scam.scamType === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        scam.name.toLowerCase().includes(q) ||
        scam.whatsapp.includes(q) ||
        (scam.freefireUid && scam.freefireUid.includes(q)) ||
        scam.bankDetails.toLowerCase().includes(q) ||
        (scam.aliases && scam.aliases.some((a) => a.toLowerCase().includes(q)));
      return matchesType && matchesSearch;
    });
  }, [scams, selectedType, searchQuery]);

  return (
    <>
      <section id="scam-blacklist" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
        {/* Section Header with Alert Red Highlighting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-red-950/60 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase font-gaming font-semibold tracking-widest text-red-500 mb-2">
              <ShieldX className="w-4 h-4 text-red-500" />
              <span>Community Defense Blacklist</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-gaming text-white uppercase tracking-tight">
              Scam Blacklist <span className="text-red-500">Alert Registry</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Confirmed scammers in the Sri Lanka Free Fire community with chat screenshots, channel photos, and bank slips.
            </p>
          </div>

          {/* Search within Blacklist */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bank number, phone, or name..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-red-900/40 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900/80 border border-zinc-800 rounded-lg mb-8 max-w-4xl overflow-x-auto">
          {scamTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                selectedType === type
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Red Grid */}
        {filteredScams.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 rounded border border-zinc-800">
            <p className="text-zinc-400 text-sm">No scam records found matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredScams.map((scam) => {
              const avatar = scam.avatarUrl || (scam.proofUrls && scam.proofUrls[0]);
              return (
                <div
                  key={scam.id}
                  className="bg-zinc-950/80 border border-red-900/50 rounded-lg p-5 flex flex-col justify-between hover:border-red-500 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.12)] relative"
                >
                  <div>
                    {/* Header: Avatar, Name & Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-red-950/80 pb-3">
                      <div className="flex items-center gap-2.5">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={scam.name}
                            className="w-11 h-11 rounded object-cover border border-red-500/50 cursor-pointer shrink-0"
                            onClick={() => setLightboxImage(avatar)}
                            title="Click to zoom profile photo"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded bg-zinc-900 border border-red-900/60 flex items-center justify-center text-red-500 shrink-0">
                            <ShieldAlert className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-red-200 text-sm sm:text-base leading-snug">
                            {scam.name}
                          </h3>
                          {scam.aliases && scam.aliases.length > 0 && (
                            <div className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                              {scam.aliases.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 bg-red-950 text-red-400 border border-red-800/80 rounded whitespace-nowrap shrink-0">
                        {scam.status}
                      </span>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 py-2.5 border-b border-zinc-900">
                      <span className="text-red-400 font-semibold font-mono tabular-nums">
                        {scam.scamAmountLkr > 0 ? `Scammed: Rs. ${scam.scamAmountLkr.toLocaleString()} LKR` : 'Amount: Unspecified'}
                      </span>
                      <span aria-hidden="true" className="text-zinc-700">·</span>
                      <span className="text-zinc-500 text-[11px]">{scam.dateReported}</span>
                    </div>

                    {/* Fields */}
                    <div className="space-y-2.5 my-3 text-xs">
                      <div className="bg-red-950/20 p-2.5 rounded border border-red-900/30">
                        <span className="text-[10px] text-red-400 uppercase tracking-wider block font-medium">
                          Flagged Bank / Payment Channels
                        </span>
                        <span className="font-mono text-zinc-200 block mt-1 break-all">
                          {scam.bankDetails || 'No bank info registered'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">WhatsApp</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-red-400 font-semibold truncate">{scam.whatsapp || 'N/A'}</span>
                            {scam.whatsapp && (
                              <button
                                onClick={() => handleCopy(scam.whatsapp, `wa-scam-${scam.id}`)}
                                className="text-zinc-400 hover:text-white p-0.5"
                                title="Copy number"
                              >
                                {copiedId === `wa-scam-${scam.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-green-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Game UID</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-zinc-300 truncate">{scam.freefireUid || 'N/A'}</span>
                            {scam.freefireUid && (
                              <button
                                onClick={() => handleCopy(scam.freefireUid, `uid-scam-${scam.id}`)}
                                className="text-zinc-400 hover:text-white p-0.5"
                                title="Copy UID"
                              >
                                {copiedId === `uid-scam-${scam.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-green-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Modus Operandi</span>
                        <span className="text-zinc-300 text-xs mt-0.5 block font-medium">{scam.scamType}</span>
                      </div>

                      <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                          Incident Summary
                        </span>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                          {scam.incidentDetails}
                        </p>
                      </div>

                      {/* Evidence / Screenshots Gallery */}
                      {scam.proofUrls && scam.proofUrls.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-yellow-400" />
                            <span>Proof Photos & Screenshots ({scam.proofUrls.length})</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {scam.proofUrls.map((url, idx) => (
                              <div
                                key={idx}
                                className="relative group rounded border border-zinc-700 overflow-hidden w-14 h-14 bg-zinc-900 cursor-pointer"
                                onClick={() => setLightboxImage(url)}
                                title={`View Evidence #${idx + 1}`}
                              >
                                <img
                                  src={url}
                                  alt={`Evidence ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <ZoomIn className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom links */}
                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs">
                    {scam.facebookUrl ? (
                      <a
                        href={scam.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-red-400 flex items-center gap-1 text-[11px] transition-colors"
                      >
                        <span>View Fake FB Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-zinc-600 text-[11px]">No FB profile recorded</span>
                    )}

                    <button
                      onClick={onOpenReportModal}
                      className="text-red-400 hover:text-red-300 text-[11px] font-medium"
                    >
                      Add Evidence +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox for zooming photos */}
      <ImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
};
