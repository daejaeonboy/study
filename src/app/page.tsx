import { HomeView } from "@/components/views/home-view";
import { getCategories, getFeaturedTopics, getTopics } from "@/lib/repository";

export default async function HomePage() {
  const [topics, featuredTopics, categories] = await Promise.all([
    getTopics(),
    getFeaturedTopics(),
    getCategories(),
  ]);

  return <HomeView topics={topics} featuredTopics={featuredTopics} categories={categories} />;
}
