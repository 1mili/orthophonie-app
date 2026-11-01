import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { categories } from "@/data/blog";
import { createArticle, toggleArticlePublished, deleteArticle } from "./actions";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const rows = await db.select().from(articles).orderBy(desc(articles.createdAt));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Articles du blog</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          {rows.map((a) => (
            <div key={a.id} className="rounded-2xl border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="mt-1 text-xs text-ink/45">
                    {a.category} · {a.slug} {a.premium && "· premium"}
                  </div>
                </div>
                <form action={deleteArticle}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-ink/30 hover:text-coral">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
              <form action={toggleArticlePublished} className="mt-3">
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="published" value={String(a.published)} />
                <button
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    a.published ? "bg-sage/10 text-sage-deep" : "bg-line text-ink/50"
                  }`}
                >
                  {a.published ? "Publié" : "Brouillon"}
                </button>
              </form>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-display text-lg font-semibold">Nouvel article</h2>
          <form action={createArticle} className="mt-4 space-y-4">
            <input name="title" placeholder="Titre" required className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
            <textarea name="excerpt" placeholder="Résumé court" required rows={2} className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
            <textarea name="content" placeholder="Contenu complet" required rows={6} className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
            <select name="category" className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <input name="videoUrl" placeholder="URL vidéo (facultatif, YouTube/Vimeo/mp4)" className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-coral" />
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" name="premium" value="true" className="accent-marigold" />
              Contenu premium (réservé aux parents connectés)
            </label>
            <button className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white hover:brightness-95">
              Publier l&apos;article
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
