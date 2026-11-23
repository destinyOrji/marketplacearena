const express = require('express');
const router = express.Router();
const { validateWebhookSignature } = require('../services/paystackService');
const Subscription = require('../models/Subscription');
const { sendReceiptEmail } = require('../services/emailService');

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

      const paymentType = metadata?.type;

      // Handle subscription payment
      if (paymentType === 'subscription' || metadata?.subscriptionId) {
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

        // Send receipt email (payment confirmed)
        const User = require('../models/User');
        const subUser = await User.findById(subscription.user).select('email firstName').catch(() => null);
        if (subUser) {
            sendReceiptEmail(subUser.email, {
                firstName:           subUser.firstName || subUser.email.split('@')[0],
                receiptNumber:       `RCP-${subscription._id.toString().slice(-8).toUpperCase()}`,
                description:         `${subscription.planName || subscription.plan} Subscription — Health Market Arena`,
                amount:              subscription.amount,
                currency:            'NGN',
                billingInterval:     subscription.plan,
                paidAt:              new Date(),
                paymentReference:    reference,
                subscriptionEndDate: subscription.endDate,
            }).catch(err => console.error('Receipt email failed (webhook):', err.message));
        }

        console.log(`✅ Subscription ${subscriptionId} activated via webhook (ref: ${reference})`);
      }

      // Handle vacancy posting payment
      if (paymentType === 'vacancy_posting') {
        const vacancyId = metadata?.vacancyId;
        if (!vacancyId) {
          console.warn('⚠️  Webhook charge.success missing vacancyId in metadata');
          return;
        }

        const Job = require('../models/Job');
        const Notification = require('../models/Notification');
        const Professional = require('../models/Professional');
        const Hospital = require('../models/Hospital');

        const vacancy = await Job.findById(vacancyId).populate('hospital');
        if (!vacancy) {
          console.warn(`⚠️  Vacancy ${vacancyId} not found`);
          return;
        }

        // Avoid double-processing
        if (vacancy.status === 'active' && vacancy.paymentReference === reference) {
          console.log(`ℹ️  Vacancy ${vacancyId} already activated — skipping`);
          return;
        }

        // Activate the vacancy
        vacancy.status = 'active';
        vacancy.publishedAt = new Date();
        vacancy.paymentReference = reference;
        vacancy.paymentStatus = 'paid';
        await vacancy.save();

        console.log(`✅ Vacancy ${vacancyId} activated via webhook (ref: ${reference})`);

        // Send receipt email to hospital for vacancy posting
        try {
            const User = require('../models/User');
            const hospital = vacancy.hospital;
            const hospitalUser = hospital?.user
                ? await User.findById(hospital.user).select('email firstName').catch(() => null)
                : null;
            if (hospitalUser) {
                sendReceiptEmail(hospitalUser.email, {
                    firstName:        hospitalUser.firstName || hospitalUser.email.split('@')[0],
                    receiptNumber:    `RCP-VAC-${vacancy._id.toString().slice(-8).toUpperCase()}`,
                    description:      `Job Vacancy Posting — ${vacancy.jobTitle || 'Healthcare Position'}`,
                    amount:           event.data.amount / 100, // Paystack sends kobo
                    currency:         'NGN',
                    paidAt:           new Date(),
                    paymentReference: reference,
                }).catch(err => console.error('Vacancy receipt email failed:', err.message));
            }
        } catch (emailErr) {
            console.error('Vacancy receipt lookup error:', emailErr.message);
        }

        // Notify all professionals
        try {
          const professionals = await Professional.find({}).populate('user', '_id');
          const hospital = vacancy.hospital || await Hospital.findById(vacancy.hospital);
          const hospitalName = hospital?.hospitalName || 'A Hospital';

          const notifications = professionals
            .filter(p => p.user)
            .map(p => ({
              user: p.user._id,
              title: 'New Job Vacancy',
              message: `${hospitalName} posted a new vacancy: ${vacancy.jobTitle} (${vacancy.department})`,
              type: 'job_posted',
              data: { jobId: vacancy._id, hospitalId: vacancy.hospital }
            }));

          if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`✅ Notified ${notifications.length} professionals about new vacancy`);
          }
        } catch (notifError) {
          console.error('❌ Error sending vacancy notifications:', notifError.message);
        }
      }
    }
  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
  }
});

module.exports = router;
