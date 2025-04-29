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
    const { order_id, total_amount, items = [], shipping_address } = orderDetails;

    // Build danh sách sản phẩm HTML
    const itemsHtml = items.map((item) => `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.product_name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">£${item.price.toFixed(2)}</td>
        </tr>
    `).join("");

    const mailOptions = {
        from: 'sonpthe172490@fpt.edu.vn',
        to: customerEmail,
        subject: `Order Confirmation - ${order_id}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1>Thank you for your order!</h1>
                <p>Your order <strong>${order_id}</strong> has been successfully placed and confirmed.</p>

                <h2>Shipping Information</h2>
                <p>
                    <strong>Name:</strong> ${shipping_address?.name || "N/A"}<br/>
                    <strong>Address:</strong> ${shipping_address?.address || "N/A"}<br/>
                    <strong>Phone:</strong> ${shipping_address?.phone || "N/A"}<br/>
                    <strong>Country:</strong> ${shipping_address?.country || "N/A"}
                </p>

                <h2>Order Details</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd;">Product</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Quantity</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <h3 style="text-align: right;">Total: £${total_amount.toFixed(2)}</h3>

                <p>We will notify you when your order is shipped.</p>
                <p>Thank you for shopping with us!</p>
            </div>
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