import type { Metadata } from "next";
import "./globals.css";
import { HorizontalNavigation } from "common/components";

export const metadata: Metadata = {
  title: "Jinyverse",
  description: "Monorepo Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-[#141414] text-white min-h-screen antialiased">
        <HorizontalNavigation channel="external" />
        <main className="relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
