import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Footer from "../../components/Footer";
import SubMenu from "../../components/SubMenu";
import MainHeader from "../../components/MainHeader";
import TopMenu from "../../components/TopMenu";

// Enable or disable debug logging
const DEBUG = false;

// Log helper function
const debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

// Track which errors have been logged to avoid duplicate error messages
const loggedErrors = new Set();

// Custom error logger that ensures each unique error is only logged once
const logErrorOnce = (error, context = '') => {
  const errorKey = `${context}:${error.message || error}`;
  if (!loggedErrors.has(errorKey)) {
    console.error(`[${context}]`, error);
    loggedErrors.add(errorKey);
  }
};

// Định nghĩa CheckoutItem
function CheckoutItem({ product }) {
    return (
        <div className="flex items-center justify-between gap-4 p-4 border-b">
            <div className="flex items-center gap-4">
                <img
                    src={`${product.url}/100`}
                    alt={product.title}
                    className="w-[100px] h-[100px] object-cover rounded-lg"
                />
                <div>
                    <div className="font-semibold text-base">{product.title}</div>
                    <div className="text-sm text-gray-500">{product.description?.substring(0, 80)}...</div>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="font-bold">£{(product.price / 100).toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Số lượng: <span className="font-semibold">{product.quantity}</span></div>
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                        Thành tiền: £{((product.price * product.quantity) / 100).toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [addressDetails, setAddressDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Store the user ID as a separate value to avoid recreating the currentUser object
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const userId = currentUser?.id;
    
    // Thêm state cho mã giảm giá và phí vận chuyển
    const [discountCode, setDiscountCode] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountError, setDiscountError] = useState("");
    const [discountSuccess, setDiscountSuccess] = useState("");
    const [shippingFee, setShippingFee] = useState(0);
    const [shippingOption, setShippingOption] = useState("standard");
    
    // State cho form địa chỉ giao hàng mới
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [formAddress, setFormAddress] = useState({
        name: "",
        address: "",
        phone: "",
        country: "Vietnam"
    });
    const [formErrors, setFormErrors] = useState({});
    // Mặc định là true để không chặn người dùng thanh toán
    const [addressValidated, setAddressValidated] = useState(true);

    // Phí vận chuyển theo khu vực
    const shippingRates = {
        "hanoi": { standard: 0, express: 20000 },
        "hcm": { standard: 0, express: 20000 },
        "other": { standard: 30000, express: 50000 }
    };

    // Hàm lấy dữ liệu từ API
    const fetchCartItems = async () => {
        if (!currentUser) {
            debugLog("No current user, setting empty cart");
            setCartItems([]);
            setIsLoading(false);
            return;
        }

        try {
            debugLog("Fetching cart for user:", currentUser.id);
            // Sử dụng cùng endpoint API với trang Cart
            const response = await fetch("http://localhost:5000/api/cart", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch cart: ${response.status}`);
            }
            
            const data = await response.json();
            debugLog("Cart data:", data);
            
            // Lấy danh sách sản phẩm từ đúng cấu trúc API
            const cartProducts = data.cart?.products || [];
            
            // Chuyển đổi định dạng dữ liệu sản phẩm để phù hợp với trang checkout
            const formattedProducts = cartProducts.map(item => ({
                id: item.productId._id,
                idProduct: item.productId._id,
                cartItemId: item._id,
                title: item.productId.title,
                description: item.productId.description,
                price: item.productId.price,
                url: item.productId.image,
                quantity: item.quantity
            }));
            
            debugLog("Formatted products:", formattedProducts);
            setCartItems(formattedProducts);
            
            if (formattedProducts.length === 0) {
                console.warn("No products found in cart");
            }
        } catch (error) {
            logErrorOnce(error, "fetchCartItems");
            setCartItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm lấy thông tin địa chỉ từ API
    const fetchAddressDetails = async () => {
        if (!currentUser) return;

        try {
            debugLog("Fetching address for user:", currentUser.id);
            // Sửa đường dẫn API user để sử dụng auth/me endpoint
            const userResponse = await fetch(`http://localhost:5000/api/auth/me`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
            if (!userResponse.ok) {
                throw new Error(`Failed to fetch user: ${userResponse.status}`);
            }
            const userData = await userResponse.json();
            debugLog("User data:", userData);
            
            // Kiểm tra dữ liệu người dùng hợp lệ
            if (userData && userData.user) {
                const user = userData.user;
                // Chỉ hiển thị form địa chỉ khi không có dữ liệu hợp lệ
                setShowAddressForm(false);
                setAddressValidated(true);
                setAddressDetails({
                    name: user.fullname || user.username,
                    address: user.address?.street || "",
                    phone: user.phone || "",
                    country: user.address?.country || "Vietnam",
                });
                
                // Cập nhật phí vận chuyển
                updateShippingFee("other", "standard");
            } else {
                console.warn("User has no valid address");
                setShowAddressForm(true);
                setAddressValidated(false);
                setAddressDetails(null);
                
                // Mặc định phí vận chuyển cho khu vực khác
                setShippingFee(shippingRates.other.standard);
            }
        } catch (error) {
            logErrorOnce(error, "fetchAddressDetails");
            setShowAddressForm(true);
            setAddressValidated(false);
            setAddressDetails(null);
            
            // Mặc định phí vận chuyển cho khu vực khác
            setShippingFee(shippingRates.other.standard);
        }
    };

    // Cập nhật phí vận chuyển dựa trên thành phố và loại vận chuyển
    const updateShippingFee = (city, option) => {
        let regionKey = "other";
        
        // Phí vận chuyển mặc định cho khu vực khác
        setShippingFee(shippingRates[regionKey][option]);
        setShippingOption(option);
    };

    // Hàm áp dụng mã giảm giá
    const applyDiscountCode = async () => {
        if (!discountCode) {
            setDiscountError("Vui lòng nhập mã giảm giá");
            setDiscountSuccess("");
            return;
        }
        
        try {
            debugLog(`Đang kiểm tra mã giảm giá: ${discountCode}`);
            
            // Gọi API kiểm tra mã giảm giá
            const response = await fetch(`http://localhost:5000/api/coupons/verify/${discountCode}`);
            const data = await response.json();
            debugLog("API response:", data);
            
            if (!response.ok) {
                setDiscountError(data.message || "Mã giảm giá không hợp lệ");
                setDiscountSuccess("");
                setDiscountAmount(0);
                return;
            }
            
            // Nếu mã giảm giá hợp lệ
            if (data.success) {
                const coupon = data.coupon;
                
                // Nếu mã giảm giá áp dụng cho sản phẩm cụ thể
                if (coupon.productId) {
                    // Tìm sản phẩm trong giỏ hàng mà mã giảm giá áp dụng
                    const applicableProduct = cartItems.find(item => item.id === coupon.productId);
                    
                    if (applicableProduct) {
                        // Tính số tiền giảm giá chỉ cho sản phẩm đó
                        const productTotal = applicableProduct.price * applicableProduct.quantity;
                        const amount = (productTotal * coupon.discountPercent) / 100;
                        setDiscountAmount(amount);
                        setDiscountSuccess(`Giảm ${coupon.discountPercent}% cho sản phẩm ${applicableProduct.title}`);
                    } else {
                        setDiscountError("Mã giảm giá không áp dụng cho sản phẩm nào trong giỏ hàng");
                        setDiscountSuccess("");
                        setDiscountAmount(0);
                        return;
                    }
                } else {
                    // Áp dụng giảm giá cho toàn bộ đơn hàng
                    if (coupon.code === "FREESHIP") {
                        setShippingFee(0);
                        setDiscountAmount(0);
                        setDiscountSuccess("Miễn phí vận chuyển!");
                    } else {
                        // Tính số tiền giảm giá dựa trên phần trăm
                        const amount = (getCartTotal() * coupon.discountPercent) / 100;
                        setDiscountAmount(amount);
                        setDiscountSuccess(`Giảm ${coupon.discountPercent}% tổng đơn hàng!`);
                    }
                }
                
                setDiscountError("");
            } else {
                setDiscountError("Mã giảm giá không hợp lệ");
                setDiscountSuccess("");
                setDiscountAmount(0);
            }
            
            // Backup dự phòng nếu API không hoạt động
            if (!response.ok) {
                // Xử lý mã giảm giá cứng
                if (discountCode === "SAVE10") {
                    // Giảm 10% tổng đơn hàng
                    const amount = (getCartTotal() * 10) / 100;
                    setDiscountAmount(amount);
                    setDiscountSuccess(`Giảm 10% tổng đơn hàng!`);
                    setDiscountError("");
                    return;
                } else if (discountCode === "SAVE20") {
                    // Giảm 20% tổng đơn hàng
                    const amount = (getCartTotal() * 20) / 100;
                    setDiscountAmount(amount);
                    setDiscountSuccess(`Giảm 20% tổng đơn hàng!`);
                    setDiscountError("");
                    return;
                } else if (discountCode === "FREESHIP") {
                    // Miễn phí vận chuyển
                    setShippingFee(0);
                    setDiscountAmount(0);
                    setDiscountSuccess("Miễn phí vận chuyển!");
                    setDiscountError("");
                    return;
                }
            }
        } catch (error) {
            logErrorOnce(error, "applyDiscountCode");
            setDiscountError("Đã xảy ra lỗi khi áp dụng mã giảm giá");
            setDiscountSuccess("");
            setDiscountAmount(0);
            
            // Xử lý mã giảm giá cứng nếu có lỗi
            if (discountCode === "SAVE10") {
                // Giảm 10% tổng đơn hàng
                const amount = (getCartTotal() * 10) / 100;
                setDiscountAmount(amount);
                setDiscountSuccess(`Giảm 10% tổng đơn hàng!`);
                setDiscountError("");
            } else if (discountCode === "SAVE20") {
                // Giảm 20% tổng đơn hàng
                const amount = (getCartTotal() * 20) / 100;
                setDiscountAmount(amount);
                setDiscountSuccess(`Giảm 20% tổng đơn hàng!`);
                setDiscountError("");
            } else if (discountCode === "FREESHIP") {
                // Miễn phí vận chuyển
                setShippingFee(0);
                setDiscountAmount(0);
                setDiscountSuccess("Miễn phí vận chuyển!");
                setDiscountError("");
            }
        }
    };
    
    // Xử lý thay đổi form địa chỉ
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormAddress({
            ...formAddress,
            [name]: value
        });
        
        // Xóa lỗi khi người dùng nhập
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ""
            });
        }
        
        // Cập nhật phí vận chuyển nếu thành phố thay đổi
        if (name === "city") {
            updateShippingFee(value, shippingOption);
        }
    };
    
    // Kiểm tra và lưu địa chỉ
    const validateAndSaveAddress = () => {
        const errors = {};
        
        // Kiểm tra các trường bắt buộc
        if (!formAddress.name.trim()) errors.name = "Vui lòng nhập họ tên";
        if (!formAddress.address.trim()) errors.address = "Vui lòng nhập địa chỉ";
        if (!formAddress.phone.trim()) errors.phone = "Vui lòng nhập số điện thoại";
        else if (!/^[0-9]{10,11}$/.test(formAddress.phone.trim())) {
            errors.phone = "Số điện thoại không hợp lệ (10-11 số)";
        }
        
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return false;
        }
        
        // Tất cả trường đều hợp lệ
        setAddressDetails({
            ...formAddress,
            zipcode: "",
            city: ""
        });
        
        // Ẩn form sau khi xác nhận
        setShowAddressForm(false);
        
        // Cập nhật thông tin người dùng trên server (tùy chọn)
        if (currentUser) {
            updateUserAddress();
        }
        
        return true;
    };
    
    // Cập nhật địa chỉ người dùng trên server
    const updateUserAddress = async () => {
        try {
            // Sử dụng API admin để cập nhật thông tin người dùng
            const response = await fetch(`http://localhost:5000/api/admin/users/${currentUser.id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ 
                    address: {
                        street: formAddress.address,
                        zipcode: "",
                        city: "",
                        country: formAddress.country
                    },
                    phone: formAddress.phone
                }),
            });
            
            if (!response.ok) {
                logErrorOnce(new Error("Failed to update user address"), "updateUserAddress");
            }
        } catch (error) {
            logErrorOnce(error, "updateUserAddress");
        }
    };

    useEffect(() => {
        // Skip effect if there's no user ID
        if (!userId) {
            setIsLoading(false);
            return;
        }
        
        const fetchData = async () => {
            await Promise.all([fetchCartItems(), fetchAddressDetails()]);
        };
        fetchData();
        // Only depend on userId, which is a stable primitive value
    }, [userId]);

    // Tính tổng tiền
    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // Tính tổng tiền cuối cùng sau khi áp dụng giảm giá và phí vận chuyển
    const getFinalTotal = () => {
        const subtotal = getCartTotal();
        return subtotal - discountAmount + shippingFee;
    };

    const handlePayment = async () => {
        if (!currentUser) {
            alert("Please login to checkout");
            navigate("/auth");
            return;
        }

        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        
        // Nếu đang hiển thị form, thử xác thực và lưu thông tin
        if (showAddressForm) {
            const isValid = validateAndSaveAddress();
            if (!isValid) {
                alert("Vui lòng điền đầy đủ thông tin giao hàng");
                return;
            }
        }
        
        // Sử dụng thông tin địa chỉ từ formAddress nếu đang hiển thị form
        const shippingAddress = showAddressForm ? formAddress : (addressDetails || {
            name: currentUser.fullname || "N/A",
            address: "N/A",
            phone: "N/A",
            country: "Vietnam"
        });

        const orderId = "ORD" + Math.floor(100 + Math.random() * 900);
        const orderData = {
            order_id: orderId,
            user_id: currentUser.id,
            order_date: new Date().toISOString(),
            total_amount: parseFloat((getFinalTotal() / 100).toFixed(2)),
            status: "pending",
            items: cartItems.map(item => ({
                product_name: item.title,
                quantity: item.quantity,
                price: parseFloat((item.price / 100).toFixed(2)),
            })),
            shipping_fee: parseFloat((shippingFee / 100).toFixed(2)),
            discount_code: discountCode || null,
            discount_amount: parseFloat((discountAmount / 100).toFixed(2)),
            shipping_address: shippingAddress
        };

        try {
            // 1. Lưu đơn hàng mới vào orders
            await fetch("http://localhost:5000/api/admin/orders", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(orderData),
            });

            // 2. Không cần cập nhật user.order_id, điều này sẽ được xử lý bởi backend
            
            // 3. Xoá toàn bộ giỏ hàng sau khi thanh toán
            const cartRes = await fetch(`http://localhost:5000/api/cart`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const cartData = await cartRes.json();
            
            // Xóa từng sản phẩm trong giỏ hàng
            for (let product of cartData.cart?.products || []) {
                await fetch(`http://localhost:5000/api/cart/remove/${product.productId._id}`, { 
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                });
            }

            // Điều hướng đến trang success
            navigate("/success", {
                state: {
                    cartItems: cartItems,
                    addressDetails: addressDetails || formAddress,
                    orderTotal: getFinalTotal(),
                    shippingFee: shippingFee,
                    discountAmount: discountAmount
                },
            });
        } catch (error) {
            logErrorOnce(error, "handlePayment");
            alert("Đã xảy ra lỗi khi thanh toán.");
        }
    };


    if (!currentUser) {
        return (
            <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
                <div>
                    <TopMenu />
                    <MainHeader />
                    <SubMenu />
                </div>
                <div className="text-center py-20">
                    Please{" "}
                    <button
                        onClick={() => navigate("/auth")}
                        className="text-blue-500 hover:underline"
                    >
                        login
                    </button>{" "}
                    to proceed to checkout
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <div id="MainLayout" className="min-w-[1050px] max-w-[1300px] mx-auto">
                <div>
                    <TopMenu />
                    <MainHeader />
                    <SubMenu />
                </div>
                <div id="CheckoutPage" className="mt-4 max-w-[1100px] mx-auto">
                    <div className="text-2xl font-bold mt-4 mb-4">Checkout</div>

                    {isLoading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : (
                        <div className="relative flex items-baseline gap-4 justify-between mx-auto w-full">
                            <div className="w-[65%]">
                                <div className="bg-white rounded-lg p-4 border">
                                    <div className="text-xl font-semibold mb-2">
                                        Shipping Address
                                    </div>
                                    
                                    {showAddressForm ? (
                                        <div className="mt-4">
                                            <form className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Họ tên <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formAddress.name}
                                                        onChange={handleFormChange}
                                                        className={`mt-1 block w-full p-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
                                                        placeholder="Nhập họ tên người nhận"
                                                    />
                                                    {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Số điện thoại <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        value={formAddress.phone}
                                                        onChange={handleFormChange}
                                                        className={`mt-1 block w-full p-2 border ${formErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
                                                        placeholder="Nhập số điện thoại"
                                                    />
                                                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Địa chỉ <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        value={formAddress.address}
                                                        onChange={handleFormChange}
                                                        className={`mt-1 block w-full p-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm`}
                                                        placeholder="Nhập địa chỉ đầy đủ"
                                                    />
                                                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Quốc gia
                                                    </label>
                                                    <select
                                                        name="country"
                                                        value={formAddress.country}
                                                        onChange={handleFormChange}
                                                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                                    >
                                                        <option value="Vietnam">Việt Nam</option>
                                                        <option value="United States">United States</option>
                                                        <option value="United Kingdom">United Kingdom</option>
                                                    </select>
                                                </div>
                                                
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={validateAndSaveAddress}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                    >
                                                        Xác nhận địa chỉ
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div>
                                            <button
                                                onClick={() => setShowAddressForm(true)}
                                                className="text-blue-500 text-sm underline"
                                            >
                                                Update Address
                                            </button>
                                            {addressDetails ? (
                                                <ul className="text-sm mt-2">
                                                    <li>Name: {addressDetails.name}</li>
                                                    <li>Phone: {addressDetails.phone}</li>
                                                    <li>Address: {addressDetails.address}</li>
                                                    <li>Country: {addressDetails.country}</li>
                                                </ul>
                                            ) : (
                                                <div className="text-sm mt-2">
                                                    No address available
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Vận chuyển */}
                                <div className="bg-white rounded-lg p-4 border mt-4">
                                    <div className="text-xl font-semibold mb-2">
                                        Shipping Options
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center">
                                            <input 
                                                type="radio" 
                                                id="standard" 
                                                name="shipping" 
                                                value="standard"
                                                checked={shippingOption === "standard"}
                                                onChange={() => updateShippingFee("", "standard")}
                                                className="mr-2"
                                            />
                                            <label htmlFor="standard" className="flex justify-between w-full">
                                                <span>Standard Shipping (3-5 days)</span>
                                                <span className="font-semibold">
                                                    {shippingRates["other"].standard === 0 
                                                      ? "Free" : `£${(shippingRates["other"].standard / 100).toFixed(2)}`}
                                                </span>
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input 
                                                type="radio" 
                                                id="express" 
                                                name="shipping" 
                                                value="express"
                                                checked={shippingOption === "express"}
                                                onChange={() => updateShippingFee("", "express")}
                                                className="mr-2"
                                            />
                                            <label htmlFor="express" className="flex justify-between w-full">
                                                <span>Express Shipping (1-2 days)</span>
                                                <span className="font-semibold">
                                                    £{(shippingRates["other"].express / 100).toFixed(2)}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div id="Items" className="bg-white rounded-lg mt-4">
                                    <div className="p-4 border-b">
                                        <h3 className="font-semibold text-lg">Đơn hàng của bạn</h3>
                                    </div>
                                    
                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-4">
                                            No items in cart
                                        </div>
                                    ) : (
                                        <>
                                            {cartItems.map((product) => (
                                                <CheckoutItem
                                                    key={`${product.cartItemId}-${product.idProduct}`}
                                                    product={product}
                                                />
                                            ))}
                                            
                                            <div className="p-4 bg-gray-50">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left py-2">Sản phẩm</th>
                                                            <th className="text-center py-2">Số lượng</th>
                                                            <th className="text-right py-2">Giá</th>
                                                            <th className="text-right py-2">Tổng</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cartItems.map((product) => (
                                                            <tr key={`summary-${product.idProduct}`} className="border-b">
                                                                <td className="py-2">{product.title}</td>
                                                                <td className="text-center py-2">{product.quantity}</td>
                                                                <td className="text-right py-2">£{(product.price / 100).toFixed(2)}</td>
                                                                <td className="text-right py-2">£{((product.price * product.quantity) / 100).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                        <tr className="font-semibold">
                                                            <td colSpan="3" className="py-2 text-right">Tổng cộng:</td>
                                                            <td className="py-2 text-right">£{(getCartTotal() / 100).toFixed(2)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div
                                id="PlaceOrder"
                                className="relative -top-[6px] w-[35%] border rounded-lg"
                            >
                                <div className="p-4">
                                    {/* Phần mã giảm giá */}
                                    <div className="mb-4">
                                        <div className="font-semibold mb-2">Apply Discount Code</div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                placeholder="Enter discount code"
                                                className="flex-1 border p-2 rounded-sm"
                                            />
                                            <button
                                                onClick={applyDiscountCode}
                                                className="bg-blue-600 text-white px-3 py-2 rounded-sm hover:bg-blue-700"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {discountError && <div className="text-red-500 text-xs mt-1">{discountError}</div>}
                                        {discountSuccess && <div className="text-green-500 text-xs mt-1">{discountSuccess}</div>}
                                    </div>

                                    <div className="flex items-baseline justify-between text-sm mb-1">
                                        <div>
                                            Items (
                                            {cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                                        </div>
                                        <div>£{(getCartTotal() / 100).toFixed(2)}</div>
                                    </div>
                                    <div className="flex items-center justify-between mb-1 text-sm">
                                        <div>Shipping:</div>
                                        <div>{shippingFee === 0 ? "Free" : `£${(shippingFee / 100).toFixed(2)}`}</div>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex items-center justify-between mb-4 text-sm text-green-600">
                                            <div>Discount:</div>
                                            <div>-£{(discountAmount / 100).toFixed(2)}</div>
                                        </div>
                                    )}

                                    <div className="border-t" />

                                    <div className="flex items-center justify-between my-4">
                                        <div className="font-semibold">Order total</div>
                                        <div className="text-2xl font-semibold">
                                            £{(getFinalTotal() / 100).toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="border border-gray-500 p-2 rounded-sm mb-4">
                                        <div className="text-gray-500 text-center">Payment Form</div>
                                    </div>

                                    <button
                                        className="mt-4 w-full font-semibold p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={handlePayment}
                                    >
                                        Confirm and pay
                                    </button>
                                </div>

                                <div className="flex items-center p-4 justify-center gap-2 border-t">
                                    <img width={50} src="/images/logo.svg" alt="Logo" />
                                    <div className="font-light mb-2 mt-2">
                                        MONEY BACK GUARANTEE
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <Footer />
                </div>
            </div>
        </>
    );
}