export const siteConfig = {
  name: "Noxentis",
  tagline: "La facturation électronique française, enfin simple et premium.",
  description:
    "Cockpit premium de facturation, conformité et trésorerie, pensé pour les structures françaises qui veulent une alternative élégante aux outils comptables vieillissants.",
  url: "https://noxentis.fr",
  supportEmail: "hello@noxentis.fr"
};

export const dashboardNavigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/quotes", label: "Devis" },
  { href: "/invoices", label: "Factures" },
  { href: "/credit-notes", label: "Avoirs" },
  { href: "/payments", label: "Paiements" },
  { href: "/reminders", label: "Relances" },
  { href: "/compliance", label: "Conformité" },
  { href: "/integrations/pdp", label: "Intégrations" },
  { href: "/billing", label: "Abonnement" }
] as const;
