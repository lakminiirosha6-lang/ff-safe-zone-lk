import React, { useState, useMemo, useEffect } from 'react';
import { TrustedSeller, SellerRole } from '../types';
import { ShieldCheck, MessageCircle, ExternalLink, Copy, Check, Search, Images, Heart, Share2, Flame } from 'lucide-react';
import { ImageLightbox } from './ImageLightbox';
import { getLikedIds, toggleSellerLike } from '../utils/storage';

interface TrustedSellersGridProps {
  sellers: TrustedSeller[];
  highlightedSellerId?: string | null;
}

export const TrustedSellersGrid: React.FC<TrustedSellersGridProps> = ({ sellers, highlightedSellerId }) => {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Likes & Liked state
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>(() => {
    const liked = getLikedIds();
    const map: Record<string, boolean> = {};
    liked.sellers.forEach((id) => (map[id] = true));
    return map;
  });

  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    sellers.forEach((s) => {
      map[s.id] = s.likes ?? 0;
    });
    return map;
  });

  // Carousel lightbox state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState<number>(0);
  const [galleryTitle, setGalleryTitle] = useState<string>('');

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

  const handleCopyProfileLink = (seller: TrustedSeller) => {
    const link = `https://tinyurl.com/FFSafeZone?seller=${seller.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(`link-${seller.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLikeToggle = (id: string) => {
    const res = toggleSellerLike(id);
    setLikedMap((prev) => ({ ...prev, [id]: res.isLiked }));
    setLikesCountMap((prev) => ({ ...prev, [id]: res.likes }));
  };

  const handleShare = (seller: TrustedSeller) => {
    const link = `https://tinyurl.com/FFSafeZone?seller=${seller.id}`;
    const text = `🔥 Verified Trusted Seller: ${seller.name} (${seller.role})\nWhatsApp: ${seller.whatsapp}\nView profile & Photo: ${link}`;
    if (navigator.share) {
      navigator.share({ title: seller.name, text, url: link }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedId(`share-${seller.id}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const openSellerGallery = (seller: TrustedSeller, startIndex = 0) => {
    const list: string[] = [];
    if (seller.logoUrl) list.push(seller.logoUrl);
    if (seller.photos && seller.photos.length > 0) {
      seller.photos.forEach((p) => {
        if (!list.includes(p)) list.push(p);
      });
    }

    if (list.length > 0) {
      setGalleryImages(list);
      setGalleryIndex(startIndex);
      setGalleryTitle(`${seller.name} - Verification & Proof Photos`);
    }
  };

  // If highlightedSellerId is provided, open gallery automatically if photos exist
  useEffect(() => {
    if (highlightedSellerId && sellers.length > 0) {
      const match = sellers.find((s) => s.id === highlightedSellerId);
      if (match) {
        const el = document.getElementById(`seller-card-${match.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => {
          openSellerGallery(match, 0);
        }, 500);
      }
    }
  }, [highlightedSellerId, sellers]);

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
    <>
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
              Vetted Sri Lankan Free Fire dealers with verified identities, official store logos, and authenticated vouches. Like, share, or check safe proof below.
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

        {/* Role Filter Tabs */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => {
              const allPhotos = [
                ...(seller.logoUrl ? [seller.logoUrl] : []),
                ...(seller.photos || []),
              ];
              const isLiked = likedMap[seller.id] || false;
              const likesCount = likesCountMap[seller.id] ?? (seller.likes ?? 0);
              const isPopular = seller.vouchesCount >= 50 || likesCount >= 10;
              const isHighlighted = highlightedSellerId === seller.id;

              return (
                <div
                  key={seller.id}
                  id={`seller-card-${seller.id}`}
                  className={`rounded-xl overflow-hidden flex flex-col justify-between transition-all ${
                    isHighlighted
                      ? 'ring-4 ring-yellow-400 scale-[1.02] shadow-[0_0_50px_rgba(250,204,21,0.5)] bg-zinc-900 border-2 border-yellow-400'
                      : isPopular
                      ? 'bg-gradient-to-b from-yellow-500/15 via-zinc-900 to-zinc-900 border-2 border-yellow-400 ring-2 ring-yellow-400/30 shadow-[0_0_30px_rgba(250,204,21,0.2)]'
                      : seller.isOfficialMiddleman
                      ? 'bg-zinc-900/90 border border-yellow-500/50 hover:border-yellow-400 hover:shadow-[0_0_25px_rgba(250,204,21,0.15)]'
                      : 'bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {/* PROMINENT 1:1 SQUARE LOGO / PROOF AT THE TOP */}
                  <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden border-b border-zinc-800 group">
                    {seller.logoUrl ? (
                      <img
                        src={seller.logoUrl}
                        alt={`${seller.name} Logo`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-zinc-900 to-zinc-950">
                        <div className="w-24 h-24 rounded-2xl bg-yellow-400/10 border-2 border-yellow-500/30 flex items-center justify-center text-yellow-400 mb-3 shadow-inner">
                          <ShieldCheck className="w-12 h-12 stroke-[2.5]" />
                        </div>
                        <span className="font-gaming font-bold text-lg text-white uppercase tracking-wider">
                          {seller.name}
                        </span>
                        <span className="text-xs text-yellow-400 mt-1 font-semibold">
                          {seller.role}
                        </span>
                      </div>
                    )}

                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {isPopular && (
                        <div className="bg-yellow-400 text-zinc-950 font-gaming px-2.5 py-1 rounded-md font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-lg animate-pulse">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          <span>Popular Seller 🔥</span>
                        </div>
                      )}
                      <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-yellow-500/40 flex items-center gap-1.5 shadow-md">
                        <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[11px] font-bold text-yellow-400 uppercase font-gaming tracking-wide">
                          {seller.badgeLevel} Verified
                        </span>
                      </div>
                    </div>

                    {/* Like & Share Quick Buttons on Image */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => handleLikeToggle(seller.id)}
                        className={`px-2.5 py-1 rounded-full backdrop-blur-md border flex items-center gap-1 transition-all ${
                          isLiked
                            ? 'bg-red-600/90 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                            : 'bg-black/70 text-zinc-300 border-zinc-700 hover:text-white'
                        }`}
                        title={isLiked ? 'Unlike this seller' : 'Like this seller'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-white' : 'text-red-400'}`} />
                        <span className="text-[11px] font-mono font-bold">{likesCount}</span>
                      </button>

                      <button
                        onClick={() => handleShare(seller)}
                        className="p-1.5 bg-black/70 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-full backdrop-blur-md border border-zinc-700 transition-colors"
                        title="Share profile link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Lightbox Trigger if photos exist */}
                    {allPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => openSellerGallery(seller, 0)}
                        className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs rounded-lg border border-yellow-500/40 backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                      >
                        <Images className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Photos ({allPhotos.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-gaming font-bold text-white text-sm uppercase tracking-wide">
                            {seller.name}
                          </h3>
                          <span className="inline-block mt-0.5 text-xs text-yellow-400 font-medium">
                            {seller.role}
                          </span>
                        </div>
                      </div>

                      {/* Details Box */}
                      <div className="space-y-2.5 text-xs mt-3">
                        <div className="flex items-center justify-between bg-zinc-950/60 px-3 py-2 rounded border border-zinc-800/80">
                          <span className="text-zinc-500">Free Fire UID</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-zinc-200">{seller.freefireUid || 'N/A'}</span>
                            {seller.freefireUid && (
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
                            )}
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
                            Accepted Payment Avenues
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
                          <p className="text-[11px] text-zinc-400 leading-relaxed italic bg-zinc-950/30 p-2 rounded">
                            &ldquo;{seller.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-zinc-800 space-y-2">
                      <div className="flex items-center gap-2">
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

                      <button
                        onClick={() => handleCopyProfileLink(seller)}
                        className="w-full py-1.5 bg-zinc-950 hover:bg-zinc-900 text-yellow-400 border border-yellow-500/30 font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1"
                      >
                        {copiedId === `link-${seller.id}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Profile Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Direct Share Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox / Slider for viewing seller photos */}
      <ImageLightbox
        images={galleryImages}
        initialIndex={galleryIndex}
        title={galleryTitle}
        onClose={() => setGalleryImages([])}
      />
    </>
  );
};
