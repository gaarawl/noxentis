export type UserRole = "OWNER" | "ADMIN" | "MEMBER";
export type CustomerType = "COMPANY" | "INDIVIDUAL";
export type QuoteStatus = "DRAFT" | "SENT" | "APPROVED" | "DECLINED" | "EXPIRED";
export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "SENT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";
export type InvoiceType = "STANDARD" | "DEPOSIT" | "FINAL";
export type PaymentMethod = "TRANSFER" | "CARD" | "SEPA" | "CASH";
export type ReminderType = "PRE_DUE" | "DUE_DATE" | "OVERDUE";
export type ReminderStatus = "SCHEDULED" | "SENT" | "FAILED";
export type PdpStatus = "NOT_CONNECTED" | "CONNECTED" | "SYNCING" | "ERROR";
export type TransmissionStatus =
  | "NOT_READY"
  | "READY"
  | "QUEUED"
  | "SENT_TO_PARTNER"
  | "RECEIVED"
  | "REJECTED";
export type ComplianceReadiness = "NOT_READY" | "PARTIALLY_READY" | "READY";
export type PlanTier = "SOLO" | "PRO" | "BUSINESS";
export type BillingStatus = "TRIALING" | "ACTIVE" | "PAST_DUE" | "INCOMPLETE" | "CANCELED";
export type EmailDeliveryKind = "INVOICE" | "REMINDER";
export type EmailDeliveryStatus = "PREVIEW" | "SENT" | "FAILED";
export type BillingEventState = "PROCESSED" | "IGNORED" | "FAILED";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface SessionUser {
  userId: string;
  companyId: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  role: UserRole;
  plan: PlanTier;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  ownerId: string;
  legalName: string;
  brandName: string;
  siren: string;
  vatNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentTerms: string;
  logoUrl?: string;
  email: string;
  phone: string;
  activityLabel: string;
  tvaOnDebits: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyId: string;
  type: CustomerType;
  legalName: string;
  contactName: string;
  email: string;
  phone: string;
  siren?: string;
  vatNumber?: string;
  billingAddress: Address;
  deliveryAddress?: Address;
  notes: string;
  tags: string[];
  status: "ACTIVE" | "ONBOARDING" | "WATCH";
  createdAt: string;
  updatedAt: string;
}

export interface DocumentLine {
  id: string;
  label: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: number;
  total: number;
}

export interface Quote {
  id: string;
  companyId: string;
  customerId: string;
  number: string;
  status: QuoteStatus;
  issueDate: string;
  expiryDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  terms: string;
  lines: DocumentLine[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  customerId: string;
  quoteId?: string;
  number: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  complianceStatus: ComplianceReadiness;
  transmissionStatus: TransmissionStatus;
  pdpStatus: PdpStatus;
  operationType: "SERVICE" | "PRODUCT" | "MIXED";
  deliveryAddressNote?: string;
  notes: string;
  lines: DocumentLine[];
  createdAt: string;
  updatedAt: string;
}

export interface CreditNote {
  id: string;
  invoiceId: string;
  companyId: string;
  number: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  reference: string;
}

export interface Reminder {
  id: string;
  invoiceId: string;
  type: ReminderType;
  scheduledAt: string;
  sentAt?: string;
  status: ReminderStatus;
  subject: string;
}

export interface PdpConnection {
  id: string;
  companyId: string;
  providerName: string;
  status: PdpStatus;
  credentialsEncrypted: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCheck {
  id: string;
  companyId: string;
  score: number;
  status: ComplianceReadiness;
  missingFields: string[];
  warnings: string[];
  checkedAt: string;
}

export interface BillingSubscription {
  id: string;
  companyId: string;
  plan: PlanTier;
  status: BillingStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCheckoutSessionId?: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  seats: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDelivery {
  id: string;
  companyId: string;
  invoiceId?: string;
  reminderId?: string;
  kind: EmailDeliveryKind;
  status: EmailDeliveryStatus;
  provider: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  externalId?: string;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingEvent {
  id: string;
  companyId?: string;
  stripeEventId: string;
  type: string;
  state: BillingEventState;
  summary: string;
  receivedAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: "invoice" | "quote" | "payment" | "compliance" | "reminder";
}

export interface DashboardKpi {
  label: string;
  value: string;
  hint: string;
  delta: string;
  tone?: "default" | "success" | "warning";
  deltaMode?: "trend" | "text";
}

export interface ChartPoint {
  month: string;
  revenue: number;
  cashIn: number;
  overdue: number;
}

export interface DashboardSnapshot {
  kpis: DashboardKpi[];
  chart: ChartPoint[];
  recentActivity: ActivityItem[];
  cashExpected: number;
  remindersToSend: number;
  conversionRate: number;
}

export interface ComplianceOverview {
  readiness: ComplianceReadiness;
  score: number;
  missingFields: string[];
  warnings: string[];
  nextSteps: string[];
  timeline: { label: string; date: string; state: "done" | "active" | "upcoming" }[];
}

export interface PricingPlan {
  name: PlanTier;
  priceMonthly: string;
  description: string;
  highlight?: boolean;
  features: string[];
}

export interface BillingOverview {
  mode: "preview" | "stripe";
  subscription: BillingSubscription;
  pricingPlans: PricingPlan[];
  activePlan: PlanTier;
  statusLabel: string;
  nextInvoiceAmount: string;
  trialEndsAtLabel: string;
  currentPeriodEndLabel: string;
  seatsLabel: string;
  trialDaysRemaining: number;
  canManagePortal: boolean;
  supportModeLabel: string;
}

export interface PdpProvider {
  slug: string;
  name: string;
  status: "ready" | "pilot" | "planned";
  description: string;
  capabilities: string[];
}

export interface InvoiceTableRow extends Invoice {
  customerName: string;
  sourceQuoteNumber?: string;
  lastEmailStatus?: EmailDeliveryStatus;
  lastEmailSentAt?: string;
}

export interface ReceivableInvoiceRow {
  id: string;
  number: string;
  customerName: string;
  dueDate: string;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
}

export interface QuoteTableRow extends Quote {
  customerName: string;
  convertedInvoiceNumber?: string;
  canConvert: boolean;
}

export interface PaymentTimelineRow extends Payment {
  invoiceNumber: string;
  customerName: string;
}

export interface RemindableInvoiceRow {
  id: string;
  number: string;
  customerName: string;
  dueDate: string;
  total: number;
  remainingAmount: number;
  status: InvoiceStatus;
  recommendedReminderType: ReminderType;
  lastReminderType?: ReminderType;
  lastReminderStatus?: ReminderStatus;
  lastReminderAt?: string;
}

export interface ReminderTimelineRow extends Reminder {
  invoiceNumber: string;
  customerName: string;
  amountDue: number;
  dueDate: string;
}

export interface EmailDeliveryRow extends EmailDelivery {
  invoiceNumber?: string;
  customerName?: string;
}
