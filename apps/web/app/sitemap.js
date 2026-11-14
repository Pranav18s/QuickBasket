/**
 * XML sitemap for public QuickBasket pages.
 * Set NEXT_PUBLIC_SITE_URL to the deployed public origin (for example,
 * https://your-real-domain.example) before deployment.
 */

export default function sitemap() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) return [];

  const siteUrl = configuredUrl.replace(/\/+$/, '');
  const lastModified = new Date();

  const publicRoutes = [
    '',
    '/assistant',
    '/products/palakkadan-matta-rice',
    '/products/premium-ponni-rice',
    '/products/nendran-bananas',
    '/products/fresh-farm-eggs',
    '/products/coconut-oil',
  ];

  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
}
