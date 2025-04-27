const Cart = require('../models/Cart');

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
    try {
      const { productId, quantity } = req.body;
  
      // Kiểm tra xem giỏ hàng của người dùng đã tồn tại chưa
      let cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) {
        cart = new Cart({ userId: req.user.id, products: [] });
      }
  
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingProduct = cart.products.find((item) => item.productId.toString() === productId);
      if (existingProduct) {
        existingProduct.quantity += quantity; // Tăng số lượng nếu sản phẩm đã tồn tại
      } else {
        cart.products.push({ productId, quantity }); // Thêm sản phẩm mới
      }
  
      await cart.save();
      res.status(200).json({ success: true, cart });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };

// Lấy giỏ hàng của người dùng
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId');
    if (!cart) {
      return res.status(200).json({ success: true, cart: { products: [] } }); // Trả về giỏ hàng rỗng nếu không tồn tại
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // Loại bỏ sản phẩm khỏi giỏ hàng
    cart.products = cart.products.filter((item) => item.productId.toString() !== productId);
    await cart.save();

    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateCartItem = async (req, res) => {
    try {
      const { productId, quantity } = req.body;
  
      // Tìm giỏ hàng của người dùng
      const cart = await Cart.findOne({ userId: req.user.id });
      if (!cart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }
  
      // Tìm sản phẩm trong giỏ hàng và cập nhật số lượng
      const product = cart.products.find((item) => item.productId.toString() === productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found in cart" });
      }
  
      product.quantity = quantity; // Cập nhật số lượng
      await cart.save();
  
      res.status(200).json({ success: true, cart });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };