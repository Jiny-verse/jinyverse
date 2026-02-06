import type { Metadata } from 'next';
import './globals.css';
import { SideNavigation } from 'common/components';
import { ApiProvider } from './providers/ApiProvider';

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
    <html lang="en" suppressHydrationWarning>
      <body className="m-0 bg-black p-0 text-white">
        <ApiProvider
          baseUrl={process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'}
          channel="INTERNAL"
          role="ADMIN"
        >
          <div className="flex min-h-screen">
            <SideNavigation channel="internal" />
            <main className="ml-64 flex-1 px-[4%] py-6">{children}</main>
          </div>
        </ApiProvider>
      </body>
    </html>
  );
}
