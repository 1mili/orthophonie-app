import type { Metadata } from "next";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { WaveDivider } from "@/components/Waveform";
import { BlogBrowser } from "./BlogBrowser";
import { getArticleViewCounts } from "@/lib/article-views";
import { getLocale } from "@/lib/locale-actions";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Blog — Lisen Wa Kalem",
  description:
    "Articles et vidéos pour informer et accompagner les parents sur le développement du langage.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const [{ category, sort }, locale] = await Promise.all([
    searchParams,
    getLocale(),
  ]);
  const copy = t(locale).blog;
  const [rows, views] = await Promise.all([
    db
      .select()
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt)),
    getArticleViewCounts(),
  ]);

  const withViews = rows.map((a) => ({
    ...a,
    viewCount: views[a.id] ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <span className="text-xs font-semibold uppercase tracking-wider text-coral">
        Blog
      </span>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        {copy.title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/65">
        {copy.subtitle}
      </p>
      <WaveDivider className="mt-8 max-w-xs" />

      <div className="mt-12">
        <BlogBrowser
          articles={withViews}
          locale={locale}
          initialCategory={category}
          initialSort={sort}
        />
      </div>
    </div>
  );
}
