// components/pages/TalentKarimLipton.tsx
"use client"

import * as React from "react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { motion, useInView, useReducedMotion, type Transition } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const C = {
  bg: "#000000",
  panel: "#0b0b0b",
  panelSoft: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#ffffff",
  textSoft: "rgba(255,255,255,0.86)",
  textBody: "rgba(255,255,255,0.78)",
  textMuted: "rgba(255,255,255,0.64)",
  textSubtle: "rgba(255,255,255,0.52)",
  textGhost: "rgba(255,255,255,0.14)",
  chipBg: "rgba(255,255,255,0.05)",
  chipBorder: "rgba(255,255,255,0.10)",
  buttonBorder: "rgba(255,255,255,0.22)",
  buttonBgHover: "#ffffff",
  buttonTextHover: "#000000",
  focus: "#ffffff",
}

const MAX_WIDTH = 1200

// Hook pour charger les fonts
function useFonts() {
  useEffect(() => {
    if (typeof document === "undefined") return
    if (!document.getElementById("talent-fonts")) {
      const link = document.createElement("link")
      link.id = "talent-fonts"
      link.rel = "stylesheet"
      link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap"
      document.head.appendChild(link)
    }
  }, [])
}

function makeTransition(reducedMotion: boolean | null, duration = 0.8, delay = 0): Transition {
  return reducedMotion ? { duration: 0 } : { duration, delay, ease: EASE }
}

// Composant Reveal
function Reveal({ children, delay = 0, y = 32 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y }}
      animate={isInView ? (reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }) : undefined}
      transition={makeTransition(reducedMotion ?? false, 0.85, delay)}
    >
      {children}
    </motion.div>
  )
}

// Composant Marquee
function Marquee({ items, speed = 35, ariaLabel }: { items: string[]; speed?: number; ariaLabel: string }) {
  const reducedMotion = useReducedMotion()
  const repeatedItems = [...items, ...items, ...items]

  return (
    <div
      aria-label={ariaLabel}
      role="presentation"
      className="overflow-hidden w-full"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="sr-only">{items.join(", ")}</div>
      <motion.div
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: ["0%", "-33.333%"] }}
        transition={reducedMotion ? undefined : { duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex gap-10 items-center w-max"
      >
        {repeatedItems.map((item, index) => (
          <React.Fragment key={`${item}-${index}`}>
            <span
              className="whitespace-nowrap uppercase font-extrabold"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(38px, 7vw, 72px)",
                color: "rgba(255,255,255,0.06)",
                letterSpacing: -2,
                lineHeight: 1,
              }}
            >
              {item}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/14 flex-shrink-0" />
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}

// Composant Counter
function Counter({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const reducedMotion = useReducedMotion()

  const match = value.match(/^([+\-]?)(\d+\.?\d*)(.*)$/)
  const prefix = match?.[1] ?? ""
  const rawNumber = match ? parseFloat(match[2]) : 0
  const suffix = match?.[3] ?? value
  const decimalPlaces = match?.[2].includes(".") ? (match[2].split(".")[1] || "").length : 0

  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    if (reducedMotion) {
      setCount(rawNumber)
      return
    }

    const timeout = setTimeout(() => {
      const duration = 2200
      const start = performance.now()
      let frame: number

      const run = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        const current = eased * rawNumber

        setCount(decimalPlaces > 0 ? parseFloat(current.toFixed(decimalPlaces)) : Math.floor(current))

        if (progress < 1) {
          frame = requestAnimationFrame(run)
        }
      }

      frame = requestAnimationFrame(run)
      return () => cancelAnimationFrame(frame)
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [isInView, reducedMotion, rawNumber, delay, decimalPlaces])

  const displayValue = isInView
    ? `${prefix}${decimalPlaces > 0 ? count.toFixed(decimalPlaces) : count}${suffix}`
    : `${prefix}0${suffix}`

  return (
    <div ref={ref} className="text-center px-1.5 py-2">
      <p
        aria-label={`${label} : ${value}`}
        className="font-extrabold leading-none mb-2.5"
        style={{
          fontFamily: DISPLAY,
          fontSize: "clamp(36px, 6vw, 56px)",
          color: C.text,
          letterSpacing: -2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {displayValue}
      </p>
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: C.textMuted, fontFamily: BODY }}
      >
        {label}
      </p>
    </div>
  )
}

// Composant PlatformIcon
function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const p = platform.toLowerCase()
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "text-current",
  }

  if (p === "snapchat") {
    return (
      <svg {...props}>
        <path d="M12 2C8 2 6 5 6 8v2c-1 0-2 .5-2 1s1 1 2 1c-.5 2-2 3-4 4 0 .5.5 1 2 1 0 .5 0 1 .5 1.5S6 19 8 19.5c0 1 .5 2.5 4 2.5s4-1.5 4-2.5c2-.5 3-1 3.5-1.5s.5-1 .5-1.5c1.5 0 2-.5 2-1-2-1-3.5-2-4-4 1 0 2-.5 2-1s-1-1-2-1V8c0-3-2-6-6-6z" />
      </svg>
    )
  }
  if (p === "instagram") {
    return (
      <svg {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (p === "tiktok") {
    return (
      <svg {...props}>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    )
  }
  if (p === "youtube") {
    return (
      <svg {...props}>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    )
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

// SectionIntro
function SectionIntro({ eyebrow, title, mutedWord, id }: { eyebrow: string; title: string; mutedWord?: string; id: string }) {
  return (
    <div className="mb-12">
      <p className="text-xs font-bold uppercase tracking-widest mb-3.5" style={{ color: C.textMuted, letterSpacing: 4 }}>
        {eyebrow}
      </p>
      <h2
        id={id}
        className="font-extrabold leading-none"
        style={{
          fontFamily: DISPLAY,
          fontSize: "clamp(30px, 4.5vw, 58px)",
          color: C.text,
          letterSpacing: -2,
        }}
      >
        {title} {mutedWord && <span style={{ color: C.textGhost }}>{mutedWord}</span>}
      </h2>
    </div>
  )
}

// COMPOSANT PRINCIPAL
export default function TalentKarimLipton() {
  useFonts()
  const reducedMotion = useReducedMotion()

  const ids = {
    main: useId(),
    stats: useId(),
    platforms: useId(),
    ascension: useId(),
    pillars: useId(),
    collabs: useId(),
    sectors: useId(),
    manifesto: useId(),
    cta: useId(),
  }

  const catList = ["Humour", "Voyage", "Lifestyle", "Storytelling"]
  const brandList = ["E-commerce", "Formation", "Tech", "Food", "Mode", "Voyage"]

  const platforms = [
    { name: "Snapchat", followers: "1.3–1.5M", desc: "Plateforme principale. +1M de vues en moins de 24h de manière régulière. Contenu quotidien, stories immersives, storytelling en temps réel.", main: true },
    { name: "Instagram", followers: "1.4M", desc: "Photos lifestyle, behind the scenes, et communication directe avec sa communauté via les stories.", main: false },
    { name: "TikTok", followers: "650.7K", desc: "Contenus courts, extraits viraux de ses aventures Snapchat. Formats humoristiques et pranks qui performent fort dans l'algorithme.", main: false },
    { name: "YouTube", followers: "100K", desc: "Rediffusions longues de ses concepts, vlogs de voyage et compilations de ses meilleurs moments.", main: false },
  ]

  const pillars = [
    { title: "Téléréalité 2.0", desc: "Sa vie amoureuse tumultueuse est son fond de commerce principal : ruptures scénarisées, fausses demandes en mariage, crises de jalousie avec sa compagne Inès et rebondissements avec son ex-fiancée Ismo.", icon: "❤️‍🔥" },
    { title: "Les Concepts", desc: "Karim organise régulièrement des concepts dignes d'émissions TV : voyages, villas, défis, cast récurrent et narration feuilletonnante.", icon: "🎬" },
    { title: "Le Bienfaiteur", desc: "Distribution d'argent, cadeaux, surprises pour sa communauté. Un format émotionnel qui pousse fort l'engagement.", icon: "🎁" },
    { title: "La Team Lipton", desc: "Une bande récurrente qui donne une vraie logique de série au contenu. Chaque personnage nourrit l'attachement audience.", icon: "👥" },
  ]

  const collabs = [
    { title: "Placement de produit", desc: "Intégration naturelle dans le contenu quotidien de Karim via stories, vlogs et formats courts." },
    { title: "Concept dédié", desc: "Création d'un concept sur mesure autour de votre marque avec mise en scène et narration intégrée." },
    { title: "Événement & Activation", desc: "Présence physique, meet & greet, activation en point de vente avec la communauté." },
    { title: "Série sponsorisée", desc: "Plusieurs épisodes dédiés à votre marque pour installer un vrai récit dans la durée." },
  ]

  return (
    <div
      className="talent-karim-root w-full overflow-x-hidden relative"
      style={{
        background: C.bg,
        color: C.textBody,
        fontFamily: BODY,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <style jsx global>{`
        .talent-karim-root * { box-sizing: border-box; }
        .talent-karim-root a:focus-visible,
        .talent-karim-root button:focus-visible {
          outline: 2px solid ${C.focus};
          outline-offset: 3px;
        }
        .talent-karim-root .sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0,0,0,0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }
        .talent-karim-root .skip-link {
          position: absolute;
          left: 16px;
          top: 16px;
          z-index: 30;
          transform: translateY(-140%);
          transition: transform 0.2s ease;
          background: #fff;
          color: #000;
          text-decoration: none;
          font-family: ${BODY};
          font-size: 14px;
          font-weight: 700;
          border-radius: 999px;
          padding: 12px 16px;
        }
        .talent-karim-root .skip-link:focus {
          transform: translateY(0);
        }
        @media (max-width: 1024px) {
          .talent-karim-hero { grid-template-columns: 1fr !important; min-height: auto !important; }
          .talent-karim-hero-media { height: min(70vh, 700px) !important; order: -1; }
          .talent-karim-platforms-grid,
          .talent-karim-collabs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .talent-karim-pillars-grid { grid-template-columns: 1fr !important; }
          .talent-karim-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .talent-karim-footer { flex-direction: column !important; gap: 12px; align-items: flex-start !important; }
        }
        @media (max-width: 640px) {
          .talent-karim-platforms-grid,
          .talent-karim-collabs-grid,
          .talent-karim-stats-grid { grid-template-columns: 1fr !important; }
          .talent-karim-hero-copy { padding: 32px 20px 48px !important; }
          .talent-karim-section { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      <Link href={`#${ids.main}`} className="skip-link">
        Aller au contenu principal
      </Link>

      {/* Back to listing */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/nos-talents"
          className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/30 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour aux talents
        </Link>
      </div>

      {/* HERO */}
      <header
        aria-label="Présentation de Karim Lipton"
        className="talent-karim-hero min-h-screen grid grid-cols-2 items-stretch relative"
        style={{ gridTemplateColumns: "1fr 1fr" }}
      >
        <div className="talent-karim-hero-copy flex items-center" style={{ padding: "80px 72px" }}>
          <div className="w-full max-w-[620px]">
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={makeTransition(reducedMotion ?? false, 0.7, 0.15)}
              className="flex flex-wrap items-center gap-2.5 mb-7"
            >
              <span
                className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase border"
                style={{ background: C.chipBg, borderColor: C.chipBorder, color: C.textMuted, letterSpacing: 2.5 }}
              >
                Karim LPTN
              </span>
              <span className="text-sm" style={{ color: C.textMuted }}>@karimlipton94</span>
            </motion.div>

            <motion.h1
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={makeTransition(reducedMotion ?? false, 0.9, 0.25)}
              className="font-extrabold leading-none mb-4"
              style={{ fontFamily: DISPLAY, fontSize: "clamp(46px, 7vw, 92px)", color: C.text, letterSpacing: -4 }}
            >
              Karim Lipton
            </motion.h1>

            <motion.p
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={makeTransition(reducedMotion ?? false, 0.7, 0.38)}
              className="text-base leading-relaxed mb-6 max-w-[560px]"
              style={{ color: C.textSoft }}
            >
              Humour · Voyage · Lifestyle · Storytelling
            </motion.p>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={makeTransition(reducedMotion ?? false, 0.6, 0.48)}
              className="flex flex-wrap gap-2 mb-6 list-none p-0"
            >
              {catList.map((cat, index) => (
                <li key={`${cat}-${index}`}>
                  <span
                    className="inline-flex px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase border"
                    style={{ background: C.chipBg, borderColor: C.chipBorder, color: C.textMuted, letterSpacing: 1 }}
                  >
                    {cat}
                  </span>
                </li>
              ))}
            </motion.ul>

            <motion.p
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={makeTransition(reducedMotion ?? false, 0.7, 0.58)}
              className="text-base leading-relaxed max-w-[560px] mb-6"
              style={{ color: C.textBody }}
            >
              Créateur dynamique et authentique, reconnu pour son sens du divertissement. Karim est un poids lourd de Snapchat avec 1,3 à 1,5 million d&apos;abonnés. Il tape régulièrement le million de vues en moins de 24 heures.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={makeTransition(reducedMotion ?? false, 0.55, 0.68)}
              className="flex items-center gap-2.5 text-sm mb-8"
              style={{ color: C.textMuted }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Val-de-Marne (94), France</span>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={makeTransition(reducedMotion ?? false, 0.55, 0.78)}
              className="flex flex-wrap gap-3 list-none p-0"
            >
              {["Snapchat", "Instagram", "TikTok", "YouTube"].map((platform) => (
                <li key={platform}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: C.panelSoft, border: `1px solid ${C.border}`, color: C.textSoft }}
                    aria-label={platform}
                    title={platform}
                  >
                    <PlatformIcon platform={platform} size={16} />
                  </div>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>

        <motion.div
          className="talent-karim-hero-media relative overflow-hidden"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={makeTransition(reducedMotion ?? false, 1, 0.2)}
          style={{ height: "100vh", background: C.panel }}
        >
          <Image
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80"
            alt="Portrait de Karim Lipton"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to right, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.15) 34%, transparent 55%)" }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.32) 0%, transparent 32%)" }}
          />
        </motion.div>
      </header>

      <main id={ids.main}>
        <Marquee
          items={["Karim Lipton", "Team Lipton", "Snapchat", "1M+ vues", "Storytelling", "Humour", "Concepts", "Val-de-Marne"]}
          speed={40}
          ariaLabel="Mots-clés liés au talent"
        />

        {/* STATS */}
        <section className="talent-karim-section relative py-24 px-16">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)" }}
          />
          <div className="max-w-[1200px] mx-auto">
            <Reveal>
              <div className="text-center mb-12">
                <p className="text-xs font-bold uppercase tracking-widest mb-3.5" style={{ color: C.textMuted, letterSpacing: 4 }}>
                  En chiffres
                </p>
                <h2
                  id={ids.stats}
                  className="font-extrabold leading-none"
                  style={{ fontFamily: DISPLAY, fontSize: "clamp(28px, 3.5vw, 44px)", color: C.text, letterSpacing: -1.5 }}
                >
                  L&apos;audience <span style={{ color: C.textGhost }}>Karim Lipton.</span>
                </h2>
              </div>
            </Reveal>

            <Reveal>
              <div
                className="talent-karim-stats-grid grid gap-8"
                style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", rowGap: 44 }}
              >
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

        {/* PLATFORMS */}
        <section className="talent-karim-section py-10 px-16 pb-20">
          <div className="max-w-[1200px] mx-auto">
            <Reveal>
              <SectionIntro eyebrow="Plateformes" title="Où il performe." id={ids.platforms} />
            </Reveal>

            <div
              className="talent-karim-platforms-grid grid gap-3"
              style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
            >
              {platforms.map((platform, index) => (
                <Reveal key={platform.name} delay={index * 0.05}>
                  <motion.article
                    whileHover={reducedMotion ? undefined : { backgroundColor: "rgba(255,255,255,0.04)", borderColor: C.borderStrong }}
                    transition={makeTransition(reducedMotion ?? false, 0.25)}
                    className="relative overflow-hidden rounded-2xl p-6 min-h-[255px]"
                    style={{
                      background: C.panelSoft,
                      border: `1px solid ${platform.main ? C.borderStrong : C.border}`,
                    }}
                  >
                    {platform.main && (
                      <span
                        className="absolute top-3 right-3.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase"
                        style={{ background: "rgba(255,255,255,0.08)", color: C.textMuted, letterSpacing: 2 }}
                      >
                        Principal
                      </span>
                    )}
                    <div className="mb-4" style={{ color: C.textSoft }}>
                      <PlatformIcon platform={platform.name} size={24} />
                    </div>
                    <h3
                      className="font-extrabold text-base mb-1"
                      style={{ fontFamily: DISPLAY, color: C.text, letterSpacing: -0.3 }}
                    >
                      {platform.name}
                    </h3>
                    <p
                      className="font-extrabold text-3xl mb-3.5 leading-none"
                      style={{ fontFamily: DISPLAY, color: C.text, letterSpacing: -2 }}
                    >
                      {platform.followers}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: C.textBody }}>
                      {platform.desc}
                    </p>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ASCENSION */}
        <section className="talent-karim-section py-20 px-16 flex justify-center">
          <Reveal>
            <div className="max-w-[860px] text-center">
              <p className="text-xs font-bold uppercase tracking-widest mb-7" style={{ color: C.textMuted, letterSpacing: 4 }}>
                L&apos;ascension
              </p>
              <h2 id={ids.ascension} className="sr-only">
                L&apos;ascension de Karim Lipton
              </h2>
              <blockquote>
                <p
                  className="italic leading-snug"
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: "clamp(22px, 2.8vw, 34px)",
                    fontWeight: 400,
                    color: C.textSoft,
                    letterSpacing: -0.5,
                  }}
                >
                  &ldquo;Karim a véritablement explosé après avoir été propulsé et validé par Nasdas. Il a repris l&apos;énergie du contenu quotidien, l&apos;effet bande et le storytelling, tout en y ajoutant sa propre mise en scène.&rdquo;
                </p>
              </blockquote>
              <motion.div
                aria-hidden="true"
                initial={reducedMotion ? { opacity: 0 } : { width: 0 }}
                whileInView={reducedMotion ? { opacity: 1 } : { width: 60 }}
                viewport={{ once: true }}
                transition={makeTransition(reducedMotion ?? false, 0.9, 0.2)}
                className="h-0.5 mx-auto mt-8"
                style={{ background: C.textGhost, width: reducedMotion ? 60 : undefined }}
              />
            </div>
          </Reveal>
        </section>

        {/* PILLARS */}
        <section className="talent-karim-section py-10 px-16 pb-20">
          <div className="max-w-[1200px] mx-auto">
            <Reveal>
              <SectionIntro eyebrow="Le contenu" title="Ses piliers" mutedWord="de contenu." id={ids.pillars} />
            </Reveal>

            <div
              className="talent-karim-pillars-grid grid gap-4"
              style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
            >
              {pillars.map((pillar, index) => (
                <Reveal key={pillar.title} delay={index * 0.06}>
                  <motion.article
                    whileHover={reducedMotion ? undefined : { backgroundColor: "rgba(255,255,255,0.04)" }}
                    transition={makeTransition(reducedMotion ?? false, 0.25)}
                    className="flex gap-5 items-start rounded-3xl p-8 min-h-[220px]"
                    style={{ background: C.panelSoft, border: `1px solid ${C.border}` }}
                  >
                    <div className="text-3xl leading-none flex-shrink-0" aria-hidden="true">
                      {pillar.icon}
                    </div>
                    <div>
                      <h3
                        className="font-extrabold text-xl mb-3 leading-tight"
                        style={{ fontFamily: DISPLAY, color: C.text, letterSpacing: -0.5 }}
                      >
                        {pillar.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: C.textBody }}>
                        {pillar.desc}
                      </p>
                    </div>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div className="py-10">
          <Marquee
            items={["Téléréalité 2.0", "Team Lipton", "Concepts TV", "Voyages", "Humour", "Bienfaiteur", "Storytelling"]}
            speed={30}
            ariaLabel="Axes éditoriaux du talent"
          />
        </div>

        {/* COLLABS */}
        <section className="talent-karim-section py-20 px-16">
          <div className="max-w-[1200px] mx-auto">
            <Reveal>
              <SectionIntro eyebrow="Collaborer" title="Formats de" mutedWord="collaboration." id={ids.collabs} />
            </Reveal>

            <div
              className="talent-karim-collabs-grid grid gap-3"
              style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
            >
              {collabs.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.05}>
                  <motion.article
                    whileHover={reducedMotion ? undefined : { backgroundColor: "rgba(255,255,255,0.04)", borderColor: C.borderStrong }}
                    transition={makeTransition(reducedMotion ?? false, 0.25)}
                    className="flex flex-col items-center justify-center text-center rounded-2xl p-6 min-h-[220px]"
                    style={{ background: C.panelSoft, border: `1px solid ${C.border}` }}
                  >
                    <p
                      aria-hidden="true"
                      className="font-extrabold leading-none mb-3.5"
                      style={{ fontFamily: DISPLAY, fontSize: 54, color: "rgba(255,255,255,0.05)" }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3
                      className="font-extrabold text-base mb-2.5"
                      style={{ fontFamily: DISPLAY, color: C.text, letterSpacing: -0.3 }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: C.textBody }}>
                      {item.desc}
                    </p>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SECTORS */}
        <section className="talent-karim-section py-10 px-16 pb-20">
          <div className="max-w-[1200px] mx-auto">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: C.textMuted, letterSpacing: 4 }}>
                Secteurs d&apos;activité
              </p>
              <h2 id={ids.sectors} className="sr-only">
                Secteurs d&apos;activité
              </h2>
              <ul className="flex flex-wrap gap-2.5 list-none p-0">
                {brandList.map((brand, index) => (
                  <motion.li
                    key={`${brand}-${index}`}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
                    whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={makeTransition(reducedMotion ?? false, 0.35, index * 0.04)}
                  >
                    <span
                      className="inline-flex px-5 py-2.5 rounded-full text-xs font-semibold uppercase border"
                      style={{ background: C.chipBg, borderColor: C.chipBorder, color: C.textMuted, letterSpacing: 1 }}
                    >
                      {brand}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* MANIFESTO */}
        <section className="talent-karim-section py-24 px-16 flex justify-center">
          <Reveal>
            <div className="max-w-[860px] text-center">
              <p className="text-xs font-bold uppercase tracking-widest mb-7" style={{ color: C.textMuted, letterSpacing: 4 }}>
                Pourquoi Karim
              </p>
              <h2 id={ids.manifesto} className="sr-only">
                Pourquoi collaborer avec Karim
              </h2>
              <blockquote>
                <p
                  className="italic leading-snug"
                  style={{
                    fontFamily: DISPLAY,
                    fontSize: "clamp(24px, 3vw, 38px)",
                    fontWeight: 400,
                    color: C.textSoft,
                    letterSpacing: -0.8,
                  }}
                >
                  &ldquo;Karim ne fait pas de la publicité. Il vit son contenu, et votre marque peut s&apos;y intégrer de manière organique, mémorable et massive.&rdquo;
                </p>
              </blockquote>
              <motion.div
                aria-hidden="true"
                initial={reducedMotion ? { opacity: 0 } : { width: 0 }}
                whileInView={reducedMotion ? { opacity: 1 } : { width: 60 }}
                viewport={{ once: true }}
                transition={makeTransition(reducedMotion ?? false, 0.9, 0.2)}
                className="h-0.5 mx-auto mt-8"
                style={{ background: C.textGhost, width: reducedMotion ? 60 : undefined }}
              />
            </div>
          </Reveal>
        </section>

        {/* CTA */}
        <section className="talent-karim-section relative text-center py-28 px-16">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center bottom, rgba(255,255,255,0.03) 0%, transparent 60%)" }}
          />
          <Reveal>
            <h2
              id={ids.cta}
              className="font-extrabold leading-none mb-4"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(42px, 7vw, 100px)",
                color: C.text,
                letterSpacing: -4,
              }}
            >
              Collaborer avec Karim.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-base leading-relaxed max-w-[560px] mx-auto mb-9" style={{ color: C.textBody }}>
              Placement, concept dédié, activation : discutons de la meilleure façon d&apos;intégrer votre marque dans son univers.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <motion.a
              href="#"
              whileHover={reducedMotion ? undefined : { y: -2, backgroundColor: C.buttonBgHover, color: C.buttonTextHover }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              transition={makeTransition(reducedMotion ?? false, 0.25)}
              className="inline-flex items-center justify-center gap-3 min-h-[52px] px-7 rounded-full border text-xs font-bold uppercase tracking-widest no-underline"
              style={{
                background: "transparent",
                color: C.text,
                fontFamily: DISPLAY,
                borderColor: C.buttonBorder,
                letterSpacing: 3,
              }}
            >
              <span>Proposer une collab</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </motion.a>
          </Reveal>
        </section>
      </main>

      <footer
        className="talent-karim-footer flex justify-between items-center py-7 px-16"
        style={{ borderTop: `1px solid ${C.border}` }}
      >
        <p
          className="text-xs font-bold uppercase"
          style={{ color: C.textMuted, letterSpacing: 3, fontFamily: DISPLAY }}
        >
          JUST IMPACT<span style={{ color: C.textBody }}>.</span> © 2026
        </p>
        <p className="text-xs uppercase" style={{ color: C.textMuted, letterSpacing: 3, fontFamily: BODY }}>
          Paris, France
        </p>
      </footer>
    </div>
  )
}