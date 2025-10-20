import React from "react";
import Clock from "./Clock";
import jackal_logo from "../assets/Jackal_icon.png";

export default function Footer({
  JKLBalance = 0,
  JKLAddress = "",
  connectButtonClick,
  walletActive,
  serious,
}) {
  const shortAddress =
    JKLAddress && JKLAddress.length > 10
      ? `${JKLAddress.slice(0, 6)}...${JKLAddress.slice(-4)}`
      : "";

  return (
    <>
      <p
        className="col-double windows-font"
        style={{ color: "gray", marginBottom: "8px" }}
      >
        Built with {"❤︎"} by{" "}
        <a
          style={{ color: "gray" }}
          href="https://www.jackallabs.io/"
          target="_blank"
          rel="noreferrer"
        >
          Jackal Labs
        </a>
      </p>

      <div className="footer windows-font">
        {/* Left side: Jackal logo */}
        {!serious && (
          <a
            className="footer-btn"
            href="https://jackalprotocol.com/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              margin: "5px",
              padding: "2px 6px",
              height: "35px",
              width: "min-content",
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",
            }}
            rel="noreferrer"
          >
            <img
              alt="Jackal Logo"
              id="jkl_logo"
              src={jackal_logo}
              style={{ height: "30px", marginRight: "6px" }}
            />
            <p>Start</p>
          </a>
        )}

        {/* Center links */}
        <div className="footer_links">
          <a
            href="https://twitter.com/Jackal_Protocol"
            target="_blank"
            rel="noreferrer"
          >
            Twitter
          </a>
          <a
            href="https://t.me/+rtuZnbTlHaIzNjVh"
            target="_blank"
            rel="noreferrer"
          >
            Telegram
          </a>
          <a
            href="https://discord.com/invite/5GKym3p6rj"
            target="_blank"
            rel="noreferrer"
          >
            Discord
          </a>
          <a
            href="https://github.com/JackalLabs/"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>

        {/* Right side: Wallet Info or Connect */}
        <div className="footer-wallet">
          {walletActive ? (
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                Balance: <strong>{JKLBalance.toFixed(2)} JKL</strong>
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "gray" }}>
                {shortAddress}
              </p>
            </div>
          ) : (
            <button
              className="blue-btn"
              style={{
                fontSize: "0.9rem",
                padding: "4px 12px",
                cursor: "pointer",
              }}
              onClick={connectButtonClick}
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Optional clock (only in non-serious mode) */}
        {!serious && <Clock JKLBalance={JKLBalance} />}
      </div>
    </>
  );
}
