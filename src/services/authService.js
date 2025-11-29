// src/services/authService.js

// Configure your backend API URL here
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

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

  console.log(' Customer Login Request:', {
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
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('userType', 'customer');
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
    name: userData.fullName,
    email: userData.email,
    password: userData.password,
    phone: userData.mobile,
  };

//   console.log('🟢 Customer Signup Request:', {
//     url: `${API_BASE_URL}/auth/register`,
//     method: 'POST',
//     data: { ...requestData, password: '***hidden***' }
//   });

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
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('userType', 'customer');
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
    const response = await fetch(`${API_BASE_URL}/auth/business/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
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
      localStorage.setItem('businessToken', data.token);
      localStorage.setItem('userType', 'business');
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
      localStorage.setItem('businessToken', data.token);
      localStorage.setItem('userType', 'business');
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
  localStorage.removeItem('userType');
}

/**
 * Get stored auth token
 * @returns {string|null}
 */
export function getAuthToken() {
  const userType = localStorage.getItem('userType');
  if (userType === 'customer') {
    return localStorage.getItem('customerToken');
  } else if (userType === 'business') {
    return localStorage.getItem('businessToken');
  }
  return null;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getAuthToken();
}