import React, { useState } from 'react';
import { X } from 'lucide-react';

export const GoogleAccountChooserModal = ({ isOpen, onClose, onSelectAccount }) => {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  const handleSignIn = (e) => {
    e.preventDefault();
    setCustomError('');

    const cleanEmail = customEmail.trim().toLowerCase();
    const cleanName = customName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setCustomError('Please enter a valid Google Account email.');
      return;
    }

    const finalName = cleanName || cleanEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase();

    onSelectAccount({
      name: finalName,
      email: cleanEmail,
      sub: `g_account_${Date.now()}`
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dimmed backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-fadeIn z-[100]" 
      />

      {/* Google Account Card */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[101] animate-scaleUp text-gray-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Google "G" Brand Icon */}
          <div className="flex justify-center mb-3">
            <svg className="w-9 h-9" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>

          {/* Heading */}
          <div className="text-center mb-5">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
              Sign in with Google
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              to continue to <span className="font-semibold text-gray-900">SUPER MASHALA &amp; DRY FRUITS</span>
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Google Email Address *
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Your Full Name (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Retail Partner"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {customError && (
              <p className="text-[11px] text-red-600">{customError}</p>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Continue
              </button>
            </div>
          </form>

          {/* Privacy & Terms Note */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-[10px] text-gray-500 leading-relaxed text-center">
            To continue, Google will share your name, email address, language preference, and profile picture with <span className="font-semibold text-gray-700">Super Mashala &amp; Dry Fruits</span>.
          </div>

        </div>
      </div>
    </div>
  );
};

export default GoogleAccountChooserModal;
