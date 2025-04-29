import React, { useState, useEffect } from "react";

const PaymentTimer = ({ initialMinutes = 30, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      if (onExpire) onExpire();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          setIsExpired(true);
          if (onExpire) onExpire();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onExpire]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="payment-timer">
      {!isExpired ? (
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse mr-2"></div>
          <span className="font-medium text-gray-700">
            Payment time remaining:{" "}
            <span className="text-red-600 font-bold">
              {formatTime(timeLeft)}
            </span>
          </span>
        </div>
      ) : (
        <div className="text-red-600 font-medium">
          Time expired! Your order may be automatically cancelled.
        </div>
      )}
    </div>
  );
};

export default PaymentTimer;
