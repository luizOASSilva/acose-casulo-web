import { getRecentArticles } from "@/services/articles";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const recentArticles = await getRecentArticles();

  return <NavbarClient recentArticles={recentArticles} />;
}