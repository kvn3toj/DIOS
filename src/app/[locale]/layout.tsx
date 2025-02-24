import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages, getLocale, locales } from '@/i18n';
import PWAInstall from '@/components/PWAInstall';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { AccessibilityProvider } from '@/providers/AccessibilityProvider';
import AccessibilitySettings from '@/components/AccessibilitySettings';
import '../globals.css';
import '@/styles/high-contrast.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SuperApp',
  description: 'Your Ultimate Gaming and Social Platform',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SuperApp',
  },
  icons: {
    icon: [
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const validLocale = getLocale(locale);

  if (!validLocale) {
    notFound();
  }

  const messages = await getMessages(validLocale);

  return (
    <html lang={validLocale}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SuperApp" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <NextIntlClientProvider locale={validLocale} messages={messages}>
          <AccessibilityProvider>
            <ServiceWorkerRegistration />
            <div className="fixed top-4 right-4 z-50 flex gap-4">
              <LanguageSwitcher />
              <AccessibilitySettings />
            </div>
            <main id="main-content" role="main" tabIndex={-1}>
              {children}
            </main>
            <PWAInstall />
          </AccessibilityProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
