import React, { useState } from 'react';
import { X, ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink, MessageCircle, Copy, Check, ZoomIn } from 'lucide-react';
import { DetailedSearchResult } from '../utils/searchEngine';
import { TrustedSeller, ScamRecord } from '../types';
import { ImageLightbox } from './ImageLightbox';

interface SearchResultModalProps {
  result: DetailedSearchResult | null;
  onClose: () => void;
  onOpenReportModal: () => void;
  onBrowseTrusted: () => void;
}

export const SearchResultModal: React.FC<SearchResultModalProps> = ({
  result,
  onClose,
  onOpenReportModal,
  onBrowseTrusted,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!result) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Search Verification</span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs font-mono text-yellow-400 truncate max-w-xs">&ldquo;{result.query}&rdquo;</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
            aria-label="Close search modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on verdict */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* VERDICT: SCAMMER */}
          {result.verdict === 'SCAMMER' && (
            <div className="space-y-5">
              <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-8 h-8 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold font-gaming uppercase tracking-wide text-red-400">
                      DANGER: Blacklisted Scammer Detected!
                    </h3>
                    <p className="text-sm text-red-200/90 mt-1">
                      Do NOT send money, account credentials, or OTP codes to this individual. They have verified fraud reports filed by the community.
                    </p>
                  </div>
                </div>
              </div>

              {result.matchedScammers.map((scammer: ScamRecord) => (
                <div
                  key={scammer.id}
                  className="bg-zinc-900/90 border border-red-900/40 rounded-lg p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-3">
                      {(scammer.avatarUrl || (scammer.proofUrls && scammer.proofUrls[0])) ? (
                        <img
                          src={scammer.avatarUrl || scammer.proofUrls[0]}
                          alt={scammer.name}
                          className="w-12 h-12 rounded object-cover border border-red-500/50 cursor-pointer shrink-0"
                          onClick={() => setLightboxImage(scammer.avatarUrl || scammer.proofUrls[0])}
                          title="Click to zoom profile photo"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-zinc-950 border border-red-900/60 flex items-center justify-center text-red-500 shrink-0">
                          <ShieldAlert className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-base font-bold text-white">{scammer.name}</h4>
                        {scammer.aliases && scammer.aliases.length > 0 && (
                          <div className="text-xs text-zinc-400 mt-0.5">
                            Aliases: {scammer.aliases.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono uppercase px-2.5 py-1 bg-red-900/60 text-red-300 rounded border border-red-700/50">
                      {scammer.status}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800/80">
                      <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">WhatsApp</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-red-300 font-semibold">{scammer.whatsapp}</span>
                        <button
                          onClick={() => handleCopy(scammer.whatsapp, `wa-${scammer.id}`)}
                          className="text-zinc-400 hover:text-white p-1"
                          title="Copy number"
                        >
                          {copiedId === `wa-${scammer.id}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800/80">
                      <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Free Fire UID</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-zinc-200">{scammer.freefireUid || 'Not specified'}</span>
                        {scammer.freefireUid && (
                          <button
                            onClick={() => handleCopy(scammer.freefireUid, `uid-${scammer.id}`)}
                            className="text-zinc-400 hover:text-white p-1"
                            title="Copy UID"
                          >
                            {copiedId === `uid-${scammer.id}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800/80 sm:col-span-2">
                      <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Bank / Payment Accounts Flagged</span>
                      <span className="font-mono text-red-400 font-semibold block mt-1 break-all">
                        {scammer.bankDetails}
                      </span>
                    </div>

                    <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800/80">
                      <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Scam Method</span>
                      <span className="text-zinc-300 block mt-1">{scammer.scamType}</span>
                    </div>

                    <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800/80">
                      <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Reported Total Fraud</span>
                      <span className="text-red-400 font-bold font-mono text-sm block mt-1">
                        Rs. {scammer.scamAmountLkr.toLocaleString()} LKR
                      </span>
                    </div>
                  </div>

                  {/* Incident Description */}
                  <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800/80">
                    <span className="text-zinc-400 text-xs font-semibold block mb-1">Incident Report:</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">{scammer.incidentDetails}</p>
                  </div>

                  {/* Proof Screenshots Gallery */}
                  {scammer.proofUrls && scammer.proofUrls.length > 0 && (
                    <div className="text-xs space-y-1.5">
                      <span className="text-zinc-400 block font-medium">Evidence Photos & Screenshots:</span>
                      <div className="flex flex-wrap gap-2">
                        {scammer.proofUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded border border-zinc-700 overflow-hidden w-16 h-16 bg-zinc-950 cursor-pointer"
                            onClick={() => setLightboxImage(url)}
                            title={`Click to zoom proof #${idx + 1}`}
                          >
                            <img
                              src={url}
                              alt={`Evidence ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scammer.facebookUrl && (
                    <div className="pt-2">
                      <a
                        href={scammer.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                      >
                        <span>Flagged Facebook Profile: {scammer.facebookUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* VERDICT: TRUSTED */}
          {result.verdict === 'TRUSTED' && (
            <div className="space-y-5">
              <div className="p-4 bg-yellow-950/30 border border-yellow-500/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-8 h-8 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold font-gaming uppercase tracking-wide text-yellow-400">
                      Verified Safe Seller / Middleman Found!
                    </h3>
                    <p className="text-sm text-yellow-100/90 mt-1">
                      This person is listed on the official FF Safe Zone LK verified registry. Always confirm the WhatsApp digits match exactly before sending funds.
                    </p>
                  </div>
                </div>
              </div>

              {result.matchedTrusted.map((seller: TrustedSeller) => (
                <div
                  key={seller.id}
                  className="bg-zinc-900 border border-yellow-500/30 rounded-lg p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        {seller.name}
                        <ShieldCheck className="w-4 h-4 text-yellow-400 inline" />
                      </h4>
                      <div className="text-xs text-yellow-400/90 font-medium mt-0.5">
                        {seller.role} {seller.isOfficialMiddleman ? '· Chief Escrow' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 bg-yellow-400/10 text-yellow-300 border border-yellow-500/30 rounded">
                        {seller.vouchesCount}+ Vouches
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">
                        ★ {seller.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                      <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Official WhatsApp</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-yellow-400 font-bold">{seller.whatsapp}</span>
                        <a
                          href={`https://wa.me/94${seller.whatsapp.replace(/\D/g, '').replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white font-semibold rounded text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" />
                          Chat
                        </a>
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                      <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Free Fire UID</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-mono text-zinc-200">{seller.freefireUid}</span>
                        <button
                          onClick={() => handleCopy(seller.freefireUid, `trusted-uid-${seller.id}`)}
                          className="text-zinc-400 hover:text-white p-1"
                          title="Copy UID"
                        >
                          {copiedId === `trusted-uid-${seller.id}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800 sm:col-span-2">
                      <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Accepted Payment Avenues</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {seller.paymentMethods.map((m, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[11px] rounded">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {seller.notes && (
                    <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/50 p-3 rounded border border-zinc-800/60">
                      {seller.notes}
                    </p>
                  )}

                  {seller.facebookUrl && (
                    <div>
                      <a
                        href={seller.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                      >
                        <span>Visit Official Facebook Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* VERDICT: IMPERSONATION ALERT */}
          {result.verdict === 'IMPERSONATION_ALERT' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/50 border border-amber-500/60 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold font-gaming uppercase tracking-wide text-amber-400">
                      Warning: Impersonation Risk!
                    </h3>
                    <p className="text-sm text-zinc-200 mt-1">
                      This query matches both a known verified person AND a reported scammer alias! Scammers often create fake Facebook / WhatsApp profiles mimicking authentic middlemen.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                Please examine the exact digits of the phone number and Facebook URL below. Never initiate a deal unless the WhatsApp digits match the Verified record precisely.
              </p>
            </div>
          )}

          {/* VERDICT: NOT_FOUND */}
          {result.verdict === 'NOT_FOUND' && (
            <div className="space-y-5 py-4 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400">
                <AlertTriangle className="w-7 h-7 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-gaming uppercase tracking-wide text-zinc-200">
                  No Verified Record Found
                </h3>
                <p className="text-sm text-zinc-400 max-w-md mx-auto mt-2 leading-relaxed">
                  The query <span className="text-yellow-400 font-mono font-medium">&ldquo;{result.query}&rdquo;</span> is not registered in our trusted sellers database or blacklist.
                </p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-lg text-left text-xs space-y-2.5 max-w-lg mx-auto">
                <span className="font-bold text-yellow-400 block uppercase tracking-wider text-[11px]">
                  Crucial Safety Protocol:
                </span>
                <p className="text-zinc-300">
                  • <strong>Do NOT send direct payment</strong> or account details without an official verified Middleman (MM).
                </p>
                <p className="text-zinc-300">
                  • Always demand trade through our verified Sri Lanka MM list. If they refuse a verified MM, they are almost certainly a scammer.
                </p>
                <p className="text-zinc-300">
                  • If this person attempted or completed a scam with you, submit a report below to protect the community.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onBrowseTrusted();
                  }}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
                >
                  Browse Verified Middlemen
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenReportModal();
                  }}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                >
                  Report This Individual
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">FF Safe Zone LK Security Guard</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox for viewing proof screenshots */}
      <ImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
};
