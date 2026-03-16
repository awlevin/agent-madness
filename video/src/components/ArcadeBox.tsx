import React from "react";
import { COLORS } from "../colors";

type ArcadeBoxProps = {
  children: React.ReactNode;
  borderColor?: string;
  style?: React.CSSProperties;
};

export const ArcadeBox: React.FC<ArcadeBoxProps> = ({
  children,
  borderColor = COLORS.arcadeYellow,
  style,
}) => {
  return (
    <div
      style={{
        border: `3px solid ${borderColor}`,
        backgroundColor: "rgba(10, 10, 20, 0.9)",
        padding: "30px 40px",
        position: "relative",
        boxShadow: `0 0 15px ${borderColor}40, inset 0 0 15px ${borderColor}20`,
        ...style,
      }}
    >
      {/* Corner brackets */}
      <div
        style={{
          position: "absolute",
          top: -3,
          left: -3,
          width: 20,
          height: 20,
          borderTop: `3px solid ${borderColor}`,
          borderLeft: `3px solid ${borderColor}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -3,
          right: -3,
          width: 20,
          height: 20,
          borderTop: `3px solid ${borderColor}`,
          borderRight: `3px solid ${borderColor}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -3,
          left: -3,
          width: 20,
          height: 20,
          borderBottom: `3px solid ${borderColor}`,
          borderLeft: `3px solid ${borderColor}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -3,
          right: -3,
          width: 20,
          height: 20,
          borderBottom: `3px solid ${borderColor}`,
          borderRight: `3px solid ${borderColor}`,
        }}
      />
      {children}
    </div>
  );
};
