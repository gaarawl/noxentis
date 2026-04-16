import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.")
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Prénom requis."),
    lastName: z.string().min(2, "Nom requis."),
    companyName: z.string().min(2, "Nom de structure requis."),
    email: z.string().email("Adresse email invalide."),
    password: z.string().min(8, "8 caractères minimum."),
    confirmPassword: z.string().min(8, "Confirmation requise.")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"]
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide.")
});

export const companyProfileSchema = z.object({
  legalName: z.string().min(2),
  brandName: z.string().min(2),
  siren: z.string().length(9),
  vatNumber: z.string().min(2),
  address: z.string().min(4),
  city: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  activityLabel: z.string().min(3),
  paymentTerms: z.string().min(3),
  tvaOnDebits: z.boolean()
});

export const brandingSchema = z.object({
  primarySignature: z.string().min(2),
  accentTone: z.string().min(2),
  footerMessage: z.string().min(6),
  logoUrl: z.string().url().or(z.literal("")),
  emailSignature: z.string().min(6)
});

export const accountSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  notifications: z.boolean()
});

export const customerSchema = z.object({
  type: z.enum(["COMPANY", "INDIVIDUAL"]),
  legalName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  siren: z.string().max(9).optional().or(z.literal("")),
  vatNumber: z.string().optional(),
  billingAddressLine1: z.string().min(3),
  billingCity: z.string().min(2),
  billingPostalCode: z.string().min(4),
  notes: z.string().max(300),
  tags: z.string().min(1)
});

export const customerImportSchema = z.object({
  content: z.string().min(10, "Collez un CSV avant de lancer l'import.")
});

export const documentLineSchema = z.object({
  id: z.string(),
  label: z.string().min(2),
  description: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  discount: z.number().min(0).max(100).optional(),
  total: z.number().min(0)
});

export const quoteEditorSchema = z.object({
  number: z.string().min(2),
  issueDate: z.string().min(1),
  expiryDate: z.string().min(1),
  customerId: z.string().min(1),
  notes: z.string().max(400),
  terms: z.string().max(400),
  lines: z.array(documentLineSchema).min(1)
});

export const invoiceEditorSchema = z.object({
  number: z.string().min(2),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  customerId: z.string().min(1),
  operationType: z.enum(["SERVICE", "PRODUCT", "MIXED"]),
  notes: z.string().max(400),
  lines: z.array(documentLineSchema).min(1)
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Selectionnez une facture."),
  amount: z.number().positive("Le montant doit etre superieur a zero."),
  method: z.enum(["TRANSFER", "CARD", "SEPA", "CASH"]),
  paidAt: z.string().min(1, "La date de paiement est requise."),
  reference: z.string().max(80).optional().or(z.literal(""))
});

export const reminderSchema = z.object({
  invoiceId: z.string().min(1, "Selectionnez une facture."),
  type: z.enum(["PRE_DUE", "DUE_DATE", "OVERDUE"]),
  mode: z.enum(["SCHEDULE", "SEND"]),
  scheduledAt: z.string().min(1, "La date de relance est requise."),
  subject: z.string().max(140).optional().or(z.literal(""))
});

export const billingPlanSchema = z.object({
  plan: z.enum(["SOLO", "PRO", "BUSINESS"])
});
