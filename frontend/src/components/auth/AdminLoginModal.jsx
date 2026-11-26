import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  KeyRound,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export const AdminLoginModal = ({ isOpen, onClose, onAdminSuccess }) => {
  const { loginAdminWithGoogle, resetAdminPasswordWithOtp } = useAuth();
  
  // Modes: 'login', 'reset_password'
  const [viewMode, setViewMode] = useState('login');
  
  // Login form state
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [authStatus, setAuthStatus] = useState(null); // 'SUCCESS' or error message
  const [successNotice, setSuccessNotice] = useState('');

  // Password reset state
  const [resetStep, setResetStep] = useState(1); // 1: Enter phone, 2: Enter OTP & New Password
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmMasterPassword, setConfirmMasterPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const cleanId = adminIdentifier.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    if (!cleanId) {
      setAuthStatus('Please enter an authorized admin email or phone number.');
      return;
    }

    if (!cleanPass) {
      setAuthStatus('Please enter the Admin Master Security Password.');
      return;
    }

    setIsVerifying(true);
    setAuthStatus(null);
    setSuccessNotice('');

    const result = await loginAdminWithGoogle(null, cleanId, cleanPass);
    setIsVerifying(false);

    if (result.success) {
      setAuthStatus('SUCCESS');
      setTimeout(() => {
        onClose();
        if (onAdminSuccess) onAdminSuccess();
      }, 600);
    } else {
      setAuthStatus(result.error || 'Access Denied: Invalid administrator credentials.');
    }
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setResetError('');
    setResetError('Password recovery is unavailable until an OTP provider is configured.');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!newMasterPassword || newMasterPassword.length < 4) {
      setResetError('Password must be at least 4 characters long.');
      return;
    }

    if (newMasterPassword !== confirmMasterPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsVerifying(true);
    const res = await resetAdminPasswordWithOtp(resetPhone.trim(), resetOtp.trim(), newMasterPassword.trim());
    setIsVerifying(false);

    if (res.success) {
      setSuccessNotice('Admin master password successfully updated! Please log in with your new password.');
      setAdminPassword(newMasterPassword.trim());
      setAdminIdentifier(resetPhone.trim());
      setViewMode('login');
      setResetStep(1);
      setNewMasterPassword('');
      setConfirmMasterPassword('');
      setResetOtp('');
    } else {
      setResetError(res.error || 'Password reset failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Dark Security Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-brand-secondary/90 backdrop-blur-md transition-opacity" 
      />

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border-2 border-brand-primary overflow-hidden z-10 my-8">
        
        {/* Header */}
        <div className="bg-brand-secondary text-brand-cream p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-brand-cream/70 hover:text-white hover:bg-brand-cream/10 transition-colors"
            aria-label="Close admin modal"
          >
            <X className="w-5 h-5" />
          </button>

          <BrandLogo variant="footer" size="sm" className="mb-3" />

          <div className="flex items-center gap-2 text-brand-gold text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-4 h-4 text-brand-gold" />
            <span>Restricted Administration System</span>
          </div>

          <h3 className="font-serif text-2xl font-bold text-brand-cream">
            {viewMode === 'login' ? 'Admin Portal Login' : 'Reset Admin Password'}
          </h3>
          <p className="text-xs text-brand-cream/80 mt-1 leading-relaxed">
            {viewMode === 'login' 
              ? 'Strictly restricted to verified Super Mashala business management. Protected by master key & allowlist.'
              : 'Password recovery is unavailable until an OTP delivery provider is configured.'
            }
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Security Alert notice */}
          <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-red-900">
            <ShieldAlert className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">Business Owner Access Only</p>
              <p className="text-red-800 text-[11px] mt-0.5">
                Authorized administrator login only. Customer accounts cannot access this portal.
              </p>
            </div>
          </div>

          {/* Success notice after reset */}
          {successNotice && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="font-semibold">{successNotice}</span>
            </div>
          )}

          {/* Error Message */}
          {(authStatus && authStatus !== 'SUCCESS') && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-700" />
              <div>
                <span className="font-bold block">Access Denied</span>
                <span>{authStatus}</span>
              </div>
            </div>
          )}

          {/* Success Message on Login */}
          {authStatus === 'SUCCESS' && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600" />
              <span className="font-bold">Admin Authorization Verified! Loading dashboard...</span>
            </div>
          )}

          {viewMode === 'login' ? (
            /* LOGIN VIEW */
            <form onSubmit={handleAdminLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Admin Email or Phone Number *
                </label>
                <input
                  type="text"
                  value={adminIdentifier}
                  onChange={(e) => setAdminIdentifier(e.target.value)}
                  placeholder="Enter admin email or phone number"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-brand-primary focus:bg-white font-mono"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-800">
                    Admin Master Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('reset_password');
                      setResetStep(1);
                      setResetPhone(adminIdentifier.includes('@') ? '' : adminIdentifier || '');
                      setResetError('');
                      setAuthStatus(null);
                    }}
                    className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                  >
                    Forgot? Reset via Phone OTP
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin master password"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-brand-primary focus:bg-white font-mono pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-light text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                {isVerifying ? (
                  <span>Validating Security Key...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-brand-gold" />
                    <span>Authenticate Admin Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* RESET PASSWORD VIA PHONE OTP VIEW */
            <div className="space-y-4 animate-fadeIn">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setResetError('');
                }}
                className="text-xs text-gray-600 hover:text-brand-primary font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin Login</span>
              </button>

              {resetError && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-700" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetStep === 1 ? (
                /* Step 1: Enter Phone Number */
                <form onSubmit={handleRequestOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Registered Admin Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={resetPhone}
                        onChange={(e) => setResetPhone(e.target.value)}
                        placeholder="Enter 10-digit registered mobile number"
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-brand-primary focus:bg-white font-mono font-bold"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Must match the official registered business owner mobile number.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send Verification Code (OTP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* Step 2: Enter OTP & New Password */
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900">
                    <p>
                      Verification code sent to <strong>+91 {resetPhone}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      4-Digit OTP Code *
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="Enter 4-digit OTP"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:border-brand-primary focus:bg-white font-mono font-black tracking-widest text-center"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      New Admin Master Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newMasterPassword}
                        onChange={(e) => setNewMasterPassword(e.target.value)}
                        placeholder="Enter new master password"
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-brand-primary focus:bg-white font-mono pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Confirm New Admin Master Password *
                    </label>
                    <input
                      type="password"
                      value={confirmMasterPassword}
                      onChange={(e) => setConfirmMasterPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:border-brand-primary focus:bg-white font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {isVerifying ? (
                      <span>Updating Password...</span>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-brand-gold" />
                        <span>Reset &amp; Save Admin Password</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="pt-2 text-center">
            <p className="text-[10px] text-gray-400">
              Super Mashala Security Guard • Phone &amp; Email Authorization Protected
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
export default AdminLoginModal;
