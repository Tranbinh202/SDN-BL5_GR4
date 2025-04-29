import { useState, useEffect } from "react";
import { Slip } from "./slip";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import {
  FiTruck,
  FiPackage,
  FiPrinter,
  FiEdit2,
  FiCalendar,
  FiBarChart2,
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
  FiDownload,
} from "react-icons/fi";

const Shipping = () => {
  const API_URL = "http://localhost:5000/api";
  const [shippingInfo, setShippingInfo] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalPrintOpen, setModalPrintOpen] = useState(false);
  const [chosenInfo, setChosenInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    _id: "",
    orderItemId: "",
    carrier: "",
    trackingNumber: "",
    estimatedArrival: "",
  });

  const handleUpdateShippingInfo = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch(`${API_URL}/shippingInfos/update/${formData._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carrier: formData.carrier,
        trackingNumber: formData.trackingNumber,
        estimatedArrival: formData.estimatedArrival,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update shipping information");
        return res.json();
      })
      .then((data) => {
        fetchShippingInfo();
        setModalEditOpen(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGetDetailedShippingInfo = (id) => {
    setLoading(true);
    fetch(`${API_URL}/shippingInfos/detailed/${id}`, { method: "GET" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch shipping details");
        return res.json();
      })
      .then((data) => {
        setChosenInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchShippingInfo = () => {
    setLoading(true);
    fetch(`${API_URL}/shippingInfos/seller/${currentUser.id}`, {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch shipping information");
        return res.json();
      })
      .then((data) => {
        setShippingInfo(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setCurrentUser(JSON.parse(user));
      setLoading(true);
      fetch(`${API_URL}/shippingInfos/seller/${JSON.parse(user).id}`, {
        method: "GET",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch shipping information");
          return res.json();
        })
        .then((data) => {
          setShippingInfo(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
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

  if (loading && shippingInfo.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading shipping information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full text-center">
          <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              if (currentUser) fetchShippingInfo();
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
          <h1 className="text-3xl font-bold text-gray-900">
            Shipping Management
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage shipping for all your orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Shipments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {shippingInfo.length}
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
                <p className="text-sm font-medium text-gray-500">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    shippingInfo.filter((info) => info.status === "shipping")
                      .length
                  }
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
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    shippingInfo.filter((info) => info.status === "shipped")
                      .length
                  }
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    shippingInfo.filter(
                      (info) => info.status === "failed to ship"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FiAlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Info Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Shipping Information
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage shipping details for all your orders
            </p>
          </div>

          {shippingInfo.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No shipping information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no shipments to display at this time.
              </p>
            </div>
          ) : (
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
                      Carrier & Tracking
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Estimated Arrival
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
                  {shippingInfo.map((info) => (
                    <tr key={info._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{info.orderItemId._id.slice(-6)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                            {info.orderItemId.productId.image ? (
                              <img
                                src={info.orderItemId.productId.image}
                                alt={info.orderItemId.productId.title}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <FiPackage className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {info.orderItemId.productId.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {info.carrier || "Not specified"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {info.trackingNumber ? (
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                              {info.trackingNumber}
                            </span>
                          ) : (
                            "No tracking number"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {info.estimatedArrival
                              ? new Date(
                                  info.estimatedArrival
                                ).toLocaleDateString()
                              : "Not set"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(info.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {info.status === "shipping" && (
                            <button
                              onClick={() => {
                                setModalEditOpen(true);
                                setFormData({
                                  ...info,
                                  estimatedArrival:
                                    info.estimatedArrival.split("T")[0],
                                });
                              }}
                              className="inline-flex items-center p-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              title="Update shipping details"
                            >
                              <FiEdit2 />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleGetDetailedShippingInfo(info._id);
                              setModalPrintOpen(true);
                            }}
                            className="inline-flex items-center p-1.5 border border-green-300 rounded-md shadow-sm text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            title="Print shipping label"
                          >
                            <FiPrinter />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {modalEditOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Update Shipping Information
              </h3>
              <button
                onClick={() => setModalEditOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShippingInfo} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="carrier"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Carrier
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiTruck className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="carrier"
                      id="carrier"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g. UPS, FedEx"
                      value={formData.carrier || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="trackingNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tracking Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBarChart2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="trackingNumber"
                      id="trackingNumber"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter tracking number"
                      value={formData.trackingNumber || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="estimatedArrival"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Estimated Arrival Date
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="estimatedArrival"
                      id="estimatedArrival"
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      value={formData.estimatedArrival || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {modalPrintOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Shipping Label Preview
              </h3>
              <button
                onClick={() => setModalPrintOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-grow p-4 overflow-hidden">
              {chosenInfo ? (
                <PDFViewer
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "0.375rem",
                  }}
                >
                  <Slip info={chosenInfo} />
                </PDFViewer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-gray-600">Loading PDF preview...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setModalPrintOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>

              {chosenInfo && (
                <PDFDownloadLink
                  document={<Slip info={chosenInfo} />}
                  fileName="shipping-label.pdf"
                  className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {({ loading }) => (
                    <>
                      {loading ? (
                        "Generating PDF..."
                      ) : (
                        <>
                          <FiDownload className="mr-2" />
                          Download PDF
                        </>
                      )}
                    </>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipping;
