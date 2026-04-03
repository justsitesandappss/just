"use client"

import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { motion, useInView, useReducedMotion, type Transition } from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const C = {
  bg: "#000000", panel: "#0b0b0b", panelSoft: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.10)", borderStrong: "rgba(255,255,255,0.16)",
  text: "#ffffff", textSoft: "rgba(255,255,255,0.86)", textBody: "rgba(255,255,255,0.78)",
  textMuted: "rgba(255,255,255,0.64)", textSubtle: "rgba(255,255,255,0.52)",
  textGhost: "rgba(255,255,255,0.14)", chipBg: "rgba(255,255,255,0.05)",
  chipBorder: "rgba(255,255,255,0.10)", buttonBorder: "rgba(255,255,255,0.22)",
  buttonBgHover: "#ffffff", buttonTextHover: "#000000", focus: "#ffffff",
} as const

function makeTransition(reducedMotion: boolean, duration = 0.8, delay = 0): Transition {
  return reducedMotion ? { duration: 0 } : { duration, delay, ease: EASE }
}

function Reveal({ children, delay = 0, y = 32 }: { children: ReactNode; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const reducedMotion = useReducedMotion()
  return (
    <motion.div ref={ref} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y }} animate={isInView ? (reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }) : undefined} transition={makeTransition(!!reducedMotion, 0.85, delay)}>
      {children}
    </motion.div>
  )
}

function Marquee({ items, speed = 35, ariaLabel }: { items: string[]; speed?: number; ariaLabel: string }) {
  const reducedMotion = useReducedMotion()
  const repeatedItems = [...items, ...items, ...items]
  return (
    <div aria-label={ariaLabel} role="presentation" style={{ overflow: "hidden", width: "100%", maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
      <span className="sr-only">{items.join(", ")}</span>
      <motion.div aria-hidden="true" animate={reducedMotion ? undefined : { x: ["0%", "-33.333%"] }} transition={reducedMotion ? undefined : { duration: speed, repeat: Infinity, ease: "linear" }} style={{ display: "flex", gap: 40, width: "max-content", alignItems: "center" }}>
        {repeatedItems.map((item, index) => (
          <Fragment key={`${item}-${index}`}>
            <span style={{ fontFamily: DISPLAY, fontSize: "clamp(38px, 7vw, 72px)", fontWeight: 800, color: "rgba(255,255,255,0.06)", letterSpacing: -2, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 }}>{item}</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.14)", display: "inline-block", flexShrink: 0 }} />
          </Fragment>
        ))}
      </motion.div>
    </div>
  )
}

function Counter({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const reducedMotion = useReducedMotion()
  const match = value.match(/^([+\-]?)(\d+\.?\d*)(.*)$/)
  const prefix = match ? match[1] : ""
  const rawNumber = match ? parseFloat(match[2]) : 0
  const suffix = match ? match[3] : value
  const decimalPlaces = match && match[2].includes(".") ? (match[2].split(".")[1] || "").length : 0
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isInView) return
    if (reducedMotion) { setCount(rawNumber); return }
    let frame = 0
    const timeout = window.setTimeout(() => {
      const duration = 2200, start = performance.now()
      const run = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        const current = eased * rawNumber
        setCount(decimalPlaces > 0 ? parseFloat(current.toFixed(decimalPlaces)) : Math.floor(current))
        if (progress < 1) frame = requestAnimationFrame(run)
      }
      frame = requestAnimationFrame(run)
    }, delay * 1000)
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame) }
  }, [isInView, reducedMotion, rawNumber, delay, decimalPlaces])
  const displayValue = isInView ? `${prefix}${decimalPlaces > 0 ? count.toFixed(decimalPlaces) : count}${suffix}` : `${prefix}0${suffix}`
  return (
    <div ref={ref} style={{ textAlign: "center", padding: "8px 6px" }}>
      <p aria-label={`${label} : ${value}`} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(36px, 6vw, 56px)", color: C.text, lineHeight: 1, margin: "0 0 10px", letterSpacing: -2, fontVariantNumeric: "tabular-nums" }}>{displayValue}</p>
      <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", fontFamily: BODY }}>{label}</p>
    </div>
  )
}

function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const p = platform.toLowerCase()
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": "true" as const, focusable: "false" as const }
  if (p === "snapchat") return <svg {...common}><path d="M12 2C8 2 6 5 6 8v2c-1 0-2 .5-2 1s1 1 2 1c-.5 2-2 3-4 4 0 .5.5 1 2 1 0 .5 0 1 .5 1.5S6 19 8 19.5c0 1 .5 2.5 4 2.5s4-1.5 4-2.5c2-.5 3-1 3.5-1.5s.5-1 .5-1.5c1.5 0 2-.5 2-1-2-1-3.5-2-4-4 1 0 2-.5 2-1s-1-1-2-1V8c0-3-2-6-6-6z" /></svg>
  if (p === "instagram") return <svg {...common}><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
  if (p === "tiktok") return <svg {...common}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
  if (p === "youtube") return <svg {...common}><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
  return <svg {...common}><circle cx="12" cy="12" r="10" /></svg>
}

function SectionIntro({ eyebrow, title, mutedWord, id }: { eyebrow: string; title: string; mutedWord?: string; id: string }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.textMuted, margin: "0 0 14px" }}>{eyebrow}</p>
      <h2 id={id} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(30px, 4.5vw, 58px)", color: C.text, lineHeight: 1, letterSpacing: -2, margin: 0 }}>
        {title}{" "}{mutedWord ? <span style={{ color: C.textGhost }}>{mutedWord}</span> : null}
      </h2>
    </div>
  )
}

export default function KarimLiptonPage() {
  const reducedMotion = useReducedMotion()

  const statsId = useId(), platformsId = useId(), ascensionId = useId()
  const pillarsId = useId(), collabsId = useId(), sectorsId = useId()
  const manifestoId = useId(), ctaId = useId()

  const catList = ["Humour", "Voyage", "Lifestyle", "Divertissement", "Storytelling"]
  const brandList = ["E-commerce", "Formation", "Tech", "Food", "Mode", "Voyage"]

  const platforms = useMemo(() => [
    { name: "Snapchat", followers: "1.3–1.5M", desc: "Plateforme principale. +1M de vues en moins de 24h de manière régulière. Contenu quotidien, stories immersives, storytelling en temps réel.", main: true },
    { name: "Instagram", followers: "1.4M", desc: "Photos lifestyle, behind the scenes, et communication directe avec sa communauté via les stories.", main: false },
    { name: "TikTok", followers: "650.7K", desc: "Contenus courts, extraits viraux de ses aventures Snapchat. Formats humoristiques et pranks qui performent fort dans l'algorithme.", main: false },
    { name: "YouTube", followers: "100K", desc: "Rediffusions longues de ses concepts, vlogs de voyage et compilations de ses meilleurs moments.", main: false },
  ], [])

  const pillars = useMemo(() => [
    { title: "Téléréalité 2.0", desc: "Sa vie amoureuse tumultueuse est son fond de commerce principal : ruptures scénarisées, fausses demandes en mariage, crises de jalousie avec sa compagne Inès et rebondissements avec son ex-fiancée Ismo.", icon: "❤️‍🔥" },
    { title: "Les Concepts", desc: "Karim organise régulièrement des concepts dignes d'émissions TV : voyages, villas, défis, cast récurrent et narration feuilletonnante.", icon: "🎬" },
    { title: "Le Bienfaiteur", desc: "Distribution d'argent, cadeaux, surprises pour sa communauté. Un format émotionnel qui pousse fort l'engagement.", icon: "🎁" },
    { title: "La Team Lipton", desc: "Une bande récurrente qui donne une vraie logique de série au contenu. Chaque personnage nourrit l'attachement audience.", icon: "👥" },
  ], [])

  const collabs = useMemo(() => [
    { title: "Placement de produit", desc: "Intégration naturelle dans le contenu quotidien de Karim via stories, vlogs et formats courts." },
    { title: "Concept dédié", desc: "Création d'un concept sur mesure autour de votre marque avec mise en scène et narration intégrée." },
    { title: "Événement & Activation", desc: "Présence physique, meet & greet, activation en point de vente avec la communauté." },
    { title: "Série sponsorisée", desc: "Plusieurs épisodes dédiés à votre marque pour installer un vrai récit dans la durée." },
  ], [])

  useEffect(() => {
    if (typeof document === "undefined") return
    if (!document.getElementById("talent-karim-fonts")) {
      const l = document.createElement("link")
      l.id = "talent-karim-fonts"
      l.rel = "stylesheet"
      l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap"
      document.head.appendChild(l)
    }
  }, [])

  return (
    <div style={{ width: "100%", background: C.bg, color: C.textBody, fontFamily: BODY, overflowX: "hidden", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", position: "relative" }}>
      <style>{`
        .talent-karim-root * { box-sizing: border-box; }
        .sr-only { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; white-space: nowrap !important; border: 0 !important; }
        .skip-link { position: absolute; left: 16px; top: 16px; z-index: 30; transform: translateY(-140%); transition: transform 0.2s ease; background: #fff; color: #000; text-decoration: none; font-family: ${BODY}; font-size: 14px; font-weight: 700; border-radius: 999px; padding: 12px 16px; }
        .skip-link:focus { transform: translateY(0); }
        a:focus-visible, button:focus-visible { outline: 2px solid ${C.focus}; outline-offset: 3px; }
        @media (max-width: 1024px) {
          .karim-hero { grid-template-columns: 1fr !important; min-height: auto !important; }
          .karim-hero-media { height: min(70vh, 700px) !important; order: -1; }
          .karim-platforms-grid, .karim-collabs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .karim-pillars-grid { grid-template-columns: 1fr !important; }
          .karim-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .karim-footer { flex-direction: column !important; gap: 12px; align-items: flex-start !important; }
        }
        @media (max-width: 640px) {
          .karim-platforms-grid, .karim-collabs-grid, .karim-stats-grid { grid-template-columns: 1fr !important; }
          .karim-hero-copy { padding: 32px 20px 48px !important; }
          .karim-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      <a href="#karim-main" className="skip-link">Aller au contenu principal</a>

      {/* HERO */}
      <header aria-label="Présentation de Karim Lipton" className="karim-hero" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "stretch", position: "relative" }}>
        <div className="karim-hero-copy" style={{ padding: "80px 72px", display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: 620 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={makeTransition(!!reducedMotion, 0.7, 0.15)} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <p style={{ margin: 0, padding: "6px 14px", borderRadius: 999, background: C.chipBg, border: `1px solid ${C.chipBorder}`, fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: C.textMuted }}>Karim LPTN</p>
              <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>@karimlipton94</p>
            </motion.div>

            <motion.h1 initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }} transition={makeTransition(!!reducedMotion, 0.9, 0.25)} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(46px, 7vw, 92px)", lineHeight: 0.92, color: C.text, margin: 0, letterSpacing: -4 }}>
              Karim Lipton
            </motion.h1>

            <motion.p initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }} transition={makeTransition(!!reducedMotion, 0.7, 0.38)} style={{ margin: "18px 0 0", fontSize: 16, lineHeight: 1.75, color: C.textSoft, fontWeight: 400, maxWidth: 560 }}>
              Humour · Voyage · Lifestyle · Storytelling
            </motion.p>

            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={makeTransition(!!reducedMotion, 0.6, 0.48)} aria-label="Catégories de contenu" style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "24px 0 0", padding: 0, listStyle: "none" }}>
              {catList.map((cat, i) => (
                <li key={`${cat}-${i}`}>
                  <span style={{ display: "inline-flex", padding: "7px 14px", borderRadius: 999, border: `1px solid ${C.chipBorder}`, background: C.chipBg, fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>{cat}</span>
                </li>
              ))}
            </motion.ul>

            <motion.p initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }} transition={makeTransition(!!reducedMotion, 0.7, 0.58)} style={{ marginTop: 28, fontSize: 15, lineHeight: 1.9, maxWidth: 560, color: C.textBody, fontWeight: 400 }}>
              Créateur dynamique et authentique, reconnu pour son sens du divertissement. Karim est un poids lourd de Snapchat avec 1,3 à 1,5 million d'abonnés. Il tape régulièrement le million de vues en moins de 24 heures.
            </motion.p>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={makeTransition(!!reducedMotion, 0.55, 0.68)} style={{ margin: "22px 0 0", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.textMuted }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: C.textMuted, flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>Val-de-Marne (94), France</span>
            </motion.p>

            <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={makeTransition(!!reducedMotion, 0.55, 0.78)} aria-label="Plateformes principales" style={{ margin: "30px 0 0", padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: 12 }}>
              {["Snapchat", "Instagram", "TikTok", "YouTube"].map((platform) => (
                <li key={platform}>
                  <div aria-label={platform} title={platform} style={{ width: 42, height: 42, borderRadius: "50%", background: C.panelSoft, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.textSoft }}>
                    <PlatformIcon platform={platform} size={16} />
                  </div>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>

        <motion.div className="karim-hero-media" initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03 }} animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }} transition={makeTransition(!!reducedMotion, 1, 0.2)} style={{ height: "100vh", position: "relative", overflow: "hidden", background: C.panel }}>
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80" alt="Portrait de Karim Lipton" loading="eager" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.15) 34%, transparent 55%)", pointerEvents: "none" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 32%)", pointerEvents: "none" }} />
        </motion.div>
      </header>

      <main id="karim-main">
        <Marquee items={["Karim Lipton", "Team Lipton", "Snapchat", "1M+ vues", "Storytelling", "Humour", "Concepts", "Val-de-Marne"]} speed={40} ariaLabel="Mots-clés liés au talent" />

        {/* STATS */}
        <section className="karim-section" aria-labelledby={statsId} style={{ padding: "100px 72px", position: "relative" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.textMuted, margin: "0 0 14px" }}>En chiffres</p>
                <h2 id={statsId} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 44px)", color: C.text, letterSpacing: -1.5, margin: 0 }}>
                  L'audience <span style={{ color: C.textGhost }}>Karim Lipton.</span>
                </h2>
              </div>
            </Reveal>
            <Reveal>
              <div className="karim-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 32, rowGap: 44 }}>
                <Counter value="1.4M" label="Abonnés Snapchat" delay={0} />
                <Counter value="650K" label="Abonnés TikTok" delay={0.06} />
                <Counter value="100K" label="Abonnés YouTube" delay={0.12} />
                <Counter value="7.4M" label="Vues totales" delay={0.18} />
                <Counter value="1M+" label="Vues en -24h" delay={0.24} />
                <Counter value="8.5%" label="Taux d'engagement" delay={0.3} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* PLATEFORMES */}
        <section className="karim-section" aria-labelledby={platformsId} style={{ padding: "40px 72px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal><SectionIntro eyebrow="Plateformes" title="Où il performe." id={platformsId} /></Reveal>
            <div className="karim-platforms-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
              {platforms.map((platform, index) => (
                <Reveal key={platform.name} delay={index * 0.05}>
                  <motion.article aria-label={`${platform.name}, ${platform.followers}`} whileHover={reducedMotion ? undefined : { backgroundColor: "rgba(255,255,255,0.04)", borderColor: C.borderStrong }} transition={makeTransition(!!reducedMotion, 0.25)} style={{ background: C.panelSoft, border: `1px solid ${platform.main ? C.borderStrong : C.border}`, borderRadius: 20, padding: "36px 24px", position: "relative", overflow: "hidden", minHeight: 255 }}>
                    {platform.main && <p style={{ position: "absolute", top: 12, right: 14, margin: 0, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.08)", fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.textMuted }}>Principal</p>}
                    <div style={{ marginBottom: 16, color: C.textSoft }}><PlatformIcon platform={platform.name} size={24} /></div>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 16, color: C.text, letterSpacing: -0.3, margin: "0 0 4px" }}>{platform.name}</h3>
                    <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, color: C.text, letterSpacing: -2, lineHeight: 1, margin: "0 0 14px" }}>{platform.followers}</p>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: C.textBody, fontWeight: 400, margin: 0 }}>{platform.desc}</p>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ASCENSION */}
        <section className="karim-section" aria-labelledby={ascensionId} style={{ padding: "80px 72px", display: "flex", justifyContent: "center" }}>
          <Reveal>
            <div style={{ maxWidth: 860, textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.textMuted, margin: "0 0 28px" }}>L'ascension</p>
              <h2 id={ascensionId} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>L'ascension de Karim Lipton</h2>
              <blockquote style={{ margin: 0 }}>
                <p style={{ fontFamily: DISPLAY, fontSize: "clamp(22px, 2.8vw, 34px)", fontWeight: 400, lineHeight: 1.55, color: C.textSoft, margin: 0, letterSpacing: -0.5, fontStyle: "italic" }}>
                  "Karim a véritablement explosé après avoir été propulsé et validé par Nasdas. Il a repris l'énergie du contenu quotidien, l'effet bande et le storytelling, tout en y ajoutant sa propre mise en scène."
                </p>
              </blockquote>
              <motion.div aria-hidden="true" initial={reducedMotion ? { opacity: 0 } : { width: 0 }} whileInView={reducedMotion ? { opacity: 1 } : { width: 60 }} viewport={{ once: true }} transition={makeTransition(!!reducedMotion, 0.9, 0.2)} style={{ height: 2, width: reducedMotion ? 60 : undefined, background: C.textGhost, margin: "34px auto 0" }} />
            </div>
          </Reveal>
        </section>

        {/* PILIERS */}
        <section className="karim-section" aria-labelledby={pillarsId} style={{ padding: "40px 72px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal><SectionIntro eyebrow="Le contenu" title="Ses piliers" mutedWord="de contenu." id={pillarsId} /></Reveal>
            <div className="karim-pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
              {pillars.map((pillar, index) => (
                <Reveal key={pillar.title} delay={index * 0.06}>
                  <motion.article whileHover={reducedMotion ? undefined : { backgroundColor: "rgba(255,255,255,0.04)" }} transition={makeTransition(!!reducedMotion, 0.25)} style={{ background: C.panelSoft, border: `1px solid ${C.border}`, borderRadius: 24, padding: "40px 32px", display: "flex", gap: 20, alignItems: "flex-start", minHeight: 220 }}>
                    <div aria-hidden="true" style={{ fontSize: 34, flexShrink: 0, lineHeight: 1 }}>{pillar.icon}</div>
                    <div>
                      <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: C.text, letterSpacing: -0.5, margin: "0 0 12px", lineHeight: 1.2 }}>{pillar.title}</h3>
                      <p style={{ fontSize: 14, lineHeight: 1.85, color: C.textBody, fontWeight: 400, margin: 0 }}>{pillar.desc}</p>
                    </div>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div style={{ padding: "40px 0" }}>
          <Marquee items={["Téléréalité 2.0", "Team Lipton", "Concepts TV", "Voyages", "Humour", "Bienfaiteur", "Storytelling"]} speed={30} ariaLabel="Axes éditoriaux du talent" />
        </div>

        {/* COLLABS */}
        <section className="karim-section" aria-labelledby={collabsId} style={{ padding: "80px 72px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal><SectionIntro eyebrow="Collaborer" title="Formats de" mutedWord="collaboration." id={collabsId} /></Reveal>
            <div className="karim-collabs-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
              {collabs.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.05}>
                  <motion.article whileHover={reducedMotion ? undefined : { backgroundColor: "rgba(255,255,255,0.04)", borderColor: C.borderStrong }} transition={makeTransition(!!reducedMotion, 0.25)} style={{ background: C.panelSoft, border: `1px solid ${C.border}`, borderRadius: 20, padding: "36px 24px", textAlign: "center", minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <p aria-hidden="true" style={{ fontFamily: DISPLAY, fontSize: 54, fontWeight: 800, color: "rgba(255,255,255,0.05)", lineHeight: 1, margin: "0 0 14px" }}>{String(index + 1).padStart(2, "0")}</p>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 17, color: C.text, margin: "0 0 10px", letterSpacing: -0.3 }}>{item.title}</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.75, color: C.textBody, fontWeight: 400, margin: 0, maxWidth: 240 }}>{item.desc}</p>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SECTEURS */}
        <section className="karim-section" aria-labelledby={sectorsId} style={{ padding: "40px 72px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.textMuted, margin: "0 0 18px" }}>Secteurs d'activité</p>
              <h2 id={sectorsId} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Secteurs d'activité</h2>
              <ul style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: 0, padding: 0, listStyle: "none" }}>
                {brandList.map((brand, index) => (
                  <motion.li key={`${brand}-${index}`} initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }} whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={makeTransition(!!reducedMotion, 0.35, index * 0.04)}>
                    <span style={{ display: "inline-flex", padding: "10px 20px", borderRadius: 999, border: `1px solid ${C.chipBorder}`, background: C.chipBg, fontSize: 12, fontWeight: 600, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>{brand}</span>
                  </motion.li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* MANIFESTO */}
        <section className="karim-section" aria-labelledby={manifestoId} style={{ padding: "100px 72px", display: "flex", justifyContent: "center" }}>
          <Reveal>
            <div style={{ maxWidth: 860, textAlign: "center" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: C.textMuted, margin: "0 0 28px" }}>Pourquoi Karim</p>
              <h2 id={manifestoId} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>Pourquoi collaborer avec Karim</h2>
              <blockquote style={{ margin: 0 }}>
                <p style={{ fontFamily: DISPLAY, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 400, lineHeight: 1.5, color: C.textSoft, margin: 0, letterSpacing: -0.8, fontStyle: "italic" }}>
                  "Karim ne fait pas de la publicité. Il vit son contenu, et votre marque peut s'y intégrer de manière organique, mémorable et massive."
                </p>
              </blockquote>
              <motion.div aria-hidden="true" initial={reducedMotion ? { opacity: 0 } : { width: 0 }} whileInView={reducedMotion ? { opacity: 1 } : { width: 60 }} viewport={{ once: true }} transition={makeTransition(!!reducedMotion, 0.9, 0.2)} style={{ height: 2, width: reducedMotion ? 60 : undefined, background: C.textGhost, margin: "34px auto 0" }} />
            </div>
          </Reveal>
        </section>

        {/* CTA */}
        <section className="karim-section" aria-labelledby={ctaId} style={{ textAlign: "center", padding: "120px 72px", position: "relative" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center bottom, rgba(255,255,255,0.03) 0%, transparent 60%)", pointerEvents: "none" }} />
          <Reveal>
            <h2 id={ctaId} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(42px, 7vw, 100px)", lineHeight: 0.95, margin: "0 0 18px", letterSpacing: -4, color: C.text }}>Collaborer avec Karim.</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p style={{ fontSize: 15, color: C.textBody, maxWidth: 560, margin: "0 auto 38px", lineHeight: 1.8, fontWeight: 400 }}>
              Placement, concept dédié, activation : discutons de la meilleure façon d'intégrer votre marque dans son univers.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <motion.a href="/contact" aria-label="Proposer une collaboration avec Karim Lipton" whileHover={reducedMotion ? undefined : { y: -2, backgroundColor: C.buttonBgHover, color: C.buttonTextHover }} whileTap={reducedMotion ? undefined : { scale: 0.98 }} transition={makeTransition(!!reducedMotion, 0.25)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 52, padding: "16px 28px", background: "transparent", color: C.text, fontFamily: DISPLAY, fontWeight: 700, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", textDecoration: "none", borderRadius: 999, border: `1px solid ${C.buttonBorder}` }}>
              <span>Proposer une collab</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </motion.a>
          </Reveal>
        </section>
      </main>
    </div>
  )
}