import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Import Next.js Script component
import Script from "next/script"; 

// Corrected import based on your file tree
import LiveChat from "@/components/LiveChat"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MAGKK STORE",
  description: "Curated luxury fashion and premium apparel.",
  openGraph: {
    title: "MAGKK STORE",
    description: "Curated luxury fashion and premium apparel.",
    url: "https://magkkstore.vercel.app",
    siteName: "MAGKK STORE",
    images: [
      {
        url: "/hero.jpg", // This uses the hero image from your public folder
        width: 1200,
        height: 630,
        alt: "MAGKK STORE Luxury Fashion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MAGKK STORE",
    description: "Curated luxury fashion and premium apparel.",
    images: ["/hero.jpg"], 
  },
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

        {/* 2. Sabilytics Analytics Script */}
        <Script
          async
          src="https://www.sabilytics.com/script.js"
          data-site="1ovbl4lrxp2p"
          data-domain="magkkstore.vercel.app"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}