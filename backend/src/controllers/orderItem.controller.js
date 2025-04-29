const OrderItem = require("../models/OrderItem");

const createOrderItem = async (req, res) => {
  try {
    const { orderId, productId, quantity } = req.body;
    const newOrderItem = new OrderItem({ orderId, productId, quantity });
    const savedOrderItem = await newOrderItem.save();
    res.status(201).json(savedOrderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllOrderItems = async (req, res) => {
  try {
    const orderItems = await OrderItem.find();
    res.status(200).json(orderItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderItemBySellerId = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const orderItems = await OrderItem.find().populate("productId");

    const filteredItems = orderItems.filter((orderItem) => {
      return orderItem.productId && orderItem.productId.sellerId == sellerId;
    });

    res.status(200).json(filteredItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrderItemForStatistic = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const orderItems = await OrderItem.find({ status: "shipped" }).populate([
      {
        path: "orderId",
        populate: [{ path: "buyerId" }, { path: "addressId" }],
      },
      {
        path: "productId",
        populate: [{ path: "sellerId" }, { path: "categoryId" }],
      },
    ]);

    const result = orderItems.filter(
      (orderItem) =>
        orderItem.productId &&
        orderItem.productId.sellerId &&
        orderItem.productId.sellerId._id.toString() === sellerId
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateOrderItem = async (req, res) => {
  try {
    const updatedOrderItem = await OrderItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedOrderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const deletedOrderItem = await OrderItem.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedOrderItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.checkOrderExpiry = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(200).json({
        success: true,
        message: "Order is not in pending status",
        isExpired: false,
        order,
      });
    }

    const now = new Date();
    const paymentDueDate =
      order.paymentDueDate ||
      new Date(order.createdAt.getTime() + 30 * 60 * 1000); // Default 30 mins
    const isExpired = now > paymentDueDate;

    if (isExpired && order.status === "pending") {
      order.status = "cancelled";
      order.cancellationReason = "Payment timeout";
      await order.save();

      await Payment.updateMany(
        { orderId: order._id, status: "pending" },
        {
          $set: {
            status: "failed",
            failureReason: "Payment timeout",
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Order has expired and been cancelled",
        isExpired: true,
        order,
      });
    }

    const remainingMs = Math.max(0, paymentDueDate - now);
    const remainingMinutes = Math.ceil(remainingMs / 60000);

    return res.status(200).json({
      success: true,
      message: "Order expiry checked",
      isExpired: false,
      remainingMinutes,
      order,
    });
  } catch (error) {
    logger.error("Check order expiry error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking order expiry",
      error: error.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order in '${order.status}' status`,
      });
    }

    if (req.user.role !== "admin" && order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order",
      });
    }

    order.status = "cancelled";
    order.cancellationReason = reason || "Cancelled by user";
    await order.save();

    await Payment.updateMany(
      { orderId: order._id, status: "pending" },
      {
        $set: {
          status: "failed",
          failureReason: "Order cancelled",
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    logger.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};
module.exports = {
  createOrderItem,
  getAllOrderItems,
  getOrderItemForStatistic,
  getOrderItemBySellerId,
  updateOrderItem,
  deleteOrderItem,
};
