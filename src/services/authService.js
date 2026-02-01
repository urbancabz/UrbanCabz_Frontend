// src/services/authService.js

// Configure your backend API URL here
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';
const CUSTOMER_PROFILE_KEY = 'customerProfile';

function setAdminSession(token) {
  if (token) {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('userType', 'admin');
    localStorage.setItem('isAdmin', 'true');
  }
}

function clearAdminSession() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('isAdmin');
}

function isAdminUser(data) {
  const role =
    data?.user?.role ||
    data?.user?.role_name ||
    data?.role ||
    data?.user?.roles?.[0];
  return (role || '').toString().toLowerCase() === 'admin';
}

function persistCustomerProfile(profile) {
  if (profile) {
    localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
  } else {
    localStorage.removeItem(CUSTOMER_PROFILE_KEY);
  }
}

/**
 * Customer Login
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function customerLogin(credentials) {
  const requestData = {
    email: credentials.email,
    password: credentials.password,
  };

  console.log('🔵 Customer Login Request:', {
    url: `${API_BASE_URL}/auth/login`,
    method: 'POST',
    data: { ...requestData, password: '***hidden***' }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('🔵 Customer Login Response Status:', response.status);
    const data = await response.json();
    console.log('🔵 Customer Login Response Data:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Login failed',
        error: data.error,
      };
    }

    // Store token if provided
    if (data.token) {
      if (isAdminUser(data)) {
        setAdminSession(data.token);
      } else {
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('userType', 'customer');
        clearAdminSession();
      }
    }

    if (data.user) {
      persistCustomerProfile(data.user);
    }

    return {
      success: true,
      data: data,
      message: data.message || 'Login successful',
    };
  } catch (error) {
    console.error('❌ Customer login error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Customer Signup
 * @param {Object} userData - { fullName, mobile, email, password }
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function customerSignup(userData) {
  const requestData = {
    fullName: userData.fullName,
    mobile: userData.mobile,
    email: userData.email,
    password: userData.password,
  };

  console.log('🟢 Customer Signup Request:', {
    url: `${API_BASE_URL}/auth/register`,
    method: 'POST',
    data: { ...requestData, password: '***hidden***' }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('🟢 Customer Signup Response Status:', response.status);
    const data = await response.json();
    console.log('🟢 Customer Signup Response Data:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Signup failed',
        error: data.error,
      };
    }

    // Store token if provided
    if (data.token) {
      if (isAdminUser(data)) {
        setAdminSession(data.token);
      } else {
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('userType', 'customer');
        clearAdminSession();
      }
    }

    if (data.user) {
      persistCustomerProfile(data.user);
    }

    return {
      success: true,
      data: data,
      message: data.message || 'Signup successful',
    };
  } catch (error) {
    console.error('❌ Customer signup error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Business Login
 * @param {Object} credentials - { companyId, email, password }
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function businessLogin(credentials) {
  const requestData = {
    companyId: credentials.companyId,
    email: credentials.email,
    password: credentials.password,
  };

  console.log('🟡 Business Login Request:', {
    url: `${API_BASE_URL}/auth/business/login`,
    method: 'POST',
    data: { ...requestData, password: '***hidden***' }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/auth/b2b/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });

    console.log('🟡 Business Login Response Status:', response.status);
    const data = await response.json();
    console.log('🟡 Business Login Response Data:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Login failed',
        error: data.error,
      };
    }

    // Store token if provided
    if (data.token) {
      if (isAdminUser(data)) {
        setAdminSession(data.token);
      } else {
        localStorage.setItem('businessToken', data.token);
        localStorage.setItem('userType', 'business');
        clearAdminSession();
      }
    }

    return {
      success: true,
      data: data,
      message: data.message || 'Login successful',
    };
  } catch (error) {
    console.error('❌ Business login error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Business Signup
 * @param {Object} businessData - { companyName, companyEmail, gstNumber, email, password }
 * @returns {Promise<Object>} - { success, data, message }
 */
export async function businessSignup(businessData) {
  const requestData = {
    companyName: businessData.companyName,
    companyEmail: businessData.companyEmail,
    gstNumber: businessData.gstNumber || null,
    email: businessData.email,
    password: businessData.password,
  };

  console.log('🟠 Business Signup Request:', {
    url: `${API_BASE_URL}/auth/business/signup`,
    method: 'POST',
    data: { ...requestData, password: '***hidden***' }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/auth/business/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('🟠 Business Signup Response Status:', response.status);
    const data = await response.json();
    console.log('🟠 Business Signup Response Data:', data);

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Signup failed',
        error: data.error,
      };
    }

    // Store token if provided
    if (data.token) {
      if (isAdminUser(data)) {
        setAdminSession(data.token);
      } else {
        localStorage.setItem('businessToken', data.token);
        localStorage.setItem('userType', 'business');
        clearAdminSession();
      }
    }

    return {
      success: true,
      data: data,
      message: data.message || 'Signup successful',
    };
  } catch (error) {
    console.error('❌ Business signup error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Logout (clears tokens)
 */
export function logout() {
  localStorage.removeItem('customerToken');
  localStorage.removeItem('businessToken');
  clearAdminSession();
  localStorage.removeItem('userType');
  persistCustomerProfile(null);
}

/**
 * Get stored auth token
 * @returns {string|null}
 */
export function getAuthToken() {
  const userType = localStorage.getItem('userType');
  if (userType === 'admin') {
    return localStorage.getItem('adminToken');
  } else if (userType === 'customer') {
    return localStorage.getItem('customerToken');
  } else if (userType === 'business') {
    return localStorage.getItem('businessToken');
  }
  // Fallback: return any available token (helps if userType missing)
  return (
    localStorage.getItem('adminToken') ||
    localStorage.getItem('customerToken') ||
    localStorage.getItem('businessToken')
  );
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Fetch authenticated customer profile
 */
export async function fetchCustomerProfile() {
  const token = getAuthToken();
  if (!token) {
    return { success: false, message: 'Not authenticated', status: 401 };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Unable to fetch profile',
        status: response.status,
      };
    }

    if (data.user) {
      persistCustomerProfile(data.user);
    }

    return {
      success: true,
      data: data.user,
      message: data.message || 'Profile fetched',
      status: response.status,
    };
  } catch (error) {
    console.error('❌ Fetch profile error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Update authenticated customer profile
 */
export async function updateCustomerProfile(payload) {
  const token = getAuthToken();
  if (!token) {
    return { success: false, message: 'Not authenticated', status: 401 };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Unable to update profile',
        status: response.status,
      };
    }

    if (data.user) {
      persistCustomerProfile(data.user);
    }

    return {
      success: true,
      data: data.user,
      message: data.message || 'Profile updated',
      status: response.status,
    };
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Request password reset OTP over WhatsApp
 */
export async function requestPasswordReset(payload) {
  const body = {};
  if (payload.email) body.email = payload.email;
  if (payload.phone) body.phone = payload.phone;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Unable to send OTP',
      };
    }

    return {
      success: true,
      data,
      message: data.message || 'OTP sent successfully',
    };
  } catch (error) {
    console.error('❌ Password reset OTP error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Complete password reset with OTP
 */
export async function completePasswordReset(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resetId: payload.resetId,
        otp: payload.otp,
        newPassword: payload.newPassword,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Unable to reset password',
      };
    }

    return {
      success: true,
      data,
      message: data.message || 'Password updated successfully',
    };
  } catch (error) {
    console.error('❌ Password reset completion error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

/**
 * Set B2B permanent password (first login)
 */
export async function b2bSetPassword(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/b2b/set-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Unable to set password',
      };
    }

    if (data.token) {
      localStorage.setItem('businessToken', data.token);
      localStorage.setItem('userType', 'business');
    }

    return {
      success: true,
      data,
      message: data.message || 'Password set successfully',
    };
  } catch (error) {
    console.error('❌ B2B set password error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
      error: error.message,
    };
  }
}

export async function getCompanyProfile() {
  try {
    const token = localStorage.getItem('businessToken');
    const response = await fetch(`${API_BASE_URL}/b2b/company/my`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  } catch (error) {
    console.error('getCompanyProfile error:', error);
    return { success: false, message: 'Network error fetching company profile' };
  }
}

export async function getCompanyBookings() {
  try {
    const token = localStorage.getItem('businessToken');
    const response = await fetch(`${API_BASE_URL}/b2b/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  } catch (error) {
    console.error('getCompanyBookings error:', error);
    return { success: false, message: 'Network error fetching company bookings' };
  }
}

export async function bookBusinessRide(bookingData) {
  try {
    const token = localStorage.getItem('businessToken');
    const response = await fetch(`${API_BASE_URL}/b2b/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    });
    return await response.json();
  } catch (error) {
    console.error('bookBusinessRide error:', error);
    return { success: false, message: 'Network error booking business ride' };
  }
}