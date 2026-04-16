import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { getCurrentSession } from "@/lib/services/auth-service";
import { isLiveMode } from "@/lib/runtime";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (isLiveMode() && !session) {
    redirect("/login");
  }

  return <AppShell user={session}>{children}</AppShell>;
}
