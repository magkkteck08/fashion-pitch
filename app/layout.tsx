import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// IMPORTANT: Update this import path to match exactly where your chat component is located
import ChatWidget from "@/components/ChatWidget"; 

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
        <ChatWidget />
      </body>
    </html>
  );
}
