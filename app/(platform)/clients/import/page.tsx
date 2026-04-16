import { CustomerImportForm } from "@/components/forms/customer-import-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";

export default function CustomerImportPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Clients"
        title="Importer un portefeuille client"
        description="Chargez votre base existante en quelques minutes avec un CSV simple, propre et compatible avec votre compte actif."
      />

      <Card>
        <CardHeader>
          <CardTitle>Import CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerImportForm />
        </CardContent>
      </Card>
    </div>
  );
}
