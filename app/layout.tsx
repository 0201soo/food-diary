import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Food Diary",
  description: "오늘 먹은 음식을 스티커로 모아보세요",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
