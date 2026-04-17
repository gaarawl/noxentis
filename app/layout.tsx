import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>{children}</body>
    </html>
  );
}
