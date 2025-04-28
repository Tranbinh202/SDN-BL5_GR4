const PayPal = require('@paypal/checkout-server-sdk');
const paypalClient = require('../config/paypal');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

exports.createPayPalOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const userId = req.user.id;
    console.log(userId);
    

    // Verify if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, buyerId: userId });
    if (!order) {
      return res.status(404).json({ userId });
    }

    // Create PayPal order
    const request = new PayPal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: (amount / 100).toFixed(2)  
        },
        reference_id: orderId.toString()
      }],
      application_context: {
        return_url: `localhost:3000/successpay`,
        cancel_url: `localhost:3000/cancelpay`,
      }
    });


    const response = await paypalClient().execute(request);
   
    const payment = new Payment({
      orderId,
      userId,
      amount,
      method: 'paypal',
      status: 'paid'
    });
    await payment.save();

    return res.json({
      id: response.result.id,
      status: response.result.status,
      links: response.result.links.find(link => link.rel === 'approve').href
    });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return res.status(500).json({ 
      message: 'Failed to create PayPal order',
      error: error.message 
    });
  }
};

exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderID } = req.body;
    
    const request = new PayPal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const response = await paypalClient().execute(request);

    if (response.result.status === 'COMPLETED') {
      const paypalOrderId = response.result.id;
      const mongoOrderId = response.result.purchase_units[0].reference_id;
      const captureId = response.result.purchase_units[0].payments.captures[0].id;

      const payment = await Payment.findOneAndUpdate(
        { orderId: mongoOrderId, status: 'pending' },
        { 
          status: 'paid',
          paidAt: new Date(),
          transactionId: captureId
        },
        { new: true }
      );
      
      if (!payment) {
        return res.status(404).json({ message: 'Payment record not found' });
      }

      await Order.findByIdAndUpdate(
        mongoOrderId,
        { status: 'paid' },
        { new: true }
      );
      
      return res.json({
        success: true,
        payment: payment
      });
    } else {
      return res.status(400).json({ 
        message: 'Payment not completed', 
        status: response.result.status 
      });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    return res.status(500).json({ 
      message: 'Failed to capture PayPal payment',
      error: error.message
    });
  }
};


exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    const payment = await Payment.findOne({ orderId, userId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    return res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve payment',
      error: error.message 
    });
  }
};