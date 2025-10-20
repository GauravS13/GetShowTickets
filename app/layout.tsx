import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import Header from "@/components/Header";
import SynUserWithConvex from "@/components/SyncUserWithConvex";
import { ClerkProvider } from "@clerk/nextjs";
import { MotionConfig } from "framer-motion";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
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
  title: "Get Show Tickets",
  description:
    "Get Show Tickets is your ultimate platform for discovering and purchasing tickets for the latest concerts, theater productions, and live events. Experience seamless ticket booking with user-friendly features and secure transactions.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#E63946",
  openGraph: {
    title: "Get Show Tickets",
    description: "Your ultimate platform for discovering and purchasing tickets for concerts, theater, and live events.",
    url: "https://getshowtickets.com",
    siteName: "Get Show Tickets",
    images: [
      {
        url: "/logos/logo-horizontal.svg",
        width: 320,
        height: 60,
        alt: "Get Show Tickets Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Show Tickets",
    description: "Your ultimate platform for discovering and purchasing tickets for concerts, theater, and live events.",
    images: ["/logos/logo-horizontal.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <ClerkProvider>
            <MotionConfig
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }}
            >
              <Suspense>
                <Header />
                <SynUserWithConvex />
                {children}
                <Toaster />
              </Suspense>
            </MotionConfig>
          </ClerkProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
