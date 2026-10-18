import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { SearchResultModal } from './components/SearchResultModal';
import { TrustedSellersGrid } from './components/TrustedSellersGrid';
import { ScamBlacklistGrid } from './components/ScamBlacklistGrid';
import { ReportScamModal } from './components/ReportScamModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SafetyGuide } from './components/SafetyGuide';
import { Footer } from './components/Footer';

import { TrustedSeller, ScamRecord, PendingReport } from './types';
import {
  getTrustedSellers,
  getScamRecords,
  getPendingReports,
  getAdminPasswords,
} from './utils/storage';
import { performCommunitySearch, DetailedSearchResult } from './utils/searchEngine';

export default function App() {
  // Database States from localStorage
  const [trustedSellers, setTrustedSellers] = useState<TrustedSeller[]>([]);
  const [scamRecords, setScamRecords] = useState<ScamRecord[]>([]);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);

  // Navigation State
  const [activeSection, setActiveSection] = useState<'home' | 'trusted' | 'blacklist' | 'guide'>('home');

  // Search Results Modal State
  const [searchResult, setSearchResult] = useState<DetailedSearchResult | null>(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Admin visibility & auth state
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeAdminKey, setActiveAdminKey] = useState<string>(() => sessionStorage.getItem('ff_admin_key') || '');

  // Highlighted states from direct links (?seller=id or ?scam=id)
  const [highlightedSellerId, setHighlightedSellerId] = useState<string | null>(null);
  const [highlightedScamId, setHighlightedScamId] = useState<string | null>(null);

  // Reload data from localStorage
  const refreshData = useCallback(() => {
    setTrustedSellers(getTrustedSellers());
    setScamRecords(getScamRecords());
    setPendingReports(getPendingReports());
    getAdminPasswords(); // Ensures passwords key is initialized
  }, []);

  const location = useLocation();

  // Initialization & URL Detection (?id=admin, ?seller=id, ?scam=id)
  useEffect(() => {
    refreshData();

    // Check search params
    const searchParams = new URLSearchParams(location.search || window.location.search);
    const hasAdminParam = searchParams.get('id') === 'admin' || window.location.href.includes('id=admin');
    const sellerParam = searchParams.get('seller');
    const scamParam = searchParams.get('scam');

    if (sellerParam) setHighlightedSellerId(sellerParam);
    if (scamParam) setHighlightedScamId(scamParam);

    // Check session storage for existing session
    const savedAdminSession = sessionStorage.getItem('ff_admin_logged_in') === 'true';
    const savedKey = sessionStorage.getItem('ff_admin_key') || '';

    if (hasAdminParam || savedAdminSession) {
      setIsAdminVisible(true);
      if (savedAdminSession) {
        setIsAdminLoggedIn(true);
        if (savedKey) setActiveAdminKey(savedKey);
      } else {
        // Automatically open the admin login modal if ?id=admin is in URL as requested
        setIsAdminLoginOpen(true);
      }
    }
  }, [refreshData, location.search]);

  // Execute Search
  const handleSearch = (query: string) => {
    const result = performCommunitySearch(query, trustedSellers, scamRecords);
    setSearchResult(result);
  };

  // Admin login successful
  const handleAdminLoginSuccess = (enteredPassword: string) => {
    setIsAdminLoggedIn(true);
    setIsAdminVisible(true);
    setActiveAdminKey(enteredPassword);
    sessionStorage.setItem('ff_admin_logged_in', 'true');
    sessionStorage.setItem('ff_admin_key', enteredPassword);
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  // Admin logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setActiveAdminKey('');
    sessionStorage.removeItem('ff_admin_logged_in');
    sessionStorage.removeItem('ff_admin_key');
    setIsAdminDashboardOpen(false);
  };

  // Navigation handler
  const handleNavigate = (section: string) => {
    setActiveSection(section as 'home' | 'trusted' | 'blacklist' | 'guide');
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(
        section === 'trusted' ? 'trusted-sellers' : section === 'blacklist' ? 'scam-blacklist' : 'safety-rules'
      );
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      {/* Navbar with Top Bar Contract & Hidden Admin Trigger */}
      <Navbar
        isAdminVisible={isAdminVisible}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminModal={() => setIsAdminLoginOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section & Search Engine */}
        <HeroSearch
          onSearch={handleSearch}
          trustedCount={trustedSellers.length}
          scamCount={scamRecords.length}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Section 1: Trusted Sellers Grid */}
        <TrustedSellersGrid
          sellers={trustedSellers}
          highlightedSellerId={highlightedSellerId}
        />

        {/* Section 2: Scam Blacklist Red Grid */}
        <ScamBlacklistGrid
          scams={scamRecords}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          highlightedScamId={highlightedScamId}
        />

        {/* Section 3: Safety Rules / Guidelines */}
        <SafetyGuide />
      </main>

      {/* Footer */}
      <Footer
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Search Result Modal (Shows SCAMMER, TRUSTED, or CAUTION) */}
      <SearchResultModal
        result={searchResult}
        onClose={() => setSearchResult(null)}
        onOpenReportModal={() => {
          setSearchResult(null);
          setIsReportModalOpen(true);
        }}
        onBrowseTrusted={() => {
          setSearchResult(null);
          handleNavigate('trusted');
        }}
      />

      {/* Report Scam Form Modal */}
      <ReportScamModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportSubmitted={() => {
          refreshData();
        }}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Dashboard Control Panel */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        trustedSellers={trustedSellers}
        scamRecords={scamRecords}
        pendingReports={pendingReports}
        onDataChanged={refreshData}
        isMasterAdmin={activeAdminKey === 'yominsha'}
      />

      {/* Floating WhatsApp Quick Contact Button (+94768303937) */}
      <a
        href="https://wa.me/94768303937"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 transition-all group"
        title="Chat with Admin / Founder on WhatsApp (+94 76 830 3937)"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-950 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-zinc-950"></span>
        </span>
        <MessageCircle className="w-4 h-4 fill-current stroke-[2]" />
        <span className="hidden sm:inline font-mono">WhatsApp Admin</span>
      </a>
    </div>
  );
}
