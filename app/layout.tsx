import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: {
    default: "Just",
    template: "%s | Just",
  },
  description: "Just — Agency, Studio & Impact.",
  metadataBase: new URL("https://just.com"),
  openGraph: {
    title: "Just",
    description: "Just — Agency, Studio & Impact.",
    url: "https://just.com",
    siteName: "Just",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Just",
    description: "Just — Agency, Studio & Impact.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}