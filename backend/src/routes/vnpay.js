import express from 'express';
import { verifyVNPayChecksum } from '../utils/vnpay-utils.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Handle return from VNPay
router.get('/vnpay-return', async (req, res) => {
  const params = req.query;
  const isValid = verifyVNPayChecksum(params, params.vnp_SecureHash);

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid checksum' });
  }

  const booking = await Booking.findById(params.vnp_TxnRef);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (params.vnp_ResponseCode === '00') {
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();
    return res.json({ success: true, message: 'Payment successful' });
  } else {
    return res.json({ success: false, message: 'Payment failed' });
  }
});

// Handle IPN
router.get('/vnpay-ipn', async (req, res) => {
  const params = req.query;
  const isValid = verifyVNPayChecksum(params, params.vnp_SecureHash);

  if (!isValid) {
    return res.json({ RspCode: '97', Message: 'Invalid checksum' });
  }

  const booking = await Booking.findById(params.vnp_TxnRef);
  if (!booking) return res.json({ RspCode: '01', Message: 'Booking not found' });

  if (params.vnp_ResponseCode === '00') {
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();
    return res.json({ RspCode: '00', Message: 'Success' });
  } else {
    return res.json({ RspCode: '00', Message: 'Payment failed' });
  }
});

export default router;
