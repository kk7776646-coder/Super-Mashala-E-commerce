import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  LogOut, 
  KeyRound, 
  ArrowLeft, 
  Eye, 
  EyeOff,
  Loader2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) => {
  const { 
    user, 
    login, 
    register, 
    loginWithGoogle, 
    resetPassword, 
    updatePassword,
    logoutCustomer, 
    authError, 
    setAuthError,
    isPasswordRecovery 
  } = useAuth();

  // Mode: 'login' | 'register' | 'forgot_password' | 'update_password'
  const [mode, setMode] = useState(initialMode);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register states
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    shopName: '',
    password: '',
    confirmPassword: '',
    deliveryAddress: 'ulhasnager-05, Thane, Mumbai, pin code 421005',
    city: 'Thane, Mumbai',
    areaLocality: 'Ulhasnagar-05',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot / Update password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Switch to update_password mode if Supabase recovery flow triggered
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('update_password');
    }
  }, [isPasswordRecovery]);

  useEffect(() => {
    if (isOpen) {
      setLocalError('');
      setSuccessMessage('');
      if (setAuthError) setAuthError(null);
    }
  }, [isOpen, setAuthError]);

  if (!isOpen) return null;

  // 1. Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!loginEmail.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setLocalError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Logged in successfully!');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 700);
    } else {
      setLocalError(res.error || 'Login failed. Please verify your email and password.');
    }
  };

  // 2. Real Google OAuth
  const handleGoogleSignIn = async () => {
    setLocalError('');
    setSuccessMessage('');
    setIsGoogleLoading(true);

    const res = await loginWithGoogle();
    if (!res.success) {
      setIsGoogleLoading(false);
      setLocalError(res.error || 'Failed to initialize Google authentication.');
    }
    // If successful, the browser will redirect to Google's consent screen.
  };

  // 3. Submit Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!regData.fullName.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }
    if (!regData.email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!regData.password) {
      setLocalError('Please choose a password.');
      return;
    }
    if (regData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const res = await register(regData);
    setIsSubmitting(false);

    if (res.success) {
      if (res.needsEmailConfirmation) {
        setSuccessMessage('Account created! A confirmation email has been sent. Please confirm your email to sign in.');
      } else {
        setSuccessMessage('Account created and logged in successfully!');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess();
          onClose();
        }, 900);
      }
    } else {
      setLocalError(res.error || 'Registration failed. Please check the entered details.');
    }
  };

  // 4. Submit Forgot Password Request
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!forgotEmail.trim()) {
      setLocalError('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(forgotEmail);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(res.message || 'Password reset link sent to your email.');
    } else {
      setLocalError(res.error || 'Failed to send password reset link.');
    }
  };

  // 5. Submit Update Password (Post-recovery)
  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    if (!newPassword || newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const res = await updatePassword(newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(res.message || 'Password updated successfully!');
      setTimeout(() => {
        setMode('login');
      }, 1500);
    } else {
      setLocalError(res.error || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-brand-secondary/75 backdrop-blur-xs transition-opacity" 
      />

      <div className="relative bg-brand-card w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border overflow-hidden z-10 my-8 animate-fadeIn">
        
        {/* Header */}
        <div className="bg-brand-secondary text-brand-cream p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-brand-cream/70 hover:text-brand-cream hover:bg-brand-cream/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <BrandLogo variant="footer" size="sm" className="mb-3" />

          <span className="text-[11px] font-bold tracking-widest text-brand-gold uppercase block mb-1">
            Super Mashala Wholesale Customer Portal
          </span>
          
          <h3 className="font-serif text-2xl font-bold text-brand-cream">
            {user 
              ? 'My Customer Account' 
              : mode === 'forgot_password' 
                ? 'Reset Your Password'
                : mode === 'update_password'
                  ? 'Set New Password'
                  : mode === 'login' 
                    ? 'Customer Login' 
                    : 'Create New Account'}
          </h3>
          <p className="text-xs text-brand-cream/80 mt-1">
            {user 
              ? 'View and manage your store delivery address and account details.' 
              : mode === 'forgot_password'
                ? 'Enter your registered email to receive a password reset link.'
                : mode === 'update_password'
                  ? 'Enter your new secure password below.'
                  : 'Log in or sign up to buy wholesale spices and complete checkout.'}
          </p>
        </div>

        {/* User is already logged in: View Profile */}
        {user ? (
          <div className="p-6 space-y-6">
            <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary text-brand-cream flex items-center justify-center font-bold text-sm shadow-xs">
                    {user.fullName?.charAt(0) || user.shopName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-brand-secondary">
                      {user.fullName}
                    </h4>
                    <p className="text-xs text-brand-muted">
                      {user.shopName || 'Retail Customer'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-brand-cream text-brand-primary px-2.5 py-1 rounded-full border border-brand-border flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-brand-gold" />
                  Verified Customer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-brand-muted block text-[11px]">Email Address:</span>
                  <span className="font-semibold text-brand-text truncate block">{user.email || 'None'}</span>
                </div>
                <div>
                  <span className="text-brand-muted block text-[11px]">Contact Mobile:</span>
                  <span className="font-semibold text-brand-text font-mono">{user.mobileNumber || 'Not provided'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-brand-muted block text-[11px]">Delivery Location:</span>
                  <span className="font-semibold text-brand-text">
                    {user.deliveryAddress ? `${user.deliveryAddress}, ${user.city || 'Thane, Mumbai'}` : 'ulhasnager-05, Thane, Mumbai, pin code 421005'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={async () => {
                  await logoutCustomer();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-primary text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-primary-light transition-all shadow-xs cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            
            {/* REAL GOOGLE AUTHENTICATION BUTTON */}
            {(mode === 'login' || mode === 'register') && (
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold rounded-xl border border-gray-300 shadow-xs flex items-center justify-center gap-3 transition-all hover:border-gray-400 group cursor-pointer disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                  ) : (
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>{isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 border-t border-brand-border/60" />
                  <span className="text-[11px] font-semibold text-brand-muted uppercase">
                    Or with email
                  </span>
                  <div className="flex-1 border-t border-brand-border/60" />
                </div>
              </div>
            )}

            {/* Mode Switcher Tabs */}
            {(mode === 'login' || mode === 'register') && (
              <div className="flex bg-brand-surface p-1 rounded-xl border border-brand-border">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLocalError(''); setSuccessMessage(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-brand-primary text-brand-cream shadow-xs'
                      : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setLocalError(''); setSuccessMessage(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-brand-primary text-brand-cream shadow-xs'
                      : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  Create New Account
                </button>
              </div>
            )}

            {/* Back to Login button for Forgot Password mode */}
            {mode === 'forgot_password' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setLocalError(''); setSuccessMessage(''); }}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-light transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            )}

            {/* Error Notification */}
            {(localError || authError) && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{localError || authError}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ----------------- 1. LOGIN FORM ----------------- */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-brand-text">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setForgotEmail(loginEmail || '');
                        setLocalError('');
                        setSuccessMessage('');
                      }}
                      className="text-xs text-brand-primary hover:text-brand-primary-light font-bold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-brand-muted hover:text-brand-text cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-brand-muted">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('register'); setLocalError(''); setSuccessMessage(''); }}
                      className="font-bold text-brand-primary hover:underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ----------------- 2. NEW REGISTRATION FORM ----------------- */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      value={regData.fullName}
                      onChange={(e) => setRegData({...regData, fullName: e.target.value})}
                      placeholder="e.g. Ramesh Patil"
                      className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                    <input
                      type="email"
                      value={regData.email}
                      onChange={(e) => setRegData({...regData, email: e.target.value})}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-text mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={regData.mobileNumber}
                        onChange={(e) => setRegData({...regData, mobileNumber: e.target.value})}
                        placeholder="10-digit mobile"
                        maxLength={10}
                        className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-text mb-1">
                      Shop / Business Name
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regData.shopName}
                        onChange={(e) => setRegData({...regData, shopName: e.target.value})}
                        placeholder="e.g. Patil Kirana"
                        className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-text mb-1">
                      Password (min 6 chars) *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regData.password}
                        onChange={(e) => setRegData({...regData, password: e.target.value})}
                        placeholder="Choose password"
                        className="w-full pl-9 pr-8 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2.5 top-2.5 text-brand-muted hover:text-brand-text"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-text mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regData.confirmPassword}
                        onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
                        placeholder="Confirm password"
                        className="w-full pl-9 pr-8 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-brand-muted hover:text-brand-text"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-brand-text mb-1">
                    Delivery Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                    <textarea
                      value={regData.deliveryAddress}
                      onChange={(e) => setRegData({...regData, deliveryAddress: e.target.value})}
                      rows={2}
                      placeholder="Shop No, Road, Locality, Pincode"
                      className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-brand-muted">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setLocalError(''); setSuccessMessage(''); }}
                      className="font-bold text-brand-primary hover:underline cursor-pointer"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ----------------- 3. FORGOT PASSWORD FLOW ----------------- */}
            {mode === 'forgot_password' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Sending...' : 'Send Password Reset Link'}</span>
                </button>
              </form>
            )}

            {/* ----------------- 4. UPDATE PASSWORD (AFTER RECOVERY LINK) ----------------- */}
            {mode === 'update_password' && (
              <form onSubmit={handleUpdatePasswordSubmit} className="space-y-3.5">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs">
                  <span className="font-bold block">Password Reset Verified</span>
                  <span>Enter a new secure password for your account.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full pl-9 pr-10 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-brand-muted hover:text-brand-text"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-text mb-1">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
