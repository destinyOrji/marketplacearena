/**
 * API Connection Test Utility
 * Use this to test if frontend can connect to backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection to:', API_BASE_URL);
    
    // Test basic connection
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', data);
      return { success: true, data };
    } else {
      console.error('API Error:', response.status, response.statusText);
      return { success: false, error: `${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('Network Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
};

export const testAuthEndpoint = async () => {
  try {
    console.log('Testing auth endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/auth/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Auth endpoint status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Auth endpoint response:', data);
      return { success: true, data };
    } else {
      console.error('Auth endpoint error:', response.status, response.statusText);
      return { success: false, error: `${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('Auth endpoint network error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
};

export const testRegistration = async (testData: any) => {
  try {
    console.log('Testing registration with data:', testData);
    
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Registration response status:', response.status);
    
    const data = await response.json();
    console.log('Registration response:', data);

    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error('Registration test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
};