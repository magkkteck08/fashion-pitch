import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LiveChat from "@/components/LiveChat";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'JUPILO | Premium Fashion House & Academy',
  description: 'Masterpieces. Worn and Taught.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <LiveChat />
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#fff',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderRadius: '4px',
            },
          }} 
        />
      </body>
    </html>
  );
}