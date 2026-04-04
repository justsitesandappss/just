import type { Metadata } from "next"
import JustPage from "@/components/pages/JustPage"

export const metadata: Metadata = {
  title: "Just | Influence, Production, Média & Conciergerie de luxe",
  description:
    "Découvrez Just, un écosystème créatif réunissant influence, production, média et conciergerie de luxe sur mesure pour marques, talents et projets premium.",
  metadataBase: new URL("https://justagency-inc.com"), 

  alternates: {
    canonical: "/just", 
  },

  openGraph: {
    title: "Just | Influence, Production, Média & Conciergerie de luxe",
    description:
      "Découvrez Just, un écosystème créatif réunissant influence, production, média et conciergerie de luxe sur mesure.",
    url: "https://justagency-inc.com/just", 
    siteName: "Just",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Just Agency",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Just | Influence, Production, Média & Conciergerie de luxe",
    description:
      "Découvrez Just, un écosystème créatif réunissant influence, production et conciergerie de luxe.",
    images: ["/og-image.jpg"],
  },
}

export default function Page() {
  return <JustPage />
}