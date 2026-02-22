import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider, I18nProvider } from 'common';

export const metadata: Metadata = {
  title: 'Jinyverse',
  description: 'Monorepo Project',
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-[#141414] text-white min-h-screen antialiased">
        <I18nProvider>
          <AuthProvider baseUrl={baseUrl}>
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
