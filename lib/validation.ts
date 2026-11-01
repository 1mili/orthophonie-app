import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{6,20}$/, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{6,20}$/, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis."),
    newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const childSchema = z.object({
  name: z.string().trim().min(1, "Le nom de l'enfant est requis."),
  age: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const bookingSchema = z.object({
  date: z.string().min(1, "Merci de choisir une date."),
  time: z.string().min(1, "Merci de choisir un horaire."),
  parentName: z.string().trim().min(2, "Nom requis."),
  childName: z.string().trim().min(1, "Nom de l'enfant requis."),
  childAge: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().regex(/^[0-9+\s()-]{6,20}$/, "Numéro de téléphone invalide."),
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  service: z.string().trim().min(1, "Merci de choisir un motif de consultation."),
  notes: z.string().trim().optional().or(z.literal("")),
  mode: z.enum(["cabinet", "teleconsultation"]),
});

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Nom requis."),
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  phone: z.string().trim().regex(/^[0-9+\s()-]{6,20}$/, "Numéro de téléphone invalide."),
  address: z.string().trim().min(5, "Adresse trop courte."),
});

export const reviewSchema = z.object({
  authorName: z.string().trim().min(2, "Nom requis."),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Merci de détailler un peu votre avis."),
});

export const articleSchema = z.object({
  title: z.string().trim().min(3, "Titre trop court."),
  excerpt: z.string().trim().min(10, "Résumé trop court."),
  content: z.string().trim().min(20, "Contenu trop court."),
  category: z.string().trim().min(1),
  videoUrl: z.string().trim().optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court."),
  description: z.string().trim().min(10, "Description trop courte."),
  category: z.enum(["jeux", "cartes", "outils"]),
  price: z.coerce.number().positive("Le prix doit être positif."),
  stock: z.coerce.number().int().min(0),
  imageEmoji: z.string().trim().optional().or(z.literal("")),
});

/** Small helper to turn Zod errors into a single readable message. */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Données invalides.";
}
