import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import TopMenu from "../../components/TopMenu";
import SubMenu from "../../components/SubMenu";
import SimilarProducts from "../../components/SimilarProducts";
import Footer from "../../components/Footer";

function EmptyCart() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="bg-white shadow-sm">
        <div className="max-w-[1300px] mx-auto">
          <TopMenu />
          <SubMenu />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-2xl font-semibold mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700"
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
}

function CartItem({ product, onRemove, onUpdateQuantity }) {
  const { productId, quantity } = product; // Lấy thông tin sản phẩm và số lượng
  const { title, description, price, image } = productId || {}; // Lấy thông tin chi tiết sản phẩm

  return (
    <div className="flex items-center justify-between gap-4 border-b p-4">
      <div className="flex items-center gap-4">
        <img
          src={image || "photo.png"}
          alt={title}
          className="w-[100px] h-[100px] object-cover rounded-lg"
        />
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-gray-500">{description}</div>
          <div className="font-bold mt-2">£{(price / 100).toFixed(2)}</div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onUpdateQuantity(product.cartItemId, productId._id, quantity - 1)}
              className="p-1 rounded-full hover:bg-gray-100"
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(product.cartItemId, productId._id, quantity + 1)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(product.cartItemId, productId._id)}
        className="text-blue-500 hover:text-blue-700"
      >
        Remove
      </button>
    </div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCartItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cart items");
      }

      const data = await response.json();
      setCartItems(data.cart?.products || []); // Đảm bảo đúng đường dẫn đến mảng sản phẩm
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId, productId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }
  
      // Cập nhật state `cartItems` để loại bỏ sản phẩm được xóa
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.productId._id !== productId)
      );
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };
  
  const updateQuantity = async (cartItemId, productId, newQuantity) => {
    if (newQuantity < 1) return; // Không cho phép số lượng nhỏ hơn 1
  
    try {
      const response = await fetch("http://localhost:5000/api/cart/update", {
        method: "PUT", // Sử dụng phương thức PUT để cập nhật số lượng
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }
  
      // Cập nhật state `cartItems` chỉ cho sản phẩm được thay đổi
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.productId._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.productId.price * item.quantity, 0);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div>
      <div className="bg-white shadow-sm">
        <div className="max-w-[1300px] mx-auto">
          <TopMenu />
          <SubMenu />
        </div>
      </div>
      <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
        <div className="max-w-[1200px] mx-auto mb-8 min-h-[300px]">
          <div className="text-2xl font-bold my-4">Shopping Cart</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="space-y-4">
                {cartItems.map((product) => (
                  <CartItem
                    key={product.productId._id}
                    product={product}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white p-4 border sticky top-4">
                <button
                  onClick={() => navigate("/checkout")}
                  className="flex items-center justify-center bg-blue-600 w-full text-white font-semibold p-3 rounded-full hover:bg-blue-700"
                >
                  Go to Checkout
                </button>

                <div className="flex items-center justify-between mt-4 text-sm mb-1">
                  <div>Items ({cartItems.length})</div>
                  <div>£{(getCartTotal() / 100).toFixed(2)}</div>
                </div>
                <div className="flex items-center justify-between mb-4 text-sm">
                  <div>Shipping:</div>
                  <div>Free</div>
                  <button> check</button>
                </div>

                <div className="border-b border-gray-300" />

                <div className="flex items-center justify-between mt-4 mb-1 text-lg font-semibold">
                  <div>Subtotal</div>
                  <div>£{(getCartTotal() / 100).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <SimilarProducts />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}