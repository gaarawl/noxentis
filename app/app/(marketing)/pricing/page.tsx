import { PricingGrid } from "@/components/marketing/pricing-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { pricingPlans } from "@/lib/data/demo-data";

export default function PricingPage() {
  return (
    <main className="container-app space-y-10 py-12">
      <SectionHeader
        eyebrow="Pricing"
        title="Des plans sobres, crédibles et prêts pour la croissance"
        description="Choisissez le niveau d'accompagnement adapté à votre structure. La connexion partenaire PDP et la préparation conformité montent en puissance sans complexifier l'expérience."
      />
      <PricingGrid plans={pricingPlans} />
    </main>
  );
}
