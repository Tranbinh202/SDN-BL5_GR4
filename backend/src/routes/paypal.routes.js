const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paypal.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/create-paypal-order', authMiddleware, paymentController.createPayPalOrder);
router.post('/capture-paypal-order', authMiddleware , paymentController.capturePayPalOrder);
router.get('/order/:orderId', authMiddleware, paymentController.getPaymentByOrderId);

module.exports = router;