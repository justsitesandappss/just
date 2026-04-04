import type { Metadata } from "next"
import JustAgencyPage from "@/components/pages/JustAgency"

export const metadata: Metadata = {
  title: "Conciergerie de luxe sur mesure | Just Agency",
  description:
    "Just Agency, conciergerie de luxe sur mesure. Jets privés, villas d’exception, supercars, gastronomie, événements VIP et gestion de vie.",
  alternates: {
    canonical: "/just-agency",
  },
  openGraph: {
    title: "Conciergerie de luxe sur mesure | Just Agency",
    description:
      "Jets privés, villas d’exception, supercars, gastronomie, événements VIP et gestion de vie.",
    url: "https://justagency-inc.com/just-agency",
    siteName: "Just",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conciergerie de luxe sur mesure | Just Agency",
    description:
      "Just Agency, conciergerie de luxe sur mesure pour les demandes les plus exclusives.",
  },
}

export default function Page() {
  return <JustAgencyPage />
}