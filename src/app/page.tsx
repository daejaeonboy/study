import { Suspense } from "react";

import { HomeView } from "@/components/views/home-view";
import { getCategories, getFeaturedTopics, getTopics } from "@/lib/repository";

export default async function HomePage() {
  const [topics, featuredTopics, categories] = await Promise.all([
    getTopics(),
    getFeaturedTopics(),
    getCategories(),
  ]);

  return (
    <Suspense
      fallback={
        <section className="view graph-home graph-home--viewport">
          <section className="graph-stage-card graph-stage-card--viewport" />
        </section>
      }
    >
      <HomeView topics={topics} featuredTopics={featuredTopics} categories={categories} />
    </Suspense>
  );
}
