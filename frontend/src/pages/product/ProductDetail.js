import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopMenu from "../../components/TopMenu";
import SubMenu from "../../components/SubMenu";
import {
  FiMessageSquare,
  FiHome,
  FiShoppingBag,
  FiChevronRight,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiHeart,
  FiPackage,
} from "react-icons/fi";
import ProductChat from "../../components/ProductChat";

export default function ProductDetail() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [seller, setSeller] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatButtonRef = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleOpenChat = () => {
    if (chatButtonRef.current) {
      chatButtonRef.current.click();
    } else {
      setIsChatOpen(true);
      setTimeout(() => {
        const chatButton = document.getElementById("productChatButton");
        if (chatButton) chatButton.click();
      }, 100);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data);
        setMainImage(data.image);

        if (response.sellerId) {
          try {
            const sellerResponse = await fetch(
              `http://localhost:5000/auth/users/${response.sellerId._id}`
            );
            if (sellerResponse.ok) {
              const sellerData = await sellerResponse.json();
              setSeller(sellerData.user || sellerData);
            } else {
              console.warn("Could not fetch seller details");
            }
          } catch (sellerError) {
            console.error("Error fetching seller:", sellerError);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const sellerName = seller?.fullname || seller?.username || "Seller";

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading product details...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <div className="bg-white border border-red-200 text-red-700 p-8 rounded-xl shadow-lg max-w-lg w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-center">
            Error Loading Product
          </h2>
          <p className="text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <div className="bg-white border border-yellow-200 text-yellow-800 p-8 rounded-xl shadow-lg max-w-lg w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-center">
            Product Not Found
          </h2>
          <p className="text-center">
            Sorry, we couldn't find the requested product.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );

  const handleAddToCart = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          productId: id,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-[1300px] mx-auto">
          <TopMenu />
          <SubMenu />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8 bg-white p-3 rounded-lg shadow-sm">
          <a
            href="/"
            className="flex items-center hover:text-blue-600 transition-colors font-medium"
          >
            <FiHome className="mr-1" />
            Home
          </a>
          <FiChevronRight className="mx-2 text-gray-400" />
          <a
            href="/products"
            className="hover:text-blue-600 transition-colors flex items-center font-medium"
          >
            <FiShoppingBag className="mr-1" />
            Products
          </a>
          <FiChevronRight className="mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-xs">
            {product.title}
          </span>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* Product Images */}
            <div className="md:col-span-5 bg-gray-50 p-6 border-r border-gray-100">
              <div className="sticky top-32">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white mb-6 shadow-sm">
                  <img
                    src={mainImage}
                    alt={product.title}
                    className="w-full h-[500px] object-contain p-4 transition-all duration-300 hover:scale-105"
                  />
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {product.images?.map((img, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 shadow-sm transition-all ${
                        mainImage === img
                          ? "ring-2 ring-blue-500 transform scale-105"
                          : ""
                      }`}
                      onClick={() => setMainImage(img)}
                    >
                      <img
                        src={img || "photo.png"}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="md:col-span-7 p-8">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center mb-3">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                      {product.condition || "New"}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      In Stock
                    </span>
                  </div>

                  <h1 className="text-4xl font-bold text-gray-800 mb-2 leading-tight">
                    {product.title}
                  </h1>

                  <div className="flex items-center text-sm text-gray-500">
                    <img
                      src={product.sellerId.avatarURL}
                      className="size-12 mr-4 object-cover rounded-full"
                    />

                    <span className="flex items-center">
                      <FiPackage className="mr-1" />
                      Sold by: {product.sellerId.fullname || "Seller"}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xl text-gray-500 line-through mb-1">
                        $
                        {(
                          (product.originalPrice || product.price * 1.2) / 100
                        ).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 text-sm text-green-700 font-medium">
                    Free shipping on orders over $50
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed border-l-4 border-blue-100 pl-4 py-2">
                    {product.description || "No description available."}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4">
                  <div className="flex flex-col items-center border rounded-lg py-3 px-2 transition-colors hover:bg-blue-50">
                    <FiTruck className="text-blue-500 text-xl mb-2" />
                    <span className="text-sm text-center font-medium">
                      Fast Delivery
                    </span>
                  </div>
                  <div className="flex flex-col items-center border rounded-lg py-3 px-2 transition-colors hover:bg-blue-50">
                    <FiShield className="text-blue-500 text-xl mb-2" />
                    <span className="text-sm text-center font-medium">
                      Buyer Protection
                    </span>
                  </div>
                  <div className="flex flex-col items-center border rounded-lg py-3 px-2 transition-colors hover:bg-blue-50">
                    <FiRefreshCw className="text-blue-500 text-xl mb-2" />
                    <span className="text-sm text-center font-medium">
                      30-Day Returns
                    </span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={decrementQuantity}
                      className="w-10 h-10 rounded-l-lg bg-gray-100 flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      -
                    </button>
                    <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-300 bg-white text-gray-700">
                      {quantity}
                    </div>
                    <button
                      onClick={incrementQuantity}
                      className="w-10 h-10 rounded-r-lg bg-gray-100 flex items-center justify-center border border-gray-300 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <button className="sm:col-span-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      Buy Now
                    </button>
                    <button
                      className="sm:col-span-4 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-4 rounded-xl font-semibold transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </button>
                    <button className="sm:col-span-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 p-4 rounded-xl transition-all flex items-center justify-center shadow-sm">
                      <FiHeart className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* Seller Contact */}
                {currentUser && currentUser.id !== product.sellerId._id && (
                  <div className="pt-6 border-t border-gray-100">
                    <button
                      onClick={handleOpenChat}
                      className="text-blue-600 hover:text-blue-800 flex items-center transition-colors bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 font-medium"
                    >
                      <FiMessageSquare className="mr-2 text-lg" />
                      Message the seller
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Product Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Specifications
              </h3>
              <div className="space-y-3">
                <div className="flex border-b border-gray-100 pb-3">
                  <span className="w-1/3 font-medium text-gray-500">
                    Condition
                  </span>
                  <span className="w-2/3 text-gray-800">
                    {product.condition || "New"}
                  </span>
                </div>
                <div className="flex border-b border-gray-100 pb-3">
                  <span className="w-1/3 font-medium text-gray-500">
                    Category
                  </span>
                  <span className="w-2/3 text-gray-800">
                    {product.category || "General"}
                  </span>
                </div>
                <div className="flex border-b border-gray-100 pb-3">
                  <span className="w-1/3 font-medium text-gray-500">Brand</span>
                  <span className="w-2/3 text-gray-800">
                    {product.brand || "Unbranded"}
                  </span>
                </div>
                <div className="flex border-b border-gray-100 pb-3">
                  <span className="w-1/3 font-medium text-gray-500">Model</span>
                  <span className="w-2/3 text-gray-800">
                    {product.model || "Standard"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Shipping Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FiTruck className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Delivery</p>
                    <p className="text-gray-600 text-sm">
                      Free shipping within the U.S. International shipping
                      available.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FiShield className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Warranty</p>
                    <p className="text-gray-600 text-sm">
                      30-day satisfaction guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {product &&
          product.sellerId._id &&
          currentUser &&
          currentUser.id !== product.sellerId._id && (
            <ProductChat
              product={{
                id: product._id || id,
                title: product.title,
                image: product.image,
                price: product.price,
              }}
              sellerId={product.sellerId._id}
              sellerName={sellerName}
              ref={chatButtonRef}
              isOpen={isChatOpen}
            />
          )}
      </div>
    </div>
  );
}
