const express = require('express');
const router = express.Router();
const { validateWebhookSignature } = require('../services/paystackService');
const Subscription = require('../models/Subscription');

/**
 * POST /api/webhooks/paystack
 * Receives and processes Paystack webhook events.
 * IMPORTANT: This route must use raw body — registered BEFORE express.json() in server.js
 */
router.post('/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-paystack-signature'];

  // Always respond 200 quickly so Paystack doesn't retry
  res.sendStatus(200);

  try {
    // Verify the webhook came from Paystack
    if (!validateWebhookSignature(req.body, signature)) {
      console.warn('⚠️  Invalid Paystack webhook signature — ignoring');
      return;
    }

    const event = JSON.parse(req.body.toString());
    console.log(`📩 Paystack webhook received: ${event.event}`);

    if (event.event === 'charge.success') {
      const { reference, metadata, status } = event.data;

      if (status !== 'success') return;

      const subscriptionId = metadata?.subscriptionId;
      if (!subscriptionId) {
        console.warn('⚠️  Webhook charge.success missing subscriptionId in metadata');
        return;
      }

      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        console.warn(`⚠️  Subscription ${subscriptionId} not found`);
        return;
      }

      // Avoid double-processing
      if (subscription.paymentStatus === 'completed') {
        console.log(`ℹ️  Subscription ${subscriptionId} already completed — skipping`);
        return;
      }

      subscription.status = 'active';
      subscription.paymentStatus = 'completed';
      subscription.paymentReference = reference;
      await subscription.save();

      console.log(`✅ Subscription ${subscriptionId} activated via webhook (ref: ${reference})`);
    }
  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
  }
});

module.exports = router;
