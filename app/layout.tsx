import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import Header from "@/components/Header";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "家庭美食规划系统",
  description: "智能规划每周美食，根据家人口味定制菜谱，自动生成采购清单",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "家庭美食",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${interTight.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <QueryProvider>
            <Header />
            {children}
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
