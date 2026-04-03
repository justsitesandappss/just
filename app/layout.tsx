import type { Metadata, Viewport } from "next"
import "./globals.css"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: {
    default: "Just — Agence d'influence, production & conciergerie",
    template: "%s | Just",
  },
  description:
    "Agence d'influence, production et conciergerie premium, Just crée des campagnes, contenus et expériences sur mesure pour les marques.",
  metadataBase: new URL("https://just.com"),

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Just — Agence d'influence, production & conciergerie",
    description:
      "Just crée des campagnes, contenus et expériences sur mesure pour les marques.",
    url: "https://just.com",
    siteName: "Just",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Just — Agence d'influence, production & conciergerie",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Just — Agence d'influence, production & conciergerie",
    description:
      "Just crée des campagnes, contenus et expériences sur mesure pour les marques.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Just",
    url: "https://just.com",
    description:
      "Agence d'influence, production et conciergerie premium.",
  }

  return (
    <html lang="fr">
      <body>
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-md"
        >
          Aller au contenu principal
        </a>

        <Header />

        <main id="contenu-principal">
          {children}
        </main>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}