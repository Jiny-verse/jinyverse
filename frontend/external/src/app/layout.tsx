import type { Metadata } from "next";
import "./globals.css";
import { HorizontalNavigation } from "common/components";
import { ApiProvider } from "./providers/ApiProvider";

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
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-[#141414] text-white min-h-screen antialiased">
        <ApiProvider baseUrl={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"} channel="EXTERNAL" role={null}>
          <HorizontalNavigation channel="external" />
          <main className="relative z-0 px-[4%] py-6">
            {children}
          </main>
        </ApiProvider>
      </body>
    </html>
  );
}
