const express = require('express');
const router = express.Router();
const { sendOrderConfirmationEmail } = require('../services/emailService');

router.get('/test-email', async (req, res) => {
    try {
        const testOrderDetails = {
            orderId: 'TEST123',
            totalAmount: 99.99,
            paymentMethod: 'Credit Card',
            shippingAddress: {
                address: '123 Test Street, Test City'
            }
        };

        await sendOrderConfirmationEmail(testOrderDetails, 'sonpthe172490@fpt.edu.vn');
        
        res.status(200).json({
            success: true,
            message: 'Test email sent successfully'
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
});

module.exports = router; 