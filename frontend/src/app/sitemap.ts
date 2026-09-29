import { MetadataRoute } from 'next';
import { MOCK_PROPERTIES } from '@/lib/mockData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://frontend-six-psi-ecroth2n1r.vercel.app';
  const currentDate = new Date().toISOString();
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://telangana-realty-backend.onrender.com/api').replace(/\/+$/, '');

  const staticRoutes = [
    '',
    '/en',
    '/te',
    '/en/properties',
    '/te/properties',
    '/en/saved-properties',
    '/te/saved-properties',
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

  // Collect property IDs from backend with fallback to mock data
  const propertyIds = new Set<string>(MOCK_PROPERTIES.map((p) => p.id));

  try {
    const res = await fetch(`${apiBase}/properties`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.properties || [];
      for (const item of list) {
        if (item?.id) {
          propertyIds.add(String(item.id));
        }
      }
    }
  } catch (err) {
    // Graceful fallback to mock properties if backend is starting or offline
    console.warn('[Sitemap] Backend fetch timed out or offline, using default property registry');
  }

  const propertyRoutes = Array.from(propertyIds).flatMap((id) => [
    {
      url: `${baseUrl}/en/properties/${id}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/te/properties/${id}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]);

  return [...staticRoutes, ...propertyRoutes];
}
