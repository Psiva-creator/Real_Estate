import { MetadataRoute } from 'next';
import { MOCK_PROPERTIES } from '@/lib/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://frontend-six-psi-ecroth2n1r.vercel.app';
  const currentDate = new Date().toISOString();

  const staticRoutes = [
    '',
    '/en',
    '/te',
    '/en/properties',
    '/te/properties',
    '/en/list-property',
    '/te/list-property',
    '/en/about',
    '/te/about',
    '/en/terms',
    '/te/terms',
    '/en/privacy',
    '/te/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/en' || route === '/te' ? 1.0 : 0.8,
  }));

  const propertyRoutes = MOCK_PROPERTIES.flatMap((prop) => [
    {
      url: `${baseUrl}/en/properties/${prop.id}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/te/properties/${prop.id}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]);

  return [...staticRoutes, ...propertyRoutes];
}
