const mongoose = require('mongoose');

// Schema cho từng sản phẩm trong giỏ hàng
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của sản phẩm
    ref: 'Product', // Tên của model Product
    required: true,
  },
  quantity: {
    type: Number, // Số lượng sản phẩm
    required: true,
    min: 1, // Số lượng tối thiểu là 1
  },
});

// Schema cho giỏ hàng
const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Tham chiếu đến _id của người dùng
      ref: 'User', // Tên của model User
      required: true,
    },
    products: [cartItemSchema], // Mảng chứa các sản phẩm trong giỏ hàng
    dateAdded: {
      type: Date, // Ngày giỏ hàng được tạo
      default: Date.now,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

module.exports = mongoose.model('Cart', cartSchema);