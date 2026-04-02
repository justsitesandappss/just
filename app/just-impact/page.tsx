"use client"

import { useEffect, useRef, useState, useCallback, useMemo, useId } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"

const FONT = {
  display: "'Syne', sans-serif",
  body: "'Outfit', sans-serif",
  numeric: "'Inter', 'Segoe UI', Arial, sans-serif",
} as const

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const WEB3FORMS_ACCESS_KEY = "b891692e-8148-4785-856a-e1c43f4816dc"

const OP = {
  label: 0.72, tag: 0.76, desc: 0.82, heroDesc: 0.84, entityDesc: 0.82,
  quote: 0.9, pill: 0.82, processDesc: 0.78, caseMetricLabel: 0.78,
  caseBrand: 0.74, ghost: 0.08, heroMuted: 0.42,
} as const

const BP = { mobile: 640, tablet: 1024 } as const

const JC = {
  bg: "#000000", text: "#ffffff",
  border: "rgba(255,255,255,0.16)", borderStrong: "rgba(255,255,255,0.3)",
  borderFocus: "#ffffff", surface: "rgba(255,255,255,0.03)",
  error: "#ef4444", errorBg: "rgba(239,68,68,0.08)",
  errorBorder: "rgba(239,68,68,0.24)", success: "#22c55e",
  placeholder: "rgba(255,255,255,0.28)", muted: "rgba(255,255,255,0.65)",
} as const

type ContactStatus = "idle" | "sending" | "success" | "error"
type ContactFormData = { name: string; email: string; phone: string; company: string; entity: string; message: string }
type ContactErrors = Partial<Record<keyof ContactFormData, string>>

const white = (o: number) => `rgba(255,255,255,${o})`
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
const parseCSV = (s: string) => s.split(",").map(x => x.trim()).filter(Boolean)
const clampNumber = (min: number, v: number, max: number) => Math.max(min, Math.min(v, max))
const fluidBetween = (w: number, minVp: number, maxVp: number, minV: number, maxV: number) => {
  if (w <= minVp) return minV
  if (w >= maxVp) return maxV
  return minV + (maxV - minV) * ((w - minVp) / (maxVp - minVp))
}

const srOnly: React.CSSProperties = {
  position: "absolute", width: 1, height: 1, overflow: "hidden",
  clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0, margin: -1, padding: 0,
}

const ghost = (size: number): React.CSSProperties => ({
  fontFamily: FONT.display, fontSize: size, fontWeight: 800,
  color: white(OP.ghost), lineHeight: 1, userSelect: "none",
})

const pill: React.CSSProperties = {
  padding: "8px 18px", borderRadius: 999, border: `1px solid ${white(0.12)}`,
  background: white(0.05), fontFamily: FONT.body, fontSize: 11, fontWeight: 600,
  color: white(OP.pill), letterSpacing: 1, textTransform: "uppercase",
}

const MASK = "linear-gradient(to right, transparent, black 8%, black 92%, transparent)"

function useReducedMotion() {
  const [r, setR] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setR(mq.matches)
    const h = (e: MediaQueryListEvent) => setR(e.matches)
    mq.addEventListener?.("change", h)
    return () => mq.removeEventListener?.("change", h)
  }, [])
  return r
}

function useResponsive(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 1200 })
  useEffect(() => {
    const node = ref.current; if (!node) return
    const update = () => setSize({ width: Math.max(320, Math.round(node.getBoundingClientRect().width || window.innerWidth)) })
    update()
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null
    ro?.observe(node)
    window.addEventListener("resize", update)
    return () => { ro?.disconnect(); window.removeEventListener("resize", update) }
  }, [ref])
  const mobile = size.width <= BP.mobile
  const tablet = size.width <= BP.tablet
  const px = mobile ? 20 : tablet ? 40 : 72
  return { vw: size.width, mobile, tablet, px, sectionPad: mobile ? "60px 20px" : tablet ? "80px 40px" : "100px 72px" }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mo(reduced: boolean, active: any, fallback: any = {}) {
  return reduced ? fallback : active
}
function tr(reduced: boolean, duration: number, delay = 0) {
  return reduced ? { duration: 0 } : { duration, delay, ease: EASE }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { once: true, margin: "-60px" })
  const reduced = useReducedMotion()
  return (
    <motion.div ref={ref} initial={mo(reduced, { opacity: 0, y: 50 }, { opacity: 1, y: 0 })} animate={visible ? { opacity: 1, y: 0 } : {}} transition={tr(reduced, 0.9, delay)} style={{ minWidth: 0 }}>
      {children}
    </motion.div>
  )
}

function Marquee({ items, speed = 35, fontSize = 72 }: { items: string[]; speed?: number; fontSize?: number }) {
  const reduced = useReducedMotion()
  const tripled = useMemo(() => [...items, ...items, ...items], [items])
  return (
    <div aria-hidden="true" style={{ overflow: "hidden", width: "100%", maskImage: MASK, WebkitMaskImage: MASK }}>
      <motion.div
        animate={reduced ? {} : { x: ["0%", "-33.333%"] }}
        transition={reduced ? {} : { duration: speed, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", gap: 40, width: "max-content", alignItems: "center" }}
      >
        {tripled.map((name, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 40 }}>
            <span style={{ ...ghost(fontSize), letterSpacing: -3, textTransform: "uppercase", whiteSpace: "nowrap" }}>{name}</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: white(0.1), display: "inline-block", flexShrink: 0 }} />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

function Counter({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useInView(ref, { once: true })
  const reduced = useReducedMotion()
  const match = value.match(/^([0-9]+\.?[0-9]*)(.*)$/)
  const num = match ? parseFloat(match[1]) : 0
  const suffix = match ? match[2] : ""
  const decimals = match && match[1].includes(".") ? (match[1].split(".")[1] || "").length : 0
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isVisible) return
    if (reduced) { setCount(num); return }
    let mounted = true
    const timeout = window.setTimeout(() => {
      if (!mounted) return
      const dur = 2200, start = performance.now()
      const tick = (now: number) => {
        if (!mounted) return
        const p = Math.min((now - start) / dur, 1)
        const eased = 1 - Math.pow(1 - p, 4)
        setCount(decimals > 0 ? parseFloat((eased * num).toFixed(decimals)) : Math.floor(eased * num))
        if (p < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, delay * 1000)
    return () => { mounted = false; clearTimeout(timeout); if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isVisible, num, delay, decimals, reduced])

  return (
    <div ref={ref} style={{ textAlign: "center", minWidth: 0 }}>
      <div style={{ fontFamily: FONT.numeric, fontWeight: 800, fontSize: "clamp(40px,5vw,64px)", color: "#fff", lineHeight: 1, marginBottom: 10, letterSpacing: -4 }}>
        <span aria-hidden="true">{isVisible ? (decimals > 0 ? count.toFixed(decimals) : count) : 0}{suffix}</span>
        <span style={srOnly}>{value} {label}</span>
      </div>
      <div aria-hidden="true" style={{ fontSize: 10, color: white(OP.tag), fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", fontFamily: FONT.body }}>{label}</div>
    </div>
  )
}

function ProcessStep({ number, title, description, isLast = false, delay = 0, mobile = false }: {
  number: string; title: string; description: string; isLast?: boolean; delay?: number; mobile?: boolean
}) {
  const ref = useRef<HTMLLIElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })
  const reduced = useReducedMotion()
  return (
    <motion.li ref={ref} initial={mo(reduced, { opacity: 0, y: 30 }, { opacity: 1, y: 0 })} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={tr(reduced, 0.7, delay)} style={{ flex: mobile ? "none" : 1, position: "relative", paddingRight: isLast || mobile ? 0 : 32, listStyle: "none", minWidth: 0 }}>
      {!isLast && !mobile && (
        <motion.div aria-hidden="true" initial={mo(reduced, { scaleX: 0 })} animate={isInView ? { scaleX: 1 } : {}} transition={tr(reduced, 1, delay + 0.3)} style={{ position: "absolute", top: 15, left: 32, right: 0, height: 1, background: `linear-gradient(to right, ${white(0.18)}, ${white(0.04)})`, transformOrigin: "left" }} />
      )}
      <div aria-hidden="true" style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${white(0.14)}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, position: "relative", zIndex: 1, background: "#000", flexShrink: 0 }}>
        <span style={{ fontFamily: FONT.display, fontSize: 11, fontWeight: 700, color: white(0.7) }}>{number}</span>
      </div>
      <h3 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: -0.5, marginBottom: 10, marginTop: 0, lineHeight: 1.2, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>{title}</h3>
      <p style={{ fontFamily: FONT.body, fontSize: 14, lineHeight: 1.8, color: white(OP.processDesc), fontWeight: 300, margin: 0, maxWidth: 260, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>{description}</p>
    </motion.li>
  )
}

function CaseCard({ imageUrl, brand, title, metric, metricLabel, tags, delay = 0, reverse = false, mobile = false, tablet = false, containerWidth = 1200 }: {
  imageUrl: string; brand: string; title: string; metric: string; metricLabel: string; tags: string[]; delay?: number; reverse?: boolean; mobile?: boolean; tablet?: boolean; containerWidth?: number
}) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const reduced = useReducedMotion()
  const stacked = mobile
  const imageHeight = stacked ? 260 : tablet ? 360 : clampNumber(320, Math.round(containerWidth * 0.28), 480)
  return (
    <motion.article ref={ref} aria-label={`${brand} ${title}`} initial={mo(reduced, { opacity: 0, y: 60 }, { opacity: 1, y: 0 })} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={tr(reduced, 0.9, delay)} style={{ display: "grid", gridTemplateColumns: stacked ? "minmax(0,1fr)" : reverse ? "minmax(0,1fr) minmax(0,1.1fr)" : "minmax(0,1.1fr) minmax(0,1fr)", gap: 0, minHeight: stacked ? "auto" : imageHeight, background: white(0.015), border: `1px solid ${white(0.05)}`, borderRadius: 24, overflow: "hidden", minWidth: 0 }}>
      <div style={{ order: stacked ? 1 : reverse ? 2 : 1, position: "relative", overflow: "hidden", minHeight: imageHeight, minWidth: 0 }}>
        <img src={imageUrl} alt={`Illustration : ${title}`} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: stacked ? "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6) 100%)" : reverse ? "linear-gradient(to left, rgba(0,0,0,0.6) 0%, transparent 60%)" : "linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 60%)", pointerEvents: "none" }} />
      </div>
      <div style={{ order: stacked ? 2 : reverse ? 1 : 2, padding: stacked ? "32px 24px" : tablet ? "40px 32px" : "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: white(OP.caseBrand), fontFamily: FONT.body, marginBottom: 16, marginTop: 0 }}>{brand}</p>
        <h3 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: "clamp(20px,2.5vw,36px)", color: "#fff", lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 24, marginTop: 0, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>{title}</h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 28, flexWrap: "wrap", minWidth: 0 }}>
          <span style={{ fontFamily: FONT.numeric, fontWeight: 800, fontSize: stacked ? 36 : 48, color: "#fff", letterSpacing: -3, lineHeight: 1, minWidth: 0 }}>{metric}</span>
          <span style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 600, color: white(OP.caseMetricLabel), letterSpacing: 2, textTransform: "uppercase" }}>{metricLabel}</span>
        </div>
        <ul style={{ display: "flex", flexWrap: "wrap", gap: 8, listStyle: "none", padding: 0, margin: 0 }} aria-label="Tags du projet">
          {tags.map(tag => <li key={tag} style={pill}>{tag}</li>)}
        </ul>
      </div>
    </motion.article>
  )
}

function ServiceBlock({ number, title, description, items, delay = 0, mobile = false, tablet = false }: {
  number: string; title: string; description: string; items: string[]; delay?: number; mobile?: boolean; tablet?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const reduced = useReducedMotion()
  const stacked = mobile || tablet
  return (
    <motion.div ref={ref} initial={mo(reduced, { opacity: 0, y: 40 }, { opacity: 1, y: 0 })} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={tr(reduced, 0.8, delay)} style={{ padding: mobile ? "40px 0" : "56px 0", borderBottom: `1px solid ${white(0.05)}`, display: "grid", gridTemplateColumns: stacked ? "minmax(0,1fr)" : "200px minmax(0,1fr)", gap: stacked ? 24 : 56, alignItems: "start", minWidth: 0 }}>
      <div style={{ minWidth: 0 }}>
        <div aria-hidden="true" style={{ ...ghost(mobile ? 60 : 80), letterSpacing: -4, marginBottom: -20 }}>{number}</div>
        <h3 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: mobile ? 20 : 22, color: "#fff", letterSpacing: -0.5, lineHeight: 1.2, margin: 0, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>{title}</h3>
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: FONT.body, fontSize: 15, lineHeight: 1.9, color: white(OP.entityDesc), fontWeight: 300, margin: "0 0 24px 0", maxWidth: 560, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>{description}</p>
        <ul style={{ display: "flex", flexWrap: "wrap", gap: 8, listStyle: "none", padding: 0, margin: 0 }} aria-label={`Compétences liées à ${title}`}>
          {items.map((item, i) => (
            <motion.li key={item} initial={mo(reduced, { opacity: 0, y: 10 }, { opacity: 1, y: 0 })} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={tr(reduced, 0.5, delay + 0.2 + i * 0.05)} style={pill}>{item}</motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

function ContactInputField({ id, label, name, type = "text", autoComplete, inputMode, placeholder, required = false, value, error, hint, onChange }: {
  id: string; label: string; name: string; type?: string; autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; placeholder?: string; required?: boolean; value: string; error?: string; hint?: string; onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: "relative" }}>
      <motion.label htmlFor={id} animate={{ top: active ? 6 : 24, fontSize: active ? 11 : 15, color: error ? JC.error : JC.text, letterSpacing: active ? 3.5 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", left: 0, fontFamily: FONT.body, fontWeight: active ? 700 : 400, textTransform: active ? "uppercase" : "none", pointerEvents: "none", zIndex: 1, lineHeight: 1 }}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </motion.label>
      <input id={id} name={name} type={type} value={value} required={required} autoComplete={autoComplete} inputMode={inputMode} aria-required={required || undefined} aria-invalid={error ? true : undefined} placeholder={focused ? placeholder : ""} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${error ? JC.error : focused ? JC.borderFocus : JC.border}`, padding: "30px 0 16px", fontFamily: FONT.body, fontSize: 17, color: JC.text, outline: "none", transition: "border-color 0.25s ease", letterSpacing: 0.2 }} />
      {hint && <p style={{ margin: "10px 0 0", fontFamily: FONT.body, fontSize: 12, color: JC.muted }}>{hint}</p>}
      {error && <p role="alert" style={{ margin: "10px 0 0", fontFamily: FONT.body, fontSize: 13, color: JC.error }}>{error}</p>}
    </div>
  )
}

function ContactTextareaField({ id, label, name, placeholder, required = false, value, error, onChange }: {
  id: string; label: string; name: string; placeholder?: string; required?: boolean; value: string; error?: string; onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: "relative" }}>
      <motion.label htmlFor={id} animate={{ top: active ? 6 : 24, fontSize: active ? 11 : 15, color: error ? JC.error : JC.text, letterSpacing: active ? 3.5 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", left: 0, fontFamily: FONT.body, fontWeight: active ? 700 : 400, textTransform: active ? "uppercase" : "none", pointerEvents: "none", zIndex: 1, lineHeight: 1 }}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </motion.label>
      <textarea id={id} name={name} value={value} required={required} aria-required={required || undefined} aria-invalid={error ? true : undefined} placeholder={focused ? placeholder : ""} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} rows={5} style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${error ? JC.error : focused ? JC.borderFocus : JC.border}`, padding: "30px 0 16px", fontFamily: FONT.body, fontSize: 17, color: JC.text, outline: "none", resize: "vertical", minHeight: 130, transition: "border-color 0.25s ease" }} />
      {error && <p role="alert" style={{ margin: "10px 0 0", fontFamily: FONT.body, fontSize: 13, color: JC.error }}>{error}</p>}
    </div>
  )
}

function ContactPillSelect({ label, name, options, value, onChange }: { label: string; name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const groupId = useId()
  const reduced = useReducedMotion()
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
      <legend style={{ fontFamily: FONT.body, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: JC.text, marginBottom: 18 }}>{label}</legend>
      <div role="group" aria-labelledby={groupId} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map(opt => {
          const active = value === opt
          return (
            <motion.button key={opt} type="button" aria-pressed={active} onClick={() => onChange(active ? "" : opt)} whileHover={mo(reduced, { scale: 1.02 })} whileTap={mo(reduced, { scale: 0.98 })} animate={{ background: active ? "#ffffff" : "transparent", borderColor: active ? "#ffffff" : "rgba(255,255,255,0.18)", color: active ? "#000000" : "#ffffff" }} transition={{ duration: 0.2 }} style={{ padding: "11px 20px", borderRadius: 100, border: "1px solid", fontFamily: FONT.body, fontSize: 13, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer", outline: "none" }}>
              {opt}
            </motion.button>
          )
        })}
      </div>
      <input type="hidden" name={name} value={value} />
    </fieldset>
  )
}

export default function JustImpactPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { mobile, tablet, px, sectionPad, vw } = useResponsive(rootRef)
  const heroRef = useRef<HTMLElement>(null)
  const heroVisible = useInView(heroRef, { once: true })

  const heroFont = fluidBetween(vw, 360, 1600, 32, 110)
  const heroMinHeight = mobile ? 760 : tablet ? 860 : clampNumber(860, Math.round(vw * 0.72), 1020)
  const heroPad = mobile ? "100px 20px 72px" : tablet ? "100px 40px 88px" : "60px 72px 96px"

  const svc1List = useMemo(() => parseCSV("Stratégie 360°, Activation Campagnes, Micro-Influence, Macro-Influence, Celebrity Seeding"), [])
  const svc2List = useMemo(() => parseCSV("Scouting, Vérification Audiences, Négociation, Management Long Terme, Exclusivités"), [])
  const svc3List = useMemo(() => parseCSV("Stratégie Éditoriale, Création Contenu, Community Management, Veille Tendances, Growth"), [])
  const svc4List = useMemo(() => parseCSV("Direction Créative, Storytelling, Vidéo, Photo, UGC, Formats Natifs"), [])
  const case1Tags = useMemo(() => parseCSV("Influence, Brand Content, Social Media"), [])
  const case2Tags = useMemo(() => parseCSV("Micro-Influence, UGC, Activation"), [])
  const case3Tags = useMemo(() => parseCSV("Casting, Stratégie, KPI & Reporting"), [])
  const entityList = useMemo(() => parseCSV("Just Impact, Just Prod, Just Agency, Just 4 You"), [])

  const [formData, setFormData] = useState<ContactFormData>({ name: "", email: "", phone: "", company: "", entity: "", message: "" })
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<ContactStatus>("idle")
  const [liveMsg, setLiveMsg] = useState("")

  const nameId = useId(), emailId = useId(), phoneId = useId(), companyId = useId(), messageId = useId()
  const titleId = useId(), descId = useId(), successId = useId()

  const update = useCallback((field: keyof ContactFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    if (status === "error") { setStatus("idle"); setLiveMsg("") }
  }, [errors, status])

  const validate = useCallback(() => {
    const e: ContactErrors = {}
    if (!formData.name.trim()) e.name = "Merci d'indiquer votre nom."
    if (!formData.email.trim()) e.email = "Merci d'indiquer votre adresse email."
    else if (!isValidEmail(formData.email)) e.email = "L'adresse email semble invalide."
    if (!formData.message.trim()) e.message = "Merci de préciser votre demande."
    else if (formData.message.trim().length < 10) e.message = "Votre message est un peu trop court."
    return e
  }, [formData])

  const reset = useCallback(() => {
    setFormData({ name: "", email: "", phone: "", company: "", entity: "", message: "" })
    setErrors({}); setStatus("idle"); setLiveMsg("")
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) { setStatus("error"); setLiveMsg("Le formulaire contient des erreurs."); return }
    setStatus("sending"); setLiveMsg("Envoi en cours.")
    try {
      const fd = new FormData()
      fd.append("access_key", WEB3FORMS_ACCESS_KEY)
      fd.append("subject", `[JUST IMPACT] Nouveau contact — ${formData.entity || "Général"}`)
      fd.append("from_name", formData.name)
      fd.append("name", formData.name); fd.append("email", formData.email)
      fd.append("phone", formData.phone); fd.append("company", formData.company)
      fd.append("entity", formData.entity); fd.append("message", formData.message)
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data?.success) { setStatus("success"); setLiveMsg("Message envoyé.") }
      else { setStatus("error"); setLiveMsg(data?.message || "Une erreur est survenue.") }
    } catch { setStatus("error"); setLiveMsg("Une erreur est survenue.") }
  }, [formData, validate])

  const submitDisabled = status === "sending" || !formData.name.trim() || !formData.email.trim() || !formData.message.trim()

  useEffect(() => {
    if (typeof document === "undefined") return
    if (!document.getElementById("just-impact-fonts")) {
      const link = document.createElement("link")
      link.id = "just-impact-fonts"
      link.rel = "stylesheet"
      link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
      document.head.appendChild(link)
    }
  }, [])

  return (
    <div ref={rootRef} style={{ width: "100%", background: "#000", color: "#d1d1d1", fontFamily: FONT.body, overflowX: "hidden", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.28); }
        input:-webkit-autofill, textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px #000 inset !important; -webkit-text-fill-color: #fff !important; }
        a:focus-visible, button:focus-visible { outline: 2px solid rgba(255,255,255,0.92); outline-offset: 3px; border-radius: 6px; }
        @media (max-width: 980px) {
          .ji-contact-grid { grid-template-columns: 1fr !important; gap: 56px !important; }
          .ji-two-cols { grid-template-columns: 1fr !important; gap: 28px !important; }
          .ji-sticky { position: relative !important; top: 0 !important; }
        }
      `}</style>

      <header>
        <section ref={heroRef} aria-labelledby="hero-heading" style={{ minHeight: heroMinHeight, display: "flex", flexDirection: "column", justifyContent: "center", padding: heroPad, position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${white(0.025)} 1px, transparent 1px)`, backgroundSize: mobile ? "28px 28px" : "40px 40px", pointerEvents: "none" }} />
          <motion.p initial={mo(reduced, { opacity: 0 })} animate={heroVisible ? { opacity: 1 } : {}} transition={tr(reduced, 1, 0.2)} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: white(OP.tag), marginBottom: mobile ? 28 : 48, display: "flex", alignItems: "center", gap: 12, minWidth: 0, overflowWrap: "break-word" }}>
            <motion.span aria-hidden="true" animate={mo(reduced, { scale: [1, 1.5, 1], opacity: [0.35, 0.9, 0.35] })} transition={reduced ? {} : { duration: 2.5, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
            Influence · Créateurs · Stratégie · Résultats
          </motion.p>
          <div style={{ maxWidth: Math.min(1100, vw - (mobile ? 40 : tablet ? 80 : 144)), position: "relative", zIndex: 1, minWidth: 0 }}>
            <h1 id="hero-heading" style={{ fontFamily: FONT.display, fontWeight: 800, lineHeight: 0.92, margin: 0, letterSpacing: mobile ? -2 : -5, color: "#fff", minWidth: 0 }}>
              <motion.span initial={mo(reduced, { opacity: 0, y: 60 })} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={tr(reduced, 1, 0.4)} style={{ display: "block", color: white(OP.heroMuted), fontSize: heroFont, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>On ne fait pas</motion.span>
              <motion.span initial={mo(reduced, { opacity: 0, y: 60 })} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={tr(reduced, 1, 0.5)} style={{ display: "block", color: white(OP.heroMuted), fontSize: heroFont, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>de la visibilité.</motion.span>
              <motion.span initial={mo(reduced, { opacity: 0, y: 60 })} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={tr(reduced, 1, 0.6)} style={{ display: "block", color: "#fff", fontSize: heroFont, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>On crée de l'impact.</motion.span>
            </h1>
          </div>
          <motion.p initial={mo(reduced, { opacity: 0, y: 30 })} animate={heroVisible ? { opacity: 1, y: 0 } : {}} transition={tr(reduced, 0.8, 0.8)} style={{ marginTop: 40, fontSize: 16, lineHeight: 1.9, maxWidth: 560, color: white(OP.heroDesc), fontWeight: 300, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>
            Just Impact est l'agence d'influence de JUST. On connecte les marques aux voix qui comptent, avec une stratégie data-driven, des créateurs triés sur le volet et une exécution sans faille.
          </motion.p>
          {!mobile && (
            <div aria-hidden="true" style={{ position: "absolute", bottom: 40, left: px, display: "flex", alignItems: "center", gap: 12 }}>
              <motion.div animate={mo(reduced, { y: [0, 8, 0] })} transition={reduced ? {} : { duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${white(0.55)}, transparent)` }} />
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: white(OP.label), fontFamily: FONT.body }}>Scroll</span>
            </div>
          )}
        </section>
      </header>

      <main>
        <Marquee items={["Influence", "Créateurs", "Brand Content", "Social Media", "Campagnes", "Stratégie", "Casting", "Performance"]} speed={40} fontSize={mobile ? 40 : tablet ? 56 : 72} />

        <section aria-labelledby="stats-heading" style={{ padding: sectionPad, position: "relative" }}>
          <h2 id="stats-heading" style={srOnly}>Chiffres clés</h2>
          <Reveal>
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: mobile ? "repeat(2,minmax(0,1fr))" : tablet ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))", gap: mobile ? 32 : 48 }} role="list" aria-label="Statistiques clés">
              {[{ v: "200+", l: "Campagnes livrées" }, { v: "80+", l: "Créateurs partenaires" }, { v: "50M+", l: "Reach mensuel" }, { v: "3.2x", l: "ROI moyen" }].map((s, i) => (
                <div key={i} role="listitem"><Counter value={s.v} label={s.l} delay={i * 0.1} /></div>
              ))}
            </div>
          </Reveal>
        </section>

        <section aria-labelledby="services-heading" style={{ padding: mobile ? "40px 20px 60px" : tablet ? "40px 40px 80px" : "40px 72px 80px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: white(OP.label), fontFamily: FONT.body, marginBottom: 14, marginTop: 0 }}>Ce qu'on fait</p>
              <h2 id="services-heading" style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: "clamp(34px,4.5vw,58px)", color: "#fff", lineHeight: 1, letterSpacing: -3, marginTop: 0, marginBottom: 16, minWidth: 0, overflowWrap: "break-word", wordBreak: "break-word" }}>
                Quatre expertises,<br /><span style={{ color: white(0.42) }}>un seul objectif.</span>
              </h2>
            </Reveal>
            <ServiceBlock number="01" title="Influence Marketing" description="De la stratégie au déploiement, on conçoit et pilote des campagnes d'influence qui convertissent. Micro, macro, célébrités, on active le bon levier au bon moment." items={svc1List} delay={0} mobile={mobile} tablet={tablet} />
            <ServiceBlock number="02" title="Casting & Management" description="On identifie, recrute et manage les créateurs qui incarnent votre marque. Pas de faux engagement, uniquement des profils vérifiés, alignés et performants." items={svc2List} delay={0.05} mobile={mobile} tablet={tablet} />
            <ServiceBlock number="03" title="Social Media" description="Stratégie éditoriale, création de contenu natif, community management. On fait vivre vos réseaux avec une voix authentique et un calendrier solide." items={svc3List} delay={0.1} mobile={mobile} tablet={tablet} />
            <ServiceBlock number="04" title="Brand Content" description="Du concept créatif au livrable final. On produit du contenu de marque qui raconte une histoire, génère de l'émotion et performe dans les feeds." items={svc4List} delay={0.15} mobile={mobile} tablet={tablet} />
          </div>
        </section>

        <section aria-labelledby="cases-heading" style={{ padding: sectionPad }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: white(OP.label), fontFamily: FONT.body, marginBottom: 14, marginTop: 0 }}>Résultats</p>
              <h2 id="cases-heading" style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: "clamp(34px,4.5vw,58px)", color: "#fff", lineHeight: 1, letterSpacing: -3, marginTop: 0, marginBottom: 16 }}>Les chiffres parlent.</h2>
            </Reveal>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 48 }}>
              <CaseCard imageUrl="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80" brand="Case Study — Mode" title="Lancement collection été avec 12 créateurs" metric="+340%" metricLabel="Engagement rate" tags={case1Tags} mobile={mobile} tablet={tablet} containerWidth={vw} />
              <CaseCard imageUrl="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80" brand="Case Study — Beauty" title="Campagne virale avec UGC et micro-influence" metric="12M" metricLabel="Vues en 72h" tags={case2Tags} reverse={!mobile} delay={0.05} mobile={mobile} tablet={tablet} containerWidth={vw} />
              <CaseCard imageUrl="https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80" brand="Case Study — Tech" title="Stratégie créateurs pour lancement produit" metric="28K" metricLabel="Conversions directes" tags={case3Tags} delay={0.1} mobile={mobile} tablet={tablet} containerWidth={vw} />
            </div>
          </div>
        </section>

        <div style={{ padding: "40px 0" }}>
          <Marquee items={["Authenticité", "Data", "Créativité", "Performance", "Confiance", "Résultats"]} speed={30} fontSize={mobile ? 34 : tablet ? 48 : 72} />
        </div>

        <section aria-labelledby="process-heading" style={{ padding: sectionPad }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: white(OP.label), fontFamily: FONT.body, marginBottom: 14, marginTop: 0 }}>Notre méthode</p>
              <h2 id="process-heading" style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: "clamp(34px,4.5vw,58px)", color: "#fff", lineHeight: 1, letterSpacing: -3, marginTop: 0, marginBottom: 16 }}>Du brief au résultat.</h2>
            </Reveal>
            <ol style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 40 : 0, listStyle: "none", padding: 0, margin: "56px 0 0" }}>
              <ProcessStep number="01" title="Brief & Stratégie" description="On analyse vos objectifs, votre marché et vos audiences pour construire une stratégie sur mesure." delay={0} mobile={mobile} />
              <ProcessStep number="02" title="Casting & Matching" description="On sélectionne les créateurs les plus pertinents grâce à notre base propriétaire et notre expertise data." delay={0.08} mobile={mobile} />
              <ProcessStep number="03" title="Production & Go Live" description="On pilote la création de contenu, valide chaque livrable et orchestre le déploiement." delay={0.16} mobile={mobile} />
              <ProcessStep number="04" title="Analyse & Optimisation" description="Reporting en temps réel, analyse de performance et recommandations d'optimisation continues." isLast delay={0.24} mobile={mobile} />
            </ol>
          </div>
        </section>

        <section aria-labelledby={titleId} aria-describedby={descId} style={{ padding: mobile ? "80px 20px 100px" : tablet ? "100px 40px 120px" : "110px 72px 140px", borderTop: `1px solid ${white(0.06)}`, position: "relative" }}>
          <div aria-live="polite" aria-atomic="true" style={srOnly}>{liveMsg}</div>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center top,rgba(255,255,255,0.03) 0%,transparent 65%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal>
              <div style={{ marginBottom: mobile ? 48 : 72 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: white(OP.tag), margin: "0 0 28px", display: "flex", alignItems: "center", gap: 12 }}>
                  <motion.span aria-hidden="true" animate={mo(reduced, { scale: [1, 1.45, 1], opacity: [0.35, 0.85, 0.35] })} transition={{ duration: 2.5, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
                  Formulaire de contact
                </p>
                <h2 style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: mobile ? "clamp(40px,12vw,58px)" : "clamp(56px,8vw,110px)", lineHeight: 0.92, color: "#fff", margin: 0, letterSpacing: mobile ? -2 : -5 }}>
                  <span style={{ display: "block" }}>Parlons</span>
                  <span style={{ display: "block", fontWeight: 300, fontStyle: "italic", color: white(0.88), letterSpacing: mobile ? -1 : -3 }}>de votre projet.</span>
                </h2>
                <p style={{ marginTop: 28, fontSize: 16, lineHeight: 1.9, maxWidth: 620, color: white(OP.heroDesc), fontWeight: 300 }}>
                  Influence, production, conciergerie ou média, quelle que soit votre ambition, on a l'entité et l'expertise qu'il vous faut. Remplissez le formulaire, on revient vers vous sous 24h.
                </p>
              </div>
            </Reveal>

            <div className="ji-contact-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,0.42fr)", gap: mobile ? 56 : 88, alignItems: "start" }}>
              <Reveal>
                <div>
                  {status === "success" ? (
                    <motion.section aria-labelledby={successId} initial={reduced ? false : { opacity: 0, y: 24 }} animate={reduced ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} style={{ textAlign: "center", padding: mobile ? "56px 24px" : "80px 40px", background: JC.surface, border: `1px solid ${JC.border}`, borderRadius: 24 }}>
                      <motion.div initial={reduced ? false : { scale: 0.85, opacity: 0 }} animate={reduced ? undefined : { scale: 1, opacity: 1 }} transition={{ duration: 0.45, delay: 0.12, ease: EASE }} style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      </motion.div>
                      <h3 id={successId} style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: 34, color: "#fff", letterSpacing: -2, margin: "0 0 12px" }}>Message envoyé.</h3>
                      <p style={{ fontFamily: FONT.body, fontSize: 16, color: white(OP.desc), fontWeight: 300, lineHeight: 1.8, maxWidth: 420, margin: "0 auto" }}>Merci pour votre intérêt. Notre équipe revient vers vous sous 24h.</p>
                      <motion.button type="button" onClick={reset} whileHover={reduced ? undefined : { opacity: 0.85 }} style={{ marginTop: 36, padding: "14px 30px", borderRadius: 100, border: "1px solid #fff", background: "transparent", color: "#fff", fontFamily: FONT.body, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
                        Nouveau message
                      </motion.button>
                    </motion.section>
                  ) : (
                    <section>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: white(OP.tag), margin: "0 0 14px" }}>Formulaire</p>
                      <h3 id={titleId} style={{ fontFamily: FONT.display, fontWeight: 800, fontSize: "clamp(32px,4vw,48px)", color: "#fff", lineHeight: 1, letterSpacing: -2, margin: "0 0 18px" }}>Dites-nous tout.</h3>
                      <p id={descId} style={{ margin: "0 0 52px", fontFamily: FONT.body, fontSize: 15, lineHeight: 1.8, color: white(OP.desc), maxWidth: 620 }}>Les champs marqués d'un astérisque sont obligatoires.</p>
                      <form onSubmit={handleSubmit} noValidate>
                        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                          <div className="ji-two-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
                            <ContactInputField id={nameId} label="Nom complet" name="name" required autoComplete="name" value={formData.name} error={errors.name} placeholder="Jean Dupont" onChange={update("name")} />
                            <ContactInputField id={emailId} label="Adresse email" name="email" type="email" required autoComplete="email" inputMode="email" value={formData.email} error={errors.email} placeholder="jean@marque.com" onChange={update("email")} />
                          </div>
                          <div className="ji-two-cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
                            <ContactInputField id={phoneId} label="Téléphone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={formData.phone} placeholder="+33 6 12 34 56 78" hint="Optionnel" onChange={update("phone")} />
                            <ContactInputField id={companyId} label="Entreprise / Marque" name="company" autoComplete="organization" value={formData.company} placeholder="Votre marque" hint="Optionnel" onChange={update("company")} />
                          </div>
                          <ContactPillSelect label="Entité" name="entity" options={entityList} value={formData.entity} onChange={update("entity")} />
                          <ContactTextareaField id={messageId} label="Votre message" name="message" required value={formData.message} error={errors.message} placeholder="Décrivez votre projet, vos objectifs, vos délais..." onChange={update("message")} />
                          <AnimatePresence>
                            {status === "error" && (
                              <motion.div role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ padding: "16px 22px", borderRadius: 12, background: JC.errorBg, border: `1px solid ${JC.errorBorder}`, fontFamily: FONT.body, fontSize: 14, color: JC.error, lineHeight: 1.7 }}>
                                <strong>Une erreur est survenue.</strong> {liveMsg && liveMsg !== "Une erreur est survenue." ? liveMsg : "Veuillez réessayer ou nous contacter directement."}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <motion.button type="submit" disabled={submitDisabled} aria-disabled={submitDisabled} whileHover={!submitDisabled && !reduced ? { y: -2, backgroundColor: "#fff", color: "#000" } : undefined} whileTap={!submitDisabled && !reduced ? { scale: 0.98 } : undefined} style={{ display: "inline-flex", alignItems: "center", alignSelf: "flex-start", gap: 12, padding: "18px 42px", background: "transparent", color: submitDisabled ? "rgba(255,255,255,0.25)" : "#fff", fontFamily: FONT.display, fontWeight: 700, fontSize: 13, letterSpacing: 4, textTransform: "uppercase", border: `1px solid ${submitDisabled ? "rgba(255,255,255,0.12)" : "#fff"}`, borderRadius: 100, cursor: submitDisabled ? "not-allowed" : "pointer", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)", opacity: status === "sending" ? 0.58 : 1 }}>
                            {status === "sending" ? "Envoi en cours..." : "Envoyer"}
                            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                          </motion.button>
                        </div>
                      </form>
                    </section>
                  )}
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <aside className="ji-sticky" aria-label="Informations de contact" style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ padding: "20px", borderRadius: 16, background: JC.surface, border: `1px solid ${JC.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                    <motion.div aria-hidden="true" animate={mo(reduced, { scale: [1, 1.3, 1], opacity: [0.45, 1, 0.45] })} transition={{ duration: 2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: JC.success, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontFamily: FONT.body, fontSize: 13, fontWeight: 500, color: "#fff" }}>Réponse sous 24h</p>
                  </div>
                  <div style={{ padding: mobile ? "24px" : "28px", borderRadius: 20, background: white(0.02), border: `1px solid ${white(0.08)}` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: white(OP.label), fontFamily: FONT.body, marginBottom: 16, marginTop: 0 }}>Note</p>
                    <blockquote style={{ margin: 0, fontFamily: FONT.display, fontSize: mobile ? 22 : 28, fontWeight: 300, lineHeight: 1.5, color: white(OP.quote), fontStyle: "italic", letterSpacing: -0.8 }}>
                      "Chaque projet commence par une conversation. La vôtre commence ici."
                    </blockquote>
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