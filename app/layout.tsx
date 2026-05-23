import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { BottomTabBar } from "@/components/BottomTabBar";
import { MobileTopBar } from "@/components/MobileTopBar";
import { QuickCapture } from "@/components/QuickCapture";
import { PWARegister } from "@/components/PWARegister";
import { DailyIntro } from "@/components/DailyIntro";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OPERATOR — К свободе через систему",
  description: "Персональный трекер 12-месячного плана",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "OPERATOR",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable}`}>
        <div className="flex min-h-screen flex-col md:flex-row">
          <MobileTopBar />
          <Sidebar />
          <main className="flex-1 overflow-x-hidden pb-24 md:pb-0">
            {children}
          </main>
          <BottomTabBar />
        </div>
        <QuickCapture />
        <PWARegister />
        <DailyIntro />
      </body>
    </html>
  );
}
