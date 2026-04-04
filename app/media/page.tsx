import type { Metadata } from "next"
import JustMediaPage from "@/components/pages/JustMedia"

const SITE_URL = "https://justagency-inc.com"
const PAGE_PATH = "/media"
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const OG_IMAGE = `${SITE_URL}/og-image.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Just Media 4 You | Média, audience, visibilité & brand content",
  description:
    "Just Media 4 You accompagne les marques avec des formats natifs, du brand content, des stories, des reels, des lives et une audience engagée.",
  alternates: {
    canonical: PAGE_PATH,
  },
  keywords: [
    "Just Media 4 You",
    "média digital",
    "brand content",
    "reels",
    "stories",
    "lives",
    "audience engagée",
    "visibilité marque",
    "placement média",
    "communication digitale",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: PAGE_URL,
    siteName: "Just Agency",
    title: "Just Media 4 You | Média, audience, visibilité & brand content",
    description:
      "Une audience engagée, des formats natifs et un environnement éditorial premium pour amplifier votre marque.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Just Media 4 You - média digital et visibilité de marque",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Just Media 4 You | Média, audience, visibilité & brand content",
    description:
      "Une audience engagée, des formats natifs et un environnement éditorial premium pour amplifier votre marque.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Just Agency",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      sameAs: [
        "https://instagram.com/justgroup",
        "https://tiktok.com/@justgroup",
        "https://linkedin.com/company/justgroup",
      ],
    },
    {
      "@type": "WebPage",
      name: "Just Media 4 You",
      url: PAGE_URL,
      description:
        "Page de présentation de Just Media 4 You, média digital dédié à la visibilité des marques.",
      isPartOf: {
        "@type": "WebSite",
        name: "Just Agency",
        url: SITE_URL,
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Media",
            item: PAGE_URL,
          },
        ],
      },
    },
    {
      "@type": "Service",
      name: "Just Media 4 You",
      provider: {
        "@type": "Organization",
        name: "Just Agency",
        url: SITE_URL,
      },
      serviceType: "Média digital et brand content",
      areaServed: "FR",
      url: PAGE_URL,
      description:
        "Formats natifs, reels, stories, articles, lives, reporting et visibilité de marque via une audience engagée.",
    },
  ],
}

export default function MediaRoutePage() {
  return (
    <>
      <JustMediaPage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}