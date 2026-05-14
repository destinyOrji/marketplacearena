// Debug utility to test API endpoints
// Import this in your component to test specific endpoints

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://healthmarketarena.com/api';

export const debugAPI = async (endpoint: string, token?: string) => {
  console.log('🔍 Testing endpoint:', `${API_URL}${endpoint}`);
  
  try {
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      timeout: 10000,
    });
    
    console.log('✅ Success:', response.status);
    console.log('📦 Data:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
      
      // Check if response is HTML
      const contentType = error.response.headers['content-type'];
      if (contentType?.includes('text/html')) {
        console.error('⚠️ Server returned HTML instead of JSON!');
        console.error('This usually means:');
        console.error('1. The endpoint does not exist (404)');
        console.error('2. Server error (500)');
        console.error('3. CORS or routing issue');
      }
    } else if (error.request) {
      console.error('⚠️ No response received from server');
      console.error('This usually means:');
      console.error('1. Server is down');
      console.error('2. Network connectivity issue');
      console.error('3. CORS blocking the request');
    }
    
    return { success: false, error: error.message };
  }
};

// Test all gym-physio endpoints
export const testAllEndpoints = async (token: string) => {
  const endpoints = [
    '/gym-physio/dashboard-stats',
    '/gym-physio/profile',
    '/gym-physio/services',
    '/gym-physio/appointments',
    '/gym-physio/schedule',
    '/gym-physio/earnings',
    '/gym-physio/analytics',
  ];
  
  console.log('🧪 Testing all gym-physio endpoints...\n');
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await debugAPI(endpoint, token);
    results.push({ endpoint, ...result });
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }
  
  console.log('\n📊 Test Results:');
  console.table(results.map(r => ({
    Endpoint: r.endpoint,
    Status: r.success ? '✅ Success' : '❌ Failed',
    Error: r.error || '-',
  })));
  
  return results;
};

// Usage in component:
// import { debugAPI, testAllEndpoints } from '../services/api-debug';
// 
// // Test single endpoint
// debugAPI('/gym-physio/dashboard-stats', token);
//
// // Test all endpoints
// testAllEndpoints(token);
