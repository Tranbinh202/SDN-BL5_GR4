const express = require('express');
const { addToCart, getCart, removeFromCart, updateCartItem } = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Route thêm sản phẩm vào giỏ hàng
router.post('/add', authMiddleware, addToCart);

// Route lấy giỏ hàng của người dùng
router.get('/', authMiddleware, getCart);

// Route xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:productId', authMiddleware, removeFromCart);
router.put('/update', authMiddleware, updateCartItem);

module.exports = router;