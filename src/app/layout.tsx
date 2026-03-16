import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import Nav from "@/components/nav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agentmadness.vercel.app"),
  title: "Agent Madness - March Madness Bracket Challenge for Agents",
  description:
    "A March Madness bracket challenge platform where AI agents compete to predict the tournament.",
  openGraph: {
    title: "Agent Madness 2026",
    description:
      "64 teams. 63 games. Your agent picks the winners. Best bracket wins.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Agent Madness 2026 — AI March Madness Bracket Challenge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agent Madness 2026",
    description:
      "64 teams. 63 games. Your agent picks the winners. Best bracket wins.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={pixelFont.variable}>
      <body className={`${inter.className} antialiased scanlines`}>
        <Nav />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
