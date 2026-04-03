"use client"

import * as React from "react"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"

// ── Types ──────────────────────────────────────────────────────────────────

type PageKey = "conditions" | "confidentialite" | "cookies"

type LegalSection = {
  title: string
  content: string
}

type LegalPageData = {
  title: string
  updated: string
  isoUpdated: string
  description: string
  path: string
  sections: LegalSection[]
}

interface LegalPagesProps {
  page: PageKey
}

// ── Design system ──────────────────────────────────────────────────────────

const C = {
  bg: "#0a0a0a",
  surface: "#111111",
  surfaceStrong: "#151515",
  surfaceSoft: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.12)",
  borderStrong: "rgba(255,255,255,0.18)",
  accent: "#dd0909",
  accentSoft: "rgba(221,9,9,0.15)",
  text: "#ffffff",
  textStrong: "#ffffff",
  textMuted: "rgba(255,255,255,0.80)",
  textSoft: "rgba(255,255,255,0.92)",
  focusRingOuter: "rgba(221,9,9,0.45)",
  focusRingInner: "#ffffff",
} as const

const FONT_STACK_DISPLAY = `'Syne', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
const FONT_STACK_MONO = `'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace`

// ── Contenu ────────────────────────────────────────────────────────────────

const CONDITIONS: LegalPageData = {
  title: "Conditions Générales d'Utilisation",
  updated: "Dernière mise à jour : mars 2026",
  isoUpdated: "2026-03-01",
  description:
    "Consultez les Conditions Générales d'Utilisation de Just Agency Incorporation : accès au site, responsabilité, propriété intellectuelle, droit applicable et contact.",
  path: "/mentions-legales",
  sections: [
    {
      title: "1. Présentation",
      content:
        "Just Agency Incorporation est une société par actions simplifiée (SAS) immatriculée sous le numéro SIREN 977 751 544, dont le siège social est situé au 30 rue Saint-Germain l'Auxerrois, 75001 Paris, France. Code APE : 7021Z – Conseil en relations publiques et communication.\n\nL'accès et l'utilisation du site impliquent l'acceptation pleine et entière des présentes conditions générales d'utilisation.",
    },
    {
      title: "2. Accès au site",
      content:
        "Le site est accessible 24h/24 et 7j/7, sauf en cas de force majeure, de maintenance informatique ou de difficultés techniques. Just Agency Incorporation ne saurait être tenue responsable des interruptions de service ou de leurs conséquences.",
    },
    {
      title: "3. Propriété intellectuelle",
      content:
        "L'ensemble des contenus présents sur ce site (textes, images, vidéos, graphismes, logos, icônes) sont la propriété exclusive de Just Agency Incorporation ou de ses partenaires. Toute reproduction, distribution, modification ou utilisation sans autorisation préalable écrite est strictement interdite.",
    },
    {
      title: "4. Responsabilité",
      content:
        "Just Agency Incorporation s'efforce d'assurer l'exactitude des informations publiées sur le site. Toutefois, elle ne garantit pas l'exhaustivité ni l'absence d'erreur. Elle ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation du site.",
    },
    {
      title: "5. Liens hypertextes",
      content:
        "Le site peut contenir des liens vers des sites tiers. Just Agency Incorporation n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou leur politique de confidentialité.",
    },
    {
      title: "6. Droit applicable",
      content:
        "Les présentes conditions générales sont soumises au droit français. Tout litige relatif à leur interprétation ou leur exécution relève de la compétence exclusive des tribunaux de Paris.",
    },
    {
      title: "7. Contact",
      content:
        "Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse suivante : 30 rue Saint-Germain l'Auxerrois, 75001 Paris, ou par email via le formulaire de contact du site.",
    },
  ],
}

const CONFIDENTIALITE: LegalPageData = {
  title: "Politique de Confidentialité",
  updated: "Dernière mise à jour : mars 2026",
  isoUpdated: "2026-03-01",
  description:
    "Consultez la Politique de Confidentialité de Just Agency Incorporation : données collectées, finalités, base légale, durée de conservation, sécurité et droits RGPD.",
  path: "/mentions-legales?tab=confidentialite",
  sections: [
    {
      title: "1. Responsable du traitement",
      content:
        "Just Agency Incorporation, SAS au capital variable, SIREN 977 751 544, 30 rue Saint-Germain l'Auxerrois, 75001 Paris, est responsable du traitement de vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD – UE 2016/679).",
    },
    {
      title: "2. Données collectées",
      content:
        "Nous collectons uniquement les données nécessaires à nos activités :\n• Données d'identification : nom, prénom, adresse email\n• Données de navigation : adresse IP, type de navigateur, pages visitées\n• Données de contact : messages envoyés via les formulaires du site\n\nAucune donnée sensible n'est collectée.",
    },
    {
      title: "3. Finalités du traitement",
      content:
        "Vos données sont traitées aux fins suivantes :\n• Répondre à vos demandes de contact et devis\n• Gérer la relation commerciale\n• Améliorer l'expérience utilisateur du site\n• Respecter nos obligations légales",
    },
    {
      title: "4. Base légale",
      content:
        "Le traitement de vos données repose sur :\n• Votre consentement pour les cookies non essentiels\n• L'exécution d'un contrat ou de mesures précontractuelles\n• Notre intérêt légitime pour l'amélioration de nos services\n• Le respect de nos obligations légales",
    },
    {
      title: "5. Durée de conservation",
      content:
        "Vos données sont conservées pendant la durée strictement nécessaire aux finalités pour lesquelles elles ont été collectées, et dans le respect des délais légaux en vigueur : 3 ans pour les données de prospect, durée contractuelle pour les données clients.",
    },
    {
      title: "6. Vos droits",
      content:
        "Conformément au RGPD, vous disposez des droits suivants :\n• Droit d'accès à vos données\n• Droit de rectification\n• Droit à l'effacement (droit à l'oubli)\n• Droit à la limitation du traitement\n• Droit à la portabilité\n• Droit d'opposition\n\nPour exercer ces droits, contactez-nous à l'adresse ci-dessous ou saisissez la CNIL : https://www.cnil.fr",
    },
    {
      title: "7. Sécurité",
      content:
        "Just Agency Incorporation met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données contre la perte, l'accès non autorisé ou la divulgation accidentelle.",
    },
    {
      title: "8. Contact DPO",
      content:
        "Pour toute question relative à la protection de vos données personnelles : 30 rue Saint-Germain l'Auxerrois, 75001 Paris, France.",
    },
  ],
}

const COOKIES: LegalPageData = {
  title: "Politique de Cookies",
  updated: "Dernière mise à jour : mars 2026",
  isoUpdated: "2026-03-01",
  description:
    "Consultez la Politique de Cookies de Just Agency Incorporation : catégories de cookies, consentement, durée de conservation, gestion des préférences et cookies tiers.",
  path: "/mentions-legales?tab=cookies",
  sections: [
    {
      title: "1. Qu'est-ce qu'un cookie ?",
      content:
        "Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d'un site web. Il permet au site de mémoriser vos préférences et d'améliorer votre expérience de navigation.",
    },
    {
      title: "2. Cookies utilisés sur ce site",
      content:
        "Notre site utilise les catégories de cookies suivantes :\n\n• Cookies strictement nécessaires : indispensables au fonctionnement du site (session, sécurité). Ils ne nécessitent pas votre consentement.\n\n• Cookies analytiques : nous permettent de mesurer l'audience et d'analyser la navigation. Ils sont déposés uniquement avec votre consentement.\n\n• Cookies de personnalisation : mémorisent vos préférences d'affichage. Ils sont déposés avec votre consentement.",
    },
    {
      title: "3. Durée de conservation",
      content:
        "Les cookies ont une durée de vie limitée :\n• Cookies de session : supprimés à la fermeture du navigateur\n• Cookies persistants : conservés jusqu'à 13 mois maximum conformément aux recommandations applicables",
    },
    {
      title: "4. Gestion de votre consentement",
      content:
        "Lors de votre première visite, un bandeau vous informe de l'utilisation des cookies et vous permet d'accepter ou de refuser les cookies non essentiels. Vous pouvez modifier vos préférences à tout moment via le bouton « Gérer les cookies » accessible en bas de page.",
    },
    {
      title: "5. Paramétrage de votre navigateur",
      content:
        "Vous pouvez également configurer votre navigateur pour bloquer ou supprimer les cookies :\n• Chrome : Paramètres > Confidentialité et sécurité > Cookies\n• Firefox : Options > Vie privée et sécurité\n• Safari : Préférences > Confidentialité\n• Edge : Paramètres > Confidentialité et services\n\nAttention : la désactivation de certains cookies peut affecter le fonctionnement du site.",
    },
    {
      title: "6. Cookies tiers",
      content:
        "Certains cookies sont déposés par des services tiers intégrés à notre site, par exemple des réseaux sociaux ou des outils analytiques. Nous vous invitons à consulter les politiques de confidentialité de ces tiers pour en savoir plus sur leurs pratiques.",
    },
    {
      title: "7. Contact",
      content:
        "Pour toute question concernant notre utilisation des cookies : 30 rue Saint-Germain l'Auxerrois, 75001 Paris, France.",
    },
  ],
}

const PAGES: Record<PageKey, LegalPageData> = {
  conditions: CONDITIONS,
  confidentialite: CONFIDENTIALITE,
  cookies: COOKIES,
}

const TABS: Array<{ key: PageKey; label: string; shortLabel: string }> = [
  {
    key: "conditions",
    label: "Conditions Générales d'Utilisation",
    shortLabel: "CGU",
  },
  {
    key: "confidentialite",
    label: "Politique de Confidentialité",
    shortLabel: "Confidentialité",
  },
  {
    key: "cookies",
    label: "Politique de Cookies",
    shortLabel: "Cookies",
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return
    }
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(mediaQuery.matches)
    update()
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update)
      return () => mediaQuery.removeEventListener("change", update)
    }
  }, [])

  return reducedMotion
}

type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }

function parseContentBlocks(content: string): ContentBlock[] {
  const rawBlocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)

  return rawBlocks.flatMap((block) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length === 0) return []

    const bulletLines = lines.filter((line) => /^•\s+/.test(line))
    const nonBulletLines = lines.filter((line) => !/^•\s+/.test(line))

    if (bulletLines.length === 0) {
      return [{ type: "paragraph", text: lines.join(" ") }]
    }

    const output: ContentBlock[] = []

    if (nonBulletLines.length > 0) {
      output.push({ type: "paragraph", text: nonBulletLines.join(" ") })
    }

    const items = bulletLines
      .map((line) => line.replace(/^•\s+/, "").trim())
      .filter(Boolean)

    if (items.length > 0) {
      output.push({ type: "list", items })
    }

    return output
  })
}

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

function renderInlineText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (isExternalUrl(part)) {
      return (
        <a
          key={`link-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="just-legal-focus"
        >
          {part}
        </a>
      )
    }
    return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>
  })
}

// ── Section ────────────────────────────────────────────────────────────────

function Section({
  title,
  content,
  index,
  reducedMotion,
  visible,
}: {
  title: string
  content: string
  index: number
  reducedMotion: boolean
  visible: boolean
}) {
  const headingId = useId()
  const blocks = useMemo(() => parseContentBlocks(content), [content])

  const delay = reducedMotion ? 0 : 50 + index * 40

  return (
    <section
      aria-labelledby={headingId}
      style={{
        borderTop: `1px solid ${C.border}`,
        paddingTop: 32,
        marginTop: 32,
        opacity: reducedMotion || visible ? 1 : 0,
        transform:
          reducedMotion || visible ? "translateY(0)" : "translateY(16px)",
        transition: reducedMotion
          ? "none"
          : `opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      <h2
        id={headingId}
        style={{
          margin: 0,
          marginBottom: 16,
          fontFamily: FONT_STACK_DISPLAY,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: C.accent,
          lineHeight: 1.4,
        }}
      >
        {title}
      </h2>

      <div
        className="just-legal-prose"
        style={{
          fontFamily: FONT_STACK_MONO,
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.85,
          color: C.textSoft,
        }}
      >
        {blocks.map((block, blockIndex) => {
          if (block.type === "list") {
            return (
              <ul key={`${title}-list-${blockIndex}`}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${title}-item-${itemIndex}`}>
                    {renderInlineText(item)}
                  </li>
                ))}
              </ul>
            )
          }
          return (
            <p key={`${title}-paragraph-${blockIndex}`}>
              {renderInlineText(block.text)}
            </p>
          )
        })}
      </div>
    </section>
  )
}

// ── Composant principal ────────────────────────────────────────────────────

export default function LegalPages({ page }: LegalPagesProps) {
  const [activePage, setActivePage] = useState<PageKey>(page)
  const [contentVisible, setContentVisible] = useState(false)
  const reducedMotion = useReducedMotionPreference()
  const router = useRouter()

  const rootId = useId()
  const mainId = useId()
  const tabListLabelId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    setActivePage(page)
  }, [page])

  // Trigger content animation on tab change
  useEffect(() => {
    setContentVisible(false)
    const t = setTimeout(() => setContentVisible(true), 50)
    return () => clearTimeout(t)
  }, [activePage])

  const data = PAGES[activePage]
  const activeTabId = `${rootId}-tab-${activePage}`
  const activePanelId = `${rootId}-panel-${activePage}`

  const handleSelectTab = useCallback(
    (nextPage: PageKey) => {
      setActivePage(nextPage)
      // Update URL query param without full navigation
      const params = new URLSearchParams()
      if (nextPage !== "conditions") params.set("tab", nextPage)
      const search = params.toString()
      router.replace(`/mentions-legales${search ? `?${search}` : ""}`, {
        scroll: false,
      })
    },
    [router]
  )

  const handleTabKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLButtonElement>,
      currentIndex: number
    ) => {
      const lastIndex = TABS.length - 1
      let nextIndex = currentIndex

      switch (event.key) {
        case "ArrowRight":
        case "Right":
          event.preventDefault()
          nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1
          break
        case "ArrowLeft":
        case "Left":
          event.preventDefault()
          nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1
          break
        case "Home":
          event.preventDefault()
          nextIndex = 0
          break
        case "End":
          event.preventDefault()
          nextIndex = lastIndex
          break
        default:
          return
      }

      const nextTab = TABS[nextIndex]
      handleSelectTab(nextTab.key)
      tabRefs.current[nextIndex]?.focus()
    },
    [handleSelectTab]
  )

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap");

        :root { color-scheme: dark; }

        .just-legal-root,
        .just-legal-root *,
        .just-legal-root *::before,
        .just-legal-root *::after { box-sizing: border-box; }

        .just-legal-root {
          position: relative;
          width: 100%;
          min-height: 100%;
          background: ${C.bg};
          color: ${C.text};
          font-family: ${FONT_STACK_DISPLAY};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .just-legal-root a {
          color: inherit;
          text-decoration-thickness: 1px;
          text-underline-offset: 0.18em;
          word-break: break-word;
        }

        .just-legal-root a:hover { text-decoration-thickness: 2px; }

        .just-legal-root [hidden] { display: none !important; }

        .just-legal-sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }

        .just-legal-skip {
          position: absolute;
          left: 16px;
          top: -72px;
          z-index: 10000;
          display: inline-flex;
          align-items: center;
          min-height: 44px;
          min-width: 44px;
          padding: 10px 14px;
          border-radius: 10px;
          background: #ffffff;
          color: #000000;
          text-decoration: none;
          font-family: ${FONT_STACK_MONO};
          font-size: 12px;
          font-weight: 500;
          line-height: 1.2;
          transition: top 0.2s ease;
        }

        .just-legal-skip:focus-visible {
          top: 16px;
          outline: none;
          box-shadow: 0 0 0 2px ${C.focusRingInner}, 0 0 0 5px ${C.focusRingOuter};
        }

        .just-legal-focus:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px ${C.focusRingInner}, 0 0 0 5px ${C.focusRingOuter};
        }

        .just-legal-prose p,
        .just-legal-prose ul,
        .just-legal-prose ol { margin: 0; }

        .just-legal-prose ul,
        .just-legal-prose ol { padding-left: 1.25rem; }

        .just-legal-prose li + li { margin-top: 0.45rem; }

        .just-legal-prose p + p,
        .just-legal-prose p + ul,
        .just-legal-prose p + ol,
        .just-legal-prose ul + p,
        .just-legal-prose ul + ul,
        .just-legal-prose ul + ol,
        .just-legal-prose ol + p,
        .just-legal-prose ol + ul,
        .just-legal-prose ol + ol { margin-top: 1rem; }

        .just-legal-tablist {
          display: flex;
          align-items: stretch;
          gap: 0;
        }

        .just-legal-tablist::-webkit-scrollbar { height: 8px; }

        .just-legal-tablist::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.18);
          border-radius: 999px;
        }

        .just-legal-tab {
          appearance: none;
          border: none;
          border-bottom: 2px solid transparent;
          background: transparent;
          cursor: pointer;
          margin-bottom: -1px;
          padding: 16px 24px;
          min-height: 52px;
          min-width: 44px;
          font-family: ${FONT_STACK_DISPLAY};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          white-space: nowrap;
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .just-legal-tab[data-selected="true"] {
          background: ${C.surfaceStrong};
          color: ${C.textStrong};
          border-bottom-color: ${C.accent};
        }

        .just-legal-tab[data-selected="false"] { color: ${C.textMuted}; }

        .just-legal-tab:hover {
          background: ${C.surfaceSoft};
          color: ${C.textStrong};
        }

        @media (max-width: 767px) {
          .just-legal-header {
            padding: 18px 20px !important;
            align-items: flex-start !important;
            flex-direction: column !important;
          }
          .just-legal-tabs-wrap { padding: 0 12px !important; }
          .just-legal-tablist {
            overflow-x: auto !important;
            scrollbar-width: thin;
          }
          .just-legal-content { padding: 40px 20px 80px !important; }
          .just-legal-meta { width: 100% !important; text-align: left !important; }
          .just-legal-footer {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .just-legal-root *,
          .just-legal-root *::before,
          .just-legal-root *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="just-legal-root">
        <a href={`#${mainId}`} className="just-legal-skip">
          Aller au contenu principal
        </a>

        <header
          className="just-legal-header"
          style={{
            borderBottom: `1px solid ${C.border}`,
            padding: "24px 48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            background: C.bg,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              aria-hidden="true"
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: C.accent,
                boxShadow: `0 0 12px ${C.accent}`,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: C.textStrong,
              }}
            >
              Just Agency
            </span>
          </div>

          <p
            className="just-legal-meta"
            style={{
              margin: 0,
              fontSize: 12,
              color: C.textMuted,
              fontFamily: FONT_STACK_MONO,
              letterSpacing: "0.08em",
              textAlign: "right",
            }}
          >
            SIREN 977 751 544
          </p>
        </header>

        <nav
          aria-labelledby={tabListLabelId}
          className="just-legal-tabs-wrap"
          style={{
            padding: "0 48px",
            borderBottom: `1px solid ${C.border}`,
            background: C.bg,
          }}
        >
          <h2 id={tabListLabelId} className="just-legal-sr-only">
            Navigation des documents légaux
          </h2>

          <div
            role="tablist"
            aria-orientation="horizontal"
            className="just-legal-tablist"
          >
            {TABS.map((tab, index) => {
              const selected = activePage === tab.key
              const tabId = `${rootId}-tab-${tab.key}`
              const tabPanelId = `${rootId}-panel-${tab.key}`

              return (
                <button
                  key={tab.key}
                  ref={(node) => {
                    tabRefs.current[index] = node
                  }}
                  id={tabId}
                  type="button"
                  role="tab"
                  className="just-legal-tab just-legal-focus"
                  data-selected={selected ? "true" : "false"}
                  aria-selected={selected}
                  aria-controls={tabPanelId}
                  aria-label={tab.label}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => handleSelectTab(tab.key)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {tab.shortLabel}
                </button>
              )
            })}
          </div>
        </nav>

        <main
          id={mainId}
          tabIndex={-1}
          style={{ outline: "none" }}
          aria-labelledby={`${rootId}-page-title`}
        >
          <article
            id={activePanelId}
            role="tabpanel"
            aria-labelledby={activeTabId}
            tabIndex={0}
            style={{
              maxWidth: 800,
              margin: "0 auto",
              padding: "64px 48px 120px",
            }}
            className="just-legal-content"
          >
            <div
              style={{
                opacity: contentVisible || reducedMotion ? 1 : 0,
                transform:
                  contentVisible || reducedMotion
                    ? "translateY(0)"
                    : "translateY(20px)",
                transition: reducedMotion
                  ? "none"
                  : "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 11,
                  fontFamily: FONT_STACK_MONO,
                  letterSpacing: "0.12em",
                  color: C.accent,
                  textTransform: "uppercase",
                  marginBottom: 24,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.accent,
                  }}
                />
                Documents légaux
              </div>

              <header>
                <h1
                  id={`${rootId}-page-title`}
                  style={{
                    margin: 0,
                    marginBottom: 16,
                    fontFamily: FONT_STACK_DISPLAY,
                    fontSize: "clamp(30px, 4vw, 48px)",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: C.textStrong,
                  }}
                >
                  {data.title}
                </h1>

                <p
                  style={{
                    margin: 0,
                    marginBottom: 32,
                    fontFamily: FONT_STACK_MONO,
                    fontSize: 12,
                    color: C.textMuted,
                    letterSpacing: "0.08em",
                  }}
                >
                  {data.updated}
                </p>
              </header>

              <section
                aria-label="Informations de l'éditeur"
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderLeft: `4px solid ${C.accent}`,
                  borderRadius: 8,
                  padding: "18px 20px",
                  fontSize: 13,
                  fontFamily: FONT_STACK_MONO,
                  color: C.textSoft,
                  lineHeight: 1.8,
                  marginBottom: 8,
                }}
              >
                Just Agency Incorporation · SAS · 30 rue Saint-Germain
                l'Auxerrois, 75001 Paris · 7021Z Conseil en relations publiques
              </section>
            </div>

            {data.sections.map((section, index) => (
              <Section
                key={`${activePage}-${index}`}
                title={section.title}
                content={section.content}
                index={index}
                reducedMotion={reducedMotion}
                visible={contentVisible}
              />
            ))}

            <footer
              className="just-legal-footer"
              style={{
                marginTop: 80,
                paddingTop: 32,
                borderTop: `1px solid ${C.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: C.textMuted,
                  fontFamily: FONT_STACK_MONO,
                  letterSpacing: "0.08em",
                }}
              >
                © 2026 Just Agency Incorporation
              </p>

              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: C.textMuted,
                  fontFamily: FONT_STACK_MONO,
                  letterSpacing: "0.08em",
                }}
              >
                Paris, France
              </p>
            </footer>
          </article>
        </main>
      </div>
    </>
  )
}