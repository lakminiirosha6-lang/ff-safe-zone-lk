import React from 'react';
import { ShieldCheck, Download, Lock } from 'lucide-react';
import { downloadStandaloneHtmlFile } from '../utils/exportHtml';

interface FooterProps {
  onOpenReportModal: () => void;
  onOpenAdminModal: () => void;
  onNavigate: (section: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenReportModal,
  onOpenAdminModal,
  onNavigate,
}) => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-yellow-400 text-black flex items-center justify-center font-black text-xs">
                <ShieldCheck className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="font-gaming font-bold text-white text-base tracking-wider uppercase">
                FF SAFE ZONE <span className="text-yellow-400">LK</span>
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              Sri Lanka Free Fire community verification initiative. Created to protect players, students, and competitive gamers from scam artists, fake middlemen, and fraudulent bank slips.
            </p>
            <div className="text-[11px] text-zinc-500">
              Disclaimer: Community-driven safety database. Free Fire and Garena are trademarks of their respective owners.
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-gaming font-bold uppercase text-white tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-yellow-400 transition-colors">
                  Search Database
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trusted')} className="hover:text-yellow-400 transition-colors">
                  Verified Trusted Sellers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blacklist')} className="hover:text-red-400 transition-colors">
                  Scam Blacklist Registry
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('guide')} className="hover:text-yellow-400 transition-colors">
                  Trading Safety Guidelines
                </button>
              </li>
              <li>
                <button onClick={onOpenReportModal} className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                  Report a Scammer
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Deployment & Utilities */}
          <div className="space-y-2">
            <h4 className="text-xs font-gaming font-bold uppercase text-white tracking-wider">
              Deployment & Tools
            </h4>
            <div className="space-y-2">
              <button
                onClick={downloadStandaloneHtmlFile}
                className="w-full text-left py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded border border-zinc-800 transition-colors flex items-center gap-1.5"
                title="Download single index.html file for GitHub Pages"
              >
                <Download className="w-3.5 h-3.5 text-yellow-400" />
                <span>Export Single HTML</span>
              </button>

              <button
                onClick={onOpenAdminModal}
                className="w-full text-left py-1.5 px-2 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-yellow-400 rounded transition-colors flex items-center gap-1.5"
                title="Access admin login (accessible via ?id=admin)"
              >
                <Lock className="w-3.5 h-3.5 text-zinc-500" />
                <span>Admin Login (?id=admin)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div>
            © {new Date().getFullYear()} FF Safe Zone LK · All data stored locally in client localStorage
          </div>
          <div className="flex items-center gap-4">
            <span>Anti-Fraud Community Defense</span>
            <span>·</span>
            <span>Sri Lanka Gaming Safe Zone</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
