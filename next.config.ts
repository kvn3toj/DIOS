import type { NextConfig } from 'next';
import withPWA from '@ducanh2912/next-pwa';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['*'],
  },
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        urlPattern: /\.(js|css)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-resources',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
        },
      },
    ],
  },
};

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(config);

export default withNextIntl(nextConfig); 