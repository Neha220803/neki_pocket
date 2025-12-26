import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/layout/NavBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NeKiPocket - Neha & Kiruthika's Pocket Tracker",
  description:
    "Track expenses and settlements between Neha and Kiruthika with beautiful UI",

  // Icons for browsers and PWA
  icons: {
    icon: [
      { url: "/images/logo-rounded.png" },
      { url: "/images/logo-rounded.png", sizes: "192x192", type: "image/png" },
      { url: "/images/logo-rounded.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/images/logo-rounded.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  // PWA Manifest
  manifest: "/manifest.json",

  // Theme colors matching your brand (lavender purple)
  themeColor: "#b794f6",

  // iOS-specific
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NeKiPocket",
  },

  // Open Graph for sharing
  openGraph: {
    title: "NeKiPocket - Expense Tracker",
    description: "Track expenses and settlements between Neha and Kiruthika",
    type: "website",
    siteName: "NeKiPocket",
  },

  // Mobile optimization
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Additional meta tags for better PWA support */}
        <meta name="application-name" content="NeKiPocket" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="NeKiPocket" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavBar />
        <main className="container mx-auto px-4 py-6 max-w-6xl">
          {children}
        </main>
      </body>
    </html>
  );
}
