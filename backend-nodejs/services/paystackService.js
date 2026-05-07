const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackRequest = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Initialize a Paystack transaction
 * @param {string} email - Customer email
 * @param {number} amountInNaira - Amount in Naira (will be converted to kobo)
 * @param {string} reference - Unique transaction reference
 * @param {object} metadata - Extra data to attach to the transaction
 * @returns {object} Paystack initialization response
 */
const initializeTransaction = async (email, amountInNaira, reference, metadata = {}) => {
  const amountInKobo = amountInNaira * 100; // Paystack uses kobo

  const response = await paystackRequest.post('/transaction/initialize', {
    email,
    amount: amountInKobo,
    reference,
    metadata,
    callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
  });

  return response.data;
};

/**
 * Verify a Paystack transaction by reference
 * @param {string} reference - Transaction reference
 * @returns {object} Paystack verification response
 */
const verifyTransaction = async (reference) => {
  const response = await paystackRequest.get(`/transaction/verify/${reference}`);
  return response.data;
};

/**
 * Validate Paystack webhook signature
 * @param {Buffer} rawBody - Raw request body
 * @param {string} signature - x-paystack-signature header value
 * @returns {boolean}
 */
const validateWebhookSignature = (rawBody, signature) => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
  validateWebhookSignature,
};
