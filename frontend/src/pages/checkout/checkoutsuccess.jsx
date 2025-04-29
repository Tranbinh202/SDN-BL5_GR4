import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentTimer from "./PaymentTimer";

const SuccessPay = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const queryParams = new URLSearchParams(location.search);
      const orderId = queryParams.get("orderID");
      const payerId = queryParams.get("PayerID");

      if (orderId && payerId) {
        try {
          const response = await fetch(`/api/paypal/capture`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderID: orderId }),
          });

          const data = await response.json();

          if (data.success) {
            setOrderDetails(data.payment);
          } else {
            alert("Payment capture failed. Please try again.");
            navigate("/checkout");
          }
        } catch (error) {
          alert("Error occurred while processing your payment.");
          navigate("/checkout");
        }
      }
    };

    fetchOrderDetails();
  }, [location.search, navigate]);

  const handleTimerExpire = () => {
    setTimerExpired(true);
    alert(
      "Your payment time has expired. The order may be automatically cancelled."
    );
    navigate("/checkout");
  };

  const calculateRemainingMinutes = () => {
    if (!orderDetails || !orderDetails.paymentDueDate) return 30; // Default 30 minutes

    const dueDate = new Date(orderDetails.paymentDueDate);
    const now = new Date();
    const diffMs = dueDate - now;
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000)); // Milliseconds to minutes

    return diffMinutes;
  };

  return (
    <div className="container">
      {orderDetails ? (
        <div>
          <h1>Payment Successful!</h1>
          <p>
            Thank you for your purchase. Your order has been successfully
            processed.
          </p>
          <div>
            <h3>Order Details:</h3>
            <p>Order ID: {orderDetails.orderId}</p>
            <p>Amount Paid: £{orderDetails.amount}</p>
            <p>Status: {orderDetails.status}</p>
          </div>
        </div>
      ) : (
        <div>
          <h1>Processing...</h1>
          <p>Please wait while we finalize your payment.</p>

          {!orderDetails && !timerExpired && (
            <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
              <PaymentTimer
                initialMinutes={calculateRemainingMinutes()}
                onExpire={handleTimerExpire}
              />
              <p className="mt-2 text-sm text-gray-600">
                Please complete your payment before the timer expires to avoid
                order cancellation.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuccessPay;
