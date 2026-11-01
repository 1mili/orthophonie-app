import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, products } from "@/lib/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/a-propos`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/boutique`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/avis`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/rdv`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/politique-de-confidentialite`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/confidentialite`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cgu`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const [publishedArticles, allProducts] = await Promise.all([
    db.select().from(articles).where(eq(articles.published, true)),
    db.select().from(products),
  ]);

  const articleRoutes: MetadataRoute.Sitemap = publishedArticles.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: a.createdAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const productRoutes: MetadataRoute.Sitemap = allProducts.map((p) => ({
    url: `${base}/boutique/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...articleRoutes, ...productRoutes];
}
