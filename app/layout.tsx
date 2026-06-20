import type { Metadata } from "next";
import { TRPCProvider } from "@/trpc/Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "사미반점 - 온라인 주문",
  description: "사미반점 온라인 주문 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-display text-ink-900">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
