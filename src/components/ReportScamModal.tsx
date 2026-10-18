import React, { useState, useRef } from 'react';
import { X, ShieldAlert, CheckCircle, AlertCircle, Upload, Image, Trash2, ZoomIn, User } from 'lucide-react';
import { ScamType, PendingReport } from '../types';
import { addPendingReport } from '../utils/storage';
import { compressImageFile } from '../utils/imageCompressor';
import { ImageLightbox } from './ImageLightbox';

interface ReportScamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (newReport: PendingReport) => void;
}

export const ReportScamModal: React.FC<ReportScamModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted,
}) => {
  const [formData, setFormData] = useState({
    scammerName: '',
    scammerWhatsapp: '',
    scammerFacebook: '',
    scammerUid: '',
    bankDetails: '',
    scamAmountLkr: '',
    scamTypeCategory: 'Fake Middleman Impersonation',
    customScamType: '',
    incidentDetails: '',
    reporterContact: '',
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [avatarIndex, setAvatarIndex] = useState<number>(0);
  const [urlInput, setUrlInput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setErrorMessage('');
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImageFile(files[i]);
        newImages.push(compressed);
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    }

    setUploadedImages((prev) => [...prev, ...newImages]);
    setIsCompressing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setUploadedImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (avatarIndex >= uploadedImages.length - 1) {
      setAvatarIndex(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only scammer name or phone is required! All others optional!
    if (!formData.scammerName.trim() && !formData.scammerWhatsapp.trim()) {
      setErrorMessage('Please provide either the Scammer Name/Alias or WhatsApp Number.');
      return;
    }

    const scamTypeFinal: ScamType =
      formData.scamTypeCategory === 'Other'
        ? (formData.customScamType.trim() || 'Other Fraud')
        : formData.scamTypeCategory;

    const avatarUrl = uploadedImages.length > 0 ? uploadedImages[avatarIndex] : undefined;

    const report = addPendingReport({
      scammerName: formData.scammerName.trim() || 'Unknown Scammer',
      scammerWhatsapp: formData.scammerWhatsapp.trim() || '',
      scammerFacebook: formData.scammerFacebook.trim() || '',
      scammerUid: formData.scammerUid.trim() || '',
      bankDetails: formData.bankDetails.trim() || 'Not specified',
      scamAmountLkr: Number(formData.scamAmountLkr) || 0,
      scamType: scamTypeFinal,
      incidentDetails: formData.incidentDetails.trim() || 'Reported scam incident without detailed note.',
      proofUrls: uploadedImages,
      avatarUrl: avatarUrl,
      reporterContact: formData.reporterContact.trim() || '',
    });

    onReportSubmitted(report);
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMessage('');
    setUploadedImages([]);
    setAvatarIndex(0);
    setUrlInput('');
    setFormData({
      scammerName: '',
      scammerWhatsapp: '',
      scammerFacebook: '',
      scammerUid: '',
      bankDetails: '',
      scamAmountLkr: '',
      scamTypeCategory: 'Fake Middleman Impersonation',
      customScamType: '',
      incidentDetails: '',
      reporterContact: '',
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-6">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-gaming font-bold text-white text-base uppercase tracking-wide">
                  Report Scammer / හොරෙක් වාර්තා කරන්න
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Provide available evidence & photos to protect the Sri Lanka Free Fire community.
                </p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
              aria-label="Close report modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          {submitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-950/60 border border-green-500/50 flex items-center justify-center text-green-400">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-gaming font-bold text-white uppercase">
                Report Submitted Successfully / සාර්ථකව යොමු කෙරිණි!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                Your report and uploaded photos are recorded for Admin verification. Once approved, this person and their photos will appear on the public Blacklist.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold uppercase tracking-wider text-xs rounded transition-colors"
                >
                  Done / නිමයි
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {errorMessage && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded flex items-center gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Notice Banner */}
              <div className="p-3 bg-zinc-900/70 border border-zinc-800 rounded-lg text-xs text-zinc-300">
                <span className="font-semibold text-yellow-400">සැ.යු (Notice): </span>
                Scammed Amount, Facebook URL, Bank Details, Game UID යන තොරතුරු ඔබ ළඟ ඇත්නම් පමණක් ඇතුළත් කරන්න. ඒවා නොමැතිව වුවද Scammer නම හෝ WhatsApp අංකය සහ Screenshots යොදා Report එකක් එවිය හැක.
              </div>

              {/* Main Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-1">
                    Scammer Name / Alias <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="scammerName"
                    value={formData.scammerName}
                    onChange={handleChange}
                    placeholder="e.g. Kasun Fake MM / Mali_FF"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">හොරාගේ නම හෝ පාවිච්චි කළ බොරු නම</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    name="scammerWhatsapp"
                    value={formData.scammerWhatsapp}
                    onChange={handleChange}
                    placeholder="e.g. 077 123 4567"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">WhatsApp අංකය (ඇත්නම්)</span>
                </div>
              </div>

              {/* Optional Fields 1: Amount & UID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                    <span>Scammed Amount (LKR)</span>
                    <span className="text-[10px] text-zinc-500">(Optional / කැමති නම්)</span>
                  </label>
                  <input
                    type="number"
                    name="scamAmountLkr"
                    value={formData.scamAmountLkr}
                    onChange={handleChange}
                    placeholder="e.g. 15000"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                    <span>Free Fire Game UID</span>
                    <span className="text-[10px] text-zinc-500">(Optional / කැමති නම්)</span>
                  </label>
                  <input
                    type="text"
                    name="scammerUid"
                    value={formData.scammerUid}
                    onChange={handleChange}
                    placeholder="e.g. 192837465"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>

              {/* Optional Fields 2: Bank details & Facebook URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                    <span>Bank / FriMi / eZ Cash Details</span>
                    <span className="text-[10px] text-zinc-500">(Optional / ඇත්නම් පමණක්)</span>
                  </label>
                  <input
                    type="text"
                    name="bankDetails"
                    value={formData.bankDetails}
                    onChange={handleChange}
                    placeholder="e.g. Commercial 800xxxxxx (K. Perera) / eZ Cash"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                    <span>Facebook Profile URL</span>
                    <span className="text-[10px] text-zinc-500">(Optional / ඇත්නම් පමණක්)</span>
                  </label>
                  <input
                    type="url"
                    name="scammerFacebook"
                    value={formData.scammerFacebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>

              {/* Scam Classification with "Other" Custom Type */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-200">
                  Scam Classification / වංචා වර්ගය
                </label>
                <select
                  name="scamTypeCategory"
                  value={formData.scamTypeCategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                >
                  <option value="Fake Middleman Impersonation">Fake Middleman Impersonation (බොරු MM පෙනී සිටීම)</option>
                  <option value="Account Sale Scam (Took money, no login)">Account Sale Scam (සල්ලි අරන් Account නොදීම)</option>
                  <option value="Account Recovery Fraud (Retrieved after sale)">Account Recovery Fraud (විකිණූ පසු නැවත රිකවර් කරගැනීම)</option>
                  <option value="Fake Payment Slip / FriMi Scam">Fake Payment Slip / FriMi Scam (ව්‍යාජ බැංකු රිසිට්)</option>
                  <option value="Diamond Top-Up Scam">Diamond Top-Up Scam (ඩයමන්ඩ් දෙන බව පවසා වංචා කිරීම)</option>
                  <option value="Phishing Link / Login Hack">Phishing Link / Login Hack (බොරු ලින්ක් මඟින් හැක් කිරීම)</option>
                  <option value="Other">Other / වෙනත් (වර්ගය ටයිප් කරන්න)</option>
                </select>

                {/* If "Other" is selected, allow user to type whatever they want */}
                {formData.scamTypeCategory === 'Other' && (
                  <div className="pt-1">
                    <input
                      type="text"
                      name="customScamType"
                      value={formData.customScamType}
                      onChange={handleChange}
                      placeholder="Type custom scam type (e.g. YouTube Channel Scam, Tournament prize scam)..."
                      required
                      autoFocus
                      className="w-full px-3 py-2 bg-zinc-900 border border-yellow-500/70 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                    />
                    <span className="text-[10px] text-yellow-400/90 mt-0.5 block">
                      ඔබට අවශ්‍ය ඕනෑම වංචා වර්ගයක් මෙතැන ටයිප් කරන්න.
                    </span>
                  </div>
                )}
              </div>

              {/* MULTI-PHOTO UPLOAD SECTION: Screenshots, Scammer Logo, Channel Photos, WhatsApp Chats */}
              <div className="space-y-3 p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-white uppercase font-gaming flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-yellow-400" />
                      <span>Photos & Screenshots / සාක්ෂි ඡායාරූප</span>
                    </label>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      හොරාගේ Logo/Avatar, WhatsApp chat, Channel screenshot, Payment slip photos ඕනෑම ප්‍රමාණයක් Add කරන්න.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-500/20">
                    {uploadedImages.length} Photo{uploadedImages.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Upload Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="report-photo-input"
                  />
                  <label
                    htmlFor="report-photo-input"
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Screenshots / Photos</span>
                  </label>

                  {isCompressing && (
                    <span className="text-xs text-yellow-400 animate-pulse font-medium">
                      Optimizing photos...
                    </span>
                  )}
                </div>

                {/* Optional Image URL Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Or paste direct image URL (https://...)"
                    className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded"
                  >
                    Add URL
                  </button>
                </div>

                {/* Image Gallery / Thumbnails */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 pt-2">
                    {uploadedImages.map((imgSrc, idx) => (
                      <div
                        key={idx}
                        className={`relative group rounded border overflow-hidden aspect-square bg-zinc-950 flex items-center justify-center ${
                          avatarIndex === idx ? 'ring-2 ring-yellow-400 border-yellow-400' : 'border-zinc-700'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={`Proof ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Top Indicator */}
                        {avatarIndex === idx && (
                          <span className="absolute top-1 left-1 bg-yellow-400 text-zinc-950 text-[9px] font-bold px-1.5 py-0.2 rounded shadow">
                            Profile/Logo
                          </span>
                        )}

                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          <button
                            type="button"
                            onClick={() => setLightboxImage(imgSrc)}
                            className="p-1 text-white hover:text-yellow-400"
                            title="Zoom / View full size"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAvatarIndex(idx)}
                            className="text-[9px] font-bold px-1 py-0.5 bg-zinc-800 hover:bg-yellow-400 hover:text-black text-zinc-200 rounded"
                            title="Set as main avatar / logo"
                          >
                            Set as Logo
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Remove photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Incident Details Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1">
                  Incident Description / වංචාව සිදුවූ ආකාරය
                </label>
                <textarea
                  name="incidentDetails"
                  rows={3}
                  value={formData.incidentDetails}
                  onChange={handleChange}
                  placeholder="සිද්ධිය කෙටියෙන් විස්තර කරන්න (උදා: Account එක දෙන බව කියා සල්ලි ගෙන Block කරන ලදී)..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                />
              </div>

              {/* Optional Reporter Contact */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                  <span>Your Contact / ඔබගේ අංකය</span>
                  <span className="text-[10px] text-zinc-500">(Optional / රහසිගතයි)</span>
                </label>
                <input
                  type="text"
                  name="reporterContact"
                  value={formData.reporterContact}
                  onChange={handleChange}
                  placeholder="e.g. 077 889 9001 (Janith)"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 rounded transition-colors"
                >
                  Cancel / අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                >
                  Submit Scam Report
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Lightbox for full size photo viewing */}
      <ImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
};
