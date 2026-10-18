import React, { useState, useMemo } from 'react';
import { ScamRecord } from '../types';
import { ShieldAlert, ExternalLink, Copy, Check, Search, ShieldX, Images, Heart, Share2 } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { getLikedIds, toggleScamLike } from '../utils/storage';

interface ScamBlacklistGridProps {
  scams: ScamRecord[];
  onOpenReportModal: () => void;
}

export const ScamBlacklistGrid: React.FC<ScamBlacklistGridProps> = ({ scams, onOpenReportModal }) => {
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Likes & Liked state
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>(() => {
    const liked = getLikedIds();
    const map: Record<string, boolean> = {};
    liked.scams.forEach((id) => (map[id] = true));
    return map;
  });

  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    scams.forEach((s) => {
      map[s.id] = s.likes ?? 25;
    });
    return map;
  });

  // Gallery slider state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState<number>(0);
  const [galleryTitle, setGalleryTitle] = useState<string>('');

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

  const handleLikeToggle = (id: string) => {
    const res = toggleScamLike(id);
    setLikedMap((prev) => ({ ...prev, [id]: res.isLiked }));
    setLikesCountMap((prev) => ({ ...prev, [id]: res.likes }));
  };

  const handleShare = (scam: ScamRecord) => {
    const text = `SCAMMER ALERT: ${scam.name} (${scam.scamType})\nWhatsApp: ${scam.whatsapp}\nReported on Free Fire Safe Zone LK`;
    if (navigator.share) {
      navigator.share({ title: scam.name, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopiedId(`share-scam-${scam.id}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const openScamGallery = (scam: ScamRecord, startIndex = 0) => {
    const list: string[] = [];
    if (scam.avatarUrl) list.push(scam.avatarUrl);
    if (scam.proofUrls && scam.proofUrls.length > 0) {
      scam.proofUrls.forEach((p) => {
        if (!list.includes(p)) list.push(p);
      });
    }

    if (list.length > 0) {
      setGalleryImages(list);
      setGalleryIndex(startIndex);
      setGalleryTitle(`${scam.name} - Evidence Proof Gallery`);
    }
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
              Confirmed scammers with 1:1 evidence proof photos, chat screenshots, fake profiles, and flagged bank slips. Like, share, or submit new evidence.
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

        {/* Red Grid with Prominent 1:1 Image Presentation */}
        {filteredScams.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/30 rounded border border-zinc-800">
            <p className="text-zinc-400 text-sm">No scam records found matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScams.map((scam) => {
              const allImages = [
                ...(scam.avatarUrl ? [scam.avatarUrl] : []),
                ...(scam.proofUrls || []),
              ];
              const featuredImage = allImages[0];
              const isLiked = likedMap[scam.id] || false;
              const likesCount = likesCountMap[scam.id] ?? (scam.likes ?? 25);

              return (
                <div
                  key={scam.id}
                  className="bg-zinc-950/90 border border-red-900/50 rounded-xl overflow-hidden flex flex-col justify-between hover:border-red-500 transition-all hover:shadow-[0_0_25px_rgba(239,68,68,0.15)] relative"
                >
                  {/* PROMINENT 1:1 SQUARE PROOF / SCAMMER LOGO ON CARD FRONT */}
                  <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden border-b border-red-950/80 group">
                    {featuredImage ? (
                      <img
                        src={featuredImage}
                        alt={`${scam.name} Evidence Proof`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-zinc-900 to-zinc-950">
                        <div className="w-24 h-24 rounded-2xl bg-red-950/50 border-2 border-red-800/40 flex items-center justify-center text-red-500 mb-3 shadow-inner">
                          <ShieldAlert className="w-12 h-12 stroke-[2.5]" />
                        </div>
                        <span className="font-gaming font-bold text-lg text-red-200 uppercase tracking-wider">
                          {scam.name}
                        </span>
                        <span className="text-xs text-red-400/90 mt-1 font-semibold">
                          {scam.scamType}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 bg-red-950/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-red-500/60 flex items-center gap-1.5 shadow-md">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[11px] font-bold text-red-300 uppercase font-gaming tracking-wide">
                        {scam.status}
                      </span>
                    </div>

                    {/* Like & Share Quick Buttons on Image */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => handleLikeToggle(scam.id)}
                        className={`px-2.5 py-1 rounded-full backdrop-blur-md border flex items-center gap-1 transition-all ${
                          isLiked
                            ? 'bg-red-600/90 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                            : 'bg-black/70 text-zinc-300 border-zinc-700 hover:text-white'
                        }`}
                        title={isLiked ? 'Unlike this record' : 'Like this record'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-white' : 'text-red-400'}`} />
                        <span className="text-[11px] font-mono font-bold">{likesCount}</span>
                      </button>

                      <button
                        onClick={() => handleShare(scam)}
                        className="p-1.5 bg-black/70 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-full backdrop-blur-md border border-zinc-700 transition-colors"
                        title="Share warning link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Lightbox / Slider Trigger for all images */}
                    {allImages.length > 0 && (
                      <button
                        type="button"
                        onClick={() => openScamGallery(scam, 0)}
                        className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs rounded-lg border border-red-500/50 backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                      >
                        <Images className="w-3.5 h-3.5 text-red-400" />
                        <span>Photos ({allImages.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-gaming font-bold text-white text-sm uppercase tracking-wide">
                            {scam.name}
                          </h3>
                          <span className="inline-block mt-0.5 text-xs text-red-400 font-semibold">
                            Loss: Rs. {scam.scamAmountLkr.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Scammer Details */}
                      <div className="space-y-2.5 text-xs mt-3">
                        <div className="bg-zinc-900/90 p-2.5 rounded border border-zinc-800">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">WhatsApp Number</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-red-400 font-semibold">{scam.whatsapp}</span>
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
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox / Slider for viewing scam evidence photos */}
      <ImageLightbox
        images={galleryImages}
        initialIndex={galleryIndex}
        title={galleryTitle}
        onClose={() => setGalleryImages([])}
      />
    </>
  );
};
