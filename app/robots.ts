import { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/admin/*',

          '/acesso',
          '/acesso/',
          '/acesso/*',

          '/login',
          '/login/',
          '/login/*',

          '/esqueci-senha',
          '/esqueci-senha/',
          '/esqueci-senha/*',

          '/redefinir-senha',
          '/redefinir-senha/',
          '/redefinir-senha/*',

          '/api',
          '/api/',
          '/api/*',
        ],
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/admin/*',
          '/acesso',
          '/acesso/',
          '/acesso/*',
        ],
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/admin/*',
          '/acesso',
          '/acesso/',
          '/acesso/*',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
