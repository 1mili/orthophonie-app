import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { products, articles, users } from "../lib/db/schema";
import { hashPassword } from "../lib/auth";
import { articles as staticArticles } from "../data/blog";

async function main() {
  console.log("Seeding products…");
  await db.insert(products).values([
    {
      slug: "cartes-imagier-vocabulaire",
      name: "Cartes imagier — Premier vocabulaire",
      description:
        "50 cartes illustrées pour enrichir le vocabulaire des tout-petits (2-4 ans).",
      category: "cartes",
      priceCents: 2900,
      stock: 40,
      imageEmoji: "🗂️",
    },
    {
      slug: "jeu-syllabes-magnetiques",
      name: "Jeu de syllabes magnétiques",
      description:
        "Un jeu ludique pour travailler la conscience syllabique et la lecture (5-8 ans).",
      category: "jeux",
      priceCents: 3900,
      stock: 25,
      imageEmoji: "🧲",
    },
    {
      slug: "cahier-exercices-articulation",
      name: "Cahier d'exercices — Articulation",
      description:
        "Exercices progressifs pour travailler l'articulation des sons difficiles.",
      category: "outils",
      priceCents: 1900,
      stock: 60,
      imageEmoji: "📘",
    },
    {
      slug: "loto-des-sons",
      name: "Loto des sons",
      description:
        "Jeu de loto sonore pour discriminer les sons proches, en famille (4-7 ans).",
      category: "jeux",
      priceCents: 3200,
      stock: 30,
      imageEmoji: "🎲",
    },
    {
      slug: "cartes-emotions",
      name: "Cartes des émotions",
      description:
        "40 cartes pour nommer et exprimer les émotions, support au langage oral.",
      category: "cartes",
      priceCents: 2500,
      stock: 35,
      imageEmoji: "😊",
    },
    {
      slug: "sablier-parole",
      name: "Sablier de parole",
      description:
        "Outil visuel pour travailler le tour de parole et le débit chez l'enfant qui bégaie.",
      category: "outils",
      priceCents: 1500,
      stock: 50,
      imageEmoji: "⏳",
    },
  ]).onConflictDoNothing();

  console.log("Seeding articles…");
  for (const a of staticArticles) {
    await db
      .insert(articles)
      .values({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        content: a.content.join("\n\n"),
        category: a.category,
        videoUrl: a.hasVideo ? "placeholder" : null,
        premium: a.slug === "aider-enfant-qui-begaie",
        published: true,
      })
      .onConflictDoUpdate({
        target: articles.slug,
        set: {
          title: a.title,
          excerpt: a.excerpt,
          content: a.content.join("\n\n"),
          category: a.category,
          published: true,
        },
      });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail) {
    throw new Error(
      "[SEED ERROR] ADMIN_EMAIL est absent des variables d'environnement (.env). Veuillez le définir."
    );
  }

  if (!adminPassword || adminPassword.length < 12) {
    throw new Error(
      `[SEED ERROR] ADMIN_PASSWORD est absent ou trop court (${adminPassword?.length ?? 0} caractères). Minimum 12 caractères requis.`
    );
  }

  const adminPasswordHash = await hashPassword(adminPassword);
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (existingAdmin) {
    console.log(`Compte administrateur existant (${adminEmail}) : mise à jour des accès…`);
    await db
      .update(users)
      .set({
        fullName: "Dr. Sarra Ben Ammar",
        passwordHash: adminPasswordHash,
        role: "admin",
      })
      .where(eq(users.id, existingAdmin.id));
  } else {
    console.log(`Création du compte administrateur initial (${adminEmail})…`);
    await db.insert(users).values({
      fullName: "Dr. Sarra Ben Ammar",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "admin",
    });
  }

  const sampleParentPassword =
    process.env.SAMPLE_PARENT_PASSWORD || "ParentSecurePass2026!";
  console.log("Seeding sample parent user…");
  await db
    .insert(users)
    .values({
      fullName: "Mouna Cherif",
      email: "parent@lisenwakalem.tn",
      passwordHash: await hashPassword(sampleParentPassword),
      role: "parent",
      phone: "+216 98 123 456",
    })
    .onConflictDoNothing();

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
