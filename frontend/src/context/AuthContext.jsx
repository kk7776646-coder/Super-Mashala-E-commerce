import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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

  useEffect(() => {
    if (user) {
      localStorage.setItem('sm_customer_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sm_customer_user');
    }
  }, [user]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('sm_admin_user', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('sm_admin_user');
    }
  }, [adminUser]);

  // Customer / Shopkeeper Login with Mobile or Email + Password
  const login = (mobileOrEmail, password) => {
    setAuthError(null);
    const trimmedInput = (mobileOrEmail || '').trim();
    const cleanPassword = (password || '').trim();

    if (!trimmedInput) {
      setAuthError('Please enter your mobile number or email.');
      return false;
    }

    if (!cleanPassword) {
      setAuthError('Please enter your password.');
      return false;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');

    // Check other registered users
    const matched = registeredUsers.find(
      u => u.mobileNumber === trimmedInput || (u.email && u.email.toLowerCase() === trimmedInput.toLowerCase())
    );

    if (matched) {
      if (matched.password && matched.password !== cleanPassword) {
        setAuthError('Incorrect password. Please try again or reset your password.');
        return false;
      }
      const customerRecord = { ...matched, role: 'customer' };
      setUser(customerRecord);
      return true;
    }

    // New shopkeeper quick profile creation if not found
    const isEmail = trimmedInput.includes('@');
    const newUser = {
      id: `usr_${Date.now()}`,
      fullName: isEmail ? trimmedInput.split('@')[0] : 'Retail Partner',
      shopName: isEmail ? `${trimmedInput.split('@')[0]} Kirana` : `Store ${trimmedInput.slice(-4)}`,
      mobileNumber: isEmail ? '' : trimmedInput,
      email: isEmail ? trimmedInput : '',
      password: cleanPassword,
      deliveryAddress: 'ulhasnager-05, Thane, Mumbai, pin code 421005',
      city: 'Thane, Mumbai',
      areaLocality: 'Ulhasnagar-05',
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    registeredUsers.push(newUser);
    localStorage.setItem('sm_registered_users', JSON.stringify(registeredUsers));
    setUser(newUser);
    return true;
  };

  const resetPasswordWithOtp = () => ({
    success: false,
    error: 'Password recovery is unavailable until an OTP provider is configured.',
  });

  // Customer Real Google Sign-In
  const loginWithGoogle = async (credential, userInfo) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          email: userInfo?.email,
          name: userInfo?.name,
          sub: userInfo?.sub,
          picture: userInfo?.picture
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Customer profile strictly has customer role
        const customerProfile = {
          id: data.user.id,
          fullName: data.user.full_name || userInfo?.name || 'Retail Partner',
          shopName: data.user.shop_name || `${userInfo?.name || 'Retail'} Store`,
          mobileNumber: data.user.mobile_number || '',
          email: data.user.email || userInfo?.email,
          deliveryAddress: data.user.delivery_address || 'ulhasnager-05, Thane, Mumbai, pin code 421005',
          city: data.user.city || 'Thane, Mumbai',
          role: 'customer',
          avatarUrl: data.user.avatar_url || userInfo?.picture,
          createdAt: data.user.created_at || new Date().toISOString(),
        };
        setUser(customerProfile);
        return true;
      } else {
        setAuthError(data.detail || 'Google sign-in failed. Please try again.');
        return false;
      }
    } catch (err) {
      // Offline fallback: create valid customer profile with role 'customer'
      const fallbackCustomer = {
        id: `usr_g_${userInfo?.sub || Date.now()}`,
        fullName: userInfo?.name || 'Retail Partner',
        shopName: `${userInfo?.name || 'Retail'} Store`,
        mobileNumber: '',
        email: userInfo?.email || '',
        deliveryAddress: 'ulhasnager-05, Thane, Mumbai, pin code 421005',
        city: 'Thane, Mumbai',
        role: 'customer',
        avatarUrl: userInfo?.picture,
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackCustomer);
      return true;
    }
  };

  // Secure Admin Login (Email or Phone) & Master Password Verification
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

  // Reset Admin Password using Phone Number OTP
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

  // Customer Registration
  const register = (formData) => {
    setAuthError(null);
    if (!formData.fullName || !formData.mobileNumber || !formData.shopName || !formData.deliveryAddress) {
      setAuthError('Please complete all required fields.');
      return false;
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      fullName: formData.fullName,
      shopName: formData.shopName,
      mobileNumber: formData.mobileNumber,
      email: formData.email || '',
      deliveryAddress: formData.deliveryAddress,
      city: formData.city || 'Thane, Mumbai',
      areaLocality: formData.areaLocality || '',
      role: 'customer', // Always customer
      createdAt: new Date().toISOString(),
    };

    const existingUsers = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('sm_registered_users', JSON.stringify(existingUsers));

    setUser(newUser);
    return true;
  };

  const logoutCustomer = () => {
    setUser(null);
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setAdminAuthError(null);
  };

  const updateProfile = (updatedData) => {
    setUser(prev => prev ? { ...prev, ...updatedData, role: 'customer' } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      adminUser,
      isAdmin: !!adminUser,
      authError,
      adminAuthError,
      login,
      loginWithGoogle,
      loginAdminWithGoogle,
      resetPasswordWithOtp,
      resetAdminPasswordWithOtp,
      register,
      logoutCustomer,
      logoutAdmin,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
