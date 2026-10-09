import "./globals.css";
import { Space_Grotesk, Inter, Caveat } from "next/font/google";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata = {
  title: "Through Your Lens",
  description: "One Color. One Day. Infinite Stories. Spin for your color and capture it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${space.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}