"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState, useId, useCallback } from "react"
import {
    motion,
    useInView,
    useReducedMotion,
    type Transition,
} from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const NUMERIC = "'Inter', 'Segoe UI', Arial, sans-serif"

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const COLORS = {
    bg: "#000000",
    panel: "rgba(255,255,255,0.02)",
    panelSoft: "rgba(255,255,255,0.03)",
    panelStrong: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.08)",
    borderStrong: "rgba(255,255,255,0.14)",
    text: "#FFFFFF",
    textSoft: "rgba(255,255,255,0.84)",
    textBody: "rgba(255,255,255,0.78)",
    textMuted: "rgba(255,255,255,0.68)",
    textSubtle: "rgba(255,255,255,0.56)",
    textGhost: "rgba(255,255,255,0.18)",
    textUltraGhost: "rgba(255,255,255,0.10)",
    focus: "#FFFFFF",
} as const

const TRANSITION_BASE: Transition = {
    duration: 0.9,
    ease: EASE,
}

type PlatformItem = { name: string; followers: string; desc: string; main?: boolean }
type PillarItem = { title: string; desc: string; icon: string }
type CollabItem = { title: string; desc: string }

function useFontsAndGlobalStyles() {
    useEffect(() => {
        if (!document.getElementById("talent-riles-fonts")) {
            const link = document.createElement("link")
            link.id = "talent-riles-fonts"
            link.rel = "stylesheet"
            link.href =
                "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@200;300;400;500;600;700&display=swap"
            document.head.appendChild(link)
        }

        if (!document.getElementById("talent-riles-accessibility-styles")) {
            const style = document.createElement("style")
            style.id = "talent-riles-accessibility-styles"
            style.innerHTML = `
                .talent-riles-root * { box-sizing: border-box; }
                .talent-riles-root a, .talent-riles-root button, .talent-riles-root [tabindex]:not([tabindex="-1"]) { -webkit-tap-highlight-color: transparent; }
                .talent-riles-root a:focus-visible, .talent-riles-root button:focus-visible, .talent-riles-root [role="button"]:focus-visible { outline: 2px solid #FFFFFF; outline-offset: 4px; box-shadow: 0 0 0 6px rgba(255,255,255,0.12); }
                .talent-riles-root .sr-only { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; }
                .talent-riles-root .tr-grid-6 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 48px; row-gap: 56px; }
                .talent-riles-root .tr-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
                .talent-riles-root .tr-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
                .talent-riles-root .tr-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 1fr); align-items: center; min-height: 100vh; position: relative; }
                .talent-riles-root .tr-footer { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
                @media (max-width: 1199px) { .talent-riles-root .tr-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
                @media (max-width: 991px) {
                    .talent-riles-root .tr-hero { grid-template-columns: 1fr; min-height: auto; }
                    .talent-riles-root .tr-hero-media { height: 60vh !important; min-height: 420px; }
                    .talent-riles-root .tr-grid-6 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                    .talent-riles-root .tr-grid-2 { grid-template-columns: 1fr; }
                }
                @media (max-width: 767px) {
                    .talent-riles-root .tr-section-padding { padding-left: 24px !important; padding-right: 24px !important; }
                    .talent-riles-root .tr-hero-copy { padding: 48px 24px !important; }
                    .talent-riles-root .tr-grid-6, .talent-riles-root .tr-grid-4 { grid-template-columns: 1fr; }
                    .talent-riles-root .tr-footer { flex-direction: column; align-items: flex-start; }
                }
            `
            document.head.appendChild(style)
        }
    }, [])
}

function Reveal({ children, delay = 0, y = 40 }: { children: React.ReactNode; delay?: number; y?: number }) {
    const ref = useRef<HTMLDivElement | null>(null)
    const inView = useInView(ref, { once: true, margin: "-60px" })
    const reduceMotion = useReducedMotion()
    const initial = reduceMotion ? { opacity: 0 } : { opacity: 0, y }
    const animate = inView ? (reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }) : {}
    return (
        <motion.div ref={ref} initial={initial} animate={animate} transition={{ ...TRANSITION_BASE, delay }}>
            {children}
        </motion.div>
    )
}

function Marquee({ items, speed = 35, ariaLabel }: { items: string[]; speed?: number; ariaLabel?: string }) {
    const reduceMotion = useReducedMotion()
    const tripled = useMemo(() => [...items, ...items, ...items], [items])
    return (
        <div aria-label={ariaLabel} style={{ overflow: "hidden", width: "100%", maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
            <motion.div aria-hidden="true" animate={reduceMotion ? undefined : { x: ["0%", "-33.333%"] }} transition={reduceMotion ? undefined : { duration: speed, repeat: Infinity, ease: "linear" }} style={{ display: "flex", gap: 40, width: "max-content", alignItems: "center" }}>
                {tripled.map((item, index) => (
                    <React.Fragment key={`${item}-${index}`}>
                        <span style={{ fontFamily: DISPLAY, fontSize: 72, fontWeight: 800, color: "rgba(255,255,255,0.06)", letterSpacing: -3, textTransform: "uppercase", whiteSpace: "nowrap", userSelect: "none" }}>{item}</span>
                        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.10)", display: "inline-block", flexShrink: 0 }} />
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    )
}

function Counter({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
    const ref = useRef<HTMLDivElement | null>(null)
    const inView = useInView(ref, { once: true, margin: "-40px" })
    const reduceMotion = useReducedMotion()
    const parsed = value.match(/^([+\-]?)(\d+\.?\d*)(.*)$/)
    const prefix = parsed ? parsed[1] : ""
    const numericValue = parsed ? parseFloat(parsed[2]) : 0
    const suffix = parsed ? parsed[3] : value
    const decimals = parsed && parsed[2].includes(".") ? (parsed[2].split(".")[1] || "").length : 0
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!inView) return
        if (reduceMotion) { setCount(numericValue); return }
        let raf = 0
        const timeout = window.setTimeout(() => {
            const duration = 2200
            const start = performance.now()
            const tick = (now: number) => {
                const progress = Math.min((now - start) / duration, 1)
                const eased = 1 - Math.pow(1 - progress, 4)
                const current = eased * numericValue
                setCount(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current))
                if (progress < 1) raf = requestAnimationFrame(tick)
            }
            raf = requestAnimationFrame(tick)
        }, delay * 1000)
        return () => { clearTimeout(timeout); cancelAnimationFrame(raf) }
    }, [inView, reduceMotion, numericValue, delay, decimals])

    const visibleValue = inView ? `${prefix}${decimals > 0 ? count.toFixed(decimals) : count}${suffix}` : `${prefix}0${suffix}`

    return (
        <div ref={ref} style={{ textAlign: "center" }} aria-label={`${label} : ${value}`}>
            <div aria-hidden="true" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: COLORS.text, lineHeight: 1, marginBottom: 8, letterSpacing: -3, fontVariantNumeric: "tabular-nums" }}>{visibleValue}</div>
            <div className="sr-only">{`${label} : ${value}`}</div>
            <div style={{ fontSize: 11, color: COLORS.textSubtle, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", fontFamily: BODY }}>{label}</div>
        </div>
    )
}

function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
    const p = platform.toLowerCase()
    const color = "rgba(255,255,255,0.74)"
    if (p === "youtube") return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
    if (p === "instagram") return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none" /></svg>
    if (p === "tiktok") return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
    if (p === "snapchat") return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8 2 6 5 6 8v2c-1 0-2 .5-2 1s1 1 2 1c-.5 2-2 3-4 4 0 .5.5 1 2 1 0 .5 0 1 .5 1.5S6 19 8 19.5c0 1 .5 2.5 4 2.5s4-1.5 4-2.5c2-.5 3-1 3.5-1.5s.5-1 .5-1.5c1.5 0 2-.5 2-1-2-1-3.5-2-4-4 1 0 2-.5 2-1s-1-1-2-1V8c0-3-2-6-6-6z" /></svg>
    return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75"><circle cx="12" cy="12" r="10" /></svg>
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
    return <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", color: COLORS.textGhost, margin: "0 0 14px 0", fontFamily: BODY }}>{children}</p>
}

function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
    return <h2 id={id} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px, 4.5vw, 58px)", color: COLORS.text, lineHeight: 1, letterSpacing: -3, margin: 0 }}>{children}</h2>
}

function safeExternalHref(url: string) {
    if (!url) return "#"
    const trimmed = url.trim()
    if (trimmed.startsWith("/") || trimmed.startsWith("#") || trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) return trimmed
    try { return new URL(trimmed).href } catch { return "#" }
}

export default function TalentRilesFreestyle() {
    const heroImage = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&q=80"
    const heroImageAlt = "Portrait de Riles Freestyle"
    const name = "Riles Freestyle"
    const alias = "Sensei"
    const handle = "@rilesfreestyle"
    const tagline = "Football · Freestyle · Futsal · Analyse · Culture"
    const bio = "Le nouveau visage du freestyle français. Riles mêle technique balle au pied, analyse footballistique passionnée et références manga pour créer un univers unique. Grand frère de quartier à la fois accessible et hyper talentueux, il est là pour régaler les yeux et transmettre sa passion."
    const location = "Bondy, Seine-Saint-Denis (93)"
    const stat1 = "1.2M+"; const stat1Label = "Abonnés YouTube"
    const stat2 = "200K"; const stat2Label = "Abonnés Instagram"
    const stat3 = "1.3M"; const stat3Label = "Abonnés TikTok"
    const stat4 = "139M+"; const stat4Label = "Vues totales"
    const stat5 = "61K"; const stat5Label = "Abonnés Snap"
    const stat6 = "6.1%"; const stat6Label = "Taux d'engagement"
    const ascensionText = "Riles est souvent présenté comme le nouveau visage du freestyle français. Son empire YouTube dépasse 1,2 million d'abonnés, et ses vidéos de futsal tournées dans les gymnases de Bondy sont devenues une référence. Il a su créer un pont unique entre le football de rue, l'analyse tactique et la culture manga."
    const categories = "Football, Freestyle, Futsal, Analyse Sportive, Manga, Engagement"
    const brandsWorked = "PSG, Canal+, SNCF, Sport, Équipementiers, Tech, Food, Formation"
    const manifesto = "Riles ne fait pas que jongler. Il inspire. Quand plus d'un million de personnes suivent chacune de ses vidéos, c'est parce qu'il incarne quelque chose de vrai : la passion du foot, l'accessibilité et le travail."
    const ctaTitle = "Collaborer avec Riles."
    const ctaDesc = "Placement, challenge, ambassadeur, activation terrain : discutons de la meilleure manière pour votre marque d'entrer dans l'univers Riles Freestyle."
    const ctaUrl = "#"
    const ctaLabel = "Proposer une collaboration avec Riles Freestyle"

    useFontsAndGlobalStyles()

    const reduceMotion = useReducedMotion()
    const heroId = useId()
    const statsId = useId()
    const platformsId = useId()
    const pillarsId = useId()
    const collabsId = useId()
    const sectorsId = useId()
    const manifestoId = useId()
    const ctaId = useId()

    const catList = useMemo(() => categories.split(",").map((i) => i.trim()).filter(Boolean), [])
    const brandList = useMemo(() => brandsWorked.split(",").map((i) => i.trim()).filter(Boolean), [])
    const finalCtaUrl = useMemo(() => safeExternalHref(ctaUrl), [])

    const getMotionHover = useCallback(
        (hoverStyles: Record<string, string | number>) => reduceMotion ? undefined : hoverStyles,
        [reduceMotion]
    )

    const platforms: PlatformItem[] = [
        { name: "YouTube", followers: "1.2M+", desc: "Plateforme empire. La chaîne 'Les Vidéos de Riles' est le cœur de son contenu : futsal immersif, tutoriels techniques, débriefs tactiques et vlogs. Le format long est sa force.", main: true },
        { name: "TikTok", followers: "1.3M", desc: "Vitrine virale pour les formats courts. Dribbles, petits ponts, gestes techniques impossibles : l'algorithme adore ce genre de contenu." },
        { name: "Instagram", followers: "200.9K", desc: "Vitrine visuelle : highlights de ses matchs, behind the scenes des tournages et prises de position sur l'actualité foot." },
        { name: "Snapchat", followers: "61.9K", desc: "Contenu quotidien plus intime, coulisses de sa vie de freestyler et interactions directes avec sa communauté." },
    ]

    const pillars: PillarItem[] = [
        { title: "Le Terrain", desc: "Vidéos immersives de futsal tournées dans les gymnases de banlieue parisienne, tutoriels pour maîtriser le ballon, défis techniques contre d'autres freestylers. Le cœur de son contenu.", icon: "⚽" },
        { title: "L'Analyse Sportive", desc: "Il troque ses crampons pour le micro et débriefe l'actu foot avec un parti pris assumé pour le Real Madrid. Décryptages, débats, réactions : du contenu passionné et clivant.", icon: "🎙️" },
        { title: "La Pop Culture", desc: "Il saupoudre tout de références manga, notamment Captain Tsubasa, qui parlent directement à la jeune génération. Le foot rencontre l'anime, et ça marche.", icon: "🎌" },
        { title: "L'Engagement Solidaire", desc: "Derrière les passements de jambes, il y a aussi des valeurs. Il prête son image à des initiatives solidaires tournées vers l'inclusion des jeunes par le sport.", icon: "💛" },
    ]

    const collabs: CollabItem[] = [
        { title: "Placement de produit", desc: "Intégration naturelle dans ses vidéos YouTube, stories et contenus courts : équipements, applications, boissons, tech." },
        { title: "Défi / Challenge sponsorisé", desc: "Création d'un défi technique autour de votre marque, dans un format viral avec potentiel de reprise." },
        { title: "Ambassadeur de marque", desc: "Partenariat long terme avec apparitions régulières, contenu dédié et représentation lors d'événements sportifs." },
        { title: "Activation terrain", desc: "Organisation d'un tournoi de futsal, clinic ou meet & greet sponsorisé par votre marque." },
    ]

    return (
        <main className="talent-riles-root" aria-labelledby={heroId} style={{ width: "100%", background: COLORS.bg, color: COLORS.textBody, fontFamily: BODY, overflowX: "hidden", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}>
            <a href={`#${ctaId}`} className="sr-only">Aller directement à la section de contact</a>

            {/* HERO */}
            <header className="tr-hero">
                <div className="tr-hero-copy" style={{ padding: "80px 72px" }}>
                    <Reveal delay={0.05} y={20}>
                        <p style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 24px 0", flexWrap: "wrap" }}>
                            <span style={{ padding: "6px 14px", borderRadius: 100, background: COLORS.panelStrong, border: `1px solid ${COLORS.border}`, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textSubtle }}>{alias}</span>
                            <span style={{ fontSize: 12, color: COLORS.textSubtle }}>{handle}</span>
                        </p>
                    </Reveal>
                    <Reveal delay={0.12} y={36}>
                        <h1 id={heroId} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(48px, 6vw, 90px)", lineHeight: 0.92, color: COLORS.text, margin: 0, letterSpacing: -4 }}>{name}</h1>
                    </Reveal>
                    <Reveal delay={0.18} y={24}>
                        <p style={{ margin: "18px 0 0 0", fontSize: 14, lineHeight: 1.8, maxWidth: 620, color: COLORS.textMuted, fontWeight: 500 }}>{tagline}</p>
                    </Reveal>
                    <Reveal delay={0.24} y={16}>
                        <ul aria-label="Catégories de contenu" style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "24px 0 0 0", padding: 0, listStyle: "none" }}>
                            {catList.map((cat) => (
                                <li key={cat}><span style={{ display: "inline-flex", padding: "6px 16px", borderRadius: 100, border: `1px solid ${COLORS.border}`, background: COLORS.panelSoft, fontSize: 10, fontWeight: 600, color: COLORS.textSoft, letterSpacing: 1, textTransform: "uppercase" }}>{cat}</span></li>
                            ))}
                        </ul>
                    </Reveal>
                    <Reveal delay={0.3} y={20}>
                        <p style={{ marginTop: 28, fontSize: 15, lineHeight: 1.9, maxWidth: 540, color: COLORS.textBody, fontWeight: 300 }}>{bio}</p>
                    </Reveal>
                    <Reveal delay={0.36} y={16}>
                        <p style={{ margin: "24px 0 0 0", display: "flex", alignItems: "center", gap: 8, color: COLORS.textMuted, fontSize: 12, letterSpacing: 0.4 }}>
                            <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.72)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            <span>{location}</span>
                        </p>
                    </Reveal>
                    <Reveal delay={0.42} y={14}>
                        <ul aria-label="Plateformes principales" style={{ margin: "32px 0 0 0", padding: 0, listStyle: "none", display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {["YouTube", "TikTok", "Instagram", "Snapchat"].map((platform) => (
                                <li key={platform}><span title={platform} aria-label={platform} style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.panelSoft, border: `1px solid ${COLORS.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><PlatformIcon platform={platform} size={18} /></span></li>
                            ))}
                        </ul>
                    </Reveal>
                </div>

                <Reveal delay={0.18} y={0}>
                    <div className="tr-hero-media" style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
                        <img src={heroImage} alt={heroImageAlt} loading="eager" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #000 0%, transparent 32%)", pointerEvents: "none" }} />
                        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 34%)", pointerEvents: "none" }} />
                    </div>
                </Reveal>
            </header>

            <div aria-hidden="true" style={{ paddingTop: 8 }}>
                <Marquee items={["Riles Freestyle", "Sensei", "YouTube 1.2M", "Futsal", "Bondy", "Real Madrid", "Captain Tsubasa", "139M vues"]} speed={40} />
            </div>

            {/* STATS */}
            <section aria-labelledby={statsId} className="tr-section-padding" style={{ padding: "100px 72px", position: "relative" }}>
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.025) 0%, transparent 70%)", pointerEvents: "none" }} />
                <Reveal>
                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <SectionEyebrow>En chiffres</SectionEyebrow>
                        <SectionTitle id={statsId}>L&apos;audience <span style={{ color: COLORS.textUltraGhost }}>Riles.</span></SectionTitle>
                    </div>
                </Reveal>
                <Reveal delay={0.04}>
                    <div className="tr-grid-6" style={{ maxWidth: 1200, margin: "0 auto" }}>
                        <Counter value={stat1} label={stat1Label} delay={0} />
                        <Counter value={stat2} label={stat2Label} delay={0.06} />
                        <Counter value={stat3} label={stat3Label} delay={0.12} />
                        <Counter value={stat4} label={stat4Label} delay={0.18} />
                        <Counter value={stat5} label={stat5Label} delay={0.24} />
                        <Counter value={stat6} label={stat6Label} delay={0.3} />
                    </div>
                </Reveal>
            </section>

            {/* PLATFORMS */}
            <section aria-labelledby={platformsId} className="tr-section-padding" style={{ padding: "40px 72px 80px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Reveal>
                        <SectionEyebrow>Plateformes</SectionEyebrow>
                        <div style={{ marginBottom: 48 }}><SectionTitle id={platformsId}>Son empire digital.</SectionTitle></div>
                    </Reveal>
                    <div className="tr-grid-4">
                        {platforms.map((platform, index) => (
                            <Reveal key={platform.name} delay={index * 0.05}>
                                <motion.article whileHover={getMotionHover({ backgroundColor: "rgba(255,255,255,0.035)", borderColor: "rgba(255,255,255,0.11)" })} transition={{ duration: 0.3 }} style={{ background: COLORS.panel, border: `1px solid ${platform.main ? COLORS.borderStrong : COLORS.border}`, borderRadius: 20, padding: "36px 24px", position: "relative", overflow: "hidden", minHeight: 255 }}>
                                    {platform.main && <p style={{ position: "absolute", top: 12, right: 14, padding: "4px 10px", borderRadius: 100, background: COLORS.panelStrong, fontSize: 8, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textSoft, margin: 0 }}>Empire</p>}
                                    <div style={{ marginBottom: 16 }}><PlatformIcon platform={platform.name} size={24} /></div>
                                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, color: COLORS.text, letterSpacing: -0.3, margin: "0 0 4px 0" }}>{platform.name}</h3>
                                    <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: COLORS.text, letterSpacing: -2, lineHeight: 1, margin: "0 0 14px 0" }}>{platform.followers}</p>
                                    <p style={{ fontSize: 13, lineHeight: 1.75, color: COLORS.textBody, fontWeight: 300, margin: 0 }}>{platform.desc}</p>
                                </motion.article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ASCENSION */}
            <section className="tr-section-padding" aria-label="Présentation de l'ascension de Riles Freestyle" style={{ padding: "80px 72px", display: "flex", justifyContent: "center" }}>
                <Reveal>
                    <figure style={{ maxWidth: 820, textAlign: "center", margin: 0 }}>
                        <SectionEyebrow>L&apos;ascension</SectionEyebrow>
                        <blockquote style={{ fontFamily: DISPLAY, fontSize: "clamp(20px, 2.8vw, 34px)", fontWeight: 300, lineHeight: 1.55, color: COLORS.textSoft, margin: 0, letterSpacing: -0.4, fontStyle: "italic" }}>{ascensionText}</blockquote>
                        <motion.div aria-hidden="true" initial={reduceMotion ? undefined : { width: 0 }} whileInView={reduceMotion ? undefined : { width: 60 }} viewport={{ once: true }} transition={reduceMotion ? undefined : { duration: 1, delay: 0.3, ease: EASE }} style={{ width: reduceMotion ? 60 : undefined, height: 2, background: "rgba(255,255,255,0.18)", margin: "36px auto 0" }} />
                    </figure>
                </Reveal>
            </section>

            {/* CONTENT PILLARS */}
            <section aria-labelledby={pillarsId} className="tr-section-padding" style={{ padding: "40px 72px 80px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Reveal>
                        <SectionEyebrow>Le contenu</SectionEyebrow>
                        <div style={{ marginBottom: 48 }}><SectionTitle id={pillarsId}>Le mix <span style={{ color: COLORS.textUltraGhost }}>gagnant.</span></SectionTitle></div>
                    </Reveal>
                    <div className="tr-grid-2">
                        {pillars.map((pillar, index) => (
                            <Reveal key={pillar.title} delay={index * 0.06}>
                                <motion.article whileHover={getMotionHover({ backgroundColor: "rgba(255,255,255,0.035)" })} transition={{ duration: 0.3 }} style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: "40px 32px", display: "flex", gap: 20, alignItems: "flex-start", minHeight: 230 }}>
                                    <span aria-hidden="true" style={{ fontSize: 34, flexShrink: 0, lineHeight: 1 }}>{pillar.icon}</span>
                                    <div>
                                        <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: COLORS.text, letterSpacing: -0.5, margin: "0 0 12px 0", lineHeight: 1.2 }}>{pillar.title}</h3>
                                        <p style={{ fontSize: 14, lineHeight: 1.85, color: COLORS.textBody, fontWeight: 300, margin: 0 }}>{pillar.desc}</p>
                                    </div>
                                </motion.article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <div aria-hidden="true" style={{ padding: "40px 0" }}>
                <Marquee items={["Futsal", "Freestyle", "Real Madrid", "Vinicius Jr", "Captain Tsubasa", "Bondy", "Giftasso", "Sensei"]} speed={30} />
            </div>

            {/* COLLABORATION */}
            <section aria-labelledby={collabsId} className="tr-section-padding" style={{ padding: "80px 72px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Reveal>
                        <SectionEyebrow>Collaborer</SectionEyebrow>
                        <div style={{ marginBottom: 48 }}><SectionTitle id={collabsId}>Formats de <span style={{ color: COLORS.textUltraGhost }}>collaboration.</span></SectionTitle></div>
                    </Reveal>
                    <div className="tr-grid-4">
                        {collabs.map((collab, index) => (
                            <Reveal key={collab.title} delay={index * 0.05}>
                                <motion.article whileHover={getMotionHover({ backgroundColor: "rgba(255,255,255,0.035)", borderColor: "rgba(255,255,255,0.11)" })} transition={{ duration: 0.3 }} style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "40px 24px", textAlign: "center", minHeight: 230, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                    <p aria-hidden="true" style={{ fontFamily: DISPLAY, fontSize: 56, fontWeight: 800, color: "rgba(255,255,255,0.06)", lineHeight: 1, margin: "0 0 16px 0" }}>{String(index + 1).padStart(2, "0")}</p>
                                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, color: COLORS.text, margin: "0 0 12px 0", letterSpacing: -0.3 }}>{collab.title}</h3>
                                    <p style={{ fontSize: 12, lineHeight: 1.8, color: COLORS.textBody, fontWeight: 300, margin: 0, maxWidth: 220 }}>{collab.desc}</p>
                                </motion.article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTORS */}
            <section aria-labelledby={sectorsId} className="tr-section-padding" style={{ padding: "40px 72px 80px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <Reveal>
                        <SectionEyebrow>Secteurs d&apos;activité</SectionEyebrow>
                        <h2 id={sectorsId} className="sr-only">Secteurs d&apos;activité visés</h2>
                        <ul style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: 0, padding: 0, listStyle: "none" }}>
                            {brandList.map((brand, index) => (
                                <motion.li key={brand} initial={reduceMotion ? undefined : { opacity: 0, y: 10 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={reduceMotion ? undefined : { duration: 0.4, delay: index * 0.05, ease: EASE }} style={{ padding: "10px 24px", borderRadius: 100, border: `1px solid ${COLORS.borderStrong}`, background: COLORS.panelSoft, fontSize: 12, fontWeight: 600, color: COLORS.textSoft, letterSpacing: 1, textTransform: "uppercase" }}>
                                    {brand}
                                </motion.li>
                            ))}
                        </ul>
                    </Reveal>
                </div>
            </section>

            {/* MANIFESTO */}
            <section aria-labelledby={manifestoId} className="tr-section-padding" style={{ padding: "100px 72px", display: "flex", justifyContent: "center" }}>
                <Reveal>
                    <figure style={{ maxWidth: 820, textAlign: "center", margin: 0 }}>
                        <SectionEyebrow>Pourquoi Riles</SectionEyebrow>
                        <h2 id={manifestoId} className="sr-only">Pourquoi collaborer avec Riles Freestyle</h2>
                        <blockquote style={{ fontFamily: DISPLAY, fontSize: "clamp(22px, 3vw, 38px)", fontWeight: 300, lineHeight: 1.5, color: COLORS.textSoft, margin: 0, letterSpacing: -0.8, fontStyle: "italic" }}>{manifesto}</blockquote>
                        <motion.div aria-hidden="true" initial={reduceMotion ? undefined : { width: 0 }} whileInView={reduceMotion ? undefined : { width: 60 }} viewport={{ once: true }} transition={reduceMotion ? undefined : { duration: 1, delay: 0.3, ease: EASE }} style={{ width: reduceMotion ? 60 : undefined, height: 2, background: "rgba(255,255,255,0.18)", margin: "36px auto 0" }} />
                    </figure>
                </Reveal>
            </section>

            {/* CTA */}
            <section id={ctaId} aria-labelledby={`${ctaId}-title`} className="tr-section-padding" style={{ textAlign: "center", padding: "120px 72px", position: "relative" }}>
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center bottom, rgba(255,255,255,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />
                <Reveal>
                    <h2 id={`${ctaId}-title`} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(44px, 7vw, 100px)", lineHeight: 0.95, margin: "0 0 20px 0", letterSpacing: -4, color: COLORS.text }}>{ctaTitle}</h2>
                </Reveal>
                <Reveal delay={0.08}>
                    <p style={{ fontSize: 15, color: COLORS.textBody, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.8, fontWeight: 300 }}>{ctaDesc}</p>
                </Reveal>
                <Reveal delay={0.16}>
                    <motion.a href={finalCtaUrl} aria-label={ctaLabel} whileHover={getMotionHover({ y: -3, backgroundColor: "#FFFFFF", color: "#000000" })} whileTap={reduceMotion ? undefined : { scale: 0.98 }} transition={{ duration: 0.35, ease: EASE }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 52, padding: "18px 42px", background: "transparent", color: COLORS.text, fontFamily: DISPLAY, fontWeight: 700, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", textDecoration: "none", borderRadius: 100, border: "1px solid rgba(255,255,255,0.24)" }}>
                        <span>Proposer une collab</span>
                        <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </motion.a>
                </Reveal>
            </section>

            <footer className="tr-footer tr-section-padding" style={{ padding: "28px 72px", borderTop: `1px solid ${COLORS.border}` }}>
                <p style={{ fontSize: 10, color: COLORS.textGhost, letterSpacing: 4, margin: 0, fontWeight: 700, fontFamily: DISPLAY }}>JUST IMPACT<span style={{ color: COLORS.textMuted }}>.</span> © 2026</p>
                <p style={{ fontSize: 10, color: COLORS.textSubtle, letterSpacing: 3, margin: 0, fontFamily: BODY }}>Paris, France</p>
            </footer>
        </main>
    )
}