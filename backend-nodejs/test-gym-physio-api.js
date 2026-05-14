// Test script to verify all Gym-Physio API endpoints are working
// Run with: node test-gym-physio-api.js

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TEST_TOKEN}`
  }
});

const endpoints = [
  // Dashboard & Profile
  { method: 'GET', path: '/gym-physio/dashboard-stats', name: 'Dashboard Stats' },
  { method: 'GET', path: '/gym-physio/profile', name: 'Get Profile' },
  
  // Services
  { method: 'GET', path: '/gym-physio/services', name: 'Get Services' },
  
  // Appointments
  { method: 'GET', path: '/gym-physio/appointments', name: 'Get Appointments' },
  
  // Schedule
  { method: 'GET', path: '/gym-physio/schedule', name: 'Get Schedule' },
  { method: 'GET', path: '/gym-physio/schedule/blocked-dates', name: 'Get Blocked Dates' },
  
  // Earnings & Payments
  { method: 'GET', path: '/gym-physio/earnings', name: 'Get Earnings' },
  { method: 'GET', path: '/gym-physio/payments', name: 'Get Payments' },
  { method: 'GET', path: '/gym-physio/payments/stats', name: 'Get Payment Stats' },
  
  // Analytics
  { method: 'GET', path: '/gym-physio/analytics', name: 'Get Analytics' },
  { method: 'GET', path: '/gym-physio/analytics/detailed', name: 'Get Detailed Analytics' },
  
  // Subscription
  { method: 'GET', path: '/gym-physio/subscription/status', name: 'Get Subscription Status' },
  
  // Settings
  { method: 'GET', path: '/gym-physio/settings', name: 'Get Settings' },
  { method: 'GET', path: '/gym-physio/bank-account', name: 'Get Bank Account' },
];

async function testEndpoint(endpoint) {
  try {
    const response = await apiClient[endpoint.method.toLowerCase()](endpoint.path);
    console.log(`✅ ${endpoint.name}: SUCCESS`);
    return { success: true, endpoint: endpoint.name };
  } catch (error) {
    console.log(`❌ ${endpoint.name}: FAILED - ${error.message}`);
    return { success: false, endpoint: endpoint.name, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Testing Gym-Physio API Endpoints...\n');
  console.log(`API URL: ${API_URL}\n`);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }
  
  console.log('\n📊 Test Summary:');
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  
  if (results.some(r => !r.success)) {
    console.log('\n❌ Failed Endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.endpoint}: ${r.error}`);
    });
  } else {
    console.log('\n✅ All endpoints are working correctly!');
  }
}

// Run tests
runTests().catch(console.error);
