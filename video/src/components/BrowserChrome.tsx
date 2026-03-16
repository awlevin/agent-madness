import React from "react";
import { FONT_BODY } from "../fonts";

type BrowserChromeProps = {
  url: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const BrowserChrome: React.FC<BrowserChromeProps> = ({
  url,
  children,
  style,
}) => {
  return (
    <div
      style={{
        width: 1600,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        ...style,
      }}
    >
      {/* Browser toolbar */}
      <div
        style={{
          backgroundColor: "#2a2a3a",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#febc2e" }} />
          <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#28c840" }} />
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#1a1a2e",
            borderRadius: 6,
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: "#28c840", fontSize: 12 }}>{"🔒"}</span>
          <span
            style={{
              fontFamily: FONT_BODY,
              fontSize: 14,
              color: "#aaa",
            }}
          >
            {url}
          </span>
        </div>
      </div>

      {/* Page content */}
      <div
        style={{
          backgroundColor: "#0a0a14",
          minHeight: 700,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};
