import React, { useState, useRef } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  FileText,
  Trash2,
  CheckCircle,
  Plus,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  UserCheck,
  Code,
  Image as ImageIcon,
  ZoomIn,
  Lock,
  UserMinus,
  Images,
} from 'lucide-react';
import { TrustedSeller, ScamRecord, PendingReport, SellerRole, ScamType } from '../types';
import {
  getAdminPasswords,
  addAdminPassword,
  deleteAdminPassword,
  addTrustedSeller,
  deleteTrustedSeller,
  convertSellerToScammer,
  addScamRecord,
  deleteScamRecord,
  approvePendingReport,
  deletePendingReport,
  addScreenshotsToScamRecord,
  addScreenshotsToPendingReport,
  resetAllData,
  exportBackupJson,
  importBackupJson,
} from '../utils/storage';
import { downloadStandaloneHtmlFile } from '../utils/exportHtml';
import { compressImageFile } from '../utils/imageCompressor';
import { ImageLightbox } from './ImageLightbox';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  trustedSellers: TrustedSeller[];
  scamRecords: ScamRecord[];
  pendingReports: PendingReport[];
  onDataChanged: () => void;
  isMasterAdmin: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  trustedSellers,
  scamRecords,
  pendingReports,
  onDataChanged,
  isMasterAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'scams' | 'sellers' | 'passwords' | 'system'>('pending');
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Password state
  const [passwords, setPasswords] = useState<string[]>(getAdminPasswords());
  const [newPassword, setNewPassword] = useState('');

  // New Trusted Seller state
  const [newSeller, setNewSeller] = useState({
    name: '',
    role: 'Official Middleman' as SellerRole,
    whatsapp: '',
    facebookUrl: '',
    freefireUid: '',
    vouchesCount: 50,
    rating: 5.0,
    paymentMethods: 'Commercial Bank, FriMi, eZ Cash',
    badgeLevel: 'Diamond' as 'Diamond' | 'Gold' | 'Master',
    isOfficialMiddleman: true,
    notes: '',
    logoUrl: '',
  });

  // State for Demoting / Converting a Trusted Seller to Scammer
  const [sellerToDemote, setSellerToDemote] = useState<TrustedSeller | null>(null);
  const [demoteForm, setDemoteForm] = useState({
    scamAmountLkr: '',
    scamType: 'Account Recovery Fraud (Retrieved after sale)' as ScamType,
    incidentDetails: '',
  });

  // New Scam Record state with photo support
  const [newScam, setNewScam] = useState({
    name: '',
    aliases: '',
    whatsapp: '',
    facebookUrl: '',
    freefireUid: '',
    bankDetails: '',
    scamAmountLkr: '',
    scamTypeCategory: 'Fake Middleman Impersonation',
    customScamType: '',
    incidentDetails: '',
    status: 'Confirmed Scammer' as 'Confirmed Scammer' | 'Banned Criminal' | 'Under Police Complaint',
  });
  const [newScamImages, setNewScamImages] = useState<string[]>([]);
  const [newScamAvatarIdx, setNewScamAvatarIdx] = useState<number>(0);

  // Target item for adding additional screenshots
  const [appendTarget, setAppendTarget] = useState<{ type: 'scam' | 'pending'; id: string; name: string } | null>(null);
  const appendFileInputRef = useRef<HTMLInputElement | null>(null);
  const directScamFileInputRef = useRef<HTMLInputElement | null>(null);
  const sellerLogoInputRef = useRef<HTMLInputElement | null>(null);

  // JSON Import state
  const [jsonInput, setJsonInput] = useState('');

  if (!isOpen) return null;

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // PASSWORD MANAGEMENT (STRICT: ONLY MASTER ADMIN "yominsha")
  const handleAddPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMasterAdmin) {
      showNotice('Permission Denied: Only Master Admin (yominsha) can add passwords.', 'error');
      return;
    }
    const res = addAdminPassword(newPassword);
    if (res.success) {
      setPasswords(getAdminPasswords());
      setNewPassword('');
      showNotice(res.message, 'success');
      onDataChanged();
    } else {
      showNotice(res.message, 'error');
    }
  };

  const handleDeletePassword = (pwd: string) => {
    if (!isMasterAdmin) {
      showNotice('Permission Denied: Only Master Admin (yominsha) can delete passwords.', 'error');
      return;
    }
    if (passwords.length <= 1) {
      showNotice('Security Guard: You must keep at least 1 admin password in the system!', 'error');
      return;
    }
    const res = deleteAdminPassword(pwd);
    if (res.success) {
      setPasswords(getAdminPasswords());
      showNotice(res.message, 'success');
      onDataChanged();
    } else {
      showNotice(res.message, 'error');
    }
  };

  // TRUSTED SELLER MANAGEMENT
  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSeller.name.trim() || !newSeller.whatsapp.trim()) {
      showNotice('Seller Name and WhatsApp are required.', 'error');
      return;
    }
    const pmArray = newSeller.paymentMethods
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    addTrustedSeller({
      name: newSeller.name.trim(),
      role: newSeller.role,
      whatsapp: newSeller.whatsapp.trim(),
      facebookUrl: newSeller.facebookUrl.trim(),
      freefireUid: newSeller.freefireUid.trim(),
      vouchesCount: Number(newSeller.vouchesCount) || 1,
      rating: Number(newSeller.rating) || 5.0,
      paymentMethods: pmArray.length > 0 ? pmArray : ['Commercial Bank'],
      verifiedDate: new Date().toISOString().slice(0, 10),
      badgeLevel: newSeller.badgeLevel,
      isOfficialMiddleman: newSeller.isOfficialMiddleman,
      notes: newSeller.notes.trim(),
      logoUrl: newSeller.logoUrl || undefined,
    });

    onDataChanged();
    showNotice(`Trusted seller "${newSeller.name}" registered with 1:1 Logo.`, 'success');
    setNewSeller({
      name: '',
      role: 'Official Middleman',
      whatsapp: '',
      facebookUrl: '',
      freefireUid: '',
      vouchesCount: 50,
      rating: 5.0,
      paymentMethods: 'Commercial Bank, FriMi, eZ Cash',
      badgeLevel: 'Diamond',
      isOfficialMiddleman: true,
      notes: '',
      logoUrl: '',
    });
  };

  const handleDeleteSeller = (id: string, name: string) => {
    if (confirm(`Remove trusted seller "${name}" from directory?`)) {
      deleteTrustedSeller(id);
      onDataChanged();
      showNotice(`Removed seller "${name}".`, 'success');
    }
  };

  // CONVERT / DEMOTE TRUSTED SELLER TO SCAMMER
  const handleConfirmDemoteSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerToDemote) return;

    const res = convertSellerToScammer(sellerToDemote.id, {
      scamAmountLkr: Number(demoteForm.scamAmountLkr) || 0,
      scamType: demoteForm.scamType,
      incidentDetails:
        demoteForm.incidentDetails.trim() ||
        `Previously verified seller (${sellerToDemote.name}) demoted to scammer by admin due to fraudulent activity.`,
    });

    if (res.success) {
      onDataChanged();
      showNotice(`"${sellerToDemote.name}" has been removed from Trusted and added to the Scam Blacklist!`, 'success');
      setSellerToDemote(null);
      setDemoteForm({
        scamAmountLkr: '',
        scamType: 'Account Recovery Fraud (Retrieved after sale)',
        incidentDetails: '',
      });
    } else {
      showNotice('Failed to demote seller.', 'error');
    }
  };

  // NEW SCAM IMAGE UPLOADS
  const handleNewScamFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const added: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImageFile(files[i]);
        added.push(compressed);
      } catch (err) {
        console.error(err);
      }
    }
    setNewScamImages((prev) => [...prev, ...added]);
    if (directScamFileInputRef.current) directScamFileInputRef.current.value = '';
  };

  // APPEND SCREENSHOTS TO EXISTING RECORDS
  const triggerAppendScreenshots = (target: { type: 'scam' | 'pending'; id: string; name: string }) => {
    setAppendTarget(target);
    if (appendFileInputRef.current) {
      appendFileInputRef.current.click();
    }
  };

  const handleAppendFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!appendTarget) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const added: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImageFile(files[i]);
        added.push(compressed);
      } catch (err) {
        console.error(err);
      }
    }

    if (added.length > 0) {
      if (appendTarget.type === 'scam') {
        addScreenshotsToScamRecord(appendTarget.id, added);
        showNotice(`Added ${added.length} screenshot(s) to "${appendTarget.name}".`, 'success');
      } else {
        addScreenshotsToPendingReport(appendTarget.id, added);
        showNotice(`Added ${added.length} screenshot(s) to pending report for "${appendTarget.name}".`, 'success');
      }
      onDataChanged();
    }

    setAppendTarget(null);
    if (appendFileInputRef.current) appendFileInputRef.current.value = '';
  };

  // SCAM MANAGEMENT
  const handleAddScam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScam.name.trim() && !newScam.whatsapp.trim()) {
      showNotice('Please provide either Scammer Name or WhatsApp Number.', 'error');
      return;
    }

    const aliasList = newScam.aliases
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const scamTypeFinal: ScamType =
      newScam.scamTypeCategory === 'Other'
        ? (newScam.customScamType.trim() || 'Other Fraud')
        : newScam.scamTypeCategory;

    const avatarUrl = newScamImages.length > 0 ? newScamImages[newScamAvatarIdx] : undefined;

    addScamRecord({
      name: newScam.name.trim() || 'Unknown Scammer',
      aliases: aliasList,
      whatsapp: newScam.whatsapp.trim(),
      facebookUrl: newScam.facebookUrl.trim(),
      freefireUid: newScam.freefireUid.trim(),
      bankDetails: newScam.bankDetails.trim() || 'Not specified',
      scamAmountLkr: Number(newScam.scamAmountLkr) || 0,
      scamType: scamTypeFinal,
      incidentDetails: newScam.incidentDetails.trim() || 'Direct admin blacklist addition.',
      proofUrls: newScamImages,
      avatarUrl: avatarUrl,
      dateReported: new Date().toISOString().slice(0, 10),
      status: newScam.status,
    });

    onDataChanged();
    showNotice(`Scammer "${newScam.name}" added to blacklist.`, 'success');
    setNewScam({
      name: '',
      aliases: '',
      whatsapp: '',
      facebookUrl: '',
      freefireUid: '',
      bankDetails: '',
      scamAmountLkr: '',
      scamTypeCategory: 'Fake Middleman Impersonation',
      customScamType: '',
      incidentDetails: '',
      status: 'Confirmed Scammer',
    });
    setNewScamImages([]);
    setNewScamAvatarIdx(0);
  };

  const handleDeleteScam = (id: string, name: string) => {
    if (confirm(`Delete blacklist entry for "${name}"?`)) {
      deleteScamRecord(id);
      onDataChanged();
      showNotice(`Deleted blacklist record for "${name}".`, 'success');
    }
  };

  // PENDING REPORT REVIEW
  const handleApprovePending = (id: string, scammerName: string) => {
    const res = approvePendingReport(id);
    if (res.success) {
      onDataChanged();
      showNotice(`Report approved! "${scammerName}" is now publicly blacklisted with all photos.`, 'success');
    } else {
      showNotice('Failed to approve report.', 'error');
    }
  };

  const handleDeletePending = (id: string, scammerName: string) => {
    if (confirm(`Reject and delete pending report for "${scammerName}"?`)) {
      deletePendingReport(id);
      onDataChanged();
      showNotice(`Report for "${scammerName}" rejected and removed.`, 'success');
    }
  };

  // SYSTEM DATA ACTIONS
  const handleReset = () => {
    if (confirm('Reset entire database to default Sri Lanka Free Fire community records?')) {
      resetAllData();
      setPasswords(getAdminPasswords());
      onDataChanged();
      showNotice('Database reset to defaults successfully.', 'success');
    }
  };

  const handleExportJson = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ff-safe-zone-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Backup JSON exported.', 'success');
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) {
      showNotice('Please paste valid JSON backup data.', 'error');
      return;
    }
    const res = importBackupJson(jsonInput);
    if (res.success) {
      setPasswords(getAdminPasswords());
      setJsonInput('');
      onDataChanged();
      showNotice(res.message, 'success');
    } else {
      showNotice(res.message, 'error');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-5xl bg-zinc-950 border border-yellow-500/50 rounded-xl shadow-[0_0_50px_rgba(250,204,21,0.15)] flex flex-col max-h-[92vh] overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/90">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-yellow-400 text-black flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h2 className="text-base font-bold font-gaming uppercase tracking-wide text-white">
                  FF Safe Zone LK Admin Control Panel
                </h2>
                <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                  <span>Master Security Console</span>
                  <span>·</span>
                  <span className={isMasterAdmin ? 'text-yellow-400 font-semibold' : 'text-zinc-500'}>
                    {isMasterAdmin ? 'Master Super Admin (yominsha)' : 'Secondary Admin Access'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
              aria-label="Close admin dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Global Feedback Notice */}
          {feedback && (
            <div
              className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between transition-all ${
                feedback.type === 'success'
                  ? 'bg-green-950/80 border-b border-green-500/40 text-green-300'
                  : 'bg-red-950/80 border-b border-red-500/40 text-red-300'
              }`}
            >
              <span>{feedback.message}</span>
              <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-zinc-800 bg-zinc-900/50 px-6 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'pending'
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pending Reports</span>
              {pendingReports.length > 0 && (
                <span className="px-1.5 py-0.2 bg-red-600 text-white font-mono text-[10px] rounded font-bold">
                  {pendingReports.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('scams')}
              className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'scams'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Manage Blacklist ({scamRecords.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sellers')}
              className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'sellers'
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Manage Trusted ({trustedSellers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('passwords')}
              className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'passwords'
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin Passwords {isMasterAdmin ? `(${passwords.length})` : '(Locked)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === 'system'
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Data & Export</span>
            </button>
          </div>

          {/* Hidden File Input for Appending Screenshots to any Record */}
          <input
            type="file"
            ref={appendFileInputRef}
            onChange={handleAppendFileSelected}
            multiple
            accept="image/*"
            className="hidden"
          />

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: PENDING REPORTS */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase text-white font-gaming">
                      Pending Community Submissions
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Review submitted evidence, add more screenshots if needed, and publish or reject.
                    </p>
                  </div>
                </div>

                {pendingReports.length === 0 ? (
                  <div className="p-12 text-center bg-zinc-900/30 rounded border border-zinc-800">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-zinc-300 font-semibold">All Pending Reports Reviewed!</p>
                    <p className="text-xs text-zinc-500 mt-1">There are no unverified submissions in the queue.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                          <div className="flex items-center gap-3">
                            {report.avatarUrl ? (
                              <img
                                src={report.avatarUrl}
                                alt={report.scammerName}
                                className="w-12 h-12 rounded object-cover border border-red-500/50 cursor-pointer"
                                onClick={() => setLightboxImage(report.avatarUrl || null)}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded bg-zinc-950 border border-zinc-700 flex items-center justify-center text-zinc-500">
                                <ShieldAlert className="w-6 h-6 text-red-500/70" />
                              </div>
                            )}

                            <div>
                              <div className="text-base font-bold text-white flex items-center gap-2">
                                <span>{report.scammerName}</span>
                                {report.scamAmountLkr > 0 && (
                                  <span className="text-xs font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/40">
                                    Rs. {report.scamAmountLkr.toLocaleString()} LKR
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-zinc-400 mt-0.5">
                                Submitted: {report.submittedAt} · {report.scamType}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => triggerAppendScreenshots({ type: 'pending', id: report.id, name: report.scammerName })}
                              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-yellow-500/30 font-semibold text-xs rounded transition-colors flex items-center gap-1"
                              title="Add more screenshots to this report"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Screenshot</span>
                            </button>
                            <button
                              onClick={() => handleApprovePending(report.id, report.scammerName)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve to Blacklist</span>
                            </button>
                            <button
                              onClick={() => handleDeletePending(report.id, report.scammerName)}
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-300 hover:text-red-400 font-bold text-xs uppercase tracking-wider rounded border border-zinc-700 transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
                            <span className="text-zinc-500 block text-[10px] uppercase">WhatsApp</span>
                            <span className="font-mono text-zinc-200 font-semibold">{report.scammerWhatsapp || 'Not provided'}</span>
                          </div>
                          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
                            <span className="text-zinc-500 block text-[10px] uppercase">Game UID</span>
                            <span className="font-mono text-zinc-200">{report.scammerUid || 'Not provided'}</span>
                          </div>
                          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
                            <span className="text-zinc-500 block text-[10px] uppercase">Reporter Contact</span>
                            <span className="font-mono text-yellow-400">{report.reporterContact || 'Anonymous'}</span>
                          </div>
                          <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 sm:col-span-3">
                            <span className="text-zinc-500 block text-[10px] uppercase">Bank / Payment Channels</span>
                            <span className="font-mono text-red-300">{report.bankDetails || 'Not provided'}</span>
                          </div>
                        </div>

                        {/* Incident Note */}
                        <div className="bg-zinc-950/80 p-3 rounded border border-zinc-800">
                          <span className="text-zinc-400 text-xs font-semibold block mb-1">Description:</span>
                          <p className="text-xs text-zinc-300 leading-relaxed">{report.incidentDetails}</p>
                        </div>

                        {/* Photos & Screenshots Gallery */}
                        {report.proofUrls && report.proofUrls.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-xs text-zinc-400 font-semibold block">
                              Attached Screenshots & Photos ({report.proofUrls.length}):
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {report.proofUrls.map((imgSrc, idx) => (
                                <div
                                  key={idx}
                                  className="relative group rounded border border-zinc-700 overflow-hidden w-20 h-20 bg-zinc-950 cursor-pointer"
                                  onClick={() => setLightboxImage(imgSrc)}
                                >
                                  <img
                                    src={imgSrc}
                                    alt={`Proof ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ZoomIn className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MANAGE SCAM BLACKLIST */}
            {activeTab === 'scams' && (
              <div className="space-y-6">
                {/* Form to directly add scammer with multi-photo upload */}
                <div className="bg-zinc-900 border border-red-900/40 rounded-lg p-5">
                  <h3 className="text-sm font-bold uppercase text-red-400 font-gaming mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Direct Blacklist Entry with Photos & Screenshots
                  </h3>
                  <form onSubmit={handleAddScam} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Scammer Full Name / Main Handle *"
                        value={newScam.name}
                        onChange={(e) => setNewScam({ ...newScam, name: e.target.value })}
                        required
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        placeholder="Aliases (comma-separated)"
                        value={newScam.aliases}
                        onChange={(e) => setNewScam({ ...newScam, aliases: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-red-500"
                      />
                      <input
                        type="text"
                        placeholder="WhatsApp Phone Number"
                        value={newScam.whatsapp}
                        onChange={(e) => setNewScam({ ...newScam, whatsapp: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Free Fire Game UID (Optional)"
                        value={newScam.freefireUid}
                        onChange={(e) => setNewScam({ ...newScam, freefireUid: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-red-500"
                      />
                      <input
                        type="number"
                        placeholder="Scammed Amount (LKR) (Optional)"
                        value={newScam.scamAmountLkr}
                        onChange={(e) => setNewScam({ ...newScam, scamAmountLkr: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-red-500"
                      />
                      <select
                        value={newScam.scamTypeCategory}
                        onChange={(e) => setNewScam({ ...newScam, scamTypeCategory: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-red-500"
                      >
                        <option value="Fake Middleman Impersonation">Fake Middleman Impersonation</option>
                        <option value="Account Sale Scam (Took money, no login)">Account Sale Scam</option>
                        <option value="Account Recovery Fraud (Retrieved after sale)">Account Recovery Fraud</option>
                        <option value="Fake Payment Slip / FriMi Scam">Fake Slip / FriMi Scam</option>
                        <option value="Diamond Top-Up Scam">Diamond Top-Up Scam</option>
                        <option value="Phishing Link / Login Hack">Phishing Link / Login Hack</option>
                        <option value="Other">Other / Custom Scam Type</option>
                      </select>
                    </div>

                    {newScam.scamTypeCategory === 'Other' && (
                      <input
                        type="text"
                        placeholder="Type custom scam classification..."
                        value={newScam.customScamType}
                        onChange={(e) => setNewScam({ ...newScam, customScamType: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-yellow-500/70 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Bank & eZ Cash Details (Optional)"
                        value={newScam.bankDetails}
                        onChange={(e) => setNewScam({ ...newScam, bankDetails: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-red-500"
                      />
                      <input
                        type="url"
                        placeholder="Facebook Profile URL (Optional)"
                        value={newScam.facebookUrl}
                        onChange={(e) => setNewScam({ ...newScam, facebookUrl: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-red-500"
                      />
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Incident details / Scam summary *"
                      value={newScam.incidentDetails}
                      onChange={(e) => setNewScam({ ...newScam, incidentDetails: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-red-500"
                    />

                    {/* Admin Multi-Photo Upload Area */}
                    <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-yellow-400" />
                          <span>Attach Screenshots, WhatsApp Chats, Channel Photos, or Logo</span>
                        </span>
                        <input
                          type="file"
                          ref={directScamFileInputRef}
                          onChange={handleNewScamFileUpload}
                          multiple
                          accept="image/*"
                          className="hidden"
                          id="admin-new-scam-photos"
                        />
                        <label
                          htmlFor="admin-new-scam-photos"
                          className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs uppercase rounded cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Choose Photos</span>
                        </label>
                      </div>

                      {newScamImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {newScamImages.map((img, idx) => (
                            <div
                              key={idx}
                              className={`relative group rounded border overflow-hidden w-16 h-16 bg-zinc-900 ${
                                newScamAvatarIdx === idx ? 'ring-2 ring-yellow-400' : 'border-zinc-700'
                              }`}
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => setNewScamAvatarIdx(idx)}
                                  className="text-[8px] bg-yellow-400 text-black px-1 rounded font-bold"
                                >
                                  Logo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewScamImages((prev) => prev.filter((_, i) => i !== idx))}
                                  className="text-red-400 text-xs"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors"
                      >
                        Publish to Scam Blacklist
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Blacklist Table */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase text-zinc-300 font-gaming">
                      Current Public Blacklist Records ({scamRecords.length})
                    </h4>
                    <span className="text-[11px] text-zinc-500">
                      Click &ldquo;+ Screenshot&rdquo; on any scammer to attach more photos
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="p-3">Avatar / Scammer</th>
                          <th className="p-3">WhatsApp</th>
                          <th className="p-3">Screenshots</th>
                          <th className="p-3">Bank Details</th>
                          <th className="p-3">Scam Amount</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                        {scamRecords.map((scam) => (
                          <tr key={scam.id} className="hover:bg-zinc-900/40">
                            <td className="p-3 font-semibold text-white">
                              <div className="flex items-center gap-2.5">
                                {scam.avatarUrl || (scam.proofUrls && scam.proofUrls[0]) ? (
                                  <img
                                    src={scam.avatarUrl || scam.proofUrls[0]}
                                    alt=""
                                    className="w-9 h-9 rounded object-cover border border-red-500/40 cursor-pointer"
                                    onClick={() => setLightboxImage(scam.avatarUrl || scam.proofUrls[0])}
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500">
                                    <ShieldAlert className="w-4 h-4 text-red-500/60" />
                                  </div>
                                )}
                                <div>
                                  <div>{scam.name}</div>
                                  <div className="text-[10px] text-zinc-500 font-normal">{scam.scamType}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-red-400">{scam.whatsapp || '-'}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-yellow-400">
                                  {scam.proofUrls ? scam.proofUrls.length : 0} photo{scam.proofUrls?.length !== 1 ? 's' : ''}
                                </span>
                                {scam.proofUrls && scam.proofUrls.length > 0 && (
                                  <button
                                    onClick={() => setLightboxImage(scam.proofUrls[0])}
                                    className="p-1 text-zinc-400 hover:text-white"
                                    title="View first photo"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="p-3 font-mono text-zinc-400 max-w-xs truncate">{scam.bankDetails}</td>
                            <td className="p-3 font-mono font-bold text-red-400">
                              {scam.scamAmountLkr > 0 ? `Rs. ${scam.scamAmountLkr.toLocaleString()}` : '-'}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => triggerAppendScreenshots({ type: 'scam', id: scam.id, name: scam.name })}
                                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-yellow-500/30 rounded text-[10px] font-semibold flex items-center gap-1"
                                  title="Upload additional screenshots to this scammer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>+ Screenshot</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteScam(scam.id, scam.name)}
                                  className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                                  title="Delete scammer record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MANAGE TRUSTED SELLERS */}
            {activeTab === 'sellers' && (
              <div className="space-y-6">
                {/* Form to add trusted seller with 1:1 Logo upload */}
                <div className="bg-zinc-900 border border-yellow-500/30 rounded-lg p-5">
                  <h3 className="text-sm font-bold uppercase text-yellow-400 font-gaming mb-3 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Register New Verified Trusted Seller with 1:1 Store Logo
                  </h3>
                  <form onSubmit={handleAddSeller} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Seller Full Name & Tag *"
                        value={newSeller.name}
                        onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })}
                        required
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      />
                      <select
                        value={newSeller.role}
                        onChange={(e) =>
                          setNewSeller({
                            ...newSeller,
                            role: e.target.value as SellerRole,
                            isOfficialMiddleman: e.target.value === 'Official Middleman',
                          })
                        }
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      >
                        <option value="Official Middleman">Official Middleman</option>
                        <option value="Diamond Top-Up">Diamond Top-Up</option>
                        <option value="Account Dealer">Account Dealer</option>
                        <option value="Guild Leader">Guild Leader</option>
                        <option value="Verified Trader">Verified Trader</option>
                      </select>
                      <input
                        type="text"
                        placeholder="WhatsApp Phone Number *"
                        value={newSeller.whatsapp}
                        onChange={(e) => setNewSeller({ ...newSeller, whatsapp: e.target.value })}
                        required
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Free Fire Game UID"
                        value={newSeller.freefireUid}
                        onChange={(e) => setNewSeller({ ...newSeller, freefireUid: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      />
                      <input
                        type="url"
                        placeholder="Facebook Profile URL"
                        value={newSeller.facebookUrl}
                        onChange={(e) => setNewSeller({ ...newSeller, facebookUrl: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      />
                      <input
                        type="number"
                        placeholder="Completed Deals / Vouches Count"
                        value={newSeller.vouchesCount}
                        onChange={(e) => setNewSeller({ ...newSeller, vouchesCount: Number(e.target.value) })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Accepted Payment Methods (comma-separated, e.g. Commercial, FriMi)"
                        value={newSeller.paymentMethods}
                        onChange={(e) => setNewSeller({ ...newSeller, paymentMethods: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      />
                      <input
                        type="text"
                        placeholder="Notes / Credentials description"
                        value={newSeller.notes}
                        onChange={(e) => setNewSeller({ ...newSeller, notes: e.target.value })}
                        className="px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      />
                    </div>

                    {/* 1:1 Store Logo / Avatar Upload */}
                    <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {newSeller.logoUrl ? (
                          <img
                            src={newSeller.logoUrl}
                            alt="Logo preview"
                            className="w-14 h-14 rounded object-cover border border-yellow-400"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-500">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            1:1 Square Store Logo / Avatar
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            Upload square logo image to display on front of seller card
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={sellerLogoInputRef}
                          accept="image/*"
                          className="hidden"
                          id="seller-logo-file"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              const compressed = await compressImageFile(f);
                              setNewSeller((prev) => ({ ...prev, logoUrl: compressed }));
                            }
                          }}
                        />
                        <label
                          htmlFor="seller-logo-file"
                          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs uppercase rounded cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Logo</span>
                        </label>
                        {newSeller.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setNewSeller((prev) => ({ ...prev, logoUrl: '' }))}
                            className="text-xs text-red-400 hover:text-red-300 p-1"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded transition-colors"
                      >
                        Register Trusted Seller
                      </button>
                    </div>
                  </form>
                </div>

                {/* Trusted Sellers Table with Convert to Scammer feature */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase text-zinc-300 font-gaming">
                      Currently Registered Trusted Sellers ({trustedSellers.length})
                    </h4>
                    <span className="text-[11px] text-zinc-500">
                      You can demote any seller who cheated to the public Scam Blacklist
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase font-mono text-[10px]">
                        <tr>
                          <th className="p-3">Logo / Seller Name</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">WhatsApp</th>
                          <th className="p-3">UID</th>
                          <th className="p-3">Vouches</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                        {trustedSellers.map((seller) => (
                          <tr key={seller.id} className="hover:bg-zinc-900/40">
                            <td className="p-3 font-semibold text-white">
                              <div className="flex items-center gap-2">
                                {seller.logoUrl ? (
                                  <img
                                    src={seller.logoUrl}
                                    alt=""
                                    className="w-9 h-9 rounded object-cover border border-yellow-400/50 cursor-pointer shrink-0"
                                    onClick={() => setLightboxImage(seller.logoUrl || null)}
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-yellow-400 shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span>{seller.name}</span>
                                    {seller.isOfficialMiddleman && (
                                      <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1 py-0.2 rounded font-mono">
                                        MM
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-yellow-400/90">{seller.role}</td>
                            <td className="p-3 font-mono text-zinc-200">{seller.whatsapp}</td>
                            <td className="p-3 font-mono">{seller.freefireUid || '-'}</td>
                            <td className="p-3 font-mono font-semibold text-yellow-400">{seller.vouchesCount}+</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Demote / Convert to Scammer Button */}
                                <button
                                  onClick={() => setSellerToDemote(seller)}
                                  className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/80 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                  title="Convert this seller into a blacklisted scammer"
                                >
                                  <UserMinus className="w-3 h-3 text-red-400" />
                                  <span>Scammer කරන්න</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteSeller(seller.id, seller.name)}
                                  className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                                  title="Delete trusted seller"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ADMIN PASSWORDS (STRICT SECURITY: YOMINSHA ONLY) */}
            {activeTab === 'passwords' && (
              <div className="space-y-6 max-w-2xl">
                {!isMasterAdmin ? (
                  /* Blocked for non-master admins */
                  <div className="p-8 text-center bg-zinc-900/40 border border-red-900/50 rounded-xl space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white uppercase font-gaming">
                      Master Key Required / මුරපද කළමනාකරණය තහනම්ය
                    </h3>
                    <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                      ආරක්ෂක නීතිය: අලුතින් Admin Password එකතු කිරීමට, ඇති Passwords බැලීමට හෝ Delete කිරීමට හැක්කේ ප්‍රධාන Master Password එක වන <strong className="text-yellow-400 font-mono">yominsha</strong> මඟින් Login වූ විට පමණි. වෙනත් Admin credentials වලට මෙම අංශය විවෘත නොවේ.
                    </p>
                  </div>
                ) : (
                  /* Full management for master admin */
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase text-white font-gaming flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-yellow-400" />
                        <span>Master Password Management (Super Admin)</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1">
                        You are logged in with the Master Key (<code className="text-yellow-400 font-mono">yominsha</code>). You can add new secondary admin keys or revoke them. Secondary admins will NOT be able to view or delete passwords.
                      </p>
                    </div>

                    {/* Add Password Form */}
                    <form onSubmit={handleAddPassword} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter new admin password..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 outline-none focus:border-yellow-400"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded transition-colors whitespace-nowrap"
                      >
                        Add Password
                      </button>
                    </form>

                    {/* Passwords List */}
                    <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg overflow-hidden">
                      <div className="p-3.5 border-b border-zinc-800 bg-zinc-950/40 text-xs font-semibold text-zinc-300 flex justify-between items-center">
                        <span>Active Passwords</span>
                        <span className="text-[11px] text-zinc-500">
                          {passwords.length} key{passwords.length > 1 ? 's' : ''} registered (min 1 required)
                        </span>
                      </div>
                      <div className="divide-y divide-zinc-800">
                        {passwords.map((pwd) => (
                          <div
                            key={pwd}
                            className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900/40"
                          >
                            <div className="flex items-center gap-3">
                              <KeyRound className="w-4 h-4 text-yellow-400" />
                              <div>
                                <span className="font-mono text-sm text-zinc-200 font-bold tracking-wider">
                                  {pwd}
                                </span>
                                {pwd === 'yominsha' && (
                                  <span className="ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 bg-yellow-400/20 text-yellow-300 rounded font-semibold">
                                    Master Key (Full Control)
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeletePassword(pwd)}
                              disabled={passwords.length <= 1}
                              className={`p-1.5 rounded transition-colors ${
                                passwords.length <= 1
                                  ? 'text-zinc-600 cursor-not-allowed'
                                  : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800'
                              }`}
                              title={
                                passwords.length <= 1
                                  ? 'Cannot delete the last remaining password'
                                  : 'Delete this password'
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {passwords.length <= 1 && (
                      <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded flex items-center gap-2 text-xs text-amber-300">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          Safe guard active: At least one password must remain to prevent lockout.
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SYSTEM & SINGLE-FILE EXPORT */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase text-white font-gaming">
                    Data Backup & GitHub Pages Single-File Export
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Manage the local community database or export a single self-contained HTML file ready for GitHub Pages.
                  </p>
                </div>

                {/* GitHub Pages Standalone Exporter */}
                <div className="p-5 bg-yellow-950/20 border border-yellow-500/40 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-yellow-400 font-bold font-gaming uppercase text-sm">
                      <Code className="w-4 h-4" />
                      <span>Single-File Standalone HTML Exporter</span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 max-w-lg">
                      Downloads an all-in-one single HTML file containing the entire FF Safe Zone LK layout, styles, scripts, and all current sellers and scammers with their photos from your localStorage. Drop it right onto GitHub Pages or double-click to open in any web browser!
                    </p>
                  </div>
                  <button
                    onClick={downloadStandaloneHtmlFile}
                    className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-2 shrink-0 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Single HTML</span>
                  </button>
                </div>

                {/* JSON Backup & Restore */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Export Card */}
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
                    <h4 className="text-xs font-bold uppercase text-white font-gaming flex items-center gap-2">
                      <Download className="w-4 h-4 text-zinc-400" />
                      Export Full JSON Backup
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Download a complete JSON snapshot of all trusted sellers, scam blacklist cases, screenshots, pending reports, and admin keys.
                    </p>
                    <button
                      onClick={handleExportJson}
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded transition-colors"
                    >
                      Download JSON File
                    </button>
                  </div>

                  {/* Reset to Defaults */}
                  <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
                    <h4 className="text-xs font-bold uppercase text-red-400 font-gaming flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-red-400" />
                      Factory Community Reset
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Reset all records back to default Sri Lankan community seed data and restore the master password <code className="text-yellow-400">yominsha</code>.
                    </p>
                    <button
                      onClick={handleReset}
                      className="w-full py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-semibold text-xs rounded transition-colors"
                    >
                      Reset All Data
                    </button>
                  </div>
                </div>

                {/* JSON Import Section */}
                <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase text-white font-gaming flex items-center gap-2">
                    <Upload className="w-4 h-4 text-zinc-400" />
                    Import JSON Backup Data
                  </h4>
                  <textarea
                    rows={3}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste JSON backup text here..."
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-200 font-mono outline-none focus:border-yellow-400"
                  />
                  <button
                    onClick={handleImportJson}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded transition-colors"
                  >
                    Restore From JSON
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/80 flex items-center justify-between text-xs text-zinc-500">
            <span>Admin Console: Full Multi-Photo & Role Security Active</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-semibold"
            >
              Close Panel
            </button>
          </div>
        </div>
      </div>

      {/* Modal to Demote / Convert Trusted Seller to Scammer */}
      {sellerToDemote && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-red-600 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-red-500 font-gaming font-bold text-base uppercase">
                <UserMinus className="w-5 h-5" />
                <span>Convert Seller to Scammer / Scammer කරන්න</span>
              </div>
              <button
                onClick={() => setSellerToDemote(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-red-950/40 border border-red-800/40 rounded text-xs text-red-200">
              <p>
                ඔබ <strong className="text-white underline">{sellerToDemote.name}</strong> නමැති Trusted Seller ව Trusted ලැයිස්තුවෙන් ඉවත් කර <strong>Scam Blacklist</strong> එකට මාරු කිරීමට සූදානම් වේ.
              </p>
            </div>

            <form onSubmit={handleConfirmDemoteSeller} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Scammed Amount (LKR) / වංචා කළ මුදල (ඇත්නම්)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={demoteForm.scamAmountLkr}
                  onChange={(e) => setDemoteForm({ ...demoteForm, scamAmountLkr: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Scam Classification / වංචා වර්ගය
                </label>
                <select
                  value={demoteForm.scamType}
                  onChange={(e) => setDemoteForm({ ...demoteForm, scamType: e.target.value as ScamType })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 outline-none focus:border-red-500"
                >
                  <option value="Account Recovery Fraud (Retrieved after sale)">Account Recovery Fraud (විකිණූ පසු Recover කරගැනීම)</option>
                  <option value="Account Sale Scam (Took money, no login)">Account Sale Scam (සල්ලි අරන් Account නොදීම)</option>
                  <option value="Fake Middleman Impersonation">Fake Middleman Fraud / MM වංචාව</option>
                  <option value="Fake Payment Slip / FriMi Scam">Fake Payment Slip</option>
                  <option value="Diamond Top-Up Scam">Diamond Top-Up Scam</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Incident Reason / සිද්ධිය විස්තර කරන්න <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="මෙම Verified Seller විසින් සිදුකළ වංචාව පිළිබඳව සටහනක් ඇතුළත් කරන්න..."
                  value={demoteForm.incidentDetails}
                  onChange={(e) => setDemoteForm({ ...demoteForm, incidentDetails: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSellerToDemote(null)}
                  className="px-4 py-2 bg-zinc-900 text-zinc-300 rounded hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider rounded"
                >
                  Confirm & Move to Blacklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox for full size photo viewing in Admin Panel */}
      <ImageLightbox
        imageUrl={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
};
