import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider, I18nProvider } from 'common';
import { ThemeProvider } from '@/components/ThemeProvider';
import { FloatingControls } from '@/components/FloatingControls';

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
      <body className="bg-background text-foreground min-h-screen antialiased transition-colors duration-200">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <I18nProvider>
            <AuthProvider baseUrl={baseUrl}>
              {children}
              <FloatingControls />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
