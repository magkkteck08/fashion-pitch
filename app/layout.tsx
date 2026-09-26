import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Corrected import based on your file tree
import LiveChat from "@/components/LiveChat"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LUXE & CO.",
  description: "Curated luxury fashion and premium apparel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        
        {/* Restored Global Chat Box */}
        <LiveChat />
      </body>
    </html>
  );
}
