import type { ReactNode } from "react";

import { AppShell } from "@/components/shell/app-shell";
import { demoSession } from "@/lib/data/demo-data";
import { getCurrentSession } from "@/lib/services/auth-service";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const session = (await getCurrentSession()) || demoSession;

  return <AppShell user={session}>{children}</AppShell>;
}
