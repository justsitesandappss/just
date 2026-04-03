import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Mentions Légales | Just Agency",
  description:
    "Consultez les mentions légales, la politique de confidentialité et la politique de cookies de Just Agency Incorporation.",
  robots: "index,follow,max-image-preview:large",
  alternates: {
    canonical: "/mentions-legales",
  },
  openGraph: {
    title: "Mentions Légales | Just Agency",
    description:
      "Consultez les mentions légales, la politique de confidentialité et la politique de cookies de Just Agency Incorporation.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Mentions Légales | Just Agency",
    description:
      "Consultez les mentions légales, la politique de confidentialité et la politique de cookies de Just Agency Incorporation.",
  },
}

export default function MentionsLegalesLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}