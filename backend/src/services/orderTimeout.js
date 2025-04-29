// src/services/orderTimeout.service.js
const cron = require("node-cron");
const { Order, Payment } = require("../models");
const logger = require("../utils/logger");
const NotificationService = require("./notificationService");

/**
 * Service to handle automatic order cancellation after payment timeout
 */
class OrderTimeoutService {
  constructor() {
    // Set payment timeout period (in minutes)
    this.paymentTimeoutMinutes = 30;
    this.notificationService = null;
  }

  /**
   * Initialize the scheduled task for checking expired orders
   * @param {Object} io - Socket.io instance for real-time notifications
   */
  init(io) {
    // Initialize notification service
    if (io) {
      this.notificationService = new NotificationService(io);
    }

    // Run every 5 minutes
    cron.schedule("*/5 * * * *", () => {
      this.checkAndCancelExpiredOrders();
    });

    logger.info("Order timeout service initialized");
  }

  /**
   * Check for expired orders and cancel them
   */
  async checkAndCancelExpiredOrders() {
    try {
      logger.info("Checking for expired orders...");

      // Calculate the cutoff time (current time - timeout period)
      const timeoutPeriod = this.paymentTimeoutMinutes * 60 * 1000; // Convert to milliseconds
      const cutoffTime = new Date(Date.now() - timeoutPeriod);

      // Find all pending orders created before the cutoff time
      const expiredOrders = await Order.find({
        status: "pending",
        createdAt: { $lt: cutoffTime },
      }).populate("buyerId", "_id"); // Include buyer information for notifications

      logger.info(`Found ${expiredOrders.length} expired orders`);

      // Cancel each expired order
      for (const order of expiredOrders) {
        // Update order status to cancelled
        order.status = "cancelled";

        // Add a reason for cancellation
        order.cancellationReason = "Payment timeout";

        // Save the updated order
        await order.save();

        // Also update any associated pending payments
        await Payment.updateMany(
          { orderId: order._id, status: "pending" },
          {
            $set: {
              status: "failed",
              failureReason: "Payment timeout",
            },
          }
        );

        logger.info(`Order ${order._id} cancelled due to payment timeout`);

        // Send notifications to user
        if (this.notificationService && order.buyerId) {
          const userId = order.buyerId._id || order.buyerId;

          // Send real-time notification
          this.notificationService.sendOrderCancellationNotification(
            userId,
            order._id.toString()
          );

          // Send email notification
          this.notificationService.sendOrderCancellationEmail(
            userId,
            order._id.toString()
          );
        }

        // TODO: Restore inventory quantities (implement as needed)
        // This would involve updating the inventory records for the products in this order
        try {
          await this.restoreInventory(order._id);
        } catch (inventoryError) {
          logger.error(
            `Error restoring inventory for order ${order._id}:`,
            inventoryError
          );
        }
      }
    } catch (error) {
      logger.error("Error in order timeout service:", error);
    }
  }

  /**
   * Restore inventory quantities for cancelled orders
   * @param {string} orderId - The order ID
   */
  async restoreInventory(orderId) {
    try {
      // Find the order items for this order
      const OrderItem = require("../models/OrderItem");
      const Inventory = require("../models/Inventory");

      const orderItems = await OrderItem.find({ orderId });

      for (const item of orderItems) {
        // Restore quantity to inventory
        await Inventory.findOneAndUpdate(
          { productId: item.productId },
          { $inc: { quantity: item.quantity } }
        );

        logger.info(
          `Restored ${item.quantity} units to inventory for product ${item.productId}`
        );
      }
    } catch (error) {
      logger.error(`Error restoring inventory for order ${orderId}:`, error);
      throw error;
    }
  }
}

module.exports = new OrderTimeoutService();
