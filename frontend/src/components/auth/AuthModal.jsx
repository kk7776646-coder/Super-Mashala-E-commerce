import React, { useState } from 'react';
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
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';

export const AuthModal = ({ isOpen, onClose }) => {
  const { user, login, register, loginWithGoogle, logoutCustomer, resetPasswordWithOtp, authError } = useAuth();
  
  // Modes: 'login', 'register', 'forgot_password'
  const [mode, setMode] = useState('login');

  // Login form state
  const [loginMobile, setLoginMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Google Account Chooser Modal state
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  // Reset Password (OTP) state
  const [resetStep, setResetStep] = useState(1); // 1: Enter mobile, 2: Enter OTP & New Password
  const [resetMobile, setResetMobile] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Register form state
  const [regData, setRegData] = useState({
    fullName: '',
    mobileNumber: '',
    shopName: '',
    email: '',
    password: '',
    deliveryAddress: '',
    city: 'Thane, Mumbai',
    areaLocality: 'Ulhasnagar-05',
  });

  const [formSuccess, setFormSuccess] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  // 1. Submit Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!loginMobile) {
      setLocalError('Please enter your mobile number or email.');
      return;
    }
    const success = login(loginMobile, loginPassword);
    if (success) {
      setFormSuccess('Logged in successfully as Shopkeeper!');
      setTimeout(() => {
        setFormSuccess('');
        onClose();
      }, 700);
    }
  };

  // 2. Google Account Selection Handler
  const handleGoogleAccountSelected = async (account) => {
    setShowGoogleChooser(false);
    const mockGooglePayload = {
      email: account.email,
      name: account.name,
      sub: account.sub || `g_${Date.now()}`,
      picture: ''
    };

    const success = await loginWithGoogle(null, mockGooglePayload);
    if (success) {
      setFormSuccess(`Signed in with Google as ${account.name}!`);
      setTimeout(() => {
        setFormSuccess('');
        onClose();
      }, 700);
    }
  };

  // 3. Send Mobile OTP for Password Reset
  const handleSendOtp = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!resetMobile || resetMobile.length < 10) {
      setLocalError('Please enter a valid 10-digit registered mobile number.');
      return;
    }

    setLocalError('Password recovery is unavailable until an OTP provider is configured.');
  };

  // 4. Verify OTP & Reset Password Submit
  const handleVerifyOtpAndReset = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!resetOtp) {
      setLocalError('Please enter the 4-digit verification OTP code.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('New passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword.length < 4) {
      setLocalError('Password must be at least 4 characters long.');
      return;
    }

    const result = resetPasswordWithOtp(resetMobile, resetOtp, newPassword);
    if (result.success) {
      setFormSuccess('Password reset successfully! You can now log in.');
      setLoginMobile(resetMobile);
      setLoginPassword(newPassword);
      setTimeout(() => {
        setMode('login');
        setResetStep(1);
        setResetOtp('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1200);
    } else {
      setLocalError(result.error || 'Failed to reset password.');
    }
  };

  // 5. Submit Registration
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!regData.fullName || !regData.mobileNumber || !regData.shopName || !regData.deliveryAddress) {
      setLocalError('Please complete all required fields.');
      return;
    }
    if (regData.mobileNumber.length < 10) {
      setLocalError('Please provide a valid 10-digit mobile number.');
      return;
    }

    const success = register(regData);
    if (success) {
      setFormSuccess('Shopkeeper registration successful!');
      setTimeout(() => {
        setFormSuccess('');
        onClose();
      }, 900);
    }
  };

  return (
    <>
      {/* Main Authentication Dialog */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto ${showGoogleChooser ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity`}>
        {/* Backdrop */}
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-brand-secondary/70 backdrop-blur-xs transition-opacity" 
        />

        <div className="relative bg-brand-card w-full max-w-lg rounded-2xl shadow-2xl border border-brand-border overflow-hidden z-10 my-8">
          
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
                ? 'My Retail Store Account' 
                : mode === 'forgot_password' 
                  ? 'Reset Password via Mobile OTP'
                  : mode === 'login' 
                    ? 'Shopkeeper Login' 
                    : 'Retailer Registration'}
            </h3>
            <p className="text-xs text-brand-cream/80 mt-1">
              {user 
                ? 'View and manage your store delivery address and profile.' 
                : mode === 'forgot_password'
                  ? 'Verify your registered mobile number using instant OTP.'
                  : 'Direct wholesale spice orders with cash or UPI.'}
            </p>
          </div>

          {/* User is already logged in: View Profile */}
          {user ? (
            <div className="p-6 space-y-6">
              <div className="bg-brand-surface p-4 rounded-xl border border-brand-border space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary text-brand-cream flex items-center justify-center font-bold text-sm shadow-xs">
                      {user.shopName?.charAt(0) || user.fullName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-brand-secondary">
                        {user.shopName || user.fullName}
                      </h4>
                      <p className="text-xs text-brand-muted">
                        Owner: {user.fullName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-brand-cream text-brand-primary px-2.5 py-1 rounded-full border border-brand-border">
                    Retail Member
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-brand-muted block text-[11px]">Contact Mobile:</span>
                    <span className="font-semibold text-brand-text font-mono">{user.mobileNumber || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-brand-muted block text-[11px]">Email:</span>
                    <span className="font-semibold text-brand-text truncate block">{user.email || 'None'}</span>
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
                  onClick={() => {
                    logoutCustomer();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-brand-primary text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-brand-primary-light transition-all shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              
              {/* GOOGLE SIGN IN BUTTON: OPENS CHOOSE AN ACCOUNT POPUP */}
              {mode !== 'forgot_password' && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowGoogleChooser(true)}
                    className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold rounded-xl border border-gray-300 shadow-xs flex items-center justify-center gap-3 transition-all hover:border-gray-400 group cursor-pointer"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              )}

              {mode !== 'forgot_password' && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-brand-border/60" />
                  <span className="text-[11px] font-semibold text-brand-muted uppercase">
                    Or with mobile
                  </span>
                  <div className="flex-1 border-t border-brand-border/60" />
                </div>
              )}

              {/* Mode Switcher Tabs */}
              {mode !== 'forgot_password' ? (
                <div className="flex bg-brand-surface p-1 rounded-xl border border-brand-border">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setLocalError(''); setFormSuccess(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      mode === 'login'
                        ? 'bg-brand-primary text-brand-cream shadow-xs'
                        : 'text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    Shopkeeper Login
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setLocalError(''); setFormSuccess(''); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      mode === 'register'
                        ? 'bg-brand-primary text-brand-cream shadow-xs'
                        : 'text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    New Retailer Register
                  </button>
                </div>
              ) : (
                /* Back to login button when in reset password mode */
                <button
                  type="button"
                  onClick={() => { setMode('login'); setResetStep(1); setLocalError(''); setFormSuccess(''); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-light transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Shopkeeper Login</span>
                </button>
              )}

              {/* Error Notification */}
              {(localError || authError) && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{localError || authError}</span>
                </div>
              )}

              {/* Success Notification */}
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* ----------------- 1. LOGIN FORM ----------------- */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-text mb-1">
                      Mobile Number or Email *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                      <input
                        type="text"
                        value={loginMobile}
                        onChange={(e) => setLoginMobile(e.target.value)}
                        placeholder="Enter 10-digit mobile number or email"
                        className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
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
                          setResetMobile(loginMobile || '');
                          setLocalError('');
                          setFormSuccess('');
                        }}
                        className="text-xs text-brand-primary hover:text-brand-primary-light font-bold hover:underline"
                      >
                        Forgot / Reset Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-9 pr-10 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-brand-muted hover:text-brand-text"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Log In To Store Account
                  </button>
                </form>
              )}

              {/* ----------------- 2. RESET PASSWORD VIA MOBILE OTP ----------------- */}
              {mode === 'forgot_password' && (
                <div className="space-y-4">
                  {resetStep === 1 ? (
                    /* Step 1: Request OTP */
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-text mb-1">
                          Registered Mobile Number *
                        </label>
                        <p className="text-[11px] text-brand-muted mb-2">
                          Password recovery is unavailable until an OTP delivery provider is configured.
                        </p>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                          <input
                            type="tel"
                            value={resetMobile}
                            onChange={(e) => setResetMobile(e.target.value)}
                            placeholder="Enter 10-digit registered mobile number"
                            className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Send OTP via SMS
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Verify OTP and Set New Password */
                    <form onSubmit={handleVerifyOtpAndReset} className="space-y-3.5">
                      
                      <div className="bg-brand-gold/15 border border-brand-gold/50 rounded-xl p-3 text-xs">
                        <span className="font-bold text-brand-secondary block text-[11px]">
                          SMS Verification Code Sent
                        </span>
                        <span className="text-[11px] text-brand-muted">
                          Enter the 4-digit OTP code received on your phone.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-text mb-1">
                          Enter 4-Digit OTP *
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                          <input
                            type="text"
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value)}
                            placeholder="Enter 4-digit OTP"
                            maxLength={6}
                            className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text font-mono tracking-widest focus:outline-none focus:border-brand-primary focus:bg-white"
                            required
                          />
                        </div>
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
                            placeholder="Enter new password"
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
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full pl-9 pr-3 py-2.5 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Verify OTP &amp; Update Password
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ----------------- 3. REGISTRATION FORM ----------------- */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-text mb-1">
                      Retail Shop Name *
                    </label>
                    <div className="relative">
                      <Building2 className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regData.shopName}
                        onChange={(e) => setRegData({...regData, shopName: e.target.value})}
                        placeholder="e.g. Mahalakshmi Kirana Stores"
                        className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-brand-text mb-1">
                        Shopkeeper Name *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                        <input
                          type="text"
                          value={regData.fullName}
                          onChange={(e) => setRegData({...regData, fullName: e.target.value})}
                          placeholder="e.g. Anil Shinde"
                          className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-brand-text mb-1">
                        Mobile Number (WhatsApp) *
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={regData.mobileNumber}
                          onChange={(e) => setRegData({...regData, mobileNumber: e.target.value})}
                          placeholder="10-digit mobile"
                          className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-text mb-1">
                      Store Delivery Address *
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                      <input
                        type="text"
                        value={regData.deliveryAddress}
                        onChange={(e) => setRegData({...regData, deliveryAddress: e.target.value})}
                        placeholder="Shop Number, Street / Road, Market area"
                        className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-brand-text mb-1">
                        Area / Locality *
                      </label>
                      <input
                        type="text"
                        value={regData.areaLocality}
                        onChange={(e) => setRegData({...regData, areaLocality: e.target.value})}
                        placeholder="e.g. Rajarampuri"
                        className="w-full px-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-brand-text mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={regData.city}
                        onChange={(e) => setRegData({...regData, city: e.target.value})}
                        className="w-full px-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-brand-text mb-1">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-3" />
                      <input
                        type="password"
                        value={regData.password}
                        onChange={(e) => setRegData({...regData, password: e.target.value})}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-3 py-2 bg-brand-surface/70 border border-brand-border rounded-xl text-xs text-brand-text focus:outline-none focus:border-brand-primary focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-primary hover:bg-brand-primary-light text-brand-cream text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md mt-2 cursor-pointer"
                  >
                    Create Retail Account
                  </button>
                </form>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Google Account Selector Dialog */}
      <GoogleAccountChooserModal
        isOpen={showGoogleChooser}
        onClose={() => setShowGoogleChooser(false)}
        onSelectAccount={handleGoogleAccountSelected}
      />
    </>
  );
};

export default AuthModal;