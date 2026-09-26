import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/en/trh-internal-desk', '/te/trh-internal-desk', '/api/'],
    },
    sitemap: 'https://frontend-six-psi-ecroth2n1r.vercel.app/sitemap.xml',
  };
}
