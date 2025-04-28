const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'sonpthe172490@fpt.edu.vn',
        pass: 'cpcm fxkv yxit xdmv'
    }
});

// Function to send order confirmation email
const sendOrderConfirmationEmail = async (orderDetails, customerEmail) => {
    const mailOptions = {
        from: 'sonpthe172490@fpt.edu.vn',
        to: customerEmail,
        subject: 'Order Confirmation - Your Purchase is Confirmed',
        html: `
            <h1>Thank you for your order!</h1>
            <p>Your order has been successfully placed and confirmed.</p>
            <h2>Order Details:</h2>
            <ul>
                <li>Order ID: ${orderDetails.orderId}</li>
                <li>Total Amount: £${orderDetails.totalAmount}</li>
                <li>Payment Method: ${orderDetails.paymentMethod}</li>
                <li>Shipping Address: ${orderDetails.shippingAddress.address}</li>
            </ul>
            <p>We will notify you when your order is shipped.</p>
            <p>Thank you for shopping with us!</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        throw error;
    }
};

// Function to send order status update email
const sendOrderStatusUpdateEmail = async (orderDetails, customerEmail, newStatus) => {
    const statusMessages = {
        'shipping': 'Your order has been shipped!',
        'shipped': 'Your order has been delivered successfully!',
        'failed to ship': 'There was an issue with your order delivery.',
        'rejected': 'Your order has been rejected.'
    };

    const mailOptions = {
        from: 'sonpthe172490@fpt.edu.vn',
        to: customerEmail,
        subject: `Order Status Update - ${statusMessages[newStatus]}`,
        html: `
            <h1>Order Status Update</h1>
            <p>${statusMessages[newStatus]}</p>
            <h2>Order Details:</h2>
            <ul>
                <li>Order ID: ${orderDetails._id}</li>
                <li>Current Status: ${newStatus}</li>
                <li>Order Date: ${new Date(orderDetails.orderDate).toLocaleDateString()}</li>
                <li>Total Amount: £${orderDetails.totalPrice}</li>
            </ul>
            <p>If you have any questions, please contact our customer service.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order status update email sent successfully');
    } catch (error) {
        console.error('Error sending order status update email:', error);
        throw error;
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendOrderStatusUpdateEmail
}; 