import { useNavigate } from "react-router-dom";

const CancelPay = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Payment Canceled</h1>
      <p>Your payment has been canceled. If you have any questions, please contact support.</p>
      <button onClick={() => navigate("/checkout")} className="btn btn-primary">
        Go Back to Checkout
      </button>
    </div>
  );
};

export default CancelPay;
