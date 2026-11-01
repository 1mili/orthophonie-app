import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and, ne } from "drizzle-orm";
import { ArrowLeft, PlayCircle, Lock } from "lucide-react";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { categories } from "@/data/blog";
import { WaveDivider } from "@/components/Waveform";
import { getSession } from "@/lib/auth";
import { ShareBar } from "./ShareBar";
import { VideoEmbed } from "./VideoEmbed";
import { recordArticleView } from "@/lib/article-views";
import { getLocale } from "@/lib/locale-actions";
import { t } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, slug) });
  return {
    title: article ? `${article.title} — Lisen Wa Kalem` : "Article",
    description: article?.excerpt,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await db.query.articles.findFirst({ where: eq(articles.slug, slug) });
  if (!article || !article.published) notFound();

  const [session, locale] = await Promise.all([getSession(), getLocale()]);
  const copy = t(locale).blog;
  const isLocked = article.premium && !session;
  try {
    await recordArticleView(article.id);
  } catch {
    // view counter must never block reading
  }

  const categoryLabel = categories.find((c) => c.id === article.category)?.label ?? article.category;
  const related = await db
    .select()
    .from(articles)
    .where(and(eq(articles.category, article.category), ne(articles.slug, article.slug)))
    .limit(2);

  const paragraphs = article.content.split("\n\n");
  const visibleParagraphs = isLocked ? paragraphs.slice(0, 1) : paragraphs;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-coral"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {copy.backToBlog}
      </Link>

      <span className="mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-coral">
        {categoryLabel}
        {article.premium && (
          <span className="flex items-center gap-1 rounded-full bg-marigold/15 px-2 py-0.5 text-marigold">
            <Lock className="h-3 w-3" /> Contenu premium
          </span>
        )}
      </span>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
        {article.title}
      </h1>

      <div className="mt-4 flex items-center gap-3 font-mono-num text-xs text-ink/45">
        <time dateTime={article.createdAt.toISOString()}>
          {article.createdAt.toLocaleDateString(locale === "ar" ? "ar" : "fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </div>

      <WaveDivider className="mt-8 max-w-xs" />

      {!isLocked && article.videoUrl && article.videoUrl !== "placeholder" && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-ink">
          <VideoEmbed url={article.videoUrl} />
        </div>
      )}
      {!isLocked && article.videoUrl === "placeholder" && (
        <div className="mt-8 flex h-52 items-center justify-center gap-3 rounded-2xl border border-line bg-white text-ink/40">
          <PlayCircle className="h-8 w-8" />
          <span className="text-sm">Vidéo associée à cet article (démo)</span>
        </div>
      )}

      <div className="mt-8 space-y-5">
        {visibleParagraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-ink/75">
            {p}
          </p>
        ))}
      </div>

      {isLocked && (
        <div className="mt-6 rounded-2xl border border-marigold/30 bg-marigold/5 p-6 text-center">
          <Lock className="mx-auto h-6 w-6 text-marigold" />
          <p className="mt-3 text-sm text-ink/70">
            {copy.premiumNotice}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/espace-parent/connexion" className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:brightness-95">
              {copy.loginCta}
            </Link>
            <Link href="/espace-parent/inscription" className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink/70 hover:border-ink/30">
              {copy.registerCta}
            </Link>
          </div>
        </div>
      )}

      <div className="mt-12 border-t border-line pt-6">
        <ShareBar title={article.title} locale={locale} />
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-xl font-semibold">
            {copy.relatedTitle}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {related.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="rounded-2xl border border-line bg-white p-5 transition hover:border-coral/40"
              >
                <h3 className="font-display text-base font-semibold leading-snug">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-ink/60">{a.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
