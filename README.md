# Noxentis

Noxentis est un SaaS premium de facturation electronique francaise pense pour les freelances, micro-entrepreneurs, TPE, PME, agences et cabinets qui veulent une interface tres haut de gamme, rassurante et exploitable sans ERP lourd.

Le produit est concu comme un logiciel compatible et connectable a une PDP partenaire. En V1, Noxentis n'est pas presente comme une PDP ; il centralise la creation des devis et factures, la conformite, les relances, le suivi des paiements, la tresorerie et la preparation du flux structure.

## Stack retenue

- Next.js App Router
- TypeScript strict
- Tailwind CSS avec primitives UI inspirees de shadcn
- Prisma + PostgreSQL
- React Hook Form + Zod
- Zustand pour l'etat UI
- Recharts pour les analytics
- Architecture de services backend par domaine

## Architecture

```text
.
|-- app
|   |-- (marketing)
|   |   |-- page.tsx
|   |   |-- pricing/page.tsx
|   |-- (auth)
|   |   |-- login/page.tsx
|   |   |-- register/page.tsx
|   |   |-- forgot-password/page.tsx
|   |-- (platform)
|   |   |-- dashboard/page.tsx
|   |   |-- clients/page.tsx
|   |   |-- clients/[customerId]/page.tsx
|   |   |-- quotes/page.tsx
|   |   |-- invoices/page.tsx
|   |   |-- credit-notes/page.tsx
|   |   |-- payments/page.tsx
|   |   |-- reminders/page.tsx
|   |   |-- compliance/page.tsx
|   |   |-- integrations/pdp/page.tsx
|   |   |-- settings/company/page.tsx
|   |   |-- settings/branding/page.tsx
|   |   |-- settings/account/page.tsx
|   |   |-- billing/page.tsx
|   |-- api
|   |   |-- auth/*
|   |   |-- dashboard/route.ts
|   |   |-- customers/route.ts
|   |   |-- quotes/route.ts
|   |   |-- invoices/route.ts
|   |   |-- compliance/route.ts
|   |   |-- pdp/route.ts
|   |   |-- payments/route.ts
|   |   |-- reminders/route.ts
|   |-- globals.css
|   |-- layout.tsx
|-- components
|   |-- auth
|   |-- dashboard
|   |-- documents
|   |-- forms
|   |-- marketing
|   |-- providers
|   |-- shell
|   |-- ui
|-- lib
|   |-- config
|   |-- data
|   |-- domain
|   |-- services
|   |-- store
|   |-- cn.ts
|   |-- session.ts
|-- prisma
|   |-- schema.prisma
|   |-- seed.ts
|-- .env.example
|-- components.json
|-- next.config.ts
|-- package.json
|-- tailwind.config.ts
|-- tsconfig.json
```

## Demarrage

1. Installer les dependances :

```bash
npm install
```

2. Copier le fichier d'environnement :

```bash
cp .env.example .env
```

3. Generer Prisma puis pousser le schema :

```bash
npm run db:generate
npm run db:push
```

4. Charger la seed de demonstration :

```bash
npm run db:seed
```

5. Lancer le projet :

```bash
npm run dev
```

## Variables d'environnement

Consulter [.env.example](./.env.example). Les principales variables :

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `DEMO_MODE`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_SOLO_MONTHLY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_BUSINESS_MONTHLY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `SMTP_FROM`

## Billing Stripe

Le module abonnement fonctionne deja sans compte Stripe :

- si les variables Stripe ne sont pas renseignees, Noxentis reste en `mode preview`
- les plans, l'essai gratuit et la console billing restent utilisables sans blocage
- quand votre compte Stripe sera pret, ajoutez simplement :
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_PRICE_SOLO_MONTHLY`
  - `STRIPE_PRICE_PRO_MONTHLY`
  - `STRIPE_PRICE_BUSINESS_MONTHLY`

Une fois ces variables ajoutees, le checkout abonnement et le portail client Stripe s'activeront automatiquement.

Pour finaliser Stripe ensuite :

- creez un webhook Stripe pointant vers `/api/stripe/webhook`
- renseignez `STRIPE_WEBHOOK_SECRET`
- laissez Noxentis synchroniser automatiquement :
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`

Le projet journalise aussi les envois d'emails facture et relance avec des statuts durables `PREVIEW`, `SENT` et `FAILED`.

## Positionnement reglementaire

- Noxentis n'est pas une PDP en V1.
- Le produit prepare et pilote la compatibilite, puis s'interface avec un partenaire.
- Le PDF visuel reste distinct du flux structure transmis.

References officielles utilisees pour le cadrage :

- [Mentions obligatoires d'une facture](https://www.economie.gouv.fr/entreprises/gerer-son-entreprise-au-quotidien/gerer-sa-comptabilite-et-ses-demarches/mentions-obligatoires-dune-facture-tout-savoir)
- [Calendrier de déploiement de la facturation électronique](https://www.economie.gouv.fr/entreprises/factures-mentions-obligatoires?language=en-gb)
