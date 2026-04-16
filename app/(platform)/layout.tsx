import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { getCurrentSession } from "@/lib/services/auth-service";
import { isLiveMode } from "@/lib/runtime";
import { getDataSource } from "@/lib/services/live-data";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (isLiveMode() && !session) {
    redirect("/login");
  }

  const data = session ? await getDataSource() : null;
  const pdpConnected = data?.pdpConnections.some((item) => item.status === "CONNECTED") || false;

  return (
    <AppShell user={data?.session || session} pdpConnected={pdpConnected}>
      {children}
    </AppShell>
  );
}
