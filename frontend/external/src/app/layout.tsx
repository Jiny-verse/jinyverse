import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jinyverse',
  description: 'Monorepo Project',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-[#141414] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
