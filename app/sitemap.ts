import { MetadataRoute } from 'next';
import { getArticles } from '@/services/articles';
import { getActivities } from '@/services/activities';

const SITE_URL = 'https://acose-casulo-web-qkce.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, activities] = await Promise.all([
    getArticles(),
    getActivities(),
  ]);

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/artigos/${article.slug}`,
    lastModified: new Date(article.created_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const activityUrls: MetadataRoute.Sitemap = activities.map((activity) => ({
    url: `${SITE_URL}/atividades/${activity.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/centro-dia`,
      lastModified: new Date('2022-01-01'),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/atividades`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/artigos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/parceiros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/transparencia`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contato`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/doe-agora`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...articleUrls,
    ...activityUrls,
  ];
}
