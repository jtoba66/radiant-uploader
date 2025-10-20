import React, { useState, useEffect } from "react";
import jackal_logo from "../assets/Jackal_icon.png";

export default function Clock({ JKLBalance = 0 }) {
  const [clock, setClock] = useState(() => formatAMPM(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(formatAMPM(new Date()));
    }, 1000);

    return () => clearInterval(interval); // ✅ Proper cleanup
  }, []);

  function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // '0' becomes '12'
    const strHours = hours < 10 ? `0${hours}` : hours;
    const strMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${strHours}:${strMinutes} ${ampm}`;
  }

  return (
    <div
      className="clock flex-this-div"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "0.9rem",
      }}
    >
      <img alt="JKL Logo" height={18} src={jackal_logo} />
      <span style={{ fontWeight: "bold" }}>
        {JKLBalance ? JKLBalance.toFixed(3) : "0.000"}
      </span>
      <p style={{ margin: 0 }}>{clock}</p>
    </div>
  );
}
