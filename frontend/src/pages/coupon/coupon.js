import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiPercent,
  FiPackage,
  FiTag,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";

const Coupon = () => {
  const API_URL = "http://localhost:5000/api";
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [chosenCoupon, setChosenCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    maxUsage: "",
    productId: "",
  });
  const [coupons, setCoupons] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { discountPercent, startDate, endDate } = formData;

    if (discountPercent < 0 || discountPercent > 100) {
      alert("Discount percent must be between 0 and 100");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date must be earlier than end date");
      return;
    }

    setLoading(true);

    if (chosenCoupon) {
      fetch(`${API_URL}/coupons/update/${chosenCoupon._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((data) => {
          fetchCoupons();
          setFormData({
            code: "",
            discountPercent: "",
            startDate: "",
            endDate: "",
            maxUsage: "",
            productId: "",
          });
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setError("Failed to update coupon");
          setLoading(false);
        });
    } else {
      fetch(`${API_URL}/coupons/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
            setLoading(false);
          } else {
            fetchCoupons();
            setFormData({
              code: "",
              discountPercent: "",
              startDate: "",
              endDate: "",
              maxUsage: "",
              productId: "",
            });
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setError("Failed to create coupon");
          setLoading(false);
        });
    }
    setModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDelete = (couponId) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      setLoading(true);
      fetch(`${API_URL}/coupons/delete/${couponId}`, { method: "DELETE" })
        .then((res) => res.json())
        .then((data) => {
          fetchCoupons();
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setError("Failed to delete coupon");
          setLoading(false);
        });
    }
  };

  const fetchCoupons = () => {
    setLoading(true);
    fetch(`${API_URL}/coupons/seller/${currentUser.id}`, { method: "GET" })
      .then((res) => res.json())
      .then((data) => {
        setCoupons(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError("Failed to fetch coupons");
        setLoading(false);
      });
  };

  useEffect(() => {
    setFormData({
      code: chosenCoupon ? chosenCoupon.code : "",
      discountPercent: chosenCoupon ? chosenCoupon.discountPercent : "",
      startDate: chosenCoupon ? chosenCoupon.startDate.split("T")[0] : "",
      endDate: chosenCoupon ? chosenCoupon.endDate.split("T")[0] : "",
      maxUsage: chosenCoupon ? chosenCoupon.maxUsage : "",
      productId: chosenCoupon ? chosenCoupon.productId._id : "",
    });
  }, [chosenCoupon]);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));

      Promise.all([
        fetch(`${API_URL}/products/seller/${JSON.parse(user).id}`).then((res) =>
          res.json()
        ),
        fetch(`${API_URL}/coupons/seller/${JSON.parse(user).id}`).then((res) =>
          res.json()
        ),
      ])
        .then(([productsData, couponsData]) => {
          setProducts(productsData);
          setCoupons(couponsData);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load data");
          setLoading(false);
        });
    }
  }, []);

  const isCouponActive = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    return now >= startDate && now <= endDate;
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <FiCalendar className="mr-1" />
          Upcoming
        </span>
      );
    } else if (now > endDate) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <FiAlertCircle className="mr-1" />
          Expired
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FiCheck className="mr-1" />
          Active
        </span>
      );
    }
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50"></div>
          <p className="mt-4 text-gray-600">Loading coupons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-700 p-8 rounded-xl shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-center">Error</h2>
          <p className="text-center mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchCoupons();
            }}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-50 min-h-screen">
      {/* Header with Stats */}
      <div className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Coupon Management
            </h1>
            <p className="text-gray-600">
              Create and manage discount coupons for your products
            </p>
          </div>
          <button
            onClick={() => {
              setChosenCoupon(null);
              setModalOpen(true);
            }}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="mr-2" />
            Create New Coupon
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <FiTag className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Coupons
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {coupons.length || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <FiCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Coupons
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {coupons.filter((coupon) => isCouponActive(coupon))
                          .length || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <FiPercent className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg. Discount
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {coupons.length > 0
                          ? Math.round(
                              coupons.reduce(
                                (sum, coupon) =>
                                  sum + Number(coupon.discountPercent),
                                0
                              ) / coupons.length
                            )
                          : 0}
                        %
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Coupons</h2>
          <p className="mt-1 text-sm text-gray-500">
            A list of all the coupons you've created for your products
          </p>
        </div>

        <div className="overflow-x-auto">
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <FiTag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No coupons
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new coupon.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setChosenCoupon(null);
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                  New Coupon
                </button>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Discount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Validity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Remaining
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                          <FiPackage className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {coupon.productId.title}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-mono inline-block">
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {coupon.discountPercent}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                        {new Date(coupon.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(coupon)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {coupon.maxUsage
                        ? `${coupon.maxUsage} uses`
                        : "Unlimited"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setChosenCoupon(coupon);
                          setModalOpen(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {chosenCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h3>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setChosenCoupon(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="productId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product
                  </label>
                  <select
                    id="productId"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={formData?.productId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, productId: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select a product
                    </option>
                    {products?.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Coupon Code
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTag className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      disabled={chosenCoupon ? true : false}
                      className={`block w-full pl-10 pr-3 py-2 ${
                        chosenCoupon ? "bg-gray-100" : "bg-white"
                      } border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="e.g. SUMMER30"
                      required
                    />
                  </div>
                  {chosenCoupon && (
                    <p className="mt-1 text-xs text-gray-500">
                      Coupon codes cannot be changed after creation
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="discountPercent"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Discount Percentage
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPercent className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="discountPercent"
                      name="discountPercent"
                      min="1"
                      max="100"
                      value={formData.discountPercent}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="e.g. 20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      disabled={chosenCoupon ? true : false}
                      className={`mt-1 block w-full py-2 px-3 ${
                        chosenCoupon ? "bg-gray-100" : "bg-white"
                      } border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="maxUsage"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Maximum Usage{" "}
                    <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    id="maxUsage"
                    name="maxUsage"
                    min="0"
                    value={formData.maxUsage}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Leave empty for unlimited usage"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setChosenCoupon(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {chosenCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupon;
