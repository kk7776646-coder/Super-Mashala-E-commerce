import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { API_BASE } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sm_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState(null);
  const [adminAuthError, setAdminAuthError] = useState(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Helper: map Supabase User + Session to customer profile
  const buildCustomerProfile = useCallback((sbUser) => {
    if (!sbUser) return null;
    const meta = sbUser.user_metadata || {};
    const fullName = meta.full_name || meta.name || sbUser.email?.split('@')[0] || 'Retail Partner';
    const shopName = meta.shop_name || `${fullName.split(' ')[0]} Kirana`;

    return {
      id: sbUser.id,
      email: sbUser.email || '',
      fullName: fullName,
      shopName: shopName,
      mobileNumber: meta.phone || meta.mobile_number || sbUser.phone || '',
      deliveryAddress: meta.delivery_address || 'ulhasnager-05, Thane, Mumbai, pin code 421005',
      city: meta.city || 'Thane, Mumbai',
      areaLocality: meta.area_locality || 'Ulhasnagar-05',
      role: 'customer',
      avatarUrl: meta.avatar_url || meta.picture || '',
      createdAt: sbUser.created_at || new Date().toISOString(),
    };
  }, []);

  // Sync Supabase Auth state on load & on changes
  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: initSession }, error }) => {
      if (error) {
        console.warn('Supabase initial session error:', error.message);
      }
      if (initSession?.user) {
        setSession(initSession);
        const profile = buildCustomerProfile(initSession.user);
        setUser(profile);
      }
      setAuthLoading(false);
    }).catch(err => {
      console.warn('Session error:', err);
      setAuthLoading(false);
    });

    // 2. Listen to real-time auth state events (OAuth redirect, login, signout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (currentSession?.user) {
        setSession(currentSession);
        const profile = buildCustomerProfile(currentSession.user);
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        localStorage.removeItem('sm_customer_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [buildCustomerProfile]);

  // Persist user in localStorage for fast UI rendering
  useEffect(() => {
    if (user) {
      localStorage.setItem('sm_customer_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sm_customer_user');
    }
  }, [user]);

  // Persist admin user
  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('sm_admin_user', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('sm_admin_user');
    }
  }, [adminUser]);

  // 1. Customer Email & Password Login
  const login = async (email, password) => {
    setAuthError(null);
    const cleanEmail = (email || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      setAuthError('Please enter your email address.');
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!cleanPass) {
      setAuthError('Please enter your password.');
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data?.session) {
        setSession(data.session);
        const profile = buildCustomerProfile(data.session.user);
        setUser(profile);
      }

      return { success: true };
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // 2. Customer Real Google OAuth Sign-In
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      // Determine origin and redirect URL for OAuth callback
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectOrigin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Google sign-in encountered an error.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // 3. Customer Email & Password Registration
  const register = async (formData) => {
    setAuthError(null);
    const cleanEmail = (formData.email || '').trim();
    const cleanPass = (formData.password || '').trim();
    const cleanName = (formData.fullName || '').trim();
    const cleanShop = (formData.shopName || '').trim();
    const cleanPhone = (formData.mobileNumber || '').trim();
    const cleanAddress = (formData.deliveryAddress || '').trim();

    if (!cleanEmail || !cleanPass) {
      setAuthError('Please enter a valid email and password.');
      return { success: false, error: 'Please enter a valid email and password.' };
    }

    if (cleanPass.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
        options: {
          emailRedirectTo: redirectOrigin,
          data: {
            full_name: cleanName,
            name: cleanName,
            shop_name: cleanShop,
            phone: cleanPhone,
            mobile_number: cleanPhone,
            delivery_address: cleanAddress,
            city: formData.city || 'Thane, Mumbai',
            area_locality: formData.areaLocality || 'Ulhasnagar-05',
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data?.session) {
        setSession(data.session);
        const profile = buildCustomerProfile(data.session.user);
        setUser(profile);
      }

      return {
        success: true,
        needsEmailConfirmation: !data?.session && !!data?.user,
        user: data?.user,
      };
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // 4. Customer Forgot Password (Email Link via Supabase)
  const resetPassword = async (email) => {
    setAuthError(null);
    const cleanEmail = (email || '').trim();
    if (!cleanEmail) {
      setAuthError('Please enter your registered email address.');
      return { success: false, error: 'Please enter your registered email address.' };
    }

    try {
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
      const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${redirectOrigin}/#recovery`,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Password reset link sent to your email. Please check your inbox.',
        data,
      };
    } catch (err) {
      const msg = err.message || 'Password reset request failed.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // 5. Update Password (after recovery link clicked)
  const updatePassword = async (newPassword) => {
    setAuthError(null);
    if (!newPassword || newPassword.length < 6) {
      setAuthError('New password must be at least 6 characters long.');
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      setIsPasswordRecovery(false);
      return { success: true, message: 'Password updated successfully!' };
    } catch (err) {
      const msg = err.message || 'Failed to update password.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // 6. Customer Logout
  const logoutCustomer = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('sm_customer_user');
  };

  // 7. Update Profile
  const updateProfile = async (updatedData) => {
    setUser(prev => prev ? { ...prev, ...updatedData, role: 'customer' } : null);
    try {
      await supabase.auth.updateUser({
        data: {
          full_name: updatedData.fullName,
          shop_name: updatedData.shopName,
          phone: updatedData.mobileNumber,
          delivery_address: updatedData.deliveryAddress,
          city: updatedData.city,
          area_locality: updatedData.areaLocality,
        }
      });
    } catch (e) {
      // ignore
    }
  };

  // 8. Secure Admin Login & Master Password
  const loginAdminWithGoogle = async (credential, identifier, password) => {
    setAdminAuthError(null);
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    try {
      const response = await fetch(`${API_BASE}/api/admin/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          identifier: cleanId,
          email: cleanId,
          phone: cleanId,
          password: cleanPass
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAdminUser({
          email: data.admin.email,
          phone: data.admin.phone || '9527898176',
          name: data.admin.name || 'Md Anwar (Business Owner)',
          role: 'admin',
          sessionToken: data.sessionToken,
          authenticatedAt: new Date().toISOString(),
        });
        return { success: true };
      } else {
        const errorMsg = data.detail || `Access Denied: Invalid credentials or unauthorized administrator.`;
        setAdminAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Admin sign-in service is unavailable.';
      setAdminAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 9. Reset Admin Password
  const resetAdminPasswordWithOtp = async (phone, otp, newPassword) => {
    setAdminAuthError(null);
    const cleanPhone = (phone || '').trim();
    const cleanOtp = (otp || '').trim();
    const cleanNewPass = (newPassword || '').trim();

    if (cleanPhone !== '9527898176') {
      const err = 'Phone number is not registered as an authorized administrator.';
      setAdminAuthError(err);
      return { success: false, error: err };
    }

    if (!cleanNewPass || cleanNewPass.length < 4) {
      const err = 'New master password must be at least 4 characters long.';
      setAdminAuthError(err);
      return { success: false, error: err };
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: cleanOtp,
          newPassword: cleanNewPass
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.detail || 'Reset failed on server.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Admin password reset service is unavailable.';
      setAdminAuthError(errorMessage);
      return { success: false, error: errorMessage };
    }

    return { success: true, message: 'Admin master password reset successfully! You can now log in.' };
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setAdminAuthError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      accessToken: session?.access_token || '',
      authLoading,
      adminUser,
      isAdmin: !!adminUser,
      authError,
      setAuthError,
      adminAuthError,
      isPasswordRecovery,
      login,
      loginWithGoogle,
      loginAdminWithGoogle,
      register,
      resetPassword,
      updatePassword,
      logoutCustomer,
      logoutAdmin,
      resetAdminPasswordWithOtp,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
