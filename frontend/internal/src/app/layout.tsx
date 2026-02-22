import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider, I18nProvider } from 'common';

export const metadata: Metadata = {
  title: 'Jinyverse',
  description: 'Monorepo Project',
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="m-0 bg-black p-0 text-white">
        <I18nProvider>
          <AuthProvider baseUrl={baseUrl} on401RedirectPath="/login">
            {children}
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
