/**
 * Search-engine crawling rules for QuickBasket.
 * Configure NEXT_PUBLIC_SITE_URL with the deployed public origin before release.
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/cart',
        '/checkout',
        '/login',
        '/register',
        '/wishlist',
        '/api/',
      ],
    },
    ...(siteUrl ? { sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl } : {}),
  };
}
