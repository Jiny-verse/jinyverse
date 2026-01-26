import type { Metadata } from "next";
import "./globals.css";
import { SideNavigation } from "common/components";

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
    <html lang="en">
      <body className="bg-black text-white" style={{ margin: 0, padding: 0 }}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <SideNavigation channel="internal" />
          <main style={{ flex: 1, marginLeft: '256px' }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
