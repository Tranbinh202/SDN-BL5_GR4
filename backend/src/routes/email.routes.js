const express = require("express");
const router = express.Router();
const { sendOrderConfirmationEmail } = require("../services/emailService");

// Route để gửi email xác nhận đơn hàng
router.post("/send-order-confirmation", async (req, res) => {
    try {
        const { orderDetails, customerEmail } = req.body;
        
        if (!orderDetails || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: orderDetails and customerEmail"
            });
        }

        await sendOrderConfirmationEmail(orderDetails, customerEmail);
        
        res.status(200).json({
            success: true,
            message: "Order confirmation email sent successfully"
        });
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send order confirmation email",
            error: error.message
        });
    }
});

module.exports = router; 