const express = require('express');
const router = express.Router();
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const client = require('../config/paypal');
const Payment = require('../models/Payment'); 

// Tạo đơn hàng PayPal
router.post('/pay/paypal', async (req, res) => {
  try {
    const { amountUSD } = req.body;

    if (!amountUSD || amountUSD <= 0) {
      return res.status(400).json({ message: 'Invalid USD amount' });
    }

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        { 
          amount: {
            currency_code: 'USD',  // Dùng USD trực tiếp
            value: amountUSD
          }
        }
      ]
    });

    const order = await client().execute(request);
    res.status(200).json({ id: order.result.id });  // Trả lại orderId cho frontend
  } catch (error) {
    console.error('Error creating PayPal order:', error.response || error);
    res.status(500).json({ message: 'Failed to create PayPal order', error: error.response || error });
  }
});

// Capture thanh toán
router.post('/pay/paypal/capture', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'Order ID is required' });

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const capture = await client().execute(request);

    const paymentInfo = capture.result.purchase_units[0].payments.captures[0];
    
    const newPayment = new Payment({
      orderId: orderId,
      userId: null, // Cập nhật userId từ frontend hoặc auth
      amount: paymentInfo.amount.value,
      method: 'PayPal',
      status: 'paid',
      paidAt: paymentInfo.create_time
    });

    await newPayment.save();

    res.status(200).json({ capture: capture.result });
  } catch (error) {
    console.error('Error capturing PayPal payment:', error.response || error);
    res.status(500).json({ message: 'Failed to capture PayPal payment', error: error.response || error });
  }
});

module.exports = router;
