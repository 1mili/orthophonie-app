import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["parent", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
export const consultationStatusEnum = pgEnum("consultation_status", [
  "scheduled",
  "ongoing",
  "completed",
  "cancelled",
]);

/* ---------- Espace Parent (4.7) ---------- */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("parent"),
  phone: varchar("phone", { length: 40 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  age: varchar("age", { length: 20 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  maxScore: integer("max_score").notNull(),
  outcome: varchar("outcome", { length: 30 }).notNull(),
  recommendation: text("recommendation").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ---------- 4.3 Prise de rendez-vous ---------- */
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => users.id, {
    onDelete: "set null",
  }),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  time: varchar("time", { length: 5 }).notNull(), // HH:mm
  parentName: varchar("parent_name", { length: 160 }).notNull(),
  childName: varchar("child_name", { length: 120 }).notNull(),
  childAge: varchar("child_age", { length: 20 }),
  phone: varchar("phone", { length: 40 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  service: varchar("service", { length: 160 }).notNull(),
  notes: text("notes"),
  mode: varchar("mode", { length: 20 }).notNull().default("cabinet"), // cabinet | teleconsultation
  reminderSentAt: timestamp("reminder_sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ---------- 4.4 Téléconsultation ---------- */
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id")
    .notNull()
    .references(() => appointments.id, { onDelete: "cascade" }),
  roomCode: varchar("room_code", { length: 40 }).notNull().unique(),
  status: consultationStatusEnum("status").notNull().default("scheduled"),
  offerSdp: text("offer_sdp"),
  answerSdp: text("answer_sdp"),
  notes: text("notes"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const consultationCandidates = pgTable("consultation_candidates", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  sender: varchar("sender", { length: 20 }).notNull(), // parent | orthophoniste
  candidate: text("candidate").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const consultationMessages = pgTable("consultation_messages", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  sender: varchar("sender", { length: 20 }).notNull(), // parent | orthophoniste
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const consultationDocuments = pgTable("consultation_documents", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedBy: varchar("uploaded_by", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ---------- 4.2 Blog ---------- */
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  videoUrl: text("video_url"),
  premium: boolean("premium").notNull().default(false),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ---------- 4.8 Système d'avis ---------- */
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  authorName: varchar("author_name", { length: 160 }).notNull(),
  parentId: integer("parent_id").references(() => users.id, {
    onDelete: "set null",
  }),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* ---------- 4.6 E-commerce ---------- */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 60 }).notNull(), // jeux | cartes | outils
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull().default(0),
  imageEmoji: varchar("image_emoji", { length: 8 }).default("🧩"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => users.id, {
    onDelete: "set null",
  }),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  address: text("address").notNull(),
  totalCents: integer("total_cents").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  stripeSessionId: varchar("stripe_session_id", { length: 200 }),
  trackingNumber: varchar("tracking_number", { length: 80 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  productName: varchar("product_name", { length: 200 }).notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 80 }).notNull(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 100 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  id: serial("id").primaryKey(),
  bucketKey: varchar("bucket_key", { length: 160 }).notNull(),
  count: integer("count").notNull().default(1),
  windowStart: timestamp("window_start").notNull().defaultNow(),
});

/* ---------- Contenu vitrine (Services / Témoignages statiques restent en data/, avis en DB) ---------- */

/* ---------- Portail praticien — Bilans & dossiers patients ---------- */
export const bilans = pgTable("bilans", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  childName: varchar("child_name", { length: 120 }).notNull(),
  assessmentDate: varchar("assessment_date", { length: 10 }).notNull(), // YYYY-MM-DD
  languageScore: integer("language_score"), // 0-100
  readingScore: integer("reading_score"),   // 0-100
  expressionScore: integer("expression_score"), // 0-100
  notes: text("notes"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
