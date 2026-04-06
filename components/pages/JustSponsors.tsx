"use client"

import { useEffect, useId, useMemo, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { motion, useInView, useReducedMotion, AnimatePresence, type Transition } from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const NUMERIC = "'Satoshi', 'Inter', 'Segoe UI', Arial, sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const COLORS = {
  bg: "#000000",
  text: "#ffffff",
  textSoft: "rgba(255,255,255,0.88)",
  textMuted: "rgba(255,255,255,0.74)",
  textLow: "rgba(255,255,255,0.62)",
  textSubtle: "rgba(255,255,255,0.48)",
  border: "rgba(255,255,255,0.12)",
  borderSoft: "rgba(255,255,255,0.08)",
  surface: "rgba(255,255,255,0.02)",
  surfaceHover: "rgba(255,255,255,0.05)",
  accent: "#ffffff",
} as const

const VISUALLY_HIDDEN: React.CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0,
}

const MAIN_CONTENT_ID = "just-sponsors-main-content"

type ContactStatus = "idle" | "sending" | "success" | "error"
type ContactFormDataState = { name: string; email: string; phone: string; company: string; entity: string; message: string }
type ContactErrorState = Partial<Record<keyof ContactFormDataState, string>>

const JC = {
  bg: "#000000", text: "#ffffff",
  border: "rgba(255,255,255,0.16)", borderFocus: "#ffffff",
  surface: "rgba(255,255,255,0.03)",
  error: "#ef4444", errorBg: "rgba(239,68,68,0.08)", errorBorder: "rgba(239,68,68,0.24)",
  success: "#22c55e", placeholder: "rgba(255,255,255,0.28)", muted: "rgba(255,255,255,0.65)",
} as const

function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) }
function cxErrorId(id: string) { return `${id}-error` }
function cxHintId(id: string) { return `${id}-hint` }
function white(opacity: number) { return `rgba(255,255,255,${opacity})` }

type SponsorCategory = "Média & Divertissement" | "Food & Restauration" | "Sport, Lifestyle & Tourisme" | "Corporate & Industrie" | "Retail & Tech" | "Services & Partenaires"

interface SponsorItem { name: string; imageUrl?: string; cat: SponsorCategory }

const SPONSOR_SEEDS = [
  { index: 1, name: "Konbini", cat: "Média & Divertissement" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-konbini.png" },
  { index: 2, name: "Warner Bros", cat: "Média & Divertissement" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-warner.png" },
  { index: 3, name: "Meta", cat: "Média & Divertissement" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-meta.png" },
  { index: 4, name: "Canal+", cat: "Média & Divertissement" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-canal.png" },
  { index: 5, name: "Allociné", cat: "Média & Divertissement" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-allocine.png" },
  { index: 6, name: "Amazon Prime Video", cat: "Média & Divertissement" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-amazonprime.png" },
  { index: 7, name: "TikTok", cat: "Média & Divertissement" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-tiktok.png" },
  { index: 8, name: "Oracle", cat: "Corporate & Industrie" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-oracle.png" },
  { index: 9, name: "Fnac", cat: "Retail & Tech" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-fnac.png" },
  { index: 10, name: "Darty", cat: "Retail & Tech" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-darty.png" },
  { index: 11, name: "Geox", cat: "Retail & Tech" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-geox.png" },
  { index: 12, name: "Volpy", cat: "Retail & Tech" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-volpy.png" },
  { index: 13, name: "Fruitz", cat: "Food & Restauration" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-fruitz.png" },
  { index: 14, name: "Honor", cat: "Sport, Lifestyle & Tourisme" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-honor.png" },
  { index: 15, name: "DeepCool", cat: "Retail & Tech" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-deepcool.png" },
  { index: 16, name: "Konix", cat: "Retail & Tech" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-konix.png" },
  { index: 17, name: "Crazy Tiger", cat: "Food & Restauration" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-crazytiger.png" },
  { index: 18, name: "Chicken Street", cat: "Food & Restauration" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-chickenstreet.png" },
  { index: 19, name: "Venum", cat: "Sport, Lifestyle & Tourisme" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-venum.png" },
  { index: 20, name: "Chamas Tacos", cat: "Food & Restauration" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-chamas.png" },
  { index: 21, name: "Five Pizza", cat: "Food & Restauration" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-fivepizza.png" },
  { index: 22, name: "Planète Rap", cat: "Média & Divertissement" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-planeterap.png" },
  { index: 23, name: "Unisport", cat: "Sport, Lifestyle & Tourisme" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-unibet.png" },
  { index: 24, name: "Black & White", cat: "Food & Restauration" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-blackandwhite.png" },
  { index: 25, name: "Sanofi", cat: "Corporate & Industrie" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-sanofi.png" },
  { index: 26, name: "SNCF", cat: "Corporate & Industrie" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-sncf.png" },
  { index: 27, name: "TotalEnergies", cat: "Corporate & Industrie" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-total.png" },
  { index: 28, name: "Renault", cat: "Corporate & Industrie" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-renault.png" },
  { index: 29, name: "Paris 2024", cat: "Sport, Lifestyle & Tourisme" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-jo.png" },
  { index: 30, name: "PSG", cat: "Sport, Lifestyle & Tourisme" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-psg.png" },
  { index: 31, name: "Get Your Guide", cat: "Sport, Lifestyle & Tourisme" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-getyourguide.png" },
  { index: 32, name: "Les Missions Locales", cat: "Corporate & Industrie" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-missionlocal.png" },
  { index: 33, name: "Hurghada Dream", cat: "Sport, Lifestyle & Tourisme" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-hurgada.png" },
  { index: 34, name: "Viseon", cat: "Retail & Tech" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-viseon.png" },
  { index: 35, name: "Sato Fusion", cat: "Services & Partenaires" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-satofusion.png" },
  { index: 36, name: "Just Media 4 You", cat: "Services & Partenaires" as SponsorCategory, imageUrl: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/sponsors-justmediaforyou.png" },
]

const CATEGORY_ORDER: SponsorCategory[] = [
  "Média & Divertissement", "Food & Restauration", "Sport, Lifestyle & Tourisme",
  "Corporate & Industrie", "Retail & Tech", "Services & Partenaires",
]

function useResponsive() {
  const getWidth = () => typeof window !== "undefined" ? window.innerWidth : 1440
  const [vw, setVw] = useState<number>(getWidth())
  useEffect(() => {
    if (typeof window === "undefined") return
    let raf = 0
    const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setVw(getWidth())) }
    onResize()
    window.addEventListener("resize", onResize, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize) }
  }, [])
  return { vw, mobile: vw < 768, tablet: vw >= 768 && vw < 1100, smallDesktop: vw >= 1100 && vw < 1440 }
}

function getTransition(delay = 0, reducedMotion = false): Transition {
  if (reducedMotion) return { duration: 0, delay: 0 }
  return { duration: 0.8, delay, ease: EASE }
}

function Reveal({ children, delay = 0, as = "div", style }: { children: React.ReactNode; delay?: number; as?: React.ElementType; style?: React.CSSProperties }) {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reducedMotion = useReducedMotion()
  const Tag = as
  return (
    <Tag ref={ref} style={style}>
      <motion.div initial={reducedMotion ? false : { opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={getTransition(delay, !!reducedMotion)} style={{ minWidth: 0 }}>
        {children}
      </motion.div>
    </Tag>
  )
}

function Marquee({ items, speed = 35, accessibleLabel }: { items: string[]; speed?: number; accessibleLabel: string }) {
  const reducedMotion = useReducedMotion()
  const tripled = [...items, ...items, ...items]
  return (
    <div aria-label={accessibleLabel} style={{ width: "100%", minWidth: 0 }}>
      <div aria-hidden="true" style={{ overflow: "hidden", width: "100%", maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
        <motion.div animate={reducedMotion ? undefined : { x: ["0%", "-33.333%"] }} transition={reducedMotion ? undefined : { duration: speed, repeat: Infinity, ease: "linear" }} style={{ display: "flex", gap: "clamp(20px, 3vw, 40px)", width: "max-content", alignItems: "center", paddingInline: 4 }}>
          {tripled.map((item, index) => (
            <span key={`${item}-${index}`} style={{ display: "inline-flex", alignItems: "center", gap: "clamp(20px, 3vw, 40px)" }}>
              <span style={{ fontFamily: DISPLAY, fontSize: "clamp(28px, 6vw, 72px)", fontWeight: 800, color: "rgba(255,255,255,0.08)", letterSpacing: "clamp(-1px, -0.15vw, -2px)", textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, flexShrink: 0 }}>{item}</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "inline-block", flexShrink: 0 }} />
            </span>
          ))}
        </motion.div>
      </div>
      <span style={VISUALLY_HIDDEN}>{items.join(" · ")}</span>
    </div>
  )
}

// FIX: lazy initializer pour éviter setState synchrone dans useEffect
function Counter({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true })
  const reducedMotion = useReducedMotion()
  const match = value.match(/\d+/)
  const numeric = match ? parseInt(match[0], 10) : 0
  const prefix = value.slice(0, match?.index ?? 0)
  const suffix = match ? value.slice((match.index ?? 0) + match[0].length) : value
  const [count, setCount] = useState<number>(() => reducedMotion ? numeric : 0)

  useEffect(() => {
    // Si reduced motion, le lazy initializer a déjà mis numeric — rien à faire
    if (!inView || reducedMotion) return
    let raf = 0
    const timeout = window.setTimeout(() => {
      const duration = 1800, start = performance.now()
      const run = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        setCount(Math.floor((1 - Math.pow(1 - progress, 4)) * numeric))
        if (progress < 1) raf = window.requestAnimationFrame(run)
      }
      raf = window.requestAnimationFrame(run)
    }, delay * 1000)
    return () => { window.clearTimeout(timeout); if (raf) window.cancelAnimationFrame(raf) }
  }, [delay, inView, numeric, reducedMotion])

  return (
    <article ref={ref} aria-label={`${label} : ${value}`} style={{ textAlign: "center", minWidth: 0 }}>
      <p style={{ fontFamily: NUMERIC, fontWeight: 900, fontSize: "clamp(30px, 4.8vw, 64px)", color: COLORS.text, lineHeight: 0.95, margin: "0 0 12px", letterSpacing: "clamp(-1px, -0.12vw, -2px)", textTransform: "uppercase", overflowWrap: "anywhere" }}>
        <span aria-hidden="true">{prefix}{inView || reducedMotion ? count : 0}{suffix}</span>
        <span style={VISUALLY_HIDDEN}>{value}</span>
      </p>
      <p style={{ margin: 0, fontSize: "clamp(11px, 1.2vw, 12px)", color: COLORS.textMuted, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", fontFamily: BODY, lineHeight: 1.5, overflowWrap: "anywhere" }}>{label}</p>
    </article>
  )
}

// FIX ligne 216 : <img> remplacé par <Image /> de next/image
function SponsorTextCard({ name, imageUrl, delay = 0 }: { name: string; imageUrl?: string; delay?: number }) {
  const ref = useRef<HTMLLIElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: "-30px" })
  const reducedMotion = useReducedMotion()
  return (
    <motion.li
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={getTransition(delay, !!reducedMotion)}
      style={{
        listStyle: "none",
        background: COLORS.surface,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 16,
        padding: "clamp(18px, 2vw, 28px) clamp(16px, 1.8vw, 24px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        minHeight: "clamp(140px, 16vw, 180px)",
        minWidth: 0,
        width: "100%",
        overflow: "hidden",
      }}
    >
      {imageUrl ? (
        <div style={{ position: "relative", width: "70%", height: "clamp(50px, 6vw, 70px)", flexShrink: 0 }}>
          <Image
            src={imageUrl}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 768px) 40vw, 15vw"
            style={{ objectFit: "contain", opacity: 0.9 }}
          />
        </div>
      ) : (
        <div style={{
          width: "clamp(50px, 6vw, 70px)",
          height: "clamp(50px, 6vw, 70px)",
          borderRadius: "50%",
          background: COLORS.surfaceHover,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ fontFamily: DISPLAY, fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 700, color: COLORS.textMuted }}>
            {name.charAt(0)}
          </span>
        </div>
      )}
      <p style={{
        margin: 0,
        fontFamily: DISPLAY,
        fontSize: "clamp(13px, 1.3vw, 15px)",
        fontWeight: 700,
        color: COLORS.textSoft,
        letterSpacing: -0.3,
        textAlign: "center",
        lineHeight: 1.3,
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        maxWidth: "100%",
      }}>
        {name}
      </p>
    </motion.li>
  )
}

// FIX ligne 216 : <img> remplacé par <Image /> de next/image dans LogoScrollRow
function LogoScrollRow({ sponsors, speed = 25, reverse = false, accessibleLabel }: { sponsors: SponsorItem[]; speed?: number; reverse?: boolean; accessibleLabel: string }) {
  const reducedMotion = useReducedMotion()
  const tripled = [...sponsors, ...sponsors, ...sponsors]
  return (
    <div aria-label={accessibleLabel} style={{ padding: "20px 0", width: "100%", minWidth: 0 }}>
      <div aria-hidden="true" style={{ overflow: "hidden", width: "100%", maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}>
        <motion.div animate={reducedMotion ? undefined : { x: reverse ? ["-33.333%", "0%"] : ["0%", "-33.333%"] }} transition={reducedMotion ? undefined : { duration: speed, repeat: Infinity, ease: "linear" }} style={{ display: "flex", gap: "clamp(24px, 4vw, 48px)", width: "max-content", alignItems: "center", paddingInline: 4 }}>
          {tripled.map((sponsor, index) => (
            <div key={`${sponsor.name}-${index}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: "clamp(96px, 12vw, 140px)", minHeight: "clamp(36px, 4vw, 50px)", position: "relative" }}>
              {sponsor.imageUrl ? (
                <Image
                  src={sponsor.imageUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="140px"
                  style={{ objectFit: "contain", opacity: 0.7 }}
                />
              ) : (
                <span style={{ fontFamily: DISPLAY, fontSize: "clamp(12px, 1.3vw, 14px)", fontWeight: 700, color: COLORS.textLow, whiteSpace: "nowrap" }}>{sponsor.name}</span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
      <span style={VISUALLY_HIDDEN}>{sponsors.map(s => s.name).join(" · ")}</span>
    </div>
  )
}

function CategorySection({ title, sponsors, delay = 0 }: { title: string; sponsors: SponsorItem[]; delay?: number }) {
  const ref = useRef<HTMLElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const reducedMotion = useReducedMotion()
  const headingId = useId()
  return (
    <motion.section ref={ref} aria-labelledby={headingId} initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={getTransition(delay, !!reducedMotion)} style={{ marginBottom: "clamp(48px, 6vw, 72px)", minWidth: 0 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 12, marginBottom: 28, borderBottom: `1px solid ${COLORS.borderSoft}`, paddingBottom: 18, minWidth: 0 }}>
        <h3 id={headingId} style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(22px, 2.6vw, 28px)", color: COLORS.text, letterSpacing: -1, lineHeight: 1.2, minWidth: 0, overflowWrap: "anywhere" }}>{title}</h3>
        <p style={{ margin: 0, fontFamily: BODY, fontSize: 12, fontWeight: 600, color: COLORS.textMuted, letterSpacing: 1.8, textTransform: "uppercase", lineHeight: 1.5 }}>{sponsors.length} partenaire{sponsors.length > 1 ? "s" : ""}</p>
      </div>
      <ul style={{ margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 12, minWidth: 0 }}>
        {sponsors.map((sponsor, index) => (
          <SponsorTextCard
            key={`${title}-${sponsor.name}-${index}`}
            name={sponsor.name}
            imageUrl={sponsor.imageUrl}
            delay={index * 0.03}
          />
        ))}
      </ul>
    </motion.section>
  )
}

function ContactInputField({ id, label, name, type = "text", autoComplete, inputMode, placeholder, required = false, value, error, hint, onChange }: { id: string; label: string; name: string; type?: string; autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; placeholder?: string; required?: boolean; value: string; error?: string; hint?: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  const errorId = cxErrorId(id), hintId = cxHintId(id)
  return (
    <div style={{ position: "relative" }}>
      <motion.label htmlFor={id} animate={{ top: active ? 6 : 24, fontSize: active ? 11 : 15, color: error ? JC.error : JC.text, letterSpacing: active ? 3.5 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", left: 0, fontFamily: BODY, fontWeight: active ? 700 : 400, textTransform: active ? "uppercase" : "none", pointerEvents: "none", zIndex: 1, lineHeight: 1 }}>
        {label}{required && <span aria-hidden="true" style={{ color: JC.text }}> *</span>}
      </motion.label>
      <input id={id} name={name} type={type} value={value} required={required} autoComplete={autoComplete} inputMode={inputMode} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined} placeholder={focused ? placeholder : ""} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${error ? JC.error : focused ? JC.borderFocus : JC.border}`, padding: "30px 0 16px", fontFamily: BODY, fontSize: 17, color: JC.text, outline: "none", transition: "border-color 0.25s ease", letterSpacing: 0.2 }} />
      {hint && <p id={hintId} style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 12, color: JC.muted }}>{hint}</p>}
      {error && <p id={errorId} role="alert" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 13, color: JC.error }}>{error}</p>}
    </div>
  )
}

function ContactTextareaField({ id, label, name, placeholder, required = false, value, error, onChange }: { id: string; label: string; name: string; placeholder?: string; required?: boolean; value: string; error?: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  const errorId = cxErrorId(id)
  return (
    <div style={{ position: "relative" }}>
      <motion.label htmlFor={id} animate={{ top: active ? 6 : 24, fontSize: active ? 11 : 15, color: error ? JC.error : JC.text, letterSpacing: active ? 3.5 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", left: 0, fontFamily: BODY, fontWeight: active ? 700 : 400, textTransform: active ? "uppercase" : "none", pointerEvents: "none", zIndex: 1, lineHeight: 1 }}>
        {label}{required && <span aria-hidden="true" style={{ color: JC.text }}> *</span>}
      </motion.label>
      <textarea id={id} name={name} value={value} required={required} aria-required={required || undefined} aria-invalid={error ? true : undefined} placeholder={focused ? placeholder : ""} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} rows={5} style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${error ? JC.error : focused ? JC.borderFocus : JC.border}`, padding: "30px 0 16px", fontFamily: BODY, fontSize: 17, color: JC.text, outline: "none", resize: "vertical", minHeight: 130, transition: "border-color 0.25s ease" }} />
      {error && <p id={errorId} role="alert" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 13, color: JC.error }}>{error}</p>}
    </div>
  )
}

function ContactPillSelect({ label, name, options, value, onChange }: { label: string; name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const groupId = useId()
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
      <legend id={groupId} style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: JC.text, marginBottom: 18 }}>{label}</legend>
      <div role="group" aria-labelledby={groupId} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map(opt => {
          const active = value === opt
          return (
            <motion.button key={opt} type="button" aria-pressed={active} onClick={() => onChange(active ? "" : opt)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} animate={{ background: active ? "#ffffff" : "transparent", borderColor: active ? "#ffffff" : "rgba(255,255,255,0.18)", color: active ? "#000000" : "#ffffff" }} transition={{ duration: 0.2 }} style={{ padding: "11px 20px", borderRadius: 100, border: "1px solid", fontFamily: BODY, fontSize: 13, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer", outline: "none" }}>
              {opt}
            </motion.button>
          )
        })}
      </div>
      <input type="hidden" name={name} value={value} />
    </fieldset>
  )
}

const ICONS = {
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>,
  tiktok: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.07A6.33 6.33 0 0 0 3 15.64 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.33-6.33V9.19a8.16 8.16 0 0 0 3.89.98V6.69Z" /></svg>,
  linkedin: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
}

const FOOTER_NAV = [
  { label: "Just Impact", href: "/just-impact" },
  { label: "Just Prod", href: "/just-prod" },
  { label: "Just Agency", href: "/just-agency" },
  { label: "Contact", href: "/contact" },
]

export default function JustSponsorsPage() {
  const { mobile, tablet, smallDesktop } = useResponsive()
  const reducedMotion = useReducedMotion()

  const heroTitleId = useId(), partnersScrollTitleId = useId(), statsSectionId = useId()
  const partnersListTitleId = useId(), extraBrandsTitleId = useId()
  const contactSectionTitleId = useId(), contactSectionDescId = useId()
  const contactSuccessTitleId = useId(), contactNameId = useId()
  const contactEmailId = useId(), contactPhoneId = useId()
  const contactCompanyId = useId(), contactMessageId = useId()

  const WEB3FORMS_ACCESS_KEY = "b891692e-8148-4785-856a-e1c43f4816dc"

  const [contactFormData, setContactFormData] = useState<ContactFormDataState>({ name: "", email: "", phone: "", company: "", entity: "", message: "" })
  const [contactErrors, setContactErrors] = useState<ContactErrorState>({})
  const [contactStatus, setContactStatus] = useState<ContactStatus>("idle")
  const [contactLiveMessage, setContactLiveMessage] = useState("")

  const contactEntityList = useMemo(() => ["Just Impact", "Just Prod", "Just Agency", "Just 4 You"], [])
  const socials = useMemo(() => [
    { href: "https://instagram.com/justgroup", label: "Instagram", icon: ICONS.instagram },
    { href: "https://tiktok.com/@justgroup", label: "TikTok", icon: ICONS.tiktok },
    { href: "https://linkedin.com/company/justgroup", label: "LinkedIn", icon: ICONS.linkedin },
  ], [])

  const updateContactField = useCallback((field: keyof ContactFormDataState) => (value: string) => {
    setContactFormData(prev => ({ ...prev, [field]: value }))
    if (contactErrors[field]) setContactErrors(prev => ({ ...prev, [field]: undefined }))
    if (contactStatus === "error") { setContactStatus("idle"); setContactLiveMessage("") }
  }, [contactErrors, contactStatus])

  const validateContactForm = useCallback(() => {
    const e: ContactErrorState = {}
    if (!contactFormData.name.trim()) e.name = "Merci d\u2019indiquer votre nom."
    if (!contactFormData.email.trim()) e.email = "Merci d\u2019indiquer votre adresse email."
    else if (!isValidEmail(contactFormData.email)) e.email = "L\u2019adresse email semble invalide."
    if (!contactFormData.message.trim()) e.message = "Merci de pr\u00e9ciser votre demande."
    else if (contactFormData.message.trim().length < 10) e.message = "Votre message est un peu trop court."
    return e
  }, [contactFormData])

  const resetContactForm = useCallback(() => {
    setContactFormData({ name: "", email: "", phone: "", company: "", entity: "", message: "" })
    setContactErrors({}); setContactStatus("idle"); setContactLiveMessage("")
  }, [])

  const handleContactSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors = validateContactForm()
    setContactErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) { setContactStatus("error"); setContactLiveMessage("Le formulaire contient des erreurs."); return }
    setContactStatus("sending"); setContactLiveMessage("Envoi du formulaire en cours.")
    try {
      const fd = new FormData()
      fd.append("access_key", WEB3FORMS_ACCESS_KEY)
      fd.append("subject", `[JUST] Nouveau contact — ${contactFormData.entity || "Général"}`)
      fd.append("from_name", contactFormData.name)
      fd.append("name", contactFormData.name); fd.append("email", contactFormData.email)
      fd.append("phone", contactFormData.phone); fd.append("company", contactFormData.company)
      fd.append("entity", contactFormData.entity); fd.append("message", contactFormData.message)
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data?.success) { setContactStatus("success"); setContactLiveMessage("Message envoyé.") }
      else { setContactStatus("error"); setContactLiveMessage(data?.message || "Une erreur est survenue.") }
    } catch { setContactStatus("error"); setContactLiveMessage("Une erreur est survenue.") }
  }, [contactFormData, validateContactForm])

  const isContactSubmitDisabled = contactStatus === "sending" || !contactFormData.name.trim() || !contactFormData.email.trim() || !contactFormData.message.trim()

  useEffect(() => {
    if (typeof document === "undefined") return
    if (!document.getElementById("just-sponsors-fonts")) {
      const link = document.createElement("link")
      link.id = "just-sponsors-fonts"; link.rel = "stylesheet"
      link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap"
      document.head.appendChild(link)
    }
    if (!document.getElementById("just-sponsors-a11y-styles")) {
      const style = document.createElement("style")
      style.id = "just-sponsors-a11y-styles"
      style.textContent = `
        .just-sponsors-root, .just-sponsors-root * { box-sizing: border-box; }
        .just-sponsors-root { width: 100%; max-width: 100%; overflow-x: hidden; }
        .just-sponsors-root a:focus-visible, .just-sponsors-root button:focus-visible { outline: 2px solid #ffffff !important; outline-offset: 4px !important; }
        .just-sponsors-skip-link { position: absolute; left: 16px; top: 16px; transform: translateY(-180%); z-index: 50; background: #ffffff; color: #000000; text-decoration: none; padding: 12px 16px; border-radius: 999px; font-family: ${BODY}; font-size: 14px; font-weight: 700; transition: transform 0.2s ease; }
        .just-sponsors-skip-link:focus-visible { transform: translateY(0); }
        .just-sponsors-contact-root input::placeholder, .just-sponsors-contact-root textarea::placeholder { color: ${JC.placeholder}; }
        .just-sponsors-contact-root input:-webkit-autofill, .just-sponsors-contact-root textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px #000 inset !important; -webkit-text-fill-color: #fff !important; }
        @media (max-width: 980px) {
          .just-sponsors-contact-grid { grid-template-columns: 1fr !important; gap: 56px !important; }
          .just-sponsors-contact-two-cols { grid-template-columns: 1fr !important; gap: 28px !important; }
          .just-sponsors-contact-sticky { position: relative !important; top: 0 !important; }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  const allSponsors: SponsorItem[] = useMemo(() => SPONSOR_SEEDS.map(seed => ({ name: seed.name, imageUrl: seed.imageUrl, cat: seed.cat })), [])
  const categories = useMemo(() => CATEGORY_ORDER.map(cat => ({ title: cat, sponsors: allSponsors.filter(s => s.cat === cat) })).filter(c => c.sponsors.length > 0), [allSponsors])
  const halfIndex = Math.ceil(allSponsors.length / 2)
  const scrollRow1 = allSponsors.slice(0, halfIndex)
  const scrollRow2 = allSponsors.slice(halfIndex)

  const pagePadding = mobile ? 20 : tablet ? 32 : smallDesktop ? 48 : 72
  const heroMinHeight = mobile ? "auto" : "min(100svh, 980px)"
  const statsColumns = mobile ? 2 : 4

  return (
    <main className="just-sponsors-root" aria-labelledby={heroTitleId} style={{ width: "100%", maxWidth: "100%", background: COLORS.bg, color: COLORS.textSoft, fontFamily: BODY, overflowX: "hidden", WebkitFontSmoothing: "antialiased" }}>
      <a href={`#${MAIN_CONTENT_ID}`} className="just-sponsors-skip-link">Aller au contenu principal</a>

      <header style={{ minHeight: heroMinHeight, display: "flex", flexDirection: "column", justifyContent: "center", padding: `${mobile ? 36 : 56}px ${pagePadding}px ${mobile ? 52 : 80}px`, position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: mobile ? "28px 28px" : "40px 40px", pointerEvents: "none" }} />
        <motion.p initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={getTransition(0.15, !!reducedMotion)} style={{ margin: `0 0 ${mobile ? 24 : 40}px`, fontSize: 12, fontWeight: 700, letterSpacing: mobile ? 2.2 : 3, textTransform: "uppercase", color: COLORS.textMuted, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, lineHeight: 1.5, position: "relative", zIndex: 1, minWidth: 0 }}>
          <motion.span aria-hidden="true" animate={reducedMotion ? undefined : { scale: [1, 1.4, 1], opacity: [0.45, 1, 0.45] }} transition={reducedMotion ? undefined : { duration: 2.4, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.accent, display: "inline-block", flexShrink: 0 }} />
          <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>Confiance · Collaboration · Excellence</span>
        </motion.p>
        <div style={{ maxWidth: 1100, width: "100%", position: "relative", zIndex: 1, minWidth: 0 }}>
          <h1 id={heroTitleId} style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(38px, 8.8vw, 130px)", lineHeight: 0.94, letterSpacing: "clamp(-1.5px, -0.3vw, -4px)", color: COLORS.text, overflowWrap: "anywhere" }}>
            <span style={{ color: "rgba(255,255,255,0.62)", display: "block" }}>Ils nous font</span>
            <span style={{ display: "block" }}>confiance.</span>
          </h1>
        </div>
        <motion.p initial={reducedMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={getTransition(0.35, !!reducedMotion)} style={{ margin: `${mobile ? 22 : 34}px 0 0`, fontSize: mobile ? 15 : 16, lineHeight: 1.8, maxWidth: 620, color: COLORS.textMuted, fontWeight: 400, position: "relative", zIndex: 1, minWidth: 0, overflowWrap: "anywhere" }}>
          {/* FIX ligne 571 : apostrophes échappées en entités HTML */}
          De grandes marques internationales aux acteurs locaux les plus ambitieux, nos partenaires partagent notre vision de l&apos;excellence. Plus de 36 marques nous ont fait confiance pour porter leurs projets d&apos;influence, de production et de conciergerie.
        </motion.p>
        {!mobile && (
          <div aria-hidden="true" style={{ position: "absolute", bottom: 32, left: pagePadding, display: "flex", alignItems: "center", gap: 12 }}>
            <motion.div animate={reducedMotion ? undefined : { y: [0, 8, 0] }} transition={reducedMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(255,255,255,0.42), transparent)" }} />
            <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textLow, fontWeight: 700 }}>Scroll</span>
          </div>
        )}
      </header>

      <div id={MAIN_CONTENT_ID}>
        <section aria-labelledby={partnersScrollTitleId} style={{ padding: "16px 0 0" }}>
          <h2 id={partnersScrollTitleId} style={VISUALLY_HIDDEN}>Logos de partenaires défilants</h2>
          {scrollRow1.length > 0 && <LogoScrollRow sponsors={scrollRow1} speed={35} accessibleLabel="Première rangée de logos partenaires" />}
          {scrollRow2.length > 0 && <LogoScrollRow sponsors={scrollRow2} speed={30} reverse accessibleLabel="Deuxième rangée de logos partenaires" />}
        </section>

        <section aria-labelledby={statsSectionId} style={{ padding: `${mobile ? 52 : 80}px 0 0` }}>
          <h2 id={statsSectionId} style={VISUALLY_HIDDEN}>Chiffres clés</h2>
          <div style={{ padding: `0 ${pagePadding}px`, minWidth: 0 }}>
            <Marquee items={["Confiance", "Partenaires", "Collaboration", "Excellence", "Impact", "Résultats"]} speed={40} accessibleLabel="Mots clés représentatifs des partenariats" />
          </div>
          <div style={{ padding: `${mobile ? 52 : 84}px ${pagePadding}px ${mobile ? 68 : 100}px`, position: "relative" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
            <Reveal>
              <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: `repeat(${statsColumns}, minmax(0, 1fr))`, gap: mobile ? 24 : 40, minWidth: 0 }}>
                <Counter value="36+" label="Partenaires" delay={0} />
                <Counter value="12" label="Secteurs d'activité" delay={0.1} />
                <Counter value="200+" label="Projets réalisés" delay={0.2} />
                <Counter value="98%" label="Taux de fidélisation" delay={0.3} />
              </div>
            </Reveal>
          </div>
        </section>

        <section aria-labelledby={partnersListTitleId} style={{ padding: `0 ${pagePadding}px ${mobile ? 72 : 88}px` }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0 }}>
            <Reveal>
              <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, letterSpacing: mobile ? 2.2 : 3, textTransform: "uppercase", color: COLORS.textMuted, lineHeight: 1.5 }}>Nos partenaires</p>
              <h2 id={partnersListTitleId} style={{ margin: 0, fontWeight: 900, fontSize: "clamp(30px, 4.5vw, 58px)", color: COLORS.text, lineHeight: 0.95, letterSpacing: "clamp(-1px, -0.15vw, -2px)", fontFamily: NUMERIC, overflowWrap: "anywhere" }}>
                36 marques,<br /><span style={{ color: "rgba(255,255,255,0.6)" }}>une même exigence.</span>
              </h2>
            </Reveal>
            <div style={{ marginTop: mobile ? 36 : 56, minWidth: 0 }}>
              {categories.map((cat, index) => (
                <CategorySection key={cat.title} title={cat.title} sponsors={cat.sponsors} delay={index * 0.05} />
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby={extraBrandsTitleId} style={{ padding: "0 0 36px" }}>
          <h2 id={extraBrandsTitleId} style={VISUALLY_HIDDEN}>Sélection complémentaire de marques</h2>
          <Marquee items={["Konbini", "Meta", "Canal+", "TikTok", "Fnac", "SNCF", "Renault", "Sanofi", "PSG", "Warner Bros"]} speed={30} accessibleLabel="Sélection complémentaire de marques partenaires" />
        </section>

        <section className="just-sponsors-contact-root" aria-labelledby={contactSectionTitleId} aria-describedby={contactSectionDescId} style={{ padding: mobile ? "80px 20px 100px" : tablet ? "100px 40px 120px" : "110px 72px 140px", borderTop: `1px solid ${white(0.06)}`, position: "relative" }}>
          <div aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>{contactLiveMessage}</div>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center top,rgba(255,255,255,0.03) 0%,transparent 65%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal>
              <div style={{ marginBottom: mobile ? 48 : 72 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: white(0.58), margin: "0 0 28px", display: "flex", alignItems: "center", gap: 12 }}>
                  <motion.span aria-hidden="true" animate={reducedMotion ? undefined : { scale: [1, 1.45, 1], opacity: [0.35, 0.85, 0.35] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: "#ffffff", display: "inline-block" }} />
                  Formulaire de contact
                </p>
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: mobile ? "clamp(40px, 12vw, 58px)" : "clamp(56px, 8vw, 110px)", lineHeight: 0.92, color: "#ffffff", margin: 0, letterSpacing: mobile ? -2 : -5 }}>
                  <span style={{ display: "block" }}>Parlons</span>
                  <span style={{ display: "block", fontWeight: 300, fontStyle: "italic", color: white(0.88), letterSpacing: mobile ? -1 : -3 }}>de votre projet.</span>
                </h2>
                <p style={{ marginTop: 28, fontSize: 16, lineHeight: 1.9, maxWidth: 620, color: white(0.62), fontWeight: 300 }}>
                  Influence, production, conciergerie ou média, quelle que soit votre ambition, on a l&apos;entité et l&apos;expertise qu&apos;il vous faut. Remplissez le formulaire, on revient vers vous sous 24h.
                </p>
              </div>
            </Reveal>

            <div className="just-sponsors-contact-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,0.42fr)", gap: mobile ? 56 : 88, alignItems: "start" }}>
              <Reveal>
                <div>
                  {contactStatus === "success" ? (
                    <motion.section aria-labelledby={contactSuccessTitleId} initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} style={{ textAlign: "center", padding: mobile ? "56px 24px" : "80px 40px", background: JC.surface, border: `1px solid ${JC.border}`, borderRadius: 24 }}>
                      <motion.div initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }} animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }} transition={{ duration: 0.45, delay: 0.12, ease: EASE }} style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      </motion.div>
                      <h3 id={contactSuccessTitleId} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: "#ffffff", letterSpacing: -2, margin: "0 0 12px" }}>Message envoyé.</h3>
                      <p style={{ fontFamily: BODY, fontSize: 16, color: white(0.6), fontWeight: 300, lineHeight: 1.8, maxWidth: 420, margin: "0 auto" }}>Merci pour votre intérêt. Notre équipe revient vers vous sous 24h.</p>
                      <motion.button type="button" onClick={resetContactForm} whileHover={reducedMotion ? undefined : { opacity: 0.85 }} style={{ marginTop: 36, padding: "14px 30px", borderRadius: 100, border: "1px solid #ffffff", background: "transparent", color: "#ffffff", fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
                        Nouveau message
                      </motion.button>
                    </motion.section>
                  ) : (
                    <section>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: white(0.58), margin: "0 0 14px" }}>Formulaire</p>
                      <h3 id={contactSectionTitleId} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(32px, 4vw, 48px)", color: "#ffffff", lineHeight: 1, letterSpacing: -2, margin: "0 0 18px" }}>Dites-nous tout.</h3>
                      <p id={contactSectionDescId} style={{ margin: "0 0 52px", fontFamily: BODY, fontSize: 15, lineHeight: 1.8, color: white(0.6), maxWidth: 620 }}>Les champs marqués d&apos;un astérisque sont obligatoires.</p>
                      <form onSubmit={handleContactSubmit} noValidate>
                        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                          <div className="just-sponsors-contact-two-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
                            <ContactInputField id={contactNameId} label="Nom complet" name="name" required autoComplete="name" value={contactFormData.name} error={contactErrors.name} placeholder="Jean Dupont" onChange={updateContactField("name")} />
                            <ContactInputField id={contactEmailId} label="Adresse email" name="email" type="email" required autoComplete="email" inputMode="email" value={contactFormData.email} error={contactErrors.email} placeholder="jean@marque.com" onChange={updateContactField("email")} />
                          </div>
                          <div className="just-sponsors-contact-two-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
                            <ContactInputField id={contactPhoneId} label="Téléphone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={contactFormData.phone} placeholder="+33 6 12 34 56 78" hint="Optionnel" onChange={updateContactField("phone")} />
                            <ContactInputField id={contactCompanyId} label="Entreprise / Marque" name="company" autoComplete="organization" value={contactFormData.company} placeholder="Votre marque" hint="Optionnel" onChange={updateContactField("company")} />
                          </div>
                          <ContactPillSelect label="Entité" name="entity" options={contactEntityList} value={contactFormData.entity} onChange={updateContactField("entity")} />
                          <ContactTextareaField id={contactMessageId} label="Votre message" name="message" required value={contactFormData.message} error={contactErrors.message} placeholder="Décrivez votre projet, vos objectifs, vos délais..." onChange={updateContactField("message")} />
                          <AnimatePresence>
                            {contactStatus === "error" && (
                              <motion.div role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ padding: "16px 22px", borderRadius: 12, background: JC.errorBg, border: `1px solid ${JC.errorBorder}`, fontFamily: BODY, fontSize: 14, color: JC.error, lineHeight: 1.7 }}>
                                <strong>Une erreur est survenue.</strong> {contactLiveMessage && contactLiveMessage !== "Une erreur est survenue." ? contactLiveMessage : "Veuillez réessayer ou nous contacter directement."}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <motion.button type="submit" disabled={isContactSubmitDisabled} aria-disabled={isContactSubmitDisabled} whileHover={!isContactSubmitDisabled && !reducedMotion ? { y: -2, backgroundColor: "#ffffff", color: "#000000" } : undefined} whileTap={!isContactSubmitDisabled && !reducedMotion ? { scale: 0.98 } : undefined} style={{ display: "inline-flex", alignItems: "center", alignSelf: "flex-start", gap: 12, padding: "18px 42px", background: "transparent", color: isContactSubmitDisabled ? "rgba(255,255,255,0.25)" : "#ffffff", fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, letterSpacing: 4, textTransform: "uppercase", border: `1px solid ${isContactSubmitDisabled ? "rgba(255,255,255,0.12)" : "#ffffff"}`, borderRadius: 100, cursor: isContactSubmitDisabled ? "not-allowed" : "pointer", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)", opacity: contactStatus === "sending" ? 0.58 : 1 }}>
                            {contactStatus === "sending" ? "Envoi en cours..." : "Envoyer"}
                            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                          </motion.button>
                        </div>
                      </form>
                    </section>
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <aside className="just-sponsors-contact-sticky" aria-label="Informations de contact" style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ padding: "20px", borderRadius: 16, background: JC.surface, border: `1px solid ${JC.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                    <motion.div aria-hidden="true" animate={reducedMotion ? undefined : { scale: [1, 1.3, 1], opacity: [0.45, 1, 0.45] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: JC.success, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#ffffff" }}>Réponse sous 24h</p>
                  </div>
                  <div style={{ padding: mobile ? "24px" : "28px", borderRadius: 20, background: white(0.02), border: `1px solid ${white(0.08)}` }}>
                    <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: white(0.58), fontFamily: BODY }}>Note</p>
                    <blockquote style={{ margin: 0, fontFamily: DISPLAY, fontSize: mobile ? 22 : 28, fontWeight: 300, lineHeight: 1.5, color: white(0.75), fontStyle: "italic", letterSpacing: -0.8 }}>
                      &ldquo;Chaque projet commence par une conversation. La vôtre commence ici.&rdquo;
                    </blockquote>
                  </div>
                </aside>
              </Reveal>
            </div>
          </div>
        </section>
      </div>

      <footer style={{ padding: mobile ? "32px 20px" : "40px 72px", borderTop: `1px solid ${white(0.06)}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "minmax(0,1fr)" : tablet ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: mobile ? 32 : 24, alignItems: "start", minWidth: 0 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, color: white(0.55), letterSpacing: 4, margin: "0 0 8px 0", fontWeight: 700, fontFamily: DISPLAY }}>JUST<span style={{ color: white(0.3) }}>.</span></p>
            <p style={{ fontSize: 12, color: white(0.55), margin: 0, fontFamily: BODY, lineHeight: 1.6 }}>Paris, France<br />© {new Date().getFullYear()} Just Group</p>
          </div>
          <nav aria-label="Liens du pied de page" style={{ minWidth: 0 }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {FOOTER_NAV.map(link => (
                <li key={link.label}>
                  <a href={link.href} style={{ fontSize: 12, fontFamily: BODY, fontWeight: 500, letterSpacing: 1, overflowWrap: "break-word", color: white(0.55), textDecoration: "none", transition: "color 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.color = white(0.9) }} onMouseLeave={e => { e.currentTarget.style.color = white(0.55) }}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: mobile ? "flex-start" : tablet ? "flex-start" : "flex-end", minWidth: 0 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {socials.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{ color: white(0.55), textDecoration: "none", transition: "color 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.color = white(0.9) }} onMouseLeave={e => { e.currentTarget.style.color = white(0.55) }}>{s.icon}</a>
              ))}
            </div>
            <a href="mailto:contact@justgroup.fr" style={{ fontSize: 12, fontFamily: BODY, fontWeight: 400, overflowWrap: "break-word", color: white(0.55), textDecoration: "none", transition: "color 0.2s ease" }} onMouseEnter={e => { e.currentTarget.style.color = white(0.9) }} onMouseLeave={e => { e.currentTarget.style.color = white(0.55) }}>contact@justgroup.fr</a>
          </div>
        </div>
      </footer>
    </main>
  )
}