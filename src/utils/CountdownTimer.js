// Component đếm ngược thời gian, gọi callback khi hết hạn
import React, { useEffect, useState } from "react";

export default function CountdownTimer({ expireTime, onExpire }) {
  // Tính thời gian còn lại (ms) từ thời điểm hiện tại đến expireTime
  const calculateTimeLeft = () => {
    const now = new Date().getTime();
    const expiry = new Date(expireTime).getTime();
    const difference = expiry - now;
    return difference > 0 ? difference : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire(); // gọi callback khi hết hạn
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (timeLeft <= 0) return <span style={{ color: "red" }}>Hết hạn</span>;

  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <span>
      {minutes} phút {seconds < 10 ? `0${seconds}` : seconds} giây
    </span>
  );
}
