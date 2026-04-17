import { calculateDocumentTotals } from "@/lib/domain/calculations";
import type {
  ActivityItem,
  ComplianceAuditLog,
  BillingEvent,
  Company,
  ComplianceCheck,
  CreditNote,
  Customer,
  EmailDelivery,
  Invoice,
  Payment,
  PdpTransmission,
  PdpConnection,
  PdpProvider,
  PricingPlan,
  Quote,
  Reminder,
  SessionUser
} from "@/lib/domain/models";

const quote1Lines = [
  {
    id: "ql-1",
    label: "Audit stratégie de facturation",
    description: "Cartographie flux, TVA et mentions obligatoires",
    quantity: 1,
    unitPrice: 1200,
    taxRate: 20,
    discount: 0,
    total: 1200
  },
  {
    id: "ql-2",
    label: "Setup branding documents",
    description: "Gabarits devis, facture et avoir premium",
    quantity: 1,
    unitPrice: 650,
    taxRate: 20,
    discount: 0,
    total: 650
  }
] as const;

const quote2Lines = [
  {
    id: "ql-3",
    label: "Accompagnement conformité 2026",
    description: "Checklist, cadrage PDP, revue données client",
    quantity: 1,
    unitPrice: 2400,
    taxRate: 20,
    discount: 5,
    total: 2280
  }
] as const;

const invoice1Lines = [
  {
    id: "il-1",
    label: "Accompte plateforme premium",
    description: "40 % du projet Noxentis Studio",
    quantity: 1,
    unitPrice: 3200,
    taxRate: 20,
    discount: 0,
    total: 3200
  }
] as const;

const invoice2Lines = [
  {
    id: "il-2",
    label: "Abonnement conseil finance",
    description: "Mars 2026",
    quantity: 1,
    unitPrice: 890,
    taxRate: 20,
    discount: 0,
    total: 890
  },
  {
    id: "il-3",
    label: "Reporting analytique",
    description: "Pack KPI + cash forecast",
    quantity: 1,
    unitPrice: 380,
    taxRate: 20,
    discount: 0,
    total: 380
  }
] as const;

const invoice3Lines = [
  {
    id: "il-4",
    label: "Refonte facturation agence",
    description: "Sprints UX, architecture, pilotage",
    quantity: 2,
    unitPrice: 1400,
    taxRate: 20,
    discount: 0,
    total: 2800
  }
] as const;

const quote1Totals = calculateDocumentTotals([...quote1Lines]);
const quote2Totals = calculateDocumentTotals([...quote2Lines]);
const invoice1Totals = calculateDocumentTotals([...invoice1Lines]);
const invoice2Totals = calculateDocumentTotals([...invoice2Lines]);
const invoice3Totals = calculateDocumentTotals([...invoice3Lines]);

export const demoSession: SessionUser = {
  userId: "user_1",
  companyId: "company_1",
  email: "clara@maisonserein.fr",
  firstName: "Clara",
  lastName: "Martin",
  companyName: "Maison Serein Studio",
  role: "OWNER",
  plan: "PRO"
};

export const demoCompany: Company = {
  id: "company_1",
  ownerId: "user_1",
  legalName: "Maison Serein Studio SAS",
  brandName: "Maison Serein Studio",
  siren: "921456783",
  vatNumber: "FR50921456783",
  address: "18 rue du Faubourg Poissonnière",
  city: "Paris",
  postalCode: "75010",
  country: "France",
  paymentTerms: "Paiement à 30 jours fin de mois",
  logoUrl: "",
  email: "finance@maisonserein.fr",
  phone: "+33 1 84 80 28 10",
  activityLabel: "Conseil, design produit et accompagnement conformité",
  tvaOnDebits: true,
  createdAt: "2026-01-05T08:30:00.000Z",
  updatedAt: "2026-04-15T16:20:00.000Z"
};

export const demoCustomers: Customer[] = [
  {
    id: "customer_1",
    companyId: "company_1",
    type: "COMPANY",
    legalName: "Aster Conseil",
    contactName: "Nora Vidal",
    email: "n.vidal@aster-conseil.fr",
    phone: "+33 6 19 28 30 40",
    siren: "839112450",
    vatNumber: "FR62839112450",
    billingAddress: {
      line1: "74 avenue de Wagram",
      city: "Paris",
      postalCode: "75017",
      country: "France"
    },
    deliveryAddress: {
      line1: "74 avenue de Wagram",
      city: "Paris",
      postalCode: "75017",
      country: "France"
    },
    notes: "Client premium, décision rapide, préfère virement SEPA.",
    tags: ["Cabinet", "Premium", "30 jours"],
    status: "ACTIVE",
    createdAt: "2026-01-12T09:30:00.000Z",
    updatedAt: "2026-04-14T14:45:00.000Z"
  },
  {
    id: "customer_2",
    companyId: "company_1",
    type: "COMPANY",
    legalName: "Studio Alba",
    contactName: "Louis Garnier",
    email: "ops@studioalba.fr",
    phone: "+33 7 44 11 96 20",
    siren: "914002318",
    vatNumber: "FR57914002318",
    billingAddress: {
      line1: "9 quai Saint-Vincent",
      city: "Lyon",
      postalCode: "69001",
      country: "France"
    },
    deliveryAddress: {
      line1: "28 rue Juliette Récamier",
      city: "Lyon",
      postalCode: "69006",
      country: "France"
    },
    notes: "Adresse de livraison distincte à toujours reporter.",
    tags: ["Agence", "Livraison distincte"],
    status: "ACTIVE",
    createdAt: "2026-02-02T10:00:00.000Z",
    updatedAt: "2026-04-11T09:15:00.000Z"
  },
  {
    id: "customer_3",
    companyId: "company_1",
    type: "INDIVIDUAL",
    legalName: "Julien Roche",
    contactName: "Julien Roche",
    email: "julien@atelier-obsidienne.fr",
    phone: "+33 6 70 12 94 01",
    billingAddress: {
      line1: "3 impasse des Lilas",
      city: "Bordeaux",
      postalCode: "33000",
      country: "France"
    },
    notes: "Client indépendant, paiements très réguliers.",
    tags: ["Freelance", "Rapide"],
    status: "WATCH",
    createdAt: "2026-02-18T11:00:00.000Z",
    updatedAt: "2026-04-09T12:10:00.000Z"
  }
];

export const demoQuotes: Quote[] = [
  {
    id: "quote_1",
    companyId: "company_1",
    customerId: "customer_1",
    number: "DEV-2026-041",
    status: "APPROVED",
    issueDate: "2026-04-02",
    expiryDate: "2026-04-17",
    subtotal: quote1Totals.subtotal,
    taxAmount: quote1Totals.taxAmount,
    total: quote1Totals.total,
    notes: "Accompagnement premium avec pilotage hebdomadaire.",
    terms: "Validité 15 jours. 40 % à la signature.",
    lines: [...quote1Lines],
    createdAt: "2026-04-02T08:10:00.000Z",
    updatedAt: "2026-04-06T11:25:00.000Z"
  },
  {
    id: "quote_2",
    companyId: "company_1",
    customerId: "customer_2",
    number: "DEV-2026-044",
    status: "SENT",
    issueDate: "2026-04-09",
    expiryDate: "2026-04-24",
    subtotal: quote2Totals.subtotal,
    taxAmount: quote2Totals.taxAmount,
    total: quote2Totals.total,
    notes: "Préparation réforme et design système documentaire.",
    terms: "Paiement à 30 jours. Livraison des livrables sous 3 semaines.",
    lines: [...quote2Lines],
    createdAt: "2026-04-09T13:00:00.000Z",
    updatedAt: "2026-04-09T13:00:00.000Z"
  }
];

export const demoInvoices: Invoice[] = [
  {
    id: "invoice_1",
    companyId: "company_1",
    customerId: "customer_1",
    quoteId: "quote_1",
    number: "FAC-2026-118",
    type: "DEPOSIT",
    status: "PARTIALLY_PAID",
    issueDate: "2026-04-04",
    dueDate: "2026-04-18",
    subtotal: invoice1Totals.subtotal,
    taxAmount: invoice1Totals.taxAmount,
    total: invoice1Totals.total,
    paidAmount: 1600,
    remainingAmount: invoice1Totals.total - 1600,
    complianceStatus: "READY",
    transmissionStatus: "SENT_TO_PARTNER",
    pdpStatus: "CONNECTED",
    operationType: "SERVICE",
    notes:
      "Option pour le paiement de la taxe d'après les débits. Flux transmis via partenaire PDP.",
    lines: [...invoice1Lines],
    createdAt: "2026-04-04T09:20:00.000Z",
    updatedAt: "2026-04-11T10:00:00.000Z"
  },
  {
    id: "invoice_2",
    companyId: "company_1",
    customerId: "customer_3",
    number: "FAC-2026-120",
    type: "STANDARD",
    status: "PAID",
    issueDate: "2026-03-29",
    dueDate: "2026-04-12",
    subtotal: invoice2Totals.subtotal,
    taxAmount: invoice2Totals.taxAmount,
    total: invoice2Totals.total,
    paidAmount: invoice2Totals.total,
    remainingAmount: 0,
    complianceStatus: "PARTIALLY_READY",
    transmissionStatus: "READY",
    pdpStatus: "NOT_CONNECTED",
    operationType: "SERVICE",
    notes: "PDF visuel envoyé et flux structuré à préparer après connexion partenaire.",
    lines: [...invoice2Lines],
    createdAt: "2026-03-29T08:40:00.000Z",
    updatedAt: "2026-04-12T17:15:00.000Z"
  },
  {
    id: "invoice_3",
    companyId: "company_1",
    customerId: "customer_2",
    number: "FAC-2026-121",
    type: "STANDARD",
    status: "OVERDUE",
    issueDate: "2026-03-30",
    dueDate: "2026-04-10",
    subtotal: invoice3Totals.subtotal,
    taxAmount: invoice3Totals.taxAmount,
    total: invoice3Totals.total,
    paidAmount: 0,
    remainingAmount: invoice3Totals.total,
    complianceStatus: "READY",
    transmissionStatus: "RECEIVED",
    pdpStatus: "CONNECTED",
    operationType: "MIXED",
    deliveryAddressNote: "Adresse de livraison différente du siège client.",
    notes: "Facture suivie par relance automatique premium.",
    lines: [...invoice3Lines],
    createdAt: "2026-03-30T12:10:00.000Z",
    updatedAt: "2026-04-15T08:10:00.000Z"
  }
];

export const demoCreditNotes: CreditNote[] = [
  {
    id: "credit_1",
    invoiceId: "invoice_3",
    companyId: "company_1",
    number: "AV-2026-014",
    amount: 420,
    reason: "Ajustement périmètre sprint final",
    createdAt: "2026-04-12T11:20:00.000Z"
  }
];

export const demoPayments: Payment[] = [
  {
    id: "payment_1",
    invoiceId: "invoice_1",
    amount: 1600,
    method: "TRANSFER",
    paidAt: "2026-04-11T10:02:00.000Z",
    reference: "VIR-ASTER-1104"
  },
  {
    id: "payment_2",
    invoiceId: "invoice_2",
    amount: invoice2Totals.total,
    method: "CARD",
    paidAt: "2026-04-12T17:10:00.000Z",
    reference: "CB-JROCHE-1204"
  }
];

export const demoReminders: Reminder[] = [
  {
    id: "reminder_1",
    invoiceId: "invoice_3",
    type: "OVERDUE",
    scheduledAt: "2026-04-16T08:00:00.000Z",
    status: "SCHEDULED",
    subject: "Votre facture FAC-2026-121 arrive en relance premium"
  },
  {
    id: "reminder_2",
    invoiceId: "invoice_1",
    type: "PRE_DUE",
    scheduledAt: "2026-04-17T09:00:00.000Z",
    status: "SCHEDULED",
    subject: "Rappel amical avant échéance"
  }
];

export const demoEmailDeliveries: EmailDelivery[] = [
  {
    id: "email_1",
    companyId: "company_1",
    invoiceId: "invoice_2",
    kind: "INVOICE",
    status: "SENT",
    provider: "resend",
    recipientEmail: "julien@atelier-obsidienne.fr",
    recipientName: "Julien Roche",
    subject: "Maison Serein Studio - facture FAC-2026-120",
    externalId: "re_demo_120",
    sentAt: "2026-04-12T17:08:00.000Z",
    createdAt: "2026-04-12T17:08:00.000Z",
    updatedAt: "2026-04-12T17:08:00.000Z"
  },
  {
    id: "email_2",
    companyId: "company_1",
    invoiceId: "invoice_3",
    reminderId: "reminder_1",
    kind: "REMINDER",
    status: "PREVIEW",
    provider: "preview",
    recipientEmail: "ops@studioalba.fr",
    recipientName: "Louis Garnier",
    subject: "Votre facture FAC-2026-121 arrive en relance premium",
    createdAt: "2026-04-16T08:00:00.000Z",
    updatedAt: "2026-04-16T08:00:00.000Z"
  }
];

export const demoBillingEvents: BillingEvent[] = [
  {
    id: "billing_event_1",
    companyId: "company_1",
    stripeEventId: "evt_demo_checkout",
    type: "checkout.session.completed",
    state: "PROCESSED",
    summary: "Checkout Stripe termine et abonnement PRO provisionne.",
    receivedAt: "2026-04-10T09:00:00.000Z",
    processedAt: "2026-04-10T09:00:01.000Z",
    createdAt: "2026-04-10T09:00:01.000Z",
    updatedAt: "2026-04-10T09:00:01.000Z"
  },
  {
    id: "billing_event_2",
    companyId: "company_1",
    stripeEventId: "evt_demo_invoice_paid",
    type: "invoice.paid",
    state: "PROCESSED",
    summary: "Renouvellement facture Stripe encaisse avec succes.",
    receivedAt: "2026-04-15T06:00:00.000Z",
    processedAt: "2026-04-15T06:00:01.000Z",
    createdAt: "2026-04-15T06:00:01.000Z",
    updatedAt: "2026-04-15T06:00:01.000Z"
  }
];

export const demoPdpConnections: PdpConnection[] = [
  {
    id: "pdp_1",
    companyId: "company_1",
    providerName: "Fluxia PDP Partner",
    status: "CONNECTED",
    credentialsEncrypted: "encrypted-demo-credentials",
    createdAt: "2026-03-05T09:10:00.000Z",
    updatedAt: "2026-04-14T07:55:00.000Z"
  }
];

export const demoPdpTransmissions: PdpTransmission[] = [
  {
    id: "pdp_tx_1",
    companyId: "company_1",
    invoiceId: "invoice_1",
    pdpConnectionId: "pdp_1",
    providerName: "Fluxia PDP Partner",
    internalStatus: "RECEIVED",
    partnerStatus: "delivered_to_customer_platform",
    externalReference: "FLX-2026-000118",
    payloadSummary: "Facture de depot avec operation service et client entreprise complet.",
    message: "Transmission acceptee puis distribuee au reseau partenaire.",
    submittedAt: "2026-04-04T09:30:00.000Z",
    updatedAt: "2026-04-04T09:31:00.000Z"
  },
  {
    id: "pdp_tx_2",
    companyId: "company_1",
    invoiceId: "invoice_3",
    pdpConnectionId: "pdp_1",
    providerName: "Fluxia PDP Partner",
    internalStatus: "REJECTED",
    partnerStatus: "validation_failed",
    externalReference: "FLX-2026-000121",
    payloadSummary: "Facture mixte avec adresse de livraison distincte a documenter.",
    message: "Adresse de livraison non formalisee pour une operation mixte.",
    submittedAt: "2026-04-15T08:05:00.000Z",
    updatedAt: "2026-04-15T08:06:00.000Z"
  }
];

export const demoComplianceAuditLogs: ComplianceAuditLog[] = [
  {
    id: "audit_1",
    companyId: "company_1",
    category: "PDP",
    level: "SUCCESS",
    title: "Partenaire PDP connecte",
    detail: "Fluxia PDP Partner est actif pour la simulation et le suivi des statuts.",
    createdAt: "2026-04-14T07:55:00.000Z"
  },
  {
    id: "audit_2",
    companyId: "company_1",
    invoiceId: "invoice_3",
    category: "TRANSMISSION",
    level: "WARNING",
    title: "Transmission rejetee",
    detail: "La facture FAC-2026-121 reste bloquee tant que l'adresse de livraison n'est pas explicitee.",
    createdAt: "2026-04-15T08:06:00.000Z"
  },
  {
    id: "audit_3",
    companyId: "company_1",
    category: "COMPLIANCE",
    level: "INFO",
    title: "Checklist reforme recalculée",
    detail: "Les points SIREN client, livraison et TVA sur les debits ont ete reevalues.",
    createdAt: "2026-04-15T16:45:00.000Z"
  }
];

export const demoComplianceCheck: ComplianceCheck = {
  id: "compliance_1",
  companyId: "company_1",
  score: 84,
  status: "PARTIALLY_READY",
  missingFields: [
    "Définir une politique par défaut pour l'adresse de livraison quand elle diffère",
    "Finaliser le mapping émission PME / micro-entreprise pour septembre 2027"
  ],
  warnings: [
    "Un PDF seul n'est pas traité comme une facture électronique structurée.",
    "Deux clients n'ont pas encore de connexion de transmission partenaire active."
  ],
  checkedAt: "2026-04-15T16:45:00.000Z"
};

export const demoActivity: ActivityItem[] = [
  {
    id: "activity_1",
    title: "Facture FAC-2026-118 partiellement encaissée",
    description: "1 600 € reçus d'Aster Conseil par virement.",
    timestamp: "2026-04-11T10:02:00.000Z",
    category: "payment"
  },
  {
    id: "activity_2",
    title: "Checklist conformité recalculée",
    description: "Score de préparation mis à jour à 84/100.",
    timestamp: "2026-04-15T16:45:00.000Z",
    category: "compliance"
  },
  {
    id: "activity_3",
    title: "Relance en attente pour FAC-2026-121",
    description: "Relance automatique programmée pour aujourd'hui à 08:00.",
    timestamp: "2026-04-16T08:00:00.000Z",
    category: "reminder"
  },
  {
    id: "activity_4",
    title: "Devis DEV-2026-044 envoyé",
    description: "Studio Alba a reçu la proposition premium.",
    timestamp: "2026-04-09T13:01:00.000Z",
    category: "quote"
  }
];

export const demoRevenueChart = [
  { month: "Jan", revenue: 8200, cashIn: 7600, overdue: 0 },
  { month: "Fév", revenue: 9800, cashIn: 9100, overdue: 0 },
  { month: "Mar", revenue: 12100, cashIn: 10250, overdue: 650 },
  { month: "Avr", revenue: 14700, cashIn: 11120, overdue: 3360 }
];

export const marketingFeatures = [
  {
    title: "Facturation pensée pour la réforme",
    description:
      "Mentions obligatoires, SIREN client, nature d'opération, TVA sur les débits et préparation du flux structuré sont intégrés dans le produit.",
    eyebrow: "Conformité"
  },
  {
    title: "Cockpit premium pour petites structures exigeantes",
    description:
      "Un environnement noir sur noir, net, lisible et crédible pour piloter clients, documents, encaissements et relances sans friction.",
    eyebrow: "Expérience"
  },
  {
    title: "Connexion partenaire PDP prête à brancher",
    description:
      "Architecture d'adaptateurs, mapping de statuts et simulation V1 pour préparer une transmission réelle via une plateforme agréée partenaire.",
    eyebrow: "Connectivité"
  }
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "SOLO",
    priceMonthly: "29 €",
    description: "Pour freelances et indépendants qui veulent une image impeccable.",
    features: [
      "Devis, factures et avoirs premium",
      "Clients illimités",
      "Relances simples",
      "Checklist conformité"
    ]
  },
  {
    name: "PRO",
    priceMonthly: "79 €",
    description: "Pour agences, cabinets et TPE structurées.",
    highlight: true,
    features: [
      "Workflows devis → facture",
      "Relances automatiques",
      "Dashboard trésorerie",
      "Connexion PDP partenaire"
    ]
  },
  {
    name: "BUSINESS",
    priceMonthly: "149 €",
    description: "Pour PME qui veulent pilotage, branding et multi-utilisateurs.",
    features: [
      "Comptes équipe",
      "Branding avancé",
      "Journal d'audit",
      "Accompagnement déploiement"
    ]
  }
];

export const faqItems = [
  {
    question: "Noxentis est-il une PDP agréée ?",
    answer:
      "Non. Noxentis est conçu comme un cockpit premium compatible et connectable à une PDP partenaire. Le produit ne se présente pas comme l'acteur réglementé lui-même en V1."
  },
  {
    question: "Puis-je continuer à envoyer des PDF ?",
    answer:
      "Oui pour le document visuel et la relation client, mais l'interface distingue clairement le PDF de la facture électronique structurée transmise via une plateforme partenaire."
  },
  {
    question: "Quand dois-je être prêt ?",
    answer:
      "Toutes les entreprises devront pouvoir recevoir des factures électroniques à compter du 1er septembre 2026. L'émission démarre le 1er septembre 2026 pour grandes entreprises et ETI, puis le 1er septembre 2027 pour PME et micro-entreprises."
  }
];

export const pdpProviders: PdpProvider[] = [
  {
    slug: "fluxia",
    name: "Fluxia PDP Partner",
    status: "ready",
    description: "Connecteur prioritaire pour émission, réception et récupération de statuts.",
    capabilities: ["Transmission", "Statuts", "Journal d'audit"]
  },
  {
    slug: "orbis",
    name: "Orbis Exchange",
    status: "pilot",
    description: "Connecteur pilote pour cabinets et agences multi-clients.",
    capabilities: ["Réception", "Mapping statuts", "Monitoring"]
  },
  {
    slug: "helios",
    name: "Helios PDP",
    status: "planned",
    description: "Prévu pour élargir la couverture sectorielle après V1.",
    capabilities: ["Planned"]
  }
];
