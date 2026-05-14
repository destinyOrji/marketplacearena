/**
 * Test script to verify all gym-physio endpoints are accessible
 * Run this on the server to test the backend
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001/api';
const TEST_TOKEN = process.env.TEST_TOKEN || ''; // Add a valid token here

const endpoints = [
    { method: 'GET', path: '/gym-physio/dashboard-stats', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/profile', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/services', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/appointments', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/schedule', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/schedule/blocked-dates', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/earnings', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/payments', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/payments/stats', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/analytics', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/analytics/detailed', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/settings', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/subscription/status', requiresAuth: true },
    { method: 'GET', path: '/gym-physio/bank-account', requiresAuth: true },
    { method: 'GET', path: '/health', requiresAuth: false },
];

async function testEndpoint(endpoint) {
    try {
        const config = {
            method: endpoint.method,
            url: `${API_URL}${endpoint.path}`,
            headers: {},
            validateStatus: () => true, // Don't throw on any status
        };

        if (endpoint.requiresAuth && TEST_TOKEN) {
            config.headers.Authorization = `Bearer ${TEST_TOKEN}`;
        }

        const response = await axios(config);
        
        const contentType = response.headers['content-type'] || '';
        const isJson = contentType.includes('application/json');
        const isHtml = contentType.includes('text/html');

        console.log(`\n${endpoint.method} ${endpoint.path}`);
        console.log(`  Status: ${response.status}`);
        console.log(`  Content-Type: ${contentType}`);
        
        if (isHtml) {
            console.log(`  ❌ ERROR: Returned HTML instead of JSON`);
            console.log(`  Response preview: ${response.data.substring(0, 100)}...`);
        } else if (isJson) {
            console.log(`  ✅ OK: Returned JSON`);
            if (response.data.success !== undefined) {
                console.log(`  Success: ${response.data.success}`);
                if (response.data.message) {
                    console.log(`  Message: ${response.data.message}`);
                }
            }
        } else {
            console.log(`  ⚠️  WARNING: Unexpected content type`);
        }

        return {
            endpoint: endpoint.path,
            status: response.status,
            isJson,
            isHtml,
            success: response.data.success
        };
    } catch (error) {
        console.log(`\n${endpoint.method} ${endpoint.path}`);
        console.log(`  ❌ ERROR: ${error.message}`);
        return {
            endpoint: endpoint.path,
            error: error.message
        };
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('GYM-PHYSIO ENDPOINT TESTS');
    console.log('='.repeat(60));
    console.log(`API URL: ${API_URL}`);
    console.log(`Auth Token: ${TEST_TOKEN ? 'Provided' : 'NOT PROVIDED (some tests will fail)'}`);
    console.log('='.repeat(60));

    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    
    const htmlResponses = results.filter(r => r.isHtml);
    const jsonResponses = results.filter(r => r.isJson);
    const errors = results.filter(r => r.error);

    console.log(`Total endpoints tested: ${results.length}`);
    console.log(`JSON responses: ${jsonResponses.length}`);
    console.log(`HTML responses: ${htmlResponses.length}`);
    console.log(`Errors: ${errors.length}`);

    if (htmlResponses.length > 0) {
        console.log('\n❌ Endpoints returning HTML:');
        htmlResponses.forEach(r => console.log(`  - ${r.endpoint} (${r.status})`));
    }

    if (errors.length > 0) {
        console.log('\n❌ Endpoints with errors:');
        errors.forEach(r => console.log(`  - ${r.endpoint}: ${r.error}`));
    }

    console.log('\n' + '='.repeat(60));
}

// Run the tests
runTests().catch(console.error);
