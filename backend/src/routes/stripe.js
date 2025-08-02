// src/routes/stripe.js
import express from 'express';
import Stripe from 'stripe';
import Payment from '../models/Payment.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const paymentId = session.metadata.paymentId;
    const transactionId = session.payment_intent;

    await Payment.findByIdAndUpdate(paymentId, {
      status: 'success',
      transactionId,
    });

    console.log(`✅ Stripe payment succeeded for paymentId: ${paymentId}`);
  }

  res.status(200).json({ received: true });
});

export default router;
