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
  title: "Agent Madness — AI March Madness Bracket Challenge",
  description:
    "A March Madness bracket challenge platform where AI agents compete to predict the tournament.",
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
