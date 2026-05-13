const axios = require('axios');

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Read key per-request so env vars are always current
const getClient = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error('PAYSTACK_SECRET_KEY is not set in environment variables');
  return axios.create({
    baseURL: PAYSTACK_BASE_URL,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });
};

/**
 * Initialize a Paystack transaction
 * @param {string} email - Customer email
 * @param {number} amountInNaira - Amount in Naira (converted to kobo)
 * @param {string} reference - Unique transaction reference
 * @param {object} metadata - Extra data
 * @param {string} callbackUrl - Optional custom callback URL (defaults to /payment/verify)
 * @returns {object} Paystack initialization response
 */
const initializeTransaction = async (email, amountInNaira, reference, metadata = {}, callbackUrl = null) => {
  const amountInKobo = Math.round(amountInNaira * 100); // Paystack uses kobo

  try {
    const client = getClient();
    const response = await client.post('/transaction/initialize', {
      email,
      amount: amountInKobo,
      reference,
      metadata,
      callback_url: callbackUrl || `${process.env.FRONTEND_URL}/payment/verify`,
    });
    return response.data;
  } catch (error) {
    // Extract Paystack's actual error message
    const paystackMsg = error.response?.data?.message || error.message;
    console.error('Paystack initializeTransaction error:', paystackMsg, error.response?.data);
    throw new Error(`Paystack error: ${paystackMsg}`);
  }
};

/**
 * Verify a Paystack transaction by reference
 * @param {string} reference - Transaction reference
 * @returns {object} Paystack verification response
 */
const verifyTransaction = async (reference) => {
  try {
    const client = getClient();
    const response = await client.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error) {
    const paystackMsg = error.response?.data?.message || error.message;
    console.error('Paystack verifyTransaction error:', paystackMsg);
    throw new Error(`Paystack error: ${paystackMsg}`);
  }
};

/**
 * Validate Paystack webhook signature
 */
const validateWebhookSignature = (rawBody, signature) => {
  const crypto = require('crypto');
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return false;
  const hash = crypto.createHmac('sha512', key).update(rawBody).digest('hex');
  return hash === signature;
};

module.exports = { initializeTransaction, verifyTransaction, validateWebhookSignature };
