import { getRecentArticles } from "@/services/articles";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  // A busca acontece no lado do servidor (Next.js Node.js runtime)
  const recentArticles = await getRecentArticles(4);

  // Passamos os dados "puros" para o componente de cliente que tem o JS interativo
  return <NavbarClient recentArticles={recentArticles} />;
}