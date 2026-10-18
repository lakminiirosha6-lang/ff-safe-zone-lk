import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SafetyGuide: React.FC = () => {
  return (
    <section id="safety-rules" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs uppercase font-gaming font-semibold tracking-widest text-yellow-400 mb-2">
          <ShieldCheck className="w-4 h-4 text-yellow-400" />
          <span>Sri Lanka Free Fire Trading Rules</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-gaming text-white uppercase tracking-tight">
          How to Avoid Getting Scammed
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2">
          Follow these 4 golden community rules to ensure your money and game accounts remain 100% secure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Rule 1 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-yellow-400/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-gaming font-bold text-sm">
              01
            </div>
            <h3 className="text-sm font-bold text-white uppercase font-gaming">
              Always Use an Official Middleman (MM)
            </h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed pl-11">
            Never send money or account credentials first to an unknown seller. Legitimate traders will never refuse an official verified middleman. The small middleman fee (Rs. 100 - Rs. 300) protects you from losing tens of thousands.
          </p>
        </div>

        {/* Rule 2 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-yellow-400/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-gaming font-bold text-sm">
              02
            </div>
            <h3 className="text-sm font-bold text-white uppercase font-gaming">
              Beware of Fake Payment Slips
            </h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed pl-11">
            Scammers use modified Photoshop templates of FriMi, Commercial Bank, and BOC transfer slips. <strong>Never release account passwords until you verify the funds have cleared in your actual bank balance</strong>.
          </p>
        </div>

        {/* Rule 3 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-yellow-400/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-gaming font-bold text-sm">
              03
            </div>
            <h3 className="text-sm font-bold text-white uppercase font-gaming">
              Watch Out for Middleman Clones
            </h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed pl-11">
            Fraudsters frequently copy the profile photo, bio, and name of trusted Sri Lankan middlemen like Kasun or SL Ghost. Always compare the exact digits of their WhatsApp phone number with this Safe Zone registry!
          </p>
        </div>

        {/* Rule 4 */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-yellow-400/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-gaming font-bold text-sm">
              04
            </div>
            <h3 className="text-sm font-bold text-white uppercase font-gaming">
              Secure Account Bindings Immediately
            </h3>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed pl-11">
            When buying an account, remove the seller’s phone number, replace the backup recovery email with your own, enable 2-Factor Authentication, and log out of all unknown active devices via Google Account settings.
          </p>
        </div>
      </div>
    </section>
  );
};
