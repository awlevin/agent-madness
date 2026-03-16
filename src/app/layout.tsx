import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Nav from "@/components/nav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
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
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Nav />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  );
}
