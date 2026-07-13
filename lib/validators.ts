import { z } from "zod";

export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("Veuillez saisir une adresse email valide"),
  full_name: z.string().min(2, "Le nom doit comporter au moins 2 caractères").nullable(),
  avatar_url: z.string().url("URL d'avatar invalide").nullable().optional(),
  phone: z.string().regex(/^(?:\+212|0)[5-7]\d{8}$/, "Numéro de téléphone marocain invalide").nullable().optional(),
  city: z.string().nullable().optional(),
  preferred_language: z.enum(["fr", "darija"]),
  currency: z.literal("MAD"),
  subscription_tier: z.enum(["free", "premium", "family", "analyse", "elite"]),
  subscription_expires_at: z.string().nullable().optional()
});

export const accountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Le nom du compte est obligatoire (min 2 caractères)"),
  type: z.enum(["checking", "savings", "cash", "investment", "debt"]),
  balance: z.number().default(0),
  currency: z.string().default("MAD"),
  is_active: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur hexadécimale invalide").default("#10B981"),
  icon: z.string().optional()
});

export const bucketSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Le nom du compartiment est obligatoire"),
  category: z.string().min(1, "La catégorie est obligatoire"),
  allocated_amount: z.number().min(0, "Le montant alloué doit être positif"),
  spent_amount: z.number().default(0),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Couleur hexadécimale invalide").default("#3B82F6"),
  icon: z.string().optional(),
  is_essential: z.boolean().default(false),
  auto_allocate_percent: z.number().min(0).max(100, "Le pourcentage doit être compris entre 0 et 100").default(0),
  order_index: z.number().int().default(0)
});

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  account_id: z.string().min(1, "Veuillez sélectionner un compte"),
  bucket_id: z.string().nullable().optional(),
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.number().positive("Le montant doit être supérieur à 0"),
  description: z.string().min(1, "La description est obligatoire"),
  merchant: z.string().nullable().optional(),
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  tags: z.array(z.string()).default([]),
  receipt_url: z.string().url().nullable().optional(),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.string().nullable().optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (format AAAA-MM-JJ)")
});

export const monthlyIncomeSchema = z.object({
  id: z.string().uuid().optional(),
  source: z.string().min(1, "La source de revenu est obligatoire"),
  amount: z.number().positive("Le montant doit être supérieur à 0"),
  frequency: z.enum(["monthly", "weekly", "biweekly"]),
  pay_day: z.number().int().min(1).max(31, "Le jour de paye doit être compris entre 1 et 31"),
  auto_allocate_rules: z.record(z.string(), z.number()).default({}),
  is_active: z.boolean().default(true)
});

export const goalSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Le nom de l'objectif est obligatoire"),
  target_amount: z.number().positive("Le montant cible doit être supérieur à 0"),
  current_amount: z.number().default(0),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  bucket_id: z.string().uuid().nullable().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).default("#8B5CF6"),
  icon: z.string().optional(),
  auto_contribute_amount: z.number().default(0)
});

export const tontineSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Le nom de la Daret est obligatoire"),
  description: z.string().nullable().optional(),
  contribution_amount: z.number().positive("Le montant de la cotisation doit être supérieur à 0"),
  frequency: z.enum(["monthly", "weekly", "biweekly"]),
  total_members: z.number().int().positive("Le nombre de membres doit être supérieur à 0"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["active", "paused", "completed"]).default("active")
});

export const moroccanEventSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Le nom de l'événement est obligatoire"),
  type: z.enum(["ramadan", "aid_al_fitr", "aid_al_adha", "wedding", "birth", "hajj", "custom"]),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  budget_allocated: z.number().min(0),
  budget_spent: z.number().default(0),
  notes: z.string().nullable().optional(),
  is_recurring: z.boolean().default(true)
});

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide (Ex: karim.alaoui@gmail.com)"),
  password: z.string().min(6, "Le mot de passe doit comporter au moins 6 caractères"),
  rememberMe: z.boolean().default(false)
});

export const registerSchema = z.object({
  email: z.string().email("Adresse email invalide (Ex: karim.alaoui@gmail.com)"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial"),
  confirmPassword: z.string(),
  fullName: z.string().min(3, "Le nom complet doit comporter au moins 3 caractères"),
  phone: z.string().regex(/^(?:\+212|0)[5-7]\d{8}$/, "Numéro marocain invalide (+212 6XX ou 06XX...)"),
  city: z.string().min(1, "Veuillez sélectionner une ville marocaine"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions générales d'utilisation"
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

