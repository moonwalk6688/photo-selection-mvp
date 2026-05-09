import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "摄影师选片系统",
  description: "摄影师自用的轻量级在线选片系统"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
