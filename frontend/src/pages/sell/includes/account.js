import React, { useState, useEffect, useCallback } from "react";
import PersonalInfo from "./PersonalInfo";
import StoreProfile from "./StoreProfile";
import {
  FiUser,
  FiShield,
  FiSettings,
  FiPackage,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";

const Account = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal"); // For mobile tab navigation
  const apiBaseUrl = "http://localhost:5000/api";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Vui lòng đăng nhập để xem thông tin tài khoản.");
      setLoading(false);
      return;
    }

    try {
      const userResponse = await fetch(`${apiBaseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          setError(
            "Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại."
          );
          localStorage.removeItem("token");
        } else {
          const errorData = await userResponse
            .json()
            .catch(() => ({ message: "Không thể lấy thông tin người dùng." }));
          throw new Error(
            errorData.message ||
              "Lỗi không xác định khi lấy thông tin người dùng."
          );
        }
      } else {
        const userData = await userResponse.json();
        if (userData.success) {
          setUserInfo(userData.user);

          if (userData.user.role === "seller") {
            const storeResponse = await fetch(`${apiBaseUrl}/stores/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (storeResponse.ok) {
              const storeData = await storeResponse.json();
              if (storeData.success) {
                setStoreInfo(storeData.store);
              }
            } else {
              console.warn("Could not fetch store profile.");
            }
          }
        } else {
          throw new Error(
            userData.message || "Lỗi khi lấy dữ liệu người dùng."
          );
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveUserInfo = async (updatedInfo) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập lại.");
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedInfo),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Không thể cập nhật thông tin người dùng."
        );
      }

      setUserInfo((prevInfo) => ({
        ...prevInfo,
        ...data.user,
      }));
      alert("Thông tin cá nhân đã được cập nhật!");
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin cá nhân:", err);
      alert("Lỗi: " + err.message);
    }
  };

  const handleSaveAddress = async (addressData, addressId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập lại.");
      return;
    }

    const isUpdating = !!addressId;
    const url = isUpdating
      ? `${apiBaseUrl}/addresses/${addressId}`
      : `${apiBaseUrl}/addresses`;
    const method = isUpdating ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            `Không thể ${isUpdating ? "cập nhật" : "thêm"} địa chỉ.`
        );
      }

      alert(`Địa chỉ đã được ${isUpdating ? "cập nhật" : "thêm"} thành công!`);
      fetchData();
    } catch (err) {
      console.error(
        `Lỗi khi ${isUpdating ? "cập nhật" : "thêm"} địa chỉ:`,
        err
      );
      alert("Lỗi: " + err.message);
    }
  };

  const handleSaveStoreProfile = async (storeData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập lại.");
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/stores/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(storeData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 404) {
          throw new Error(
            "Cửa hàng không tồn tại. Có lỗi xảy ra hoặc bạn cần tạo cửa hàng trước."
          );
        } else {
          throw new Error(data.message || "Không thể cập nhật hồ sơ cửa hàng.");
        }
      }

      setStoreInfo(data.store);
      alert("Hồ sơ cửa hàng đã được cập nhật!");
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ cửa hàng:", err);
      alert("Lỗi: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">
            Đang tải thông tin tài khoản...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 text-red-700 p-8 rounded-xl shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-center">Đã xảy ra lỗi</h2>
          <p className="text-center mb-4">{error}</p>
          <button
            onClick={() => fetchData()}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );

  if (!userInfo)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-yellow-50 text-yellow-700 p-8 rounded-xl shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4">
            <FiUser className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-center">
            Không tìm thấy thông tin
          </h2>
          <p className="text-center mb-4">
            Không thể tải thông tin người dùng. Vui lòng thử lại.
          </p>
          <button
            onClick={() => fetchData()}
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý tài khoản
          </h1>
          <p className="text-gray-600">
            Tùy chỉnh thông tin cá nhân, thanh toán và cửa hàng của bạn tại đây.
          </p>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="sm:hidden mb-6">
          <div className="bg-white rounded-lg shadow">
            <div className="flex divide-x divide-gray-200">
              <button
                onClick={() => setActiveTab("personal")}
                className={`flex-1 py-3 ${
                  activeTab === "personal"
                    ? "text-blue-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                Cá nhân
              </button>
              {userInfo.role === "seller" && (
                <button
                  onClick={() => setActiveTab("store")}
                  className={`flex-1 py-3 ${
                    activeTab === "store"
                      ? "text-blue-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  Cửa hàng
                </button>
              )}
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 py-3 ${
                  activeTab === "settings"
                    ? "text-blue-600 font-medium"
                    : "text-gray-600"
                }`}
              >
                Cài đặt
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* Account Sidebar - Hidden on Mobile */}
          <div className="hidden sm:block sm:col-span-3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {userInfo.avatarURL ? (
                      <img
                        src={userInfo.avatarURL}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <FiUser className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {userInfo.fullname}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userInfo.role === "seller" ? "Người bán" : "Người mua"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <a
                  href="#personal"
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
                >
                  <FiUser className="inline-block mr-2" />
                  Thông tin cá nhân
                </a>
                {userInfo.role === "seller" && (
                  <a
                    href="#store"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
                  >
                    <FiPackage className="inline-block mr-2" />
                    Hồ sơ cửa hàng
                  </a>
                )}
                <a
                  href="#settings"
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
                >
                  <FiSettings className="inline-block mr-2" />
                  Tùy chỉnh & Cài đặt
                </a>
                <a
                  href="#services"
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium"
                >
                  <FiShield className="inline-block mr-2" />
                  Gói dịch vụ
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="sm:col-span-9 space-y-6">
            {/* Personal Info Section */}
            <div
              id="personal"
              className={`bg-white rounded-lg shadow overflow-hidden transition-all duration-300 ${
                !["personal", undefined].includes(activeTab) &&
                "sm:block hidden"
              }`}
            >
              <div className="border-b px-4 py-4 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Thông tin cá nhân
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Cập nhật thông tin cá nhân và địa chỉ của bạn
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <PersonalInfo
                  userInfo={userInfo}
                  addresses={userInfo.addresses}
                  onSave={handleSaveUserInfo}
                  onSaveAddress={handleSaveAddress}
                />
              </div>
            </div>

            {/* Store Profile Section - Only for sellers */}
            {userInfo.role === "seller" && (
              <div
                id="store"
                className={`bg-white rounded-lg shadow overflow-hidden transition-all duration-300 ${
                  activeTab !== "store" && "sm:block hidden"
                }`}
              >
                <div className="border-b px-4 py-4 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Hồ sơ cửa hàng
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Quản lý thông tin và cài đặt cửa hàng của bạn
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <StoreProfile
                    storeInfo={storeInfo}
                    onSave={handleSaveStoreProfile}
                  />
                </div>
              </div>
            )}

            {/* Customization Section */}
            <div
              id="settings"
              className={`bg-white rounded-lg shadow overflow-hidden transition-all duration-300 ${
                activeTab !== "settings" && "sm:block hidden"
              }`}
            >
              <div className="border-b px-4 py-4 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Tùy chỉnh & Cài đặt
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Thiết lập thông báo, bảo mật và ngôn ngữ
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Thông báo
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Nhận thông báo qua email và ứng dụng
                      </p>
                    </div>
                    <div className="relative">
                      <div className="h-6 w-11 bg-green-500 rounded-full cursor-pointer"></div>
                      <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Ngôn ngữ
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Thiết lập ngôn ngữ hiển thị
                      </p>
                    </div>
                    <select className="text-sm border-gray-300 rounded-md py-1 pl-3 pr-8 text-gray-700">
                      <option>Tiếng Việt</option>
                      <option>English</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">
                        Xác minh 2 bước
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Tăng cường bảo mật tài khoản
                      </p>
                    </div>
                    <div className="relative">
                      <div className="h-6 w-11 bg-green-500 rounded-full cursor-pointer"></div>
                      <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>

                <button className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                  Lưu cài đặt
                </button>
              </div>
            </div>

            {/* Service Packages */}
            <div
              id="services"
              className={`bg-white rounded-lg shadow overflow-hidden transition-all duration-300 ${
                activeTab !== "services" && "sm:block hidden"
              }`}
            >
              <div className="border-b px-4 py-4 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Gói dịch vụ
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Theo dõi các gói đăng ký của bạn
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Đang hoạt động
                        </span>
                        <h3 className="mt-1 font-medium text-gray-900">
                          Gói bán hàng Pro
                        </h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        Hết hạn: 30/04/2025
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                          <div
                            style={{ width: "75%" }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Đã sử dụng 9 tháng</span>
                        <span>Còn lại 3 tháng</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Không hoạt động
                        </span>
                        <h3 className="mt-1 font-medium text-gray-700">
                          Gói quảng cáo nâng cao
                        </h3>
                      </div>
                      <button className="px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-50">
                        Kích hoạt
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Tiếp cận nhiều khách hàng hơn với gói quảng cáo nâng cao
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    Xem lịch sử giao dịch
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    Nâng cấp gói dịch vụ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
