const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sonpthe172490@fpt.edu.vn',
        pass: 'cpcm fxkv yxit xdmv'
    }
});

// Test email function
async function sendTestEmail() {
    const mailOptions = {
        from: 'sonpthe172490@fpt.edu.vn',
        to: 'sonpthe172490@fpt.edu.vn',
        subject: 'Test Email from E-commerce System',
        html: `
            <h1>Test Email</h1>
            <p>This is a test email to verify the email sending functionality.</p>
            <h2>Test Order Details:</h2>
            <ul>
                <li>Order ID: TEST123</li>
                <li>Status: Test Order</li>
                <li>Date: ${new Date().toLocaleDateString()}</li>
                <li>Total Amount: $100.00</li>
            </ul>
            <p>If you received this email, the email system is working correctly!</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully');
    } catch (error) {
        console.error('Error sending test email:', error);
    }
}

// Run the test
sendTestEmail(); 