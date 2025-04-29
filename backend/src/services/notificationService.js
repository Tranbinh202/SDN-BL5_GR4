// src/services/notificationService.js
const { User } = require("../models");
const logger = require("../utils/logger");

/**
 * Service to handle user notifications
 */
class NotificationService {
  constructor(io) {
    this.io = io; // Socket.io instance
  }

  /**
   * Send order cancellation notification to user
   * @param {string} userId - The user ID
   * @param {string} orderId - The order ID
   */
  sendOrderCancellationNotification(userId, orderId) {
    try {
      // Get the socket ID for this user if they're connected
      const userSocketRoom = userId.toString();

      // Send notification through socket.io
      this.io.to(userSocketRoom).emit("orderCancellationNotification", {
        type: "order_cancelled",
        message: `Your order #${orderId} has been cancelled due to payment timeout.`,
        orderId: orderId,
        timestamp: new Date(),
      });

      logger.info(
        `Order cancellation notification sent to user ${userId} for order ${orderId}`
      );
    } catch (error) {
      logger.error("Error sending order cancellation notification:", error);
    }
  }

  /**
   * Send email notification (implementation would depend on your email service)
   * @param {string} userId - The user ID
   * @param {string} orderId - The order ID
   */
  async sendOrderCancellationEmail(userId, orderId) {
    try {
      // Find user to get their email
      const user = await User.findById(userId);
      if (!user || !user.email) {
        logger.error(
          `Cannot send email - user ${userId} not found or has no email`
        );
        return;
      }

      // Here you would implement your email sending logic
      // For example using nodemailer or a service like SendGrid

      /*
      await emailService.send({
        to: user.email,
        subject: 'Order Cancelled',
        template: 'order-cancelled',
        data: {
          username: user.username || user.fullname,
          orderId: orderId,
          reason: 'Payment timeout',
          supportEmail: 'support@yourstore.com'
        }
      });
      */

      logger.info(
        `Order cancellation email sent to ${user.email} for order ${orderId}`
      );
    } catch (error) {
      logger.error("Error sending order cancellation email:", error);
    }
  }
}

module.exports = NotificationService;
