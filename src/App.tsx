import React, { useState, useEffect, useCallback } from 'react';
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

  // Reload data from localStorage
  const refreshData = useCallback(() => {
    setTrustedSellers(getTrustedSellers());
    setScamRecords(getScamRecords());
    setPendingReports(getPendingReports());
    getAdminPasswords(); // Ensures passwords key is initialized
  }, []);

  // Initialization & URL Detection (?id=admin)
  useEffect(() => {
    refreshData();

    // Check if URL contains ?id=admin
    const urlParams = new URLSearchParams(window.location.search);
    const hasAdminParam = urlParams.get('id') === 'admin' || window.location.href.includes('id=admin');

    // Check session storage for existing session
    const savedAdminSession = sessionStorage.getItem('ff_admin_logged_in') === 'true';

    if (hasAdminParam || savedAdminSession) {
      setIsAdminVisible(true);
      if (savedAdminSession) {
        setIsAdminLoggedIn(true);
      } else {
        // Automatically open the admin login modal if ?id=admin is in URL as requested
        setIsAdminLoginOpen(true);
      }
    }
  }, [refreshData]);

  // Execute Search
  const handleSearch = (query: string) => {
    const result = performCommunitySearch(query, trustedSellers, scamRecords);
    setSearchResult(result);
  };

  // Admin login successful
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setIsAdminVisible(true);
    sessionStorage.setItem('ff_admin_logged_in', 'true');
    setIsAdminLoginOpen(false);
    setIsAdminDashboardOpen(true);
  };

  // Admin logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('ff_admin_logged_in');
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
        <TrustedSellersGrid sellers={trustedSellers} />

        {/* Section 2: Scam Blacklist Red Grid */}
        <ScamBlacklistGrid
          scams={scamRecords}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Section 3: Safety Rules / Guidelines */}
        <SafetyGuide />
      </main>

      {/* Footer */}
      <Footer
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAdminModal={() => setIsAdminLoginOpen(true)}
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
      />
    </div>
  );
}
