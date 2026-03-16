import { loadFont as loadPressStart } from "@remotion/google-fonts/PressStart2P";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const pressStart = loadPressStart("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const inter = loadInter("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

export const FONT_PIXEL = pressStart.fontFamily;
export const FONT_BODY = inter.fontFamily;
