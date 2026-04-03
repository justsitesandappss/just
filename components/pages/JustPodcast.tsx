"use client"

import { useEffect, useMemo, useRef, useState, useCallback, useId } from "react"
import { motion, useInView, AnimatePresence, useReducedMotion } from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const COLORS = {
  bg: "#000000",
  text: "#FFFFFF",
  textStrong: "rgba(255,255,255,0.92)",
  textBody: "rgba(255,255,255,0.78)",
  textSoft: "rgba(255,255,255,0.68)",
  textMuted: "rgba(255,255,255,0.58)",
  textSubtle: "rgba(255,255,255,0.46)",
  textGhost: "rgba(255,255,255,0.18)",
  border: "rgba(255,255,255,0.12)",
  borderSoft: "rgba(255,255,255,0.08)",
  surface: "rgba(255,255,255,0.02)",
  surfaceHover: "rgba(255,255,255,0.04)",
  accent: "#FFFFFF",
  error: "#ff4444",
  errorBg: "rgba(255,68,68,0.08)",
  errorBorder: "rgba(255,68,68,0.2)",
  success: "#22c55e",
  placeholder: "rgba(255,255,255,0.3)",
  muted: "rgba(255,255,255,0.65)",
} as const

const BREAKPOINTS = { mobile: 768, tablet: 1024 } as const

type Testimonial = { text: string; by: string }
type FormatItem = { title: string; desc: string; image: string; imageAlt: string }
type ServiceItem = { title: string; desc: string }
type WhyItem = { n: string; t: string; d: string }
type ContactStatus = "idle" | "sending" | "success" | "error"
type ContactFormDataState = { name: string; email: string; phone: string; company: string; entity: string; message: string; bookingDate: string; bookingSlot: string }
type ContactErrorState = Partial<Record<keyof ContactFormDataState, string>>

interface ResponsiveState { width: number; mobile: boolean; tablet: boolean }

function clampText(v: string | undefined, fb: string) { const c = typeof v === "string" ? v.trim() : ""; return c || fb }
function isValidEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) }

function useResponsive(containerRef: React.RefObject<HTMLElement | null>): ResponsiveState {
  const [width, setWidth] = useState<number>(typeof window === "undefined" ? 1440 : 1440)
  useEffect(() => {
    if (typeof window === "undefined") return
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(() => { setWidth(containerRef.current?.clientWidth || window.innerWidth || 1440) })
    }
    update()
    const node = containerRef.current
    let obs: ResizeObserver | null = null
    if (node && typeof ResizeObserver !== "undefined") { obs = new ResizeObserver(() => update()); obs.observe(node) }
    window.addEventListener("resize", update, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", update); obs?.disconnect() }
  }, [containerRef])
  return { width, mobile: width < BREAKPOINTS.mobile, tablet: width < BREAKPOINTS.tablet }
}

function useGlobalStyles() {
  useEffect(() => {
    if (typeof document === "undefined") return
    if (!document.getElementById("just-podcast-fonts")) {
      const link = document.createElement("link")
      link.id = "just-podcast-fonts"
      link.rel = "stylesheet"
      link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap"
      document.head.appendChild(link)
    }
    if (!document.getElementById("just-podcast-a11y-styles")) {
      const style = document.createElement("style")
      style.id = "just-podcast-a11y-styles"
      style.innerHTML = `
        .just-root, .just-root *, .just-root *::before, .just-root *::after { box-sizing: border-box; }
        .just-root { line-height: 1.5; width: 100%; max-width: 100%; }
        .just-root * { min-width: 0; }
        .just-visually-hidden { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important; }
        .just-root a:focus-visible, .just-root button:focus-visible, .just-root input:focus-visible, .just-root textarea:focus-visible { outline: 2px solid #ffffff !important; outline-offset: 4px !important; }
        .just-skip-link { position: absolute; left: 16px; top: 16px; transform: translateY(-220%); transition: transform 0.2s ease; z-index: 9999; background: #fff; color: #000; padding: 12px 16px; border-radius: 10px; text-decoration: none; font-family: ${BODY}; font-size: 14px; font-weight: 700; }
        .just-skip-link:focus { transform: translateY(0); }
        .just-dark-form input::placeholder, .just-dark-form textarea::placeholder { color: rgba(255,255,255,0.3); }
        .just-dark-form input:-webkit-autofill, .just-dark-form textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px #000 inset !important; -webkit-text-fill-color: #fff !important; }
        @media (max-width: 980px) {
          .just-contact-grid-dark { grid-template-columns: 1fr !important; gap: 56px !important; }
          .just-contact-two-cols-dark { grid-template-columns: 1fr !important; gap: 28px !important; }
          .just-contact-sticky-dark { position: relative !important; top: 0 !important; }
        }
        .jm2-link { color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.2s ease; }
        .jm2-link:hover { color: rgba(255,255,255,0.9); }
      `
      document.head.appendChild(style)
    }
  }, [])
}

function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-60px 0px" })
  const rm = useReducedMotion() ?? false
  return (
    <motion.div ref={ref} initial={rm ? false : { opacity: 0, y: 36 }} animate={rm ? { opacity: 1, y: 0 } : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }} transition={{ duration: rm ? 0 : 0.8, delay: rm ? 0 : delay, ease: EASE }} style={{ minWidth: 0, ...style }}>
      {children}
    </motion.div>
  )
}

function AccessibleImage({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false)
  if (!src || err) return (
    <div role="img" aria-label={alt} style={{ width: "100%", height: "100%", minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))", color: COLORS.textMuted, fontFamily: BODY, fontSize: 14, ...style }}>
      Visuel podcast
    </div>
  )
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />
}

function Marquee({ items, speed = 35, ariaLabel = "Liste d'éléments" }: { items: string[]; speed?: number; ariaLabel?: string }) {
  const rm = useReducedMotion() ?? false
  const tripled = useMemo(() => [...items, ...items, ...items], [items])
  return (
    <section aria-label={ariaLabel} style={{ overflow: "hidden", width: "100%", maxWidth: "100%", maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}>
      <ul className="just-visually-hidden">{items.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>
      <motion.div aria-hidden="true" animate={rm ? { x: 0 } : { x: ["0%", "-33.333%"] }} transition={rm ? { duration: 0 } : { duration: speed, repeat: Infinity, ease: "linear" }} style={{ display: "flex", gap: 32, width: "max-content", maxWidth: "none", alignItems: "center", paddingInline: 8 }}>
        {tripled.map((item, i) => (
          <span key={`${item}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 32 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: "clamp(32px, 5vw, 72px)", fontWeight: 800, color: "rgba(255,255,255,0.10)", letterSpacing: -1.5, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1, flexShrink: 0 }}>{item}</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "inline-block", flexShrink: 0 }} />
          </span>
        ))}
      </motion.div>
    </section>
  )
}

function Counter({ value, label, delay = 0, reducedMotion = false }: { value: string; label: string; delay?: number; reducedMotion?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  const numVal = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0
  const suffix = value.replace(/[0-9]/g, "")
  const [count, setCount] = useState(reducedMotion ? numVal : 0)
  useEffect(() => {
    if (!inView) return
    if (reducedMotion) { setCount(numVal); return }
    let raf = 0
    const t = window.setTimeout(() => {
      const dur = 1800, s = performance.now()
      const frame = (now: number) => {
        const p = Math.min((now - s) / dur, 1)
        setCount(Math.floor((1 - Math.pow(1 - p, 4)) * numVal))
        if (p < 1) raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }, delay * 1000)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [inView, numVal, delay, reducedMotion])
  return (
    <div ref={ref} style={{ textAlign: "center", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center", padding: "12px 8px", minWidth: 0 }}>
      <p aria-label={`${value} ${label}`} style={{ fontFamily: BODY, fontWeight: 700, fontSize: "clamp(34px, 4vw, 64px)", color: COLORS.text, lineHeight: 1, margin: "0 0 10px", letterSpacing: -1.5 }}>{inView || reducedMotion ? count : 0}{suffix}</p>
      <p style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", fontFamily: BODY, margin: 0, lineHeight: 1.5 }}>{label}</p>
    </div>
  )
}

function WaveformBars({ count = 40, height = 60, color = "rgba(255,255,255,0.10)", reducedMotion = false }: { count?: number; height?: number; color?: string; reducedMotion?: boolean }) {
  const heights = useMemo(() => Array.from({ length: count }).map((_, i) => Math.max(10, 16 + Math.sin(i * 0.42) * 18 + ((i * 17) % 13))), [count])
  return (
    <div aria-hidden="true" role="presentation" style={{ display: "flex", alignItems: "center", gap: 3, height, justifyContent: "center", width: "100%", maxWidth: "100%", overflow: "hidden" }}>
      {heights.map((h, i) => (
        <motion.div key={i} animate={reducedMotion ? { height: h } : { height: [h * 0.5, h, h * 0.7, h * 0.9, h * 0.6] }} transition={reducedMotion ? { duration: 0 } : { duration: 1.6 + (i % 5) * 0.12, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }} style={{ width: 3, height: Math.max(8, h), borderRadius: 2, background: color, flexShrink: 0 }} />
      ))}
    </div>
  )
}

function ProcessStep({ number, title, description, isLast = false, delay = 0, reducedMotion = false, stacked = false }: { number: string; title: string; description: string; isLast?: boolean; delay?: number; reducedMotion?: boolean; stacked?: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  return (
    <motion.article ref={ref} initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={reducedMotion ? { opacity: 1, y: 0 } : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }} transition={{ duration: reducedMotion ? 0 : 0.7, delay, ease: EASE }} style={{ flex: 1, position: "relative", paddingRight: stacked || isLast ? 0 : 32, minWidth: 0 }}>
      {!isLast && !stacked && (
        <motion.div initial={reducedMotion ? false : { scaleX: 0 }} animate={reducedMotion ? { scaleX: 1 } : inView ? { scaleX: 1 } : { scaleX: 0 }} transition={{ duration: reducedMotion ? 0 : 1, delay: reducedMotion ? 0 : delay + 0.25, ease: EASE }} style={{ position: "absolute", top: 16, left: 32, right: 0, height: 1, background: "linear-gradient(to right, rgba(255,255,255,0.24), rgba(255,255,255,0.06))", transformOrigin: "left" }} aria-hidden="true" />
      )}
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, position: "relative", zIndex: 1, background: COLORS.bg, flexShrink: 0 }} aria-hidden="true">
        <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, color: COLORS.textSoft }}>{number}</span>
      </div>
      <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: COLORS.text, letterSpacing: -0.5, margin: "0 0 10px", lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.8, color: COLORS.textBody, fontWeight: 400, margin: 0, maxWidth: stacked ? "100%" : 260 }}>{description}</p>
    </motion.article>
  )
}

function TestimonialSlider({ items, reducedMotion = false, label = "Témoignages clients" }: { items: Testimonial[]; reducedMotion?: boolean; label?: string }) {
  const safeItems = items.filter(i => i.text.trim() && i.by.trim())
  const [current, setCurrent] = useState(0)
  const timer = useRef<number | null>(null)
  const next = useCallback(() => setCurrent(p => (p + 1) % safeItems.length), [safeItems.length])
  const clearT = useCallback(() => { if (timer.current) { window.clearInterval(timer.current); timer.current = null } }, [])
  const startT = useCallback(() => {
    if (reducedMotion || safeItems.length <= 1) return
    clearT(); timer.current = window.setInterval(next, 6000)
  }, [clearT, next, reducedMotion, safeItems.length])
  useEffect(() => { startT(); return () => clearT() }, [startT, clearT])
  if (!safeItems.length) return null
  const a = safeItems[current]
  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} onMouseEnter={clearT} onMouseLeave={startT} onFocus={clearT} onBlur={startT} style={{ minWidth: 0 }}>
      <AnimatePresence mode="wait">
        <motion.figure key={current} initial={reducedMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -16 }} transition={{ duration: reducedMotion ? 0 : 0.45, ease: EASE }} style={{ margin: 0, minWidth: 0 }}>
          <blockquote aria-live="polite" style={{ fontFamily: DISPLAY, fontSize: "clamp(20px, 2.5vw, 32px)", fontWeight: 400, lineHeight: 1.55, color: COLORS.textBody, margin: 0, letterSpacing: -0.5, fontStyle: "italic" }}>"{a.text}"</blockquote>
          <figcaption style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, color: COLORS.textMuted, letterSpacing: 2, textTransform: "uppercase", marginTop: 24, lineHeight: 1.5 }}>{a.by}</figcaption>
        </motion.figure>
      </AnimatePresence>
      {safeItems.length > 1 && (
        <div style={{ display: "flex", gap: 10, marginTop: 28, alignItems: "center", flexWrap: "wrap" }}>
          {safeItems.map((item, i) => (
            <button key={`${item.by}-${i}`} type="button" aria-label={`Témoignage ${i + 1}`} aria-pressed={i === current} onClick={() => { setCurrent(i); startT() }} style={{ cursor: "pointer", border: `1px solid ${i === current ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.16)"}`, background: i === current ? "#fff" : "rgba(255,255,255,0.08)", width: i === current ? 34 : 12, height: 12, borderRadius: 999, padding: 0, transition: "all 0.25s ease" }} />
          ))}
        </div>
      )}
    </div>
  )
}

function ContactInputField({ id, label, name, type = "text", autoComplete, inputMode, placeholder, required = false, value, error, hint, onChange }: { id: string; label: string; name: string; type?: string; autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; placeholder?: string; required?: boolean; value: string; error?: string; hint?: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <motion.label htmlFor={id} animate={{ top: active ? 6 : 24, fontSize: active ? 11 : 15, color: error ? COLORS.error : COLORS.text, letterSpacing: active ? 3.5 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", left: 0, fontFamily: BODY, fontWeight: active ? 700 : 400, textTransform: active ? "uppercase" : "none", pointerEvents: "none", zIndex: 1, lineHeight: 1 }}>
        {label}{required && <span aria-hidden="true" style={{ color: COLORS.text }}> *</span>}
      </motion.label>
      <input id={id} name={name} type={type} value={value} required={required} autoComplete={autoComplete} inputMode={inputMode} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={[hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined} placeholder={focused ? placeholder : ""} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: "100%", minWidth: 0, background: "transparent", border: "none", borderBottom: `1px solid ${error ? COLORS.error : focused ? COLORS.text : COLORS.border}`, padding: "30px 0 16px", fontFamily: BODY, fontSize: 17, color: COLORS.text, outline: "none", transition: "border-color 0.25s ease", letterSpacing: 0.2 }} />
      {hint && <p id={`${id}-hint`} style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 12, color: COLORS.muted }}>{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 13, color: COLORS.error }}>{error}</p>}
    </div>
  )
}

function ContactTextareaField({ id, label, name, placeholder, required = false, value, error, onChange }: { id: string; label: string; name: string; placeholder?: string; required?: boolean; value: string; error?: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <motion.label htmlFor={id} animate={{ top: active ? 6 : 24, fontSize: active ? 11 : 15, color: error ? COLORS.error : COLORS.text, letterSpacing: active ? 3.5 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", left: 0, fontFamily: BODY, fontWeight: active ? 700 : 400, textTransform: active ? "uppercase" : "none", pointerEvents: "none", zIndex: 1, lineHeight: 1 }}>
        {label}{required && <span aria-hidden="true" style={{ color: COLORS.text }}> *</span>}
      </motion.label>
      <textarea id={id} name={name} value={value} required={required} aria-required={required || undefined} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} placeholder={focused ? placeholder : ""} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} rows={5} style={{ width: "100%", minWidth: 0, background: "transparent", border: "none", borderBottom: `1px solid ${error ? COLORS.error : focused ? COLORS.text : COLORS.border}`, padding: "30px 0 16px", fontFamily: BODY, fontSize: 17, color: COLORS.text, outline: "none", resize: "vertical", minHeight: 130, transition: "border-color 0.25s ease" }} />
      {error && <p id={`${id}-error`} role="alert" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 13, color: COLORS.error }}>{error}</p>}
    </div>
  )
}

function ContactPillSelect({ label, name, options, value, onChange }: { label: string; name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const gid = useId()
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
      <legend id={gid} style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: COLORS.text, marginBottom: 18 }}>{label}</legend>
      <div role="group" aria-labelledby={gid} style={{ display: "flex", flexWrap: "wrap", gap: 10, minWidth: 0 }}>
        {options.map(opt => {
          const a = value === opt
          return (
            <motion.button key={opt} type="button" aria-pressed={a} onClick={() => onChange(a ? "" : opt)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} animate={{ background: a ? "#FFFFFF" : "transparent", borderColor: a ? "#FFFFFF" : "rgba(255,255,255,0.18)", color: a ? "#000000" : "#FFFFFF" }} transition={{ duration: 0.2 }} style={{ padding: "11px 20px", borderRadius: 100, border: "1px solid", fontFamily: BODY, fontSize: 13, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer", outline: "none" }}>
              {opt}
            </motion.button>
          )
        })}
      </div>
      <input type="hidden" name={name} value={value} />
    </fieldset>
  )
}

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
const TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]

function BookingCalendar({ selectedDate, selectedSlot, onSelectDate, onSelectSlot, mobile = false }: { selectedDate: string; selectedSlot: string; onSelectDate: (d: string) => void; onSelectSlot: (s: string) => void; mobile?: boolean }) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const calendarDays = useMemo(() => {
    const y = viewMonth.getFullYear(), m = viewMonth.getMonth()
    const firstDay = new Date(y, m, 1)
    let startDow = firstDay.getDay() - 1; if (startDow < 0) startDow = 6
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startDow; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [viewMonth])
  const formatDateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6
  const isPast = (d: Date) => d < today
  const canGoPrev = viewMonth > new Date(today.getFullYear(), today.getMonth(), 1)
  return (
    <div style={{ minWidth: 0 }}>
      <fieldset style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
        <legend style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: COLORS.text, marginBottom: 20 }}>Réserver un créneau</legend>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))} disabled={!canGoPrev} aria-label="Mois précédent" style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${COLORS.border}`, background: "transparent", color: canGoPrev ? COLORS.text : COLORS.textSubtle, cursor: canGoPrev ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>←</button>
          <span style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: COLORS.text, letterSpacing: -0.5 }}>{MONTHS_FR[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
          <button type="button" onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))} aria-label="Mois suivant" style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${COLORS.border}`, background: "transparent", color: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>→</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
          {DAYS_FR.map(d => <div key={d} style={{ textAlign: "center", fontFamily: BODY, fontSize: 10, fontWeight: 700, color: COLORS.textSubtle, letterSpacing: 1, textTransform: "uppercase", padding: "6px 0" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }} role="grid" aria-label="Sélection de date">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />
            const key = formatDateKey(day)
            const disabled = isPast(day) || isWeekend(day)
            const selected = selectedDate === key
            const isToday = key === formatDateKey(today)
            return (
              <button key={key} type="button" disabled={disabled} onClick={() => onSelectDate(selected ? "" : key)} aria-pressed={selected} style={{ aspectRatio: "1", borderRadius: 10, border: selected ? "1px solid #FFFFFF" : isToday ? `1px solid ${COLORS.border}` : "1px solid transparent", background: selected ? "rgba(255,255,255,0.14)" : "transparent", color: disabled ? COLORS.textSubtle : selected ? COLORS.text : COLORS.textSoft, fontFamily: BODY, fontSize: mobile ? 13 : 14, fontWeight: selected ? 700 : 500, cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease", opacity: disabled ? 0.35 : 1 }}>
                {day.getDate()}
              </button>
            )
          })}
        </div>
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} style={{ marginTop: 24 }}>
            <p style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, marginBottom: 14, marginTop: 0 }}>Créneau horaire</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TIME_SLOTS.map(slot => {
                const active = selectedSlot === slot
                return (
                  <motion.button key={slot} type="button" aria-pressed={active} onClick={() => onSelectSlot(active ? "" : slot)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} animate={{ background: active ? "#FFFFFF" : "transparent", borderColor: active ? "#FFFFFF" : "rgba(255,255,255,0.16)", color: active ? "#000000" : COLORS.textSoft }} transition={{ duration: 0.2 }} style={{ padding: "10px 18px", borderRadius: 100, border: "1px solid", fontFamily: BODY, fontSize: 13, fontWeight: active ? 700 : 500, letterSpacing: 0.5, cursor: "pointer", outline: "none" }}>
                    {slot}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </fieldset>
    </div>
  )
}

const FOOTER_NAV = [
  { label: "Just Impact", href: "/just-impact" },
  { label: "Just Prod", href: "/just-prod" },
  { label: "Just Agency", href: "/just-agency" },
  { label: "Contact", href: "/contact" },
] as const

const ICONS = {
  instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>,
  tiktok: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.07A6.33 6.33 0 0 0 3 15.64 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.33-6.33V9.19a8.16 8.16 0 0 0 3.89.98V6.69Z" /></svg>,
  linkedin: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
} as const

export default function JustPodcastPage() {
  const reducedMotion = useReducedMotion() ?? false
  const rootRef = useRef<HTMLDivElement | null>(null)
  const responsive = useResponsive(rootRef as React.RefObject<HTMLElement | null>)
  useGlobalStyles()

  const WEB3FORMS_ACCESS_KEY = "b891692e-8148-4785-856a-e1c43f4816dc"

  const formats: FormatItem[] = [
    { title: "Série de marque", desc: "Un podcast à votre nom, avec votre identité sonore, votre ligne éditoriale et un rendez-vous régulier.", image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/podcast-podcast.jpg", imageAlt: "Microphone de studio" },
    { title: "Interviews & Conversations", desc: "Invitez experts, clients ou partenaires pour installer votre marque au centre des discussions qui comptent.", image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/podcast-talk.jpg", imageAlt: "Casque audio studio" },
    { title: "Podcast interne", desc: "Partagez la culture, embarquez les équipes, onboardez mieux et rendez la communication interne plus humaine.", image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/podcast-groupe.jpg", imageAlt: "Équipe en studio" },
    { title: "Podcast événementiel", desc: "Captez l'énergie d'un événement et prolongez son impact bien après la dernière lumière.", image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/podcast-show.jpg", imageAlt: "Scène événement audio" },
  ]
  const whys: WhyItem[] = [
    { n: "01", t: "Intimité inégalée", d: "Le podcast crée une connexion directe avec votre audience, dans les oreilles, dans le quotidien, dans la durée." },
    { n: "02", t: "Contenu evergreen", d: "Contrairement à un post social, un épisode continue de générer des écoutes pendant des mois." },
    { n: "03", t: "Crédibilité instantanée", d: "Experts, invités, retours d'expérience et vision de marque renforcent votre légitimité." },
    { n: "04", t: "Engagement profond", d: "L'audio capte une attention longue et volontaire, rare sur le web contemporain." },
  ]
  const services: ServiceItem[] = [
    { title: "Stratégie & Positionnement", desc: "Concept, cible, angle éditorial, promesse et calendrier pour construire un format utile et distinctif." },
    { title: "Production Audio", desc: "Enregistrement, montage, mixage, mastering et identité sonore, avec un niveau de finition premium." },
    { title: "Booking d'invités", desc: "On identifie et contacte les intervenants qui augmentent la valeur perçue de chaque épisode." },
    { title: "Distribution Multi-Plateforme", desc: "Publication sur Spotify, Apple Podcasts, Deezer, YouTube et autres plateformes pertinentes." },
    { title: "Promotion & Growth", desc: "Clips, audiogrammes, formats courts, relais créateurs et mécanique de diffusion intelligente." },
    { title: "Analytics & ROI", desc: "Lecture des données, suivi des performances et reporting exploitable." },
  ]
  const quotes: Testimonial[] = [
    { text: "Just a créé notre podcast de marque de A à Z. En quelques mois, notre prise de parole est devenue identifiable et crédible.", by: "Directrice marketing, groupe retail" },
    { text: "Le podcast a changé notre relation client. Les prospects arrivent déjà convaincus par notre niveau d'expertise.", by: "CEO, cabinet de conseil" },
    { text: "La qualité éditoriale et sonore est au niveau de productions bien plus grosses. Rien de bricolé.", by: "Head of Content, marque lifestyle" },
  ]
  const contactEntityList = useMemo(() => ["Podcast de marque", "Interview / Conversation", "Podcast interne", "Podcast événementiel"], [])
  const socials = useMemo(() => [
    { href: "https://instagram.com/justgroup", label: "Instagram", icon: ICONS.instagram },
    { href: "https://tiktok.com/@justgroup", label: "TikTok", icon: ICONS.tiktok },
    { href: "https://linkedin.com/company/justgroup", label: "LinkedIn", icon: ICONS.linkedin },
  ], [])

  const [contactFormData, setContactFormData] = useState<ContactFormDataState>({ name: "", email: "", phone: "", company: "", entity: "", message: "", bookingDate: "", bookingSlot: "" })
  const [contactErrors, setContactErrors] = useState<ContactErrorState>({})
  const [contactStatus, setContactStatus] = useState<ContactStatus>("idle")
  const [contactLiveMessage, setContactLiveMessage] = useState("")

  const contactNameId = useId(), contactEmailId = useId(), contactPhoneId = useId(), contactCompanyId = useId(), contactMessageId = useId()
  const contactSectionTitleId = useId(), contactSectionDescId = useId(), contactSuccessTitleId = useId()

  const updateContactField = useCallback((field: keyof ContactFormDataState) => (value: string) => {
    setContactFormData(prev => ({ ...prev, [field]: value }))
    if (contactErrors[field]) setContactErrors(prev => ({ ...prev, [field]: undefined }))
    if (contactStatus === "error") { setContactStatus("idle"); setContactLiveMessage("") }
  }, [contactErrors, contactStatus])

  const validateContactForm = useCallback(() => {
    const e: ContactErrorState = {}
    if (!contactFormData.name.trim()) e.name = "Merci d'indiquer votre nom."
    if (!contactFormData.email.trim()) e.email = "Merci d'indiquer votre adresse email."
    else if (!isValidEmail(contactFormData.email)) e.email = "L'adresse email semble invalide."
    if (!contactFormData.message.trim()) e.message = "Merci de préciser votre demande."
    else if (contactFormData.message.trim().length < 10) e.message = "Votre message est un peu trop court."
    return e
  }, [contactFormData])

  const resetContactForm = useCallback(() => {
    setContactFormData({ name: "", email: "", phone: "", company: "", entity: "", message: "", bookingDate: "", bookingSlot: "" })
    setContactErrors({}); setContactStatus("idle"); setContactLiveMessage("")
  }, [])

  const handleContactSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors = validateContactForm()
    setContactErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) { setContactStatus("error"); setContactLiveMessage("Le formulaire contient des erreurs."); return }
    setContactStatus("sending"); setContactLiveMessage("Envoi du formulaire en cours.")
    try {
      const bookingInfo = contactFormData.bookingDate && contactFormData.bookingSlot ? `\n\nCréneau souhaité : ${contactFormData.bookingDate} à ${contactFormData.bookingSlot}` : contactFormData.bookingDate ? `\n\nDate souhaitée : ${contactFormData.bookingDate}` : ""
      const fd = new FormData()
      fd.append("access_key", WEB3FORMS_ACCESS_KEY)
      fd.append("subject", `[JUST PODCAST] Nouveau contact — ${contactFormData.entity || "Général"}`)
      fd.append("from_name", contactFormData.name)
      fd.append("name", contactFormData.name); fd.append("email", contactFormData.email)
      fd.append("phone", contactFormData.phone); fd.append("company", contactFormData.company)
      fd.append("entity", contactFormData.entity); fd.append("message", contactFormData.message + bookingInfo)
      if (contactFormData.bookingDate) fd.append("booking_date", contactFormData.bookingDate)
      if (contactFormData.bookingSlot) fd.append("booking_slot", contactFormData.bookingSlot)
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data?.success) { setContactStatus("success"); setContactLiveMessage("Message envoyé.") }
      else { setContactStatus("error"); setContactLiveMessage(data?.message || "Une erreur est survenue.") }
    } catch { setContactStatus("error"); setContactLiveMessage("Une erreur est survenue.") }
  }, [contactFormData, validateContactForm])

  const isContactSubmitDisabled = contactStatus === "sending" || !contactFormData.name.trim() || !contactFormData.email.trim() || !contactFormData.message.trim()

  const sectionPadding = responsive.mobile ? "72px 20px" : responsive.tablet ? "88px 32px" : "100px 56px"
  const heroPadding = responsive.mobile ? "84px 20px 72px" : responsive.tablet ? "92px 32px 80px" : "72px 56px 96px"
  const fourCols = responsive.mobile ? "1fr" : responsive.tablet ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))"
  const threeCols = responsive.mobile ? "1fr" : responsive.tablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))"
  const processLayout = responsive.mobile || responsive.tablet ? "column" : "row"
  const maxW = 1200

  return (
    <div ref={rootRef} className="just-root" style={{ width: "100%", maxWidth: "100%", background: COLORS.bg, color: COLORS.textBody, fontFamily: BODY, overflowX: "hidden", WebkitFontSmoothing: "antialiased" }}>
      <a href="#contenu-principal" className="just-skip-link">Aller au contenu principal</a>

      <div aria-labelledby="hero-title" style={{ minHeight: responsive.mobile ? "auto" : "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: heroPadding, position: "relative" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: responsive.mobile ? "28px 28px" : "40px 40px", pointerEvents: "none" }} />
        <motion.p initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }} style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 32px", display: "flex", alignItems: "center", gap: 12, lineHeight: 1.5, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <motion.span aria-hidden="true" animate={reducedMotion ? { scale: 1, opacity: 0.8 } : { scale: [1, 1.45, 1], opacity: [0.35, 0.9, 0.35] }} transition={reducedMotion ? { duration: 0 } : { duration: 2.2, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
          Podcast · Marques · Storytelling · Audience
        </motion.p>
        <div style={{ maxWidth: 1120, width: "100%", position: "relative", zIndex: 1, minWidth: 0 }}>
          <motion.h1 id="hero-title" initial={reducedMotion ? false : { opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: EASE }} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: responsive.mobile ? "clamp(38px, 13vw, 56px)" : "clamp(54px, 8vw, 108px)", lineHeight: 0.95, color: COLORS.text, margin: 0, letterSpacing: responsive.mobile ? -2 : -4, maxWidth: "100%" }}>
            Votre marque<br />
            <span style={{ color: "rgba(255,255,255,0.74)" }}>a une voix.</span><br />
            <span style={{ fontWeight: 400, fontStyle: "italic", color: "rgba(255,255,255,0.55)", letterSpacing: responsive.mobile ? -1 : -2 }}>On la fait entendre.</span>
          </motion.h1>
        </div>
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35, ease: EASE }} style={{ marginTop: 28, width: "100%", maxWidth: 720, minWidth: 0 }}>
          <WaveformBars count={responsive.mobile ? 28 : responsive.tablet ? 42 : 60} height={36} color="rgba(255,255,255,0.12)" reducedMotion={reducedMotion} />
        </motion.div>
        <motion.p initial={reducedMotion ? false : { opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45, ease: EASE }} style={{ margin: "28px 0 0", fontSize: responsive.mobile ? 15 : 17, lineHeight: 1.85, maxWidth: 620, color: COLORS.textBody, fontWeight: 400, position: "relative", zIndex: 1 }}>
          Le podcast est le format le plus intime et le plus engageant du digital. Chez Just, on conçoit, produit et distribue des podcasts de marque qui créent de la confiance, positionnent votre expertise et engagent vos audiences, épisode après épisode.
        </motion.p>
        {!responsive.mobile && (
          <motion.div initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} aria-hidden="true" style={{ position: "absolute", bottom: 40, left: responsive.tablet ? 32 : 56, display: "flex", alignItems: "center", gap: 12 }}>
            <motion.div animate={reducedMotion ? { y: 0 } : { y: [0, 8, 0] }} transition={reducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ width: 1, height: 40, background: "linear-gradient(to bottom, rgba(255,255,255,0.45), transparent)" }} />
            <span style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, fontWeight: 700 }}>Scroll</span>
          </motion.div>
        )}
      </div>

      <main id="contenu-principal" tabIndex={-1}>
        <section style={{ padding: "8px 0 0" }}>
          <Marquee items={["Podcast", "Brand Content", "Storytelling", "Audio", "Audience", "Engagement", "Confiance", "Expertise"]} speed={40} ariaLabel="Mots-clés podcast" />
        </section>

        <section aria-labelledby="stats-title" style={{ padding: sectionPadding, position: "relative" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)", pointerEvents: "none" }} />
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 14px" }}>Le podcast en chiffres</p>
              <h2 id="stats-title" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px, 3.5vw, 46px)", color: COLORS.text, letterSpacing: responsive.mobile ? -1.5 : -2, margin: 0, lineHeight: 1.1 }}>
                Pourquoi les marques investissent <span style={{ color: "rgba(255,255,255,0.66)" }}>dans l'audio</span>
              </h2>
            </div>
          </Reveal>
          <Reveal>
            <div style={{ maxWidth: maxW, margin: "0 auto", display: "grid", gridTemplateColumns: fourCols, gap: responsive.mobile ? 20 : 36, alignItems: "stretch" }}>
              <Counter value="85%" label="Taux de complétion moyen" delay={0} reducedMotion={reducedMotion} />
              <Counter value="3x" label="Plus mémorable que la pub" delay={0.1} reducedMotion={reducedMotion} />
              <Counter value="48" label="Minutes d'écoute moyenne" delay={0.2} reducedMotion={reducedMotion} />
              <Counter value="73%" label="Achètent après un podcast" delay={0.3} reducedMotion={reducedMotion} />
            </div>
          </Reveal>
        </section>

        <section aria-labelledby="why-title" style={{ padding: sectionPadding }}>
          <div style={{ maxWidth: maxW, margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 14px" }}>Pourquoi le podcast</p>
              <h2 id="why-title" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px, 4.5vw, 58px)", color: COLORS.text, lineHeight: 1, letterSpacing: responsive.mobile ? -2 : -3, margin: "0 0 48px" }}>
                Le format qui <span style={{ color: "rgba(255,255,255,0.66)" }}>change tout</span>
              </h2>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: fourCols, gap: 14, alignItems: "stretch" }}>
              {whys.map((item, i) => (
                <Reveal key={item.n} delay={i * 0.05} style={{ height: "100%" }}>
                  <motion.article whileHover={reducedMotion ? undefined : { backgroundColor: COLORS.surfaceHover, borderColor: "rgba(255,255,255,0.16)" }} transition={{ duration: 0.25 }} style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 20, padding: responsive.mobile ? "30px 20px" : "38px 24px", textAlign: "center", minHeight: responsive.mobile ? 220 : 280, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
                    <p aria-hidden="true" style={{ fontFamily: BODY, fontSize: responsive.mobile ? 42 : 52, fontWeight: 700, color: "rgba(255,255,255,0.12)", lineHeight: 1, margin: "0 0 16px", letterSpacing: -2 }}>{item.n}</p>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, color: COLORS.text, margin: "0 0 12px", letterSpacing: -0.3, lineHeight: 1.25 }}>{item.t}</h3>
                    <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.8, color: COLORS.textBody, fontWeight: 400, margin: 0, maxWidth: 240 }}>{item.d}</p>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="formats-title" style={{ padding: sectionPadding }}>
          <div style={{ maxWidth: maxW, margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 14px" }}>Nos formats</p>
              <h2 id="formats-title" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px, 4.5vw, 58px)", color: COLORS.text, lineHeight: 1, letterSpacing: responsive.mobile ? -2 : -3, margin: "0 0 48px" }}>
                Un podcast pour chaque <span style={{ color: "rgba(255,255,255,0.66)" }}>objectif</span>
              </h2>
            </Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {formats.map((fmt, i) => {
                const rev = i % 2 === 1, mob = responsive.mobile
                return (
                  <Reveal key={`${fmt.title}-${i}`} delay={i * 0.05}>
                    <article style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : rev ? "minmax(0,1fr) minmax(0,1.15fr)" : "minmax(0,1.15fr) minmax(0,1fr)", background: COLORS.surface, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 24, overflow: "hidden", minHeight: mob ? undefined : 320, minWidth: 0 }}>
                      <div style={{ order: mob ? 1 : rev ? 2 : 1, position: "relative", overflow: "hidden", minHeight: mob ? 260 : 320, minWidth: 0 }}>
                        <AccessibleImage src={fmt.image} alt={fmt.imageAlt} />
                        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: mob ? "linear-gradient(to top, rgba(0,0,0,0.2), rgba(0,0,0,0.05))" : rev ? "linear-gradient(to left, transparent 40%, rgba(0,0,0,0.55) 100%)" : "linear-gradient(to right, transparent 40%, rgba(0,0,0,0.55) 100%)", pointerEvents: "none" }} />
                      </div>
                      <div style={{ order: mob ? 2 : rev ? 1 : 2, padding: mob ? "28px 22px" : responsive.tablet ? "36px 32px" : "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                        <p aria-hidden="true" style={{ fontFamily: BODY, fontSize: mob ? 50 : 80, fontWeight: 700, color: "rgba(255,255,255,0.12)", lineHeight: 1, letterSpacing: -2, margin: "0 0 -8px" }}>{String(i + 1).padStart(2, "0")}</p>
                        <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: mob ? 22 : 26, color: COLORS.text, letterSpacing: -1, lineHeight: 1.15, margin: "0 0 16px" }}>{fmt.title}</h3>
                        <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.85, color: COLORS.textBody, fontWeight: 400, margin: 0, maxWidth: 480 }}>{fmt.desc}</p>
                        <div style={{ marginTop: 24, opacity: 0.75, width: "100%", minWidth: 0 }}>
                          <WaveformBars count={20} height={16} color="rgba(255,255,255,0.16)" reducedMotion={reducedMotion} />
                        </div>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section style={{ padding: "20px 0 40px" }}>
          <Marquee items={["Spotify", "Apple Podcasts", "YouTube", "Deezer", "Amazon Music", "RSS"]} speed={30} ariaLabel="Plateformes de diffusion podcast" />
        </section>

        <section aria-labelledby="services-title" style={{ padding: sectionPadding }}>
          <div style={{ maxWidth: maxW, margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 14px" }}>Notre offre</p>
              <h2 id="services-title" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px, 4.5vw, 58px)", color: COLORS.text, lineHeight: 1, letterSpacing: responsive.mobile ? -2 : -3, margin: "0 0 48px" }}>De l'idée à l'écoute.</h2>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: threeCols, gap: 14, alignItems: "stretch" }}>
              {services.map((svc, i) => (
                <Reveal key={`${svc.title}-${i}`} delay={i * 0.04} style={{ height: "100%" }}>
                  <motion.article whileHover={reducedMotion ? undefined : { backgroundColor: COLORS.surfaceHover }} transition={{ duration: 0.25 }} style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 20, padding: responsive.mobile ? "30px 20px" : "38px 26px", position: "relative", overflow: "hidden", minHeight: responsive.mobile ? 210 : 240, height: "100%", display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <p aria-hidden="true" style={{ fontFamily: BODY, fontSize: responsive.mobile ? 58 : 72, fontWeight: 700, color: "rgba(255,255,255,0.10)", lineHeight: 1, letterSpacing: -2, position: "absolute", top: -4, right: 14, margin: 0 }}>{String(i + 1).padStart(2, "0")}</p>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: COLORS.text, letterSpacing: -0.5, margin: "0 0 12px", lineHeight: 1.2, position: "relative", zIndex: 1 }}>{svc.title}</h3>
                    <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.85, color: COLORS.textBody, fontWeight: 400, margin: 0, position: "relative", zIndex: 1 }}>{svc.desc}</p>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="process-title" style={{ padding: sectionPadding }}>
          <div style={{ maxWidth: maxW, margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 14px" }}>Notre méthode</p>
              <h2 id="process-title" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px, 4.5vw, 58px)", color: COLORS.text, lineHeight: 1, letterSpacing: responsive.mobile ? -2 : -3, margin: "0 0 56px" }}>Comment on travaille.</h2>
            </Reveal>
            <div style={{ display: "flex", flexDirection: processLayout as "row" | "column", gap: responsive.mobile ? 36 : responsive.tablet ? 28 : 0, minWidth: 0 }}>
              <ProcessStep number="01" title="Découverte" description="On comprend votre marque, vos objectifs et votre audience pour définir le bon concept." delay={0} reducedMotion={reducedMotion} stacked={responsive.mobile || responsive.tablet} />
              <ProcessStep number="02" title="Création" description="On pose le nom, le format, l'identité sonore et le planning éditorial." delay={0.08} reducedMotion={reducedMotion} stacked={responsive.mobile || responsive.tablet} />
              <ProcessStep number="03" title="Production" description="On enregistre, on monte, on mixe et on livre au standard attendu d'un vrai média." delay={0.16} reducedMotion={reducedMotion} stacked={responsive.mobile || responsive.tablet} />
              <ProcessStep number="04" title="Lancement" description="On publie, on distribue, on pousse la visibilité et on analyse les performances." isLast delay={0.24} reducedMotion={reducedMotion} stacked={responsive.mobile || responsive.tablet} />
            </div>
          </div>
        </section>

        <section aria-labelledby="testimonials-title" style={{ padding: sectionPadding }}>
          <div style={{ maxWidth: maxW, margin: "0 auto" }}>
            <Reveal>
              <div style={{ display: "grid", gridTemplateColumns: responsive.mobile || responsive.tablet ? "1fr" : "minmax(0,0.35fr) minmax(0,1fr)", gap: responsive.mobile ? 28 : 72, alignItems: "start" }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 14px" }}>Témoignages</p>
                  <h2 id="testimonials-title" style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px, 3vw, 42px)", color: COLORS.text, lineHeight: 1, letterSpacing: -2, margin: 0 }}>Ce qu'ils<br />en disent.</h2>
                </div>
                <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 20, padding: responsive.mobile ? "28px 22px" : "48px", minWidth: 0 }}>
                  <TestimonialSlider items={quotes} reducedMotion={reducedMotion} label="Témoignages podcast" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section aria-labelledby="manifesto-title" style={{ padding: sectionPadding, display: "flex", justifyContent: "center" }}>
          <Reveal style={{ width: "100%" }}>
            <div style={{ maxWidth: 860, textAlign: "center", margin: "0 auto" }}>
              <p id="manifesto-title" style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 28px" }}>Manifesto</p>
              <blockquote style={{ fontFamily: DISPLAY, fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 400, lineHeight: 1.5, color: COLORS.textBody, margin: 0, letterSpacing: -1, fontStyle: "italic" }}>
                "Le podcast n'est pas un canal de plus. C'est un territoire de confiance. Une voix bien utilisée devient une arme de positionnement redoutable."
              </blockquote>
              <motion.div initial={reducedMotion ? false : { width: 0 }} whileInView={{ width: 60 }} viewport={{ once: true }} transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.2, ease: EASE }} style={{ height: 2, background: "rgba(255,255,255,0.22)", margin: "34px auto 0" }} aria-hidden="true" />
            </div>
          </Reveal>
        </section>

        <section className="just-dark-form" aria-labelledby={contactSectionTitleId} aria-describedby={contactSectionDescId} style={{ padding: responsive.mobile ? "80px 20px 100px" : responsive.tablet ? "100px 32px 120px" : "110px 56px 140px", borderTop: `1px solid ${COLORS.borderSoft}`, position: "relative", minWidth: 0 }}>
          <div aria-live="polite" aria-atomic="true" className="just-visually-hidden">{contactLiveMessage}</div>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center top,rgba(255,255,255,0.03) 0%,transparent 65%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal>
              <div style={{ marginBottom: responsive.mobile ? 48 : 72 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 28px", display: "flex", alignItems: "center", gap: 12 }}>
                  <motion.span aria-hidden="true" animate={reducedMotion ? undefined : { scale: [1, 1.45, 1], opacity: [0.35, 0.85, 0.35] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: "#ffffff", display: "inline-block" }} />
                  Formulaire de contact
                </p>
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: responsive.mobile ? "clamp(40px, 12vw, 58px)" : "clamp(56px, 8vw, 110px)", lineHeight: 0.92, color: "#ffffff", margin: 0, letterSpacing: responsive.mobile ? -2 : -5 }}>
                  <span style={{ display: "block" }}>Parlons</span>
                  <span style={{ display: "block", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.88)", letterSpacing: responsive.mobile ? -1 : -3 }}>de votre podcast.</span>
                </h2>
                <p style={{ marginTop: 28, fontSize: 16, lineHeight: 1.9, maxWidth: 620, color: COLORS.textBody, fontWeight: 300 }}>
                  Podcast de marque, interview, format interne ou événementiel — on a l'expertise et le studio qu'il vous faut. Remplissez le formulaire, on revient vers vous sous 24h.
                </p>
              </div>
            </Reveal>

            <div className="just-contact-grid-dark" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,0.42fr)", gap: responsive.mobile ? 56 : 88, alignItems: "start" }}>
              <Reveal>
                <div style={{ minWidth: 0 }}>
                  {contactStatus === "success" ? (
                    <motion.section aria-labelledby={contactSuccessTitleId} initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} style={{ textAlign: "center", padding: responsive.mobile ? "56px 24px" : "80px 40px", background: COLORS.surface, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 24 }}>
                      <motion.div initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }} animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }} transition={{ duration: 0.45, delay: 0.12, ease: EASE }} style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      </motion.div>
                      <h3 id={contactSuccessTitleId} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: responsive.mobile ? 28 : 34, color: "#FFFFFF", letterSpacing: -2, margin: "0 0 12px" }}>Message envoyé.</h3>
                      <p style={{ fontFamily: BODY, fontSize: 16, color: COLORS.textBody, fontWeight: 300, lineHeight: 1.8, maxWidth: 420, margin: "0 auto" }}>Merci pour votre intérêt. Notre équipe revient vers vous sous 24h.</p>
                      <motion.button type="button" onClick={resetContactForm} whileHover={reducedMotion ? undefined : { opacity: 0.85 }} style={{ marginTop: 36, padding: "14px 30px", borderRadius: 100, border: "1px solid #FFFFFF", background: "transparent", color: "#FFFFFF", fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
                        Nouveau message
                      </motion.button>
                    </motion.section>
                  ) : (
                    <section style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 14px" }}>Formulaire</p>
                      <h3 id={contactSectionTitleId} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(32px, 4vw, 48px)", color: "#FFFFFF", lineHeight: 1, letterSpacing: -2, margin: "0 0 18px" }}>Dites-nous tout.</h3>
                      <p id={contactSectionDescId} style={{ margin: "0 0 52px", fontFamily: BODY, fontSize: 15, lineHeight: 1.8, color: COLORS.textBody, maxWidth: 620 }}>Les champs marqués d'un astérisque sont obligatoires.</p>
                      <form onSubmit={handleContactSubmit} noValidate>
                        <div style={{ display: "flex", flexDirection: "column", gap: 36, minWidth: 0 }}>
                          <div className="just-contact-two-cols-dark" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 44 }}>
                            <ContactInputField id={contactNameId} label="Nom complet" name="name" required autoComplete="name" value={contactFormData.name} error={contactErrors.name} placeholder="Jean Dupont" onChange={updateContactField("name")} />
                            <ContactInputField id={contactEmailId} label="Adresse email" name="email" type="email" required autoComplete="email" inputMode="email" value={contactFormData.email} error={contactErrors.email} placeholder="jean@marque.com" onChange={updateContactField("email")} />
                          </div>
                          <div className="just-contact-two-cols-dark" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 44 }}>
                            <ContactInputField id={contactPhoneId} label="Téléphone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={contactFormData.phone} placeholder="+33 6 12 34 56 78" hint="Optionnel" onChange={updateContactField("phone")} />
                            <ContactInputField id={contactCompanyId} label="Entreprise / Marque" name="company" autoComplete="organization" value={contactFormData.company} placeholder="Votre marque" hint="Optionnel" onChange={updateContactField("company")} />
                          </div>
                          <ContactPillSelect label="Format souhaité" name="entity" options={contactEntityList} value={contactFormData.entity} onChange={updateContactField("entity")} />
                          <div style={{ padding: responsive.mobile ? "28px 20px" : "36px 32px", borderRadius: 20, background: "rgba(255,255,255,0.015)", border: `1px solid ${COLORS.borderSoft}` }}>
                            <div style={{ marginBottom: 20 }}>
                              <p style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: COLORS.text, letterSpacing: -0.5, margin: "0 0 8px" }}>Réservez une séance</p>
                              <p style={{ fontFamily: BODY, fontSize: 13, color: COLORS.textMuted, margin: 0, lineHeight: 1.7 }}>Choisissez un créneau pour discuter de votre projet podcast ou réserver une session d'enregistrement.</p>
                            </div>
                            <BookingCalendar selectedDate={contactFormData.bookingDate} selectedSlot={contactFormData.bookingSlot} onSelectDate={updateContactField("bookingDate")} onSelectSlot={updateContactField("bookingSlot")} mobile={responsive.mobile} />
                            {contactFormData.bookingDate && contactFormData.bookingSlot && (
                              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} style={{ marginTop: 20, padding: "14px 18px", borderRadius: 12, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success, flexShrink: 0 }} />
                                <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.88)" }}>Créneau sélectionné : <strong>{contactFormData.bookingDate}</strong> à <strong>{contactFormData.bookingSlot}</strong></span>
                              </motion.div>
                            )}
                          </div>
                          <ContactTextareaField id={contactMessageId} label="Votre message" name="message" required value={contactFormData.message} error={contactErrors.message} placeholder="Décrivez votre projet podcast, vos objectifs, votre audience cible..." onChange={updateContactField("message")} />
                          <AnimatePresence>
                            {contactStatus === "error" && (
                              <motion.div role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ padding: "16px 22px", borderRadius: 12, background: COLORS.errorBg, border: `1px solid ${COLORS.errorBorder}`, fontFamily: BODY, fontSize: 14, color: COLORS.error, lineHeight: 1.7 }}>
                                <strong>Une erreur est survenue.</strong> {contactLiveMessage && contactLiveMessage !== "Une erreur est survenue." ? contactLiveMessage : "Veuillez réessayer ou nous contacter directement."}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <motion.button type="submit" disabled={isContactSubmitDisabled} aria-disabled={isContactSubmitDisabled} whileHover={!isContactSubmitDisabled && !reducedMotion ? { y: -2, backgroundColor: "#fff", color: "#000" } : undefined} whileTap={!isContactSubmitDisabled && !reducedMotion ? { scale: 0.98 } : undefined} style={{ display: "inline-flex", alignItems: "center", alignSelf: "flex-start", gap: 12, padding: responsive.mobile ? "16px 28px" : "18px 42px", background: "transparent", color: isContactSubmitDisabled ? "rgba(255,255,255,0.25)" : "#FFFFFF", fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, letterSpacing: 4, textTransform: "uppercase", border: `1px solid ${isContactSubmitDisabled ? "rgba(255,255,255,0.12)" : "#FFFFFF"}`, borderRadius: 100, cursor: isContactSubmitDisabled ? "not-allowed" : "pointer", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)", opacity: contactStatus === "sending" ? 0.58 : 1 }}>
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
                <aside className="just-contact-sticky-dark" aria-label="Informations de contact" style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
                  <div style={{ padding: "20px", borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.borderSoft}`, display: "flex", alignItems: "center", gap: 14 }}>
                    <motion.div aria-hidden="true" animate={reducedMotion ? undefined : { scale: [1, 1.3, 1], opacity: [0.45, 1, 0.45] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#FFFFFF" }}>Réponse sous 24h</p>
                  </div>
                  <div style={{ padding: responsive.mobile ? "24px" : "28px", borderRadius: 20, background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.borderSoft}` }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: COLORS.textMuted, marginBottom: 16, marginTop: 0 }}>Note</p>
                    <blockquote style={{ margin: 0, fontFamily: DISPLAY, fontSize: responsive.mobile ? 22 : 28, fontWeight: 300, lineHeight: 1.5, color: "rgba(255,255,255,0.75)", fontStyle: "italic", letterSpacing: -0.8 }}>
                      "Chaque podcast commence par une conversation. La vôtre commence ici."
                    </blockquote>
                  </div>
                  <div style={{ padding: "20px", borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.borderSoft}`, overflow: "hidden" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: COLORS.textMuted, marginBottom: 14, marginTop: 0 }}>Studio</p>
                    <WaveformBars count={24} height={28} color="rgba(255,255,255,0.08)" reducedMotion={reducedMotion} />
                  </div>
                </aside>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}