import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { verifyAdminPassword } from '../utils/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the admin password.');
      return;
    }

    const isValid = verifyAdminPassword(password.trim());
    if (isValid) {
      setError('');
      setPassword('');
      onLoginSuccess();
    } else {
      setError('Invalid admin credentials. Access denied.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-zinc-950 border border-yellow-500/40 rounded-lg shadow-[0_0_30px_rgba(250,204,21,0.15)] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-yellow-400" />
            <span className="font-gaming font-bold text-white uppercase text-sm tracking-wider">
              Admin Authentication
            </span>
          </div>
          <button
            onClick={() => {
              setError('');
              setPassword('');
              onClose();
            }}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
            aria-label="Close admin login"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center space-y-1.5 pb-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-yellow-400/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-zinc-200 uppercase font-gaming">
              Protected Management Console
            </h3>
            <p className="text-xs text-zinc-400">
              Enter your master key or registered administrator password to proceed.
            </p>
          </div>

          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-500/50 rounded flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter master password..."
              autoFocus
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-100 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-zinc-950 font-gaming font-bold text-xs uppercase tracking-wider rounded transition-colors shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            >
              Verify & Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
