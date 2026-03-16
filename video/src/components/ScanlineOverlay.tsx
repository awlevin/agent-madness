import { AbsoluteFill } from "remotion";

export const ScanlineOverlay: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
};
