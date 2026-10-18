import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';
import { ScamType, PendingReport } from '../types';
import { addPendingReport } from '../utils/storage';

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
    scamType: 'Account Sale Scam (Took money, no login)' as ScamType,
    incidentDetails: '',
    proofUrls: '',
    reporterContact: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scammerName.trim()) {
      setErrorMessage('Please enter the scammer\'s name or alias.');
      return;
    }
    if (!formData.scammerWhatsapp.trim() && !formData.scammerUid.trim() && !formData.bankDetails.trim()) {
      setErrorMessage('Please provide at least a WhatsApp number, Free Fire UID, or Bank details.');
      return;
    }
    if (!formData.incidentDetails.trim()) {
      setErrorMessage('Please describe what happened in detail.');
      return;
    }

    const proofList = formData.proofUrls
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const report = addPendingReport({
      scammerName: formData.scammerName.trim(),
      scammerWhatsapp: formData.scammerWhatsapp.trim(),
      scammerFacebook: formData.scammerFacebook.trim(),
      scammerUid: formData.scammerUid.trim(),
      bankDetails: formData.bankDetails.trim() || 'Not provided',
      scamAmountLkr: Number(formData.scamAmountLkr) || 0,
      scamType: formData.scamType,
      incidentDetails: formData.incidentDetails.trim(),
      proofUrls: proofList,
      reporterContact: formData.reporterContact.trim(),
    });

    onReportSubmitted(report);
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setErrorMessage('');
    setFormData({
      scammerName: '',
      scammerWhatsapp: '',
      scammerFacebook: '',
      scammerUid: '',
      bankDetails: '',
      scamAmountLkr: '',
      scamType: 'Account Sale Scam (Took money, no login)',
      incidentDetails: '',
      proofUrls: '',
      reporterContact: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span className="font-gaming font-bold text-white text-base uppercase tracking-wide">
              Submit Scam Report
            </span>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
            aria-label="Close report modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-950/60 border border-green-500/50 flex items-center justify-center text-green-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-gaming font-bold text-white uppercase">Report Queued for Review</h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              Your submission has been securely recorded. An administrator will verify the bank slips, chat screenshots, and phone numbers before adding the individual to the official Scam Blacklist.
            </p>
            <div className="pt-4">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold uppercase tracking-wider text-xs rounded transition-colors"
              >
                Back to Safe Zone
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded flex items-center gap-2 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Scammer Name / Alias <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="scammerName"
                  value={formData.scammerName}
                  onChange={handleChange}
                  placeholder="e.g. Kasun Fake MM / Mali"
                  required
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Free Fire Game UID
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

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Scammed Amount (LKR)
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
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Scam Classification
              </label>
              <select
                name="scamType"
                value={formData.scamType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
              >
                <option value="Fake Middleman Impersonation">Fake Middleman Impersonation</option>
                <option value="Account Sale Scam (Took money, no login)">Account Sale Scam (Took money, no login)</option>
                <option value="Account Recovery Fraud (Retrieved after sale)">Account Recovery Fraud (Retrieved after sale)</option>
                <option value="Fake Payment Slip / FriMi Scam">Fake Payment Slip / FriMi Scam</option>
                <option value="Diamond Top-Up Scam">Diamond Top-Up Scam</option>
                <option value="Phishing Link / Login Hack">Phishing Link / Login Hack</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Bank / FriMi / eZ Cash Details Used by Scammer
              </label>
              <input
                type="text"
                name="bankDetails"
                value={formData.bankDetails}
                onChange={handleChange}
                placeholder="e.g. Commercial Bank 8009283746 (Kavindu M.) or eZ Cash 077..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Facebook Profile URL (if available)
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

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Detailed Incident Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="incidentDetails"
                rows={3}
                value={formData.incidentDetails}
                onChange={handleChange}
                placeholder="Explain step-by-step how the scam occurred (e.g. promised an account, received slip, then blocked)..."
                required
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Proof Links / Screenshots (One URL per line)
              </label>
              <textarea
                name="proofUrls"
                rows={2}
                value={formData.proofUrls}
                onChange={handleChange}
                placeholder="Paste Imgur, Google Drive, or Cloud image links (https://...)"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100 focus:border-yellow-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Your Contact (WhatsApp or Telegram, for admin verification only)
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

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
              >
                Submit Report to Admin
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
