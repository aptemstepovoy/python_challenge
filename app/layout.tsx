import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Forum } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { PWARegister } from "@/components/PWARegister";
import { CloudSync } from "@/components/CloudSync";
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

const forum = Forum({
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
  weight: ["400"],
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
      <body
        className={`${inter.variable} ${jetbrains.variable} ${forum.variable}`}
      >
        <AppShell>{children}</AppShell>
        <PWARegister />
        <CloudSync />
      </body>
    </html>
  );
}
