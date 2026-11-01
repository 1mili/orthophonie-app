# Lisen Wa Kalem — Plateforme Digitale d'Orthophonie

Plateforme complète (Phases 1, 2 et 3 du cahier des charges) : site vitrine, blog,
prise de RDV, téléconsultation, e-commerce, espace parent, avis, back-office admin,
multilingue FR/AR.

## Stack technique (2026)

| Couche | Choix | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, React 19) | Server Actions, Route Handlers pour l'API |
| Langage | **TypeScript** strict | |
| Style | **Tailwind CSS v4** | design tokens en CSS (`app/globals.css`) |
| Base de données | **PostgreSQL 16** | schéma dans `lib/db/schema.ts` |
| ORM | **Drizzle ORM** | choisi à la place de Prisma : pas de binaire natif à télécharger, 100 % TypeScript |
| Auth | **JWT en cookie httpOnly** (`jose`) + `bcryptjs` | session légère, sans dépendance lourde |
| Paiement | **Stripe Checkout** (`stripe` SDK) | dégrade proprement en mode "paiement à la livraison" si aucune clé n'est configurée |
| Email | **Nodemailer** | no-op journalisé si SMTP non configuré |
| SMS | **Twilio SDK** | no-op journalisé si non configuré |
| Vidéo | **WebRTC natif** (peer-to-peer) avec signaling maison (polling sur Route Handlers) | voir limitations plus bas |
| Icônes | `lucide-react` | |
| Polices | `@fontsource` (auto-hébergées) | |

## Fonctionnalités livrées

### Phase 1 — Vitrine
- Accueil, Services, À propos, Parcours, Témoignages
- Blog : catégories, recherche, partage réseaux sociaux, gestion depuis le back-office,
  **vidéos réellement intégrées** (YouTube / Vimeo / fichier direct — plus un simple placeholder),
  **contenu premium** réservé aux parents connectés (levier de monétisation du cahier des charges)
- Prise de RDV : calendrier interactif, confirmation email + SMS, **acompte de paiement en ligne
  optionnel via Stripe** (20 DT, comme prévu au 4.3 "Paiement en ligne (optionnel)")

### Phase 2 — Marketplace & interaction
- **Téléconsultation** (`/teleconsultation/[roomCode]`) : appel vidéo WebRTC, chat en direct, partage de documents
- **Espace parent** (`/espace-parent`) : inscription, connexion, historique des RDV, quiz d'évaluation rapide
- **Avis** (`/avis`) : soumission publique, modération dans le back-office

### Phase 3 — E-commerce
- Boutique (`/boutique`) : catalogue, fiche produit
- Panier persistant (cookie de session + PostgreSQL)
- Commande (`/commande`) : paiement Stripe si configuré, sinon confirmation directe
- Webhook Stripe (`/api/stripe/webhook`) pour marquer les commandes payées

### Espace parent (complet)
- Inscription / connexion / déconnexion
- **Mot de passe oublié** (`/espace-parent/mot-de-passe-oublie`) + réinitialisation par lien à durée limitée (1h)
- **Profil** (`/espace-parent/profil`) : modifier nom/téléphone, changer le mot de passe
- **Gestion des enfants** : ajouter / supprimer les enfants rattachés au compte
- **RGPD** : export de toutes les données personnelles en JSON, suppression définitive du compte

### Sécurité & qualité
- **Validation Zod** sur tous les formulaires (inscription, connexion, RDV, avis, checkout, articles, produits)
- **Rate limiting** (backé par PostgreSQL) sur inscription, connexion, RDV, avis — anti brute-force / anti-spam
- **Rappels de RDV automatiques** : route `/api/cron/reminders` (protégée par `CRON_SECRET`), à déclencher une fois par jour par un scheduler externe (configuré par défaut dans `vercel.json` pour Vercel Cron, 8h du matin)
- **Bandeau cookies RGPD** (`components/CookieConsent.tsx`) — pas de cookies publicitaires/tiers, uniquement session/panier/langue
- **SEO** : `sitemap.xml` et `robots.txt` générés dynamiquement (`app/sitemap.ts`, `app/robots.ts`)

### Back-office (complet)
- Vue d'ensemble, Rendez-vous, Téléconsultations, **Parents** (nouveau), Articles, Produits, Commandes, Avis


### Multilingue
- Bascule FR / AR (`components/LanguageSwitcher.tsx`), `dir="rtl"` automatique
- Dictionnaire dans `lib/i18n.ts` — navigation, pied de page et page d'accueil traduits ;
  **le contenu du blog et des services reste à traduire** (travail éditorial, pas technique —
  la structure (`lib/i18n.ts`) est prête à recevoir plus de clés)

## ⚠️ Limitations connues (honnêteté sur l'environnement de développement)

Ce projet a été construit dans un environnement sans accès réseau sortant vers les
services tiers. Le code est prêt pour la production, mais certaines intégrations
n'ont pas pu être testées en conditions réelles :

- **Stripe** : le code de checkout est fonctionnel et suit l'API officielle, mais
  n'a pas pu être testé avec de vraies clés. Sans clé configurée, le site bascule
  automatiquement sur un flux "commande sans paiement en ligne" pour rester
  utilisable en développement.
- **Email / SMS** : mêmes limites. Sans configuration SMTP/Twilio, les envois sont
  simplement journalisés dans la console (`[email:mock]`, `[sms:mock]`).
- **WebRTC / Téléconsultation** : le signaling (échange d'offre/réponse/ICE) passe
  par nos propres Route Handlers Next.js et fonctionnera pour de vrais utilisateurs
  une fois déployé (leurs navigateurs ont un accès réseau normal). Seuls les
  serveurs STUN publics de Google sont utilisés ; pour une qualité fiable en
  production (réseaux difficiles, NAT symétrique), prévoir un **serveur TURN**
  (ex. Twilio TURN, coturn auto-hébergé).
- **Déploiement** : `Dockerfile`, `docker-compose.yml` et `vercel.json` sont fournis
  et prêts à l'emploi, mais le déploiement réel (AWS, Vercel...) n'a pas pu être
  effectué depuis cet environnement.

## Démarrer en local

Renseignez `DATABASE_URL` dans `.env.local` avec l'URI PostgreSQL de Supabase
(connexion directe ou pooler en mode session, port 5432). Encodez les caractères
spéciaux du mot de passe dans l'URI. `AUTH_SECRET` doit être une valeur aléatoire
d'au moins 32 caractères.

```bash
npm install

# Applique les migrations versionnées du dossier drizzle/
npm run db:migrate

# Facultatif : données de démo. ADMIN_EMAIL et ADMIN_PASSWORD sont requis.
npm run db:seed

npm run dev                 # http://localhost:3000
```

Après une modification de `lib/db/schema.ts`, générez puis appliquez une migration :

```bash
npm run db:generate
npm run db:migrate
```

## Variables d'environnement

Voir `.env.example`. À minima pour tourner en local : `DATABASE_URL`, `AUTH_SECRET`.
`ADMIN_EMAIL` et `ADMIN_PASSWORD` (12 caractères minimum) ne sont requis que pour
exécuter le seed. La connexion Supabase est une connexion PostgreSQL Drizzle ;
le SDK Supabase et ses API REST/Storage ne sont pas utilisés par cette application.
Toutes les autres (`STRIPE_*`, `SMTP_*`, `TWILIO_*`) sont optionnelles — l'app
dégrade proprement sans elles, comme expliqué plus haut.

## Déploiement et Stockage des Documents

- **Stockage des documents médicaux & téléconsultations** : configuré par `UPLOAD_DIR` (par défaut `storage/teleconsultation-documents` pour les fichiers de téléconsultation et `storage/clinical-reports` pour les bilans PDF, limités à 10 Mo). Les bilans restent privés et sont servis via `/api/clinical-reports/[bilanId]` après vérification de la session parent/admin. Les données de progression et les exercices prescrits sont enregistrés avec chaque bilan.
- **Attention sur Vercel / serverless** : le système de fichiers est éphémère (read-only / temporaire en `/tmp`). Pour une mise en production serverless, montez un stockage objet persistant (S3 / Cloudflare R2 / Vercel Blob) ou utilisez un déploiement conteneurisé Docker avec un volume persistant (`docker-compose.yml`).

```bash
docker compose up --build
```

ou sur Vercel (nécessite une base PostgreSQL managée externe, ex. Neon, Supabase,
RDS — Vercel n'héberge pas PostgreSQL nativement) :

```bash
vercel deploy
```

## Structure du projet

```
app/
  page.tsx, services/, a-propos/          # Vitrine
  blog/, blog/[slug]/                      # Blog (lit lib/db, articles)
  rdv/, rdv/confirmation/                  # Prise de RDV
  teleconsultation/[roomCode]/             # Vidéo + chat + documents
  espace-parent/                           # Auth + dashboard parent
  boutique/, panier/, commande/            # E-commerce
  avis/                                    # Avis publics
  admin/                                   # Back-office (protégé)
  api/teleconsultation/, api/stripe/       # Route Handlers
lib/
  db/schema.ts, db/index.ts                # Drizzle + PostgreSQL
  auth.ts, require-admin.ts                # Session JWT
  cart.ts, stripe.ts, notifications.ts     # Logique métier
  i18n.ts, locale-actions.ts               # Multilingue
  actions/                                 # Server Actions transverses
scripts/seed.ts                            # Données de démonstration
```
