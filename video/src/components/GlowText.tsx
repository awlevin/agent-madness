import React from "react";
import { FONT_PIXEL } from "../fonts";

type GlowTextProps = {
  children: React.ReactNode;
  color: string;
  fontSize: number;
  glowColor?: string;
  style?: React.CSSProperties;
};

export const GlowText: React.FC<GlowTextProps> = ({
  children,
  color,
  fontSize,
  glowColor,
  style,
}) => {
  const glow = glowColor || color;
  return (
    <div
      style={{
        fontFamily: FONT_PIXEL,
        fontSize,
        color,
        textShadow: `0 0 10px ${glow}, 0 0 20px ${glow}, 0 0 40px ${glow}`,
        letterSpacing: "0.05em",
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
