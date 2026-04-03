"use client"

import * as React from "react"
import { useEffect, useRef, useState, useMemo } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

// ─────────────────────────────────────────────────────────────────────────────
// Fonts / tokens
// ─────────────────────────────────────────────────────────────────────────────

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const WHITE = (opacity: number) => `rgba(255,255,255,${opacity})`

const BP = {
    mobile: 640,
    tablet: 1024,
} as const

function useViewport() {
    const [vw, setVw] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1440
    )

    useEffect(() => {
        let rafId = 0

        const onResize = () => {
            cancelAnimationFrame(rafId)
            rafId = requestAnimationFrame(() => {
                setVw(window.innerWidth)
            })
        }

        window.addEventListener("resize", onResize)
        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener("resize", onResize)
        }
    }, [])

    const mobile = vw <= BP.mobile
    const tablet = vw <= BP.tablet

    return { vw, mobile, tablet }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared styles
// ─────────────────────────────────────────────────────────────────────────────

const SR_ONLY: React.CSSProperties = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
}

const overlayFill: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
}

const labelStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 6,
    textTransform: "uppercase",
    color: WHITE(0.15),
    marginBottom: 14,
    marginTop: 0,
    fontFamily: BODY,
}

const sectionTitleStyle: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1,
    letterSpacing: -3,
    marginTop: 0,
}

const pillStyle: React.CSSProperties = {
    padding: "6px 16px",
    borderRadius: 100,
    border: `1px solid ${WHITE(0.08)}`,
    background: WHITE(0.03),
    fontFamily: BODY,
    fontSize: 10,
    fontWeight: 500,
    color: WHITE(0.5),
    letterSpacing: 1,
    textTransform: "uppercase",
}

const cardStyle: React.CSSProperties = {
    background: WHITE(0.01),
    border: `1px solid ${WHITE(0.04)}`,
    borderRadius: 20,
}

// ─────────────────────────────────────────────────────────────────────────────
// Global styles injection
// ─────────────────────────────────────────────────────────────────────────────

function useGlobalStyles() {
    useEffect(() => {
        if (!document.getElementById("talent-kimo-fonts")) {
            const link = document.createElement("link")
            link.id = "talent-kimo-fonts"
            link.rel = "stylesheet"
            link.href =
                "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@200;300;400;500;600;700&display=swap"
            document.head.appendChild(link)
        }

        if (!document.getElementById("talent-kimo-reset")) {
            const style = document.createElement("style")
            style.id = "talent-kimo-reset"
            style.textContent = `
                *:focus-visible {
                    outline: 2px solid rgba(255,255,255,0.65) !important;
                    outline-offset: 3px !important;
                    box-shadow: none !important;
                    border-radius: 4px;
                }

                *:focus:not(:focus-visible) {
                    outline: none !important;
                    box-shadow: none !important;
                }

                a, button, [role="button"] {
                    -webkit-tap-highlight-color: transparent !important;
                }

                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }

                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        scroll-behavior: auto !important;
                    }
                }
            `
            document.head.appendChild(style)
        }
    }, [])
}

// ─────────────────────────────────────────────────────────────────────────────
// Motion helpers
// ─────────────────────────────────────────────────────────────────────────────

function getFadeIn(reduced: boolean, delay = 0) {
    return reduced
        ? {
              initial: { opacity: 1 },
              animate: { opacity: 1 },
          }
        : {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { duration: 0.6, delay },
          }
}

function getSlideUp(reduced: boolean, delay = 0) {
    return reduced
        ? {
              initial: { opacity: 1, y: 0 },
              animate: { opacity: 1, y: 0 },
          }
        : {
              initial: { opacity: 0, y: 50 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 1, delay, ease: EASE },
          }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reveal
// ─────────────────────────────────────────────────────────────────────────────

function Reveal({
    children,
    delay = 0,
}: {
    children: React.ReactNode
    delay?: number
}) {
    const ref = useRef<HTMLDivElement | null>(null)
    const visible = useInView(ref, { once: true, margin: "-60px" })
    const reduced = useReducedMotion() ?? false

    return (
        <motion.div
            ref={ref}
            initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={
                reduced ? { duration: 0 } : { duration: 0.9, delay, ease: EASE }
            }
        >
            {children}
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Decorative marquee
// ─────────────────────────────────────────────────────────────────────────────

function Marquee({ items, speed = 35 }: { items: string[]; speed?: number }) {
    const reduced = useReducedMotion() ?? false
    const tripled = useMemo(() => [...items, ...items, ...items], [items])

    return (
        <div
            aria-hidden="true"
            style={{
                overflow: "hidden",
                width: "100%",
                maskImage:
                    "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
        >
            <motion.div
                animate={reduced ? {} : { x: ["0%", "-33.333%"] }}
                transition={
                    reduced
                        ? { duration: 0 }
                        : {
                              duration: speed,
                              repeat: Infinity,
                              ease: "linear",
                          }
                }
                style={{
                    display: "flex",
                    gap: 40,
                    width: "max-content",
                    alignItems: "center",
                }}
            >
                {tripled.map((item, i) => (
                    <React.Fragment key={`${item}-${i}`}>
                        <span
                            style={{
                                fontFamily: DISPLAY,
                                fontSize: 72,
                                fontWeight: 800,
                                color: WHITE(0.03),
                                letterSpacing: -3,
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {item}
                        </span>
                        <span
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: WHITE(0.08),
                                display: "inline-block",
                                flexShrink: 0,
                            }}
                        />
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Counter
// ─────────────────────────────────────────────────────────────────────────────

function Counter({
    value,
    label,
    delay = 0,
}: {
    value: string
    label: string
    delay?: number
}) {
    const ref = useRef<HTMLLIElement | null>(null)
    const visible = useInView(ref, { once: true })
    const reduced = useReducedMotion() ?? false


    const match = value.match(/^(?:([+\-]?)(\d+\.?\d*)(.*))$/)
    const prefix = match ? match[1] : ""
    const num = match ? parseFloat(match[2]) : 0
    const suffix = match ? match[3] : value
    const decimals =
        match && match[2].includes(".")
            ? (match[2].split(".")[1] || "").length
            : 0

    const [count, setCount] = useState(0)
    const frameRef = useRef<number | null>(null)
    const timeoutRef = useRef<number | null>(null)

    useEffect(() => {
        if (!visible) return

        if (reduced) {
            setCount(num)
            return
        }

        timeoutRef.current = window.setTimeout(() => {
            const duration = 2200
            const start = performance.now()

            const run = (now: number) => {
                const progress = Math.min((now - start) / duration, 1)
                const eased = 1 - Math.pow(1 - progress, 4)

                setCount(
                    decimals > 0
                        ? parseFloat((eased * num).toFixed(decimals))
                        : Math.floor(eased * num)
                )

                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(run)
                }
            }

            frameRef.current = requestAnimationFrame(run)
        }, delay * 1000)

        return () => {
            if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
            if (frameRef.current !== null)
                cancelAnimationFrame(frameRef.current)
        }
    }, [visible, reduced, num, delay, decimals])

    const display = `${prefix}${decimals > 0 ? count.toFixed(decimals) : count}${suffix}`

    return (
        <li
            ref={ref}
            style={{
                textAlign: "center",
                listStyle: "none",
            }}
            aria-label={`${label}: ${value}`}
        >
            <div
                aria-hidden="true"
                style={{
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: "clamp(40px,4vw,56px)",
                    color: "#fff",
                    lineHeight: 1,
                    marginBottom: 8,
                    letterSpacing: -3,
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {display}
            </div>
            <div
                style={{
                    fontSize: 10,
                    color: WHITE(0.2),
                    fontWeight: 600,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    fontFamily: BODY,
                }}
            >
                {label}
            </div>
            <span style={SR_ONLY}>
                {value} {label}
            </span>
        </li>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform icon
// ─────────────────────────────────────────────────────────────────────────────

function PlatformIcon({
    platform,
    size = 16,
}: {
    platform: string
    size?: number
}) {
    const p = platform.toLowerCase()
    const color = WHITE(0.5)

    if (p === "snapchat")
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M12 2C8 2 6 5 6 8v2c-1 0-2 .5-2 1s1 1 2 1c-.5 2-2 3-4 4 0 .5.5 1 2 1 0 .5 0 1 .5 1.5S6 19 8 19.5c0 1 .5 2.5 4 2.5s4-1.5 4-2.5c2-.5 3-1 3.5-1.5s.5-1 .5-1.5c1.5 0 2-.5 2-1-2-1-3.5-2-4-4 1 0 2-.5 2-1s-1-1-2-1V8c0-3-2-6-6-6z" />
            </svg>
        )

    if (p === "instagram")
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
            >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none" />
            </svg>
        )

    if (p === "tiktok")
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
        )

    if (p === "youtube")
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                <path d="m10 15 5-3-5-3z" />
            </svg>
        )

    if (p === "spotify")
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 15c2-1 4.5-1.2 7-.4" />
                <path d="M7 12.5c2.5-1.2 6-1.5 9-.5" />
                <path d="M6.5 10c3-1.5 7.5-1.8 11-.6" />
            </svg>
        )

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            aria-hidden="true"
            focusable="false"
        >
            <circle cx="12" cy="12" r="10" />
        </svg>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface TalentKimoDjzProps {
    heroImage?: string
    name?: string
    alias?: string
    handle?: string
    tagline?: string
    bio?: string
    location?: string
    stat1?: string
    stat1Label?: string
    stat2?: string
    stat2Label?: string
    stat3?: string
    stat3Label?: string
    stat4?: string
    stat4Label?: string
    stat5?: string
    stat5Label?: string
    stat6?: string
    stat6Label?: string
    tiktokFollowers?: string
    tiktokDesc?: string
    instaFollowers?: string
    instaDesc?: string
    spotifyFollowers?: string
    spotifyDesc?: string
    youtubeFollowers?: string
    youtubeDesc?: string
    pillar1Title?: string
    pillar1Desc?: string
    pillar1Icon?: string
    pillar2Title?: string
    pillar2Desc?: string
    pillar2Icon?: string
    pillar3Title?: string
    pillar3Desc?: string
    pillar3Icon?: string
    pillar4Title?: string
    pillar4Desc?: string
    pillar4Icon?: string
    ascensionText?: string
    categories?: string
    collab1?: string
    collab1Desc?: string
    collab2?: string
    collab2Desc?: string
    collab3?: string
    collab3Desc?: string
    collab4?: string
    collab4Desc?: string
    brandsWorked?: string
    manifesto?: string
    ctaTitle?: string
    ctaDesc?: string
    ctaUrl?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function TalentKimoDjz(props: TalentKimoDjzProps) {
    const {
        heroImage = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
        name = "Kimo Djz",
        alias = "Le Créateur de Sons",
        handle = "@kimodjz",
        tagline = "Musique · Beatmaking · TikTok · Culture Urbaine · Viralité",
        bio = "Le créateur de sons et d'ambiances. Kimo Djz s'inscrit dans cette nouvelle mouvance où la frontière entre l'influenceur TikTok et l'artiste urbain est extrêmement fine. Avec des morceaux comme 'Roule', il génère des millions de vues et crée les bandes-son de toute une génération.",
        location = "France",
        stat1 = "1M+",
        stat1Label = "Abonnés TikTok",
        stat2 = "300K",
        stat2Label = "Abonnés Instagram",
        stat3 = "500K+",
        stat3Label = "Streams Spotify",
        stat4 = "15M+",
        stat4Label = "Vues totales",
        stat5 = "2M+",
        stat5Label = "Vues en -48h",
        stat6 = "11.5%",
        stat6Label = "Taux d'engagement",
        tiktokFollowers = "1M+",
        tiktokDesc = "Son terrain de jeu principal. Kimo y dépose ses sons, ses extraits, ses freestyles — et l'algorithme fait le reste. Ses vidéos deviennent des trends, ses beats deviennent des bandes-son que des milliers de créateurs reprennent.",
        instaFollowers = "300K",
        instaDesc = "Vitrine visuelle et behind the scenes : sessions studio, extraits de clips, lifestyle urbain. Le pont entre l'artiste et l'influenceur.",
        spotifyFollowers = "500K+ streams",
        spotifyDesc = "Ses morceaux comme 'Roule' cumulent des centaines de milliers de streams. La preuve que l'audience TikTok se convertit en auditeurs fidèles sur les plateformes musicales.",
        youtubeFollowers = "150K",
        youtubeDesc = "Clips officiels, freestyles, sessions live. Le format long qui donne de la profondeur à l'univers sonore de Kimo.",
        pillar1Title = "Les Sons Viraux",
        pillar1Desc = "Kimo crée les bandes-son de TikTok. Ses beats deviennent des trends repris par des milliers de créateurs. 'Roule' est devenu un hymne. Chaque nouveau son est un potentiel viral.",
        pillar1Icon = "🎵",
        pillar2Title = "Le Beatmaking",
        pillar2Desc = "Avant d'être un influenceur, Kimo est un musicien. Il compose, produit, mixe — et montre tout le processus en stories et en TikTok. Le making of fascine une audience qui veut comprendre comment naît un hit.",
        pillar2Icon = "🎹",
        pillar3Title = "La Culture Urbaine",
        pillar3Desc = "Kimo incarne la nouvelle génération de la culture urbaine française. Mode streetwear, références rap, codes de quartier — son univers visuel et sonore parle directement à la Gen Z et aux jeunes millennials.",
        pillar3Icon = "🏙️",
        pillar4Title = "L'Artiste-Influenceur",
        pillar4Desc = "Il est à la croisée des chemins : assez artiste pour être crédible musicalement, assez influenceur pour générer de l'engagement massif. Cette double casquette est rare et précieuse.",
        pillar4Icon = "🔥",
        ascensionText = "Kimo Djz représente la nouvelle vague — ces créateurs qui brouillent les frontières entre artiste et influenceur. Ses sons ne sont pas juste des morceaux, ce sont des trends. Quand 'Roule' explose sur TikTok et se retrouve dans des milliers de vidéos, c'est une force de frappe que les labels traditionnels peinent à reproduire.",
        categories = "Musique, Beatmaking, Culture Urbaine, TikTok, Lifestyle, Streetwear",
        collab1 = "Son sponsorisé / Brand Beat",
        collab1Desc = "Kimo crée un son original ou un beat autour de votre marque — un format natif qui peut devenir un trend TikTok organique.",
        collab2 = "Placement de produit",
        collab2Desc = "Intégration naturelle dans ses vidéos TikTok, ses sessions studio, ses clips — votre marque dans l'univers sonore et visuel de Kimo.",
        collab3 = "Showcase & Événement",
        collab3Desc = "Performance live, DJ set, apparition en soirée de marque. Kimo apporte l'énergie et l'audience.",
        collab4 = "Campagne musicale",
        collab4Desc = "Création d'un morceau dédié à votre campagne — de la composition au clip, en passant par la promotion virale sur TikTok.",
        brandsWorked = "Mode, Streetwear, Boissons, Tech, Auto, Musique, Gaming, Clubs",
        manifesto = "Kimo Djz ne fait pas des vidéos — il crée des bandes-son. Quand un de ses beats fait vibrer des millions de téléphones, c'est parce qu'il a touché quelque chose de vrai. Associer votre marque à Kimo, c'est associer votre marque à un son, une vibe, une génération.",
        ctaTitle = "Collaborer avec Kimo.",
        ctaDesc = "Son sponsorisé, placement, showcase, campagne musicale — discutons de comment votre marque peut entrer dans l'univers Kimo Djz.",
        ctaUrl = "#",
    } = props

    const reduced = useReducedMotion() ?? false
    const { mobile, tablet } = useViewport()
    useGlobalStyles()

    const sectionPad = mobile
        ? "72px 20px"
        : tablet
          ? "88px 40px"
          : "100px 72px"

    const heroPad = mobile ? "48px 20px" : tablet ? "64px 40px" : "80px 72px"

    const catList = categories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

    const brandList = brandsWorked
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

    const socialProfiles = {
        instagram:
            handle && handle !== "@"
                ? `https://www.instagram.com/${handle.replace("@", "")}`
                : undefined,
        tiktok:
            handle && handle !== "@"
                ? `https://www.tiktok.com/${handle.startsWith("@") ? handle : `@${handle}`}`
                : undefined,
        spotify: undefined as string | undefined,
        youtube: undefined as string | undefined,
    }

    const platforms = [
        {
            name: "TikTok",
            followers: tiktokFollowers,
            desc: tiktokDesc,
            main: true,
        },
        {
            name: "Spotify",
            followers: spotifyFollowers,
            desc: spotifyDesc,
            main: false,
        },
        {
            name: "Instagram",
            followers: instaFollowers,
            desc: instaDesc,
            main: false,
        },
        {
            name: "YouTube",
            followers: youtubeFollowers,
            desc: youtubeDesc,
            main: false,
        },
    ]

    const pillars = [
        { title: pillar1Title, desc: pillar1Desc, icon: pillar1Icon },
        { title: pillar2Title, desc: pillar2Desc, icon: pillar2Icon },
        { title: pillar3Title, desc: pillar3Desc, icon: pillar3Icon },
        { title: pillar4Title, desc: pillar4Desc, icon: pillar4Icon },
    ]

    const collabs = [
        { title: collab1, desc: collab1Desc },
        { title: collab2, desc: collab2Desc },
        { title: collab3, desc: collab3Desc },
        { title: collab4, desc: collab4Desc },
    ]

    const pageUrl = ctaUrl && ctaUrl !== "#" ? ctaUrl : undefined
    const sameAs = [
        socialProfiles.instagram,
        socialProfiles.tiktok,
        socialProfiles.spotify,
        socialProfiles.youtube,
    ].filter(Boolean)

    const heroGridColumns = mobile ? "1fr" : "1fr 1fr"
    const statsCols = mobile
        ? "1fr 1fr"
        : tablet
          ? "repeat(2,1fr)"
          : "repeat(3,1fr)"
    const platformCols = mobile
        ? "1fr"
        : tablet
          ? "repeat(2,1fr)"
          : "repeat(4,1fr)"
    const pillarCols = mobile ? "1fr" : "repeat(2,1fr)"
    const collabCols = mobile
        ? "1fr"
        : tablet
          ? "repeat(2,1fr)"
          : "repeat(4,1fr)"

    return (
        <article
            lang="fr"
            aria-labelledby="talent-heading"
            style={{
                width: "100%",
                background: "#000",
                color: "#c8c8c8",
                fontFamily: BODY,
                overflowX: "hidden",
                WebkitFontSmoothing: "antialiased",
            }}
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        name,
                        alternateName: alias,
                        description: bio,
                        url: pageUrl,
                        address: {
                            "@type": "PostalAddress",
                            addressLocality: location,
                        },
                        sameAs,
                        knowsAbout: catList,
                        memberOf: {
                            "@type": "Organization",
                            name: "Just Impact",
                        },
                    }),
                }}
            />

            {/* HERO */}
            <header
                style={{
                    minHeight: mobile ? "auto" : "100vh",
                    display: "grid",
                    gridTemplateColumns: heroGridColumns,
                    alignItems: "stretch",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        padding: heroPad,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        order: 1,
                    }}
                >
                    <motion.div
                        {...getFadeIn(reduced, 0.2)}
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 24,
                        }}
                    >
                        <span
                            style={{
                                padding: "5px 14px",
                                borderRadius: 100,
                                background: WHITE(0.06),
                                border: `1px solid ${WHITE(0.06)}`,
                                fontFamily: BODY,
                                fontSize: 9,
                                fontWeight: 600,
                                letterSpacing: 3,
                                textTransform: "uppercase",
                                color: WHITE(0.4),
                            }}
                        >
                            {alias}
                        </span>
                        <span
                            style={{
                                fontFamily: BODY,
                                fontSize: 12,
                                color: WHITE(0.25),
                            }}
                        >
                            {handle}
                        </span>
                    </motion.div>

                    <motion.h1
                        id="talent-heading"
                        {...getSlideUp(reduced, 0.35)}
                        style={{
                            fontFamily: DISPLAY,
                            fontWeight: 800,
                            fontSize: "clamp(48px, 6vw, 90px)",
                            lineHeight: 0.92,
                            color: "#fff",
                            margin: 0,
                            letterSpacing: -4,
                        }}
                    >
                        {name}
                    </motion.h1>

                    <motion.p
                        {...getFadeIn(reduced, 0.45)}
                        style={{
                            marginTop: 14,
                            marginBottom: 0,
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: WHITE(0.34),
                            fontWeight: 400,
                            maxWidth: 560,
                            letterSpacing: 0.2,
                        }}
                    >
                        {tagline}
                    </motion.p>

                    <motion.ul
                        {...getFadeIn(reduced, 0.5)}
                        aria-label="Catégories de contenu"
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 24,
                            marginBottom: 0,
                            padding: 0,
                            listStyle: "none",
                        }}
                    >
                        {catList.map((cat) => (
                            <li key={cat} style={pillStyle}>
                                {cat}
                            </li>
                        ))}
                    </motion.ul>

                    <motion.p
                        {...(reduced
                            ? {
                                  initial: { opacity: 1, y: 0 },
                                  animate: { opacity: 1, y: 0 },
                              }
                            : {
                                  initial: { opacity: 0, y: 20 },
                                  animate: { opacity: 1, y: 0 },
                                  transition: { duration: 0.7, delay: 0.6 },
                              })}
                        style={{
                            marginTop: 28,
                            fontSize: 15,
                            lineHeight: 1.9,
                            maxWidth: 520,
                            color: WHITE(0.42),
                            fontWeight: 300,
                        }}
                    >
                        {bio}
                    </motion.p>

                    <motion.div
                        {...getFadeIn(reduced, 0.8)}
                        style={{
                            marginTop: 24,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={WHITE(0.25)}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span
                            style={{
                                fontFamily: BODY,
                                fontSize: 12,
                                color: WHITE(0.22),
                                letterSpacing: 1,
                            }}
                        >
                            {location}
                        </span>
                    </motion.div>

                    <motion.ul
                        {...getFadeIn(reduced, 0.9)}
                        aria-label="Présence sur les plateformes"
                        style={{
                            marginTop: 32,
                            display: "flex",
                            gap: 12,
                            listStyle: "none",
                            padding: 0,
                            marginBottom: 0,
                        }}
                    >
                        {["TikTok", "Spotify", "Instagram", "YouTube"].map(
                            (platform) => (
                                <li
                                    key={platform}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        background: WHITE(0.04),
                                        border: `1px solid ${WHITE(0.06)}`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    aria-label={platform}
                                >
                                    <PlatformIcon
                                        platform={platform}
                                        size={16}
                                    />
                                </li>
                            )
                        )}
                    </motion.ul>
                </div>

                <motion.figure
                    initial={
                        reduced
                            ? { opacity: 1, scale: 1 }
                            : { opacity: 0, scale: 1.05 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    transition={
                        reduced
                            ? { duration: 0 }
                            : { duration: 1.2, delay: 0.3, ease: EASE }
                    }
                    style={{
                        height: mobile ? "58vh" : "100vh",
                        minHeight: mobile ? 420 : undefined,
                        position: "relative",
                        overflow: "hidden",
                        margin: 0,
                        order: mobile ? 0 : 2,
                    }}
                >
                    <Image
                        src={heroImage}
                        alt={`Portrait de ${name}, artiste et créateur de contenus musicaux`}
                        fill
                        priority
                        style={{
                            objectFit: "cover",
                        }}
                    />
                    <div
                        aria-hidden="true"
                        style={{
                            ...overlayFill,
                            background: mobile
                                ? "linear-gradient(to top, #000 0%, transparent 35%)"
                                : "linear-gradient(to right, #000 0%, transparent 30%)",
                        }}
                    />
                    <div
                        aria-hidden="true"
                        style={{
                            ...overlayFill,
                            background:
                                "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 30%)",
                        }}
                    />
                </motion.figure>
            </header>

            <Marquee
                items={[
                    "Kimo Djz",
                    "Roule",
                    "Beatmaker",
                    "TikTok",
                    "Culture Urbaine",
                    "Viralité",
                    "Sons",
                    "Studio",
                ]}
                speed={40}
            />

            {/* STATS */}
            <section
                aria-labelledby="stats-heading"
                style={{ padding: sectionPad, position: "relative" }}
            >
                <div
                    aria-hidden="true"
                    style={{
                        ...overlayFill,
                        background:
                            "radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 70%)",
                    }}
                />
                <Reveal>
                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <p style={labelStyle}>En chiffres</p>
                        <h2
                            id="stats-heading"
                            style={{
                                ...sectionTitleStyle,
                                fontSize: "clamp(28px, 3.5vw, 44px)",
                                margin: 0,
                                letterSpacing: -2,
                            }}
                        >
                            L'audience{" "}
                            <span
                                aria-hidden="true"
                                style={{ color: WHITE(0.12) }}
                            >
                                Kimo Djz.
                            </span>
                        </h2>
                    </div>
                </Reveal>

                <Reveal>
                    <ul
                        aria-label="Statistiques d'audience"
                        style={{
                            maxWidth: 1200,
                            margin: "0 auto",
                            padding: 0,
                            listStyle: "none",
                            display: "grid",
                            gridTemplateColumns: statsCols,
                            gap: 48,
                            rowGap: 56,
                        }}
                    >
                        <Counter value={stat1} label={stat1Label} delay={0} />
                        <Counter
                            value={stat2}
                            label={stat2Label}
                            delay={0.06}
                        />
                        <Counter
                            value={stat3}
                            label={stat3Label}
                            delay={0.12}
                        />
                        <Counter
                            value={stat4}
                            label={stat4Label}
                            delay={0.18}
                        />
                        <Counter
                            value={stat5}
                            label={stat5Label}
                            delay={0.24}
                        />
                        <Counter value={stat6} label={stat6Label} delay={0.3} />
                    </ul>
                </Reveal>
            </section>

            {/* PLATEFORMES */}
            <section
                aria-labelledby="platforms-heading"
                style={{
                    padding: mobile
                        ? "20px 20px 72px"
                        : tablet
                          ? "32px 40px 80px"
                          : "40px 72px 80px",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Reveal>
                        <p style={labelStyle}>Plateformes</p>
                        <h2
                            id="platforms-heading"
                            style={{
                                ...sectionTitleStyle,
                                fontSize: "clamp(34px, 4.5vw, 58px)",
                                marginBottom: 48,
                            }}
                        >
                            Là où ça{" "}
                            <span
                                aria-hidden="true"
                                style={{ color: WHITE(0.12) }}
                            >
                                résonne.
                            </span>
                        </h2>
                    </Reveal>

                    <ul
                        style={{
                            display: "grid",
                            gridTemplateColumns: platformCols,
                            gap: 12,
                            padding: 0,
                            margin: 0,
                            listStyle: "none",
                        }}
                    >
                        {platforms.map((platform, i) => (
                            <li key={platform.name}>
                                <Reveal delay={i * 0.05}>
                                    <motion.div
                                        whileHover={
                                            reduced
                                                ? {}
                                                : {
                                                      backgroundColor:
                                                          WHITE(0.03),
                                                      borderColor: WHITE(0.08),
                                                  }
                                        }
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            ...cardStyle,
                                            border: `1px solid ${
                                                platform.main
                                                    ? WHITE(0.08)
                                                    : WHITE(0.04)
                                            }`,
                                            padding: "36px 24px",
                                            position: "relative",
                                            overflow: "hidden",
                                            height: "100%",
                                        }}
                                    >
                                        {platform.main && (
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    top: 12,
                                                    right: 14,
                                                    padding: "3px 10px",
                                                    borderRadius: 100,
                                                    background: WHITE(0.06),
                                                    fontFamily: BODY,
                                                    fontSize: 8,
                                                    fontWeight: 700,
                                                    letterSpacing: 2,
                                                    textTransform: "uppercase",
                                                    color: WHITE(0.3),
                                                }}
                                            >
                                                Principal
                                            </span>
                                        )}

                                        <div
                                            aria-hidden="true"
                                            style={{ marginBottom: 16 }}
                                        >
                                            <PlatformIcon
                                                platform={platform.name}
                                                size={24}
                                            />
                                        </div>

                                        <h3
                                            style={{
                                                fontFamily: DISPLAY,
                                                fontWeight: 800,
                                                fontSize: 14,
                                                color: "#fff",
                                                letterSpacing: -0.3,
                                                marginBottom: 4,
                                                marginTop: 0,
                                            }}
                                        >
                                            {platform.name}
                                        </h3>

                                        <p
                                            style={{
                                                fontFamily: DISPLAY,
                                                fontWeight: 800,
                                                fontSize: 32,
                                                color: "#fff",
                                                letterSpacing: -2,
                                                lineHeight: 1,
                                                marginBottom: 14,
                                                marginTop: 0,
                                            }}
                                        >
                                            {platform.followers}
                                        </p>

                                        <p
                                            style={{
                                                fontFamily: BODY,
                                                fontSize: 12,
                                                lineHeight: 1.7,
                                                color: WHITE(0.3),
                                                fontWeight: 300,
                                                margin: 0,
                                            }}
                                        >
                                            {platform.desc}
                                        </p>
                                    </motion.div>
                                </Reveal>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ASCENSION */}
            <section
                aria-labelledby="ascension-heading"
                style={{
                    padding: mobile
                        ? "64px 20px"
                        : tablet
                          ? "72px 40px"
                          : "80px 72px",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Reveal>
                    <div style={{ maxWidth: 800, textAlign: "center" }}>
                        <h2 id="ascension-heading" style={labelStyle}>
                            L'ascension
                        </h2>
                        <blockquote
                            style={{
                                fontFamily: DISPLAY,
                                fontSize: "clamp(20px, 2.8vw, 34px)",
                                fontWeight: 300,
                                lineHeight: 1.55,
                                color: WHITE(0.6),
                                margin: 0,
                                letterSpacing: -0.5,
                                fontStyle: "italic",
                            }}
                        >
                            <span aria-hidden="true">"</span>
                            {ascensionText}
                            <span aria-hidden="true">"</span>
                        </blockquote>
                        <motion.div
                            aria-hidden="true"
                            initial={{ width: 0 }}
                            whileInView={reduced ? {} : { width: 60 }}
                            viewport={{ once: true }}
                            transition={
                                reduced
                                    ? { duration: 0 }
                                    : { duration: 1, delay: 0.3, ease: EASE }
                            }
                            style={{
                                height: 2,
                                background: WHITE(0.15),
                                margin: "36px auto 0",
                                width: reduced ? 60 : 0,
                            }}
                        />
                    </div>
                </Reveal>
            </section>

            {/* PILIERS */}
            <section
                aria-labelledby="pillars-heading"
                style={{
                    padding: mobile
                        ? "24px 20px 72px"
                        : tablet
                          ? "32px 40px 80px"
                          : "40px 72px 80px",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Reveal>
                        <p style={labelStyle}>Le contenu</p>
                        <h2
                            id="pillars-heading"
                            style={{
                                ...sectionTitleStyle,
                                fontSize: "clamp(34px, 4.5vw, 58px)",
                                marginBottom: 48,
                            }}
                        >
                            La vibe{" "}
                            <span
                                aria-hidden="true"
                                style={{ color: WHITE(0.12) }}
                            >
                                Kimo.
                            </span>
                        </h2>
                    </Reveal>

                    <ul
                        style={{
                            display: "grid",
                            gridTemplateColumns: pillarCols,
                            gap: 16,
                            padding: 0,
                            margin: 0,
                            listStyle: "none",
                        }}
                    >
                        {pillars.map((pillar, i) => (
                            <li key={pillar.title}>
                                <Reveal delay={i * 0.06}>
                                    <motion.div
                                        whileHover={
                                            reduced
                                                ? {}
                                                : {
                                                      backgroundColor:
                                                          WHITE(0.03),
                                                  }
                                        }
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            ...cardStyle,
                                            borderRadius: 24,
                                            padding: mobile
                                                ? "32px 20px"
                                                : "48px 36px",
                                            display: "flex",
                                            gap: 24,
                                            alignItems: "flex-start",
                                            height: "100%",
                                        }}
                                    >
                                        <span
                                            role="img"
                                            aria-label={pillar.title}
                                            style={{
                                                fontSize: 36,
                                                flexShrink: 0,
                                                lineHeight: 1,
                                            }}
                                        >
                                            {pillar.icon}
                                        </span>
                                        <div>
                                            <h3
                                                style={{
                                                    fontFamily: DISPLAY,
                                                    fontWeight: 800,
                                                    fontSize: 20,
                                                    color: "#fff",
                                                    letterSpacing: -0.5,
                                                    marginBottom: 12,
                                                    lineHeight: 1.2,
                                                    marginTop: 0,
                                                }}
                                            >
                                                {pillar.title}
                                            </h3>
                                            <p
                                                style={{
                                                    fontFamily: BODY,
                                                    fontSize: 14,
                                                    lineHeight: 1.85,
                                                    color: WHITE(0.35),
                                                    fontWeight: 300,
                                                    margin: 0,
                                                }}
                                            >
                                                {pillar.desc}
                                            </p>
                                        </div>
                                    </motion.div>
                                </Reveal>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <div style={{ padding: "40px 0" }}>
                <Marquee
                    items={[
                        "Roule",
                        "Beatmaker",
                        "Studio",
                        "Freestyle",
                        "Viralité",
                        "Gen Z",
                        "Streetwear",
                        "Spotify",
                    ]}
                    speed={30}
                />
            </div>

            {/* COLLABS */}
            <section
                aria-labelledby="collab-heading"
                style={{
                    padding: mobile
                        ? "72px 20px"
                        : tablet
                          ? "80px 40px"
                          : "80px 72px",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Reveal>
                        <p style={labelStyle}>Collaborer</p>
                        <h2
                            id="collab-heading"
                            style={{
                                ...sectionTitleStyle,
                                fontSize: "clamp(34px, 4.5vw, 58px)",
                                marginBottom: 48,
                            }}
                        >
                            Formats de{" "}
                            <span
                                aria-hidden="true"
                                style={{ color: WHITE(0.12) }}
                            >
                                collaboration.
                            </span>
                        </h2>
                    </Reveal>

                    <ul
                        style={{
                            display: "grid",
                            gridTemplateColumns: collabCols,
                            gap: 12,
                            padding: 0,
                            margin: 0,
                            listStyle: "none",
                        }}
                    >
                        {collabs.map((collab, i) => (
                            <li key={collab.title}>
                                <Reveal delay={i * 0.05}>
                                    <motion.div
                                        whileHover={
                                            reduced
                                                ? {}
                                                : {
                                                      backgroundColor:
                                                          WHITE(0.03),
                                                      borderColor: WHITE(0.08),
                                                  }
                                        }
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            ...cardStyle,
                                            padding: "40px 24px",
                                            textAlign: "center",
                                            minHeight: 220,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                        }}
                                    >
                                        <span
                                            aria-hidden="true"
                                            style={{
                                                fontFamily: DISPLAY,
                                                fontSize: 56,
                                                fontWeight: 800,
                                                color: WHITE(0.02),
                                                lineHeight: 1,
                                                marginBottom: 16,
                                            }}
                                        >
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <h3
                                            style={{
                                                fontFamily: DISPLAY,
                                                fontWeight: 800,
                                                fontSize: 16,
                                                color: "#fff",
                                                marginBottom: 12,
                                                letterSpacing: -0.3,
                                                marginTop: 0,
                                            }}
                                        >
                                            {collab.title}
                                        </h3>
                                        <p
                                            style={{
                                                fontFamily: BODY,
                                                fontSize: 12,
                                                lineHeight: 1.75,
                                                color: WHITE(0.3),
                                                fontWeight: 300,
                                                margin: 0,
                                                maxWidth: 220,
                                            }}
                                        >
                                            {collab.desc}
                                        </p>
                                    </motion.div>
                                </Reveal>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* SECTEURS */}
            <section
                aria-labelledby="sectors-heading"
                style={{
                    padding: mobile
                        ? "24px 20px 72px"
                        : tablet
                          ? "32px 40px 80px"
                          : "40px 72px 80px",
                }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Reveal>
                        <h2 id="sectors-heading" style={labelStyle}>
                            Secteurs d'activité
                        </h2>
                        <ul
                            aria-label="Secteurs d'activité"
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 10,
                                padding: 0,
                                margin: 0,
                                listStyle: "none",
                            }}
                        >
                            {brandList.map((brand, i) => (
                                <motion.li
                                    key={brand}
                                    initial={
                                        reduced
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: 10 }
                                    }
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={
                                        reduced
                                            ? { duration: 0 }
                                            : {
                                                  duration: 0.4,
                                                  delay: i * 0.05,
                                                  ease: EASE,
                                              }
                                    }
                                    style={{
                                        padding: "10px 24px",
                                        borderRadius: 100,
                                        border: `1px solid ${WHITE(0.08)}`,
                                        background: WHITE(0.03),
                                        fontFamily: BODY,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: WHITE(0.5),
                                        letterSpacing: 1,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {brand}
                                </motion.li>
                            ))}
                        </ul>
                    </Reveal>
                </div>
            </section>

            {/* MANIFESTO */}
            <section
                aria-labelledby="manifesto-heading"
                style={{
                    padding: mobile
                        ? "72px 20px"
                        : tablet
                          ? "88px 40px"
                          : "100px 72px",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Reveal>
                    <div style={{ maxWidth: 800, textAlign: "center" }}>
                        <h2 id="manifesto-heading" style={labelStyle}>
                            Pourquoi Kimo
                        </h2>
                        <blockquote
                            style={{
                                fontFamily: DISPLAY,
                                fontSize: "clamp(22px, 3vw, 38px)",
                                fontWeight: 300,
                                lineHeight: 1.5,
                                color: WHITE(0.7),
                                margin: 0,
                                letterSpacing: -1,
                                fontStyle: "italic",
                            }}
                        >
                            <span aria-hidden="true">"</span>
                            {manifesto}
                            <span aria-hidden="true">"</span>
                        </blockquote>
                        <motion.div
                            aria-hidden="true"
                            initial={{ width: 0 }}
                            whileInView={reduced ? {} : { width: 60 }}
                            viewport={{ once: true }}
                            transition={
                                reduced
                                    ? { duration: 0 }
                                    : { duration: 1, delay: 0.3, ease: EASE }
                            }
                            style={{
                                height: 2,
                                background: WHITE(0.15),
                                margin: "36px auto 0",
                                width: reduced ? 60 : 0,
                            }}
                        />
                    </div>
                </Reveal>
            </section>

            {/* CTA */}
            <section
                aria-labelledby="cta-heading"
                style={{
                    textAlign: "center",
                    padding: mobile
                        ? "88px 20px"
                        : tablet
                          ? "104px 40px"
                          : "120px 72px",
                    position: "relative",
                }}
            >
                <div
                    aria-hidden="true"
                    style={{
                        ...overlayFill,
                        background:
                            "radial-gradient(ellipse at center bottom, rgba(255,255,255,0.02) 0%, transparent 60%)",
                    }}
                />
                <Reveal>
                    <h2
                        id="cta-heading"
                        style={{
                            fontFamily: DISPLAY,
                            fontWeight: 800,
                            fontSize: "clamp(44px, 7vw, 100px)",
                            lineHeight: 0.95,
                            marginBottom: 20,
                            letterSpacing: -4,
                            color: "#fff",
                            marginTop: 0,
                        }}
                    >
                        {ctaTitle}
                    </h2>
                </Reveal>
                <Reveal delay={0.08}>
                    <p
                        style={{
                            fontSize: 15,
                            color: WHITE(0.3),
                            maxWidth: 480,
                            margin: "0 auto 40px",
                            lineHeight: 1.8,
                            fontWeight: 300,
                        }}
                    >
                        {ctaDesc}
                    </p>
                </Reveal>
                <Reveal delay={0.16}>
                    <motion.a
                        href={ctaUrl}
                        aria-label={`Proposer une collaboration avec ${name}`}
                        whileHover={
                            reduced
                                ? {}
                                : {
                                      y: -3,
                                      backgroundColor: "#fff",
                                      color: "#000",
                                  }
                        }
                        whileTap={reduced ? {} : { scale: 0.96 }}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 12,
                            padding: mobile ? "16px 28px" : "18px 42px",
                            background: "transparent",
                            color: "#fff",
                            fontFamily: DISPLAY,
                            fontWeight: 700,
                            fontSize: 12,
                            letterSpacing: 4,
                            textTransform: "uppercase",
                            textDecoration: "none",
                            borderRadius: 100,
                            border: `1px solid ${WHITE(0.2)}`,
                            transition: reduced
                                ? "none"
                                : "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                    >
                        Proposer une collab
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </motion.a>
                </Reveal>
            </section>

            {/* FOOTER */}
            <footer
                style={{
                    padding: mobile ? "24px 20px" : "28px 72px",
                    borderTop: `1px solid ${WHITE(0.04)}`,
                    display: "flex",
                    flexDirection: mobile ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: mobile ? "flex-start" : "center",
                    gap: mobile ? 10 : 20,
                }}
            >
                <p
                    style={{
                        fontSize: 10,
                        color: WHITE(0.12),
                        letterSpacing: 4,
                        margin: 0,
                        fontWeight: 700,
                        fontFamily: DISPLAY,
                    }}
                >
                    JUST IMPACT
                    <span aria-hidden="true" style={{ color: WHITE(0.3) }}>
                        .
                    </span>{" "}
                    © {new Date().getFullYear()}
                </p>
                <p
                    style={{
                        fontSize: 10,
                        color: WHITE(0.08),
                        letterSpacing: 4,
                        margin: 0,
                        fontFamily: BODY,
                    }}
                >
                    Paris, France
                </p>
            </footer>
        </article>
    )
}