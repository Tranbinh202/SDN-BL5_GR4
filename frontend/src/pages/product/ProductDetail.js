import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopMenu from "../../components/TopMenu";
import SubMenu from "../../components/SubMenu";
import { FiMessageSquare } from "react-icons/fi";
import ProductChat from "../../components/ProductChat";

export default function ProductDetail() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [seller, setSeller] = useState(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  const handleAddToCart = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Gửi token xác thực
        },
        body: JSON.stringify({
          productId: id, // ID của sản phẩm
          quantity: 1, // Số lượng mặc định là 1
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      // Chuyển hướng sang trang /cart sau khi thêm thành công
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  return (
    <div>
      <div className="bg-white shadow-sm">
        <div className="max-w-[1300px] mx-auto">
          <TopMenu />
          <SubMenu />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <a href="/" className="hover:underline">
            Home
          </a>{" "}
          &gt;
          <a href="/products" className="hover:underline">
            {" "}
            Products
          </a>{" "}
          &gt;
          <span className="font-semibold">{product.title}</span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Hình ảnh sản phẩm */}
          <div className="md:col-span-5">
            <div className="border rounded-lg p-4">
              <img
                src={mainImage}
                alt={product.title}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />
              <div className="grid grid-cols-5 gap-2">
                {product.images?.map((img, index) => (
                  <img
                    key={index}
                    src={img || "photo.png"}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-20 object-cover border rounded-lg cursor-pointer hover:border-blue-500"
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Chi tiết sản phẩm */}
          <div className="md:col-span-7">
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <p className="text-lg text-gray-600 mb-4">
              {product.description || "No description available."}
            </p>
            <p className="text-2xl font-semibold text-red-500 mb-4">
              ${(product.price / 100).toFixed(2)}
            </p>
            <p className="text-md text-gray-600 mb-4">
              Condition: {product.condition || "New"}
            </p>

            {/* Nút hành động */}
            <div className="flex items-center space-x-4 mt-6">
              <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600">
                Buy Now
              </button>
              <button
                className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        {currentUser && currentUser.id !== product.sellerId._id && (
          <button
            onClick={handleOpenChat}
            className="ml-auto text-xs text-[#0053A0] hover:underline flex items-center"
          >
            <FiMessageSquare className="mr-1" />
            Contact seller
          </button>
        )}
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
