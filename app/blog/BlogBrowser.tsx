"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Lock } from "lucide-react";
import { categories, type Category } from "@/data/blog";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type SortOrder = "newest" | "oldest" | "popular";

type DbArticle = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  videoUrl: string | null;
  premium: boolean;
  createdAt: Date;
  viewCount: number;
};

const CATEGORY_IDS = new Set(categories.map((c) => c.id));

function parseCategory(value?: string): Category | "all" {
  if (value && CATEGORY_IDS.has(value as Category)) return value as Category;
  return "all";
}

function parseSort(value?: string): SortOrder {
  if (value === "oldest" || value === "popular" || value === "newest") return value;
  return "newest";
}

export function BlogBrowser({
  articles,
  locale,
  initialCategory,
  initialSort,
}: {
  articles: DbArticle[];
  locale: Locale;
  initialCategory?: string;
  initialSort?: string;
}) {
  const copy = t(locale).blog;
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">(
    parseCategory(initialCategory)
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(parseSort(initialSort));

  const sortLabels: Record<SortOrder, string> = {
    newest: copy.newestFirst,
    oldest: copy.oldestFirst,
    popular: copy.mostPopular,
  };

  const filtered = useMemo(() => {
    const result = articles.filter((a) => {
      const matchesCategory =
        activeCategory === "all" || a.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });

    return result.sort((a, b) => {
      if (sortOrder === "popular") {
        if (b.viewCount !== a.viewCount) return b.viewCount - a.viewCount;
      }
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
    });
  }, [query, activeCategory, sortOrder, articles]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            label={copy.allCategories}
          />
          {categories.map((c) => (
            <FilterPill
              key={c.id}
              active={activeCategory === c.id}
              onClick={() => setActiveCategory(c.id)}
              label={copy.categories[c.id]}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="blog-sort">
            {copy.sortLabel}
          </label>
          <select
            id="blog-sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink/70 outline-none hover:border-ink/30 focus:border-coral"
          >
            <option value="newest">{sortLabels.newest}</option>
            <option value="oldest">{sortLabels.oldest}</option>
            <option value="popular">{sortLabels.popular}</option>
          </select>

          <label className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-full border border-line bg-white py-2.5 ps-9 pe-4 text-sm outline-none focus:border-coral"
            />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink/50">{copy.noResults}</p>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {filtered.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:border-coral/40"
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sage-deep">
                {copy.categories[a.category as Category] ?? a.category}
                {a.premium && <Lock className="h-3 w-3 text-marigold" />}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
                {a.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                {a.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-3 font-mono-num text-xs text-ink/45">
                <time dateTime={new Date(a.createdAt).toISOString()}>
                  {new Date(a.createdAt).toLocaleDateString(
                    locale === "ar" ? "ar" : "fr-FR",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </time>
                {a.videoUrl && <span>· {copy.videoIncluded}</span>}
                {a.viewCount > 0 && (
                  <span>
                    · {a.viewCount} {copy.views}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-coral bg-coral text-white"
          : "border-line bg-white text-ink/70 hover:border-ink/30"
      }`}
    >
      {label}
    </button>
  );
}
