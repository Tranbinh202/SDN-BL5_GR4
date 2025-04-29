import { useState, useEffect } from "react";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiFilter,
  FiShoppingBag,
  FiClock,
  FiCheck,
  FiX,
} from "react-icons/fi";

const PendingOrder = () => {
  const API_URL = "http://localhost:5000/api";
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API_URL}/orderItems/seller/${currentUser.id}`, { method: "GET" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "An error occurred while fetching orders");
        setLoading(false);
      });
  };

  const handleCreateShippingInfo = (id) => {
    return fetch(`${API_URL}/shippingInfos/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderItemId: id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to create shipping info");
        return res.json();
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  const handleUpdateShippingInfo = (id, status) => {
    return fetch(`${API_URL}/shippingInfos/updateByOrderItemId/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: status }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update shipping info");
        return res.json();
      })
      .catch((err) => {
        console.error(err);
        throw err;
      });
  };

  const handleAcceptOrder = (id) => {
    setLoading(true);
    fetch(`${API_URL}/orderItems/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "shipping" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to accept order");
        return res.json();
      })
      .then((data) => {
        return handleCreateShippingInfo(id);
      })
      .then(() => {
        fetchOrders();
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "An error occurred while accepting the order");
        setLoading(false);
      });
  };

  const handleTryAgain = (id) => {
    setLoading(true);
    fetch(`${API_URL}/orderItems/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "shipping" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update order");
        return res.json();
      })
      .then((data) => {
        return handleUpdateShippingInfo(id, "shipping");
      })
      .then(() => {
        fetchOrders();
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "An error occurred while updating the order");
        setLoading(false);
      });
  };

  const handleRejectOrder = (id) => {
    setLoading(true);
    fetch(`${API_URL}/orderItems/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "rejected" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to reject order");
        return res.json();
      })
      .then((data) => {
        fetchOrders();
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "An error occurred while rejecting the order");
        setLoading(false);
      });
  };

  const handleShipSuccess = (id) => {
    setLoading(true);
    fetch(`${API_URL}/orderItems/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "shipped" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update order");
        return res.json();
      })
      .then((data) => {
        return handleUpdateShippingInfo(id, "shipped");
      })
      .then(() => {
        fetchOrders();
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "An error occurred while updating the order");
        setLoading(false);
      });
  };

  const handleShipFailed = (id) => {
    setLoading(true);
    fetch(`${API_URL}/orderItems/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "failed to ship" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update order");
        return res.json();
      })
      .then((data) => {
        return handleUpdateShippingInfo(id, "failed to ship");
      })
      .then(() => {
        fetchOrders();
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "An error occurred while updating the order");
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
      setLoading(true);
      fetch(`${API_URL}/orderItems/seller/${JSON.parse(user).id}`, {
        method: "GET",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch orders");
          return res.json();
        })
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || "An error occurred while fetching orders");
          setLoading(false);
        });
    }
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="mr-1" />
            Pending
          </span>
        );
      case "shipping":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FiTruck className="mr-1" />
            Shipping
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheckCircle className="mr-1" />
            Shipped
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiXCircle className="mr-1" />
            Rejected
          </span>
        );
      case "failed to ship":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiAlertTriangle className="mr-1" />
            Failed to Ship
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.status === filter);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          Loading orders...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              if (currentUser) fetchOrders();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="mt-2 text-gray-600">
            Manage and track all your customer orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <FiPackage className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiClock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Shipping</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "shipping").length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiTruck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter((o) => o.status === "shipped").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex flex-wrap items-center border-b border-gray-200">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-4 text-sm font-medium ${
                filter === "all"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-4 text-sm font-medium ${
                filter === "pending"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("shipping")}
              className={`px-4 py-4 text-sm font-medium ${
                filter === "shipping"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Shipping
            </button>
            <button
              onClick={() => setFilter("shipped")}
              className={`px-4 py-4 text-sm font-medium ${
                filter === "shipped"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Shipped
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`px-4 py-4 text-sm font-medium ${
                filter === "rejected"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter("failed to ship")}
              className={`px-4 py-4 text-sm font-medium ${
                filter === "failed to ship"
                  ? "text-indigo-700 border-b-2 border-indigo-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Failed
            </button>
          </div>
        </div>

        {/* Orders Table/List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-gray-500">
              {filter === "all"
                ? "You don't have any orders yet."
                : `You don't have any ${filter} orders.`}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiFilter className="mr-2 -ml-1" />
                View all orders
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Order Details
                    </th>
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
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
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
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order._id.slice(-6)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Quantity: {order.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
                            {order.productId.image ? (
                              <img
                                src={order.productId.image}
                                alt={order.productId.title}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <FiPackage className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.productId.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          $
                          {(
                            (order.productId.price * order.quantity) /
                            100
                          ).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${(order.productId.price / 100).toFixed(2)} ×{" "}
                          {order.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {order.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleAcceptOrder(order._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                              <FiCheck className="mr-1" /> Accept
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                            >
                              <FiX className="mr-1" /> Reject
                            </button>
                          </div>
                        )}
                        {order.status === "shipping" && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleShipSuccess(order._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                              <FiCheck className="mr-1" /> Delivered
                            </button>
                            <button
                              onClick={() => handleShipFailed(order._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                            >
                              <FiX className="mr-1" /> Failed
                            </button>
                          </div>
                        )}
                        {order.status === "failed to ship" && (
                          <button
                            onClick={() => handleTryAgain(order._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <FiRefreshCw className="mr-1" /> Try again
                          </button>
                        )}
                        {(order.status === "rejected" ||
                          order.status === "shipped") && (
                          <span className="text-gray-500 text-xs">
                            No actions available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingOrder;
