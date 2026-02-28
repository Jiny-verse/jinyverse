import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider, I18nProvider, GlobalRefreshProvider } from 'common';
import { ThemeProvider } from 'common/components';

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
      <body className="m-0 bg-background p-0 text-foreground transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <I18nProvider>
            <GlobalRefreshProvider>
              <AuthProvider baseUrl={baseUrl} on401RedirectPath="/login">
                {children}
              </AuthProvider>
            </GlobalRefreshProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
