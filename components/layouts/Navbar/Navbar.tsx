import { getRecentArticles } from '@/services/articles';
import NavbarClient from '@/components/layouts/Navbar/NavbarClient';

export default async function Navbar() {
  const recentArticles = await getRecentArticles();

  return <NavbarClient recentArticles={recentArticles} />;
}
