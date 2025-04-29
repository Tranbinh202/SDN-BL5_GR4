import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SuccessPay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const queryParams = new URLSearchParams(location.search);
      const orderId = queryParams.get("orderID");
      const payerId = queryParams.get("PayerID");

      if (orderId && payerId) {
        try {
          // Call your backend to verify and capture the payment
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

  return (
    <div className="container">
      {orderDetails ? (
        <div>
          <h1>Payment Successful!</h1>
          <p>Thank you for your purchase. Your order has been successfully processed.</p>
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
        </div>
      )}
    </div>
  );
};

export default SuccessPay;
