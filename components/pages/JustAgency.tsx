"use client"

import { useEffect, useMemo, useRef, useState, useCallback, useId } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const WEB3FORMS_ACCESS_KEY = "b891692e-8148-4785-856a-e1c43f4816dc"

const COLORS = {
  bg: "#000000",
  text: "#FFFFFF",
  textBody: "rgba(255,255,255,0.80)",
  textMuted: "rgba(255,255,255,0.72)",
  border: "rgba(255,255,255,0.14)",
  borderSoft: "rgba(255,255,255,0.08)",
  card: "rgba(255,255,255,0.025)",
  cardHover: "rgba(255,255,255,0.05)",
  focus: "#FFFFFF",
  focusRing: "rgba(255,255,255,0.16)",
  error: "#ff4444",
  errorBg: "rgba(255,68,68,0.08)",
  errorBorder: "rgba(255,68,68,0.2)",
  success: "#22c55e",
  muted: "rgba(255,255,255,0.65)",
  surface: "rgba(255,255,255,0.025)",
} as const

const srOnly: React.CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0,
  margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap", border: 0,
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
}

function clampNumber(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

function fluidBetween(width: number, minVp: number, maxVp: number, minVal: number, maxVal: number) {
  if (width <= minVp) return minVal
  if (width >= maxVp) return maxVal
  return minVal + (maxVal - minVal) * ((width - minVp) / (maxVp - minVp))
}

function useResponsive(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 1440 })
  useEffect(() => {
    const node = ref.current; if (!node) return
    const update = () => setSize({ width: Math.max(320, Math.round(node.getBoundingClientRect().width || window.innerWidth)) })
    update()
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null
    ro?.observe(node)
    window.addEventListener("resize", update, { passive: true })
    return () => { ro?.disconnect(); window.removeEventListener("resize", update) }
  }, [ref])
  return { vw: size.width, mobile: size.width <= 767, tablet: size.width <= 1024 }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return <div style={{ minWidth: 0 }}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      style={{ minWidth: 0 }}
    >
      {children}
    </motion.div>
  )
}

function Marquee({ items, speed = 35 }: { items: string[]; speed?: number }) {
  const reduceMotion = useReducedMotion()
  const duplicated = [...items, ...items]
  if (!items.length) return null
  if (reduceMotion) return (
    <section aria-label="Prestations premium" style={{
      width: "100%", padding: "18px 0",
      borderTop: `1px solid ${COLORS.borderSoft}`,
      borderBottom: `1px solid ${COLORS.borderSoft}`,
      overflow: "hidden",
    }}>
      <ul style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "center", margin: 0, padding: "0 24px" }}>
        {items.map((item, i) => (
          <li key={i} style={{ padding: "8px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 999, color: COLORS.textMuted, fontFamily: BODY, fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase" }}>{item}</li>
        ))}
      </ul>
    </section>
  )
  return (
    <section aria-label="Prestations premium" style={{
      overflow: "hidden", width: "100%",
      maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      padding: "12px 0",
      borderTop: `1px solid ${COLORS.borderSoft}`,
      borderBottom: `1px solid ${COLORS.borderSoft}`,
    }}>
      <div style={srOnly}>{items.join(", ")}</div>
      <motion.div
        aria-hidden="true"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", gap: 40, width: "max-content", alignItems: "center" }}
      >
        {duplicated.map((n, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 40 }}>
            <span style={{ fontFamily: DISPLAY, fontSize: "clamp(28px,6vw,64px)", fontWeight: 800, color: "rgba(255,255,255,0.10)", letterSpacing: -2, textTransform: "uppercase", whiteSpace: "nowrap", lineHeight: 1 }}>{n}</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "inline-block", flexShrink: 0 }} />
          </span>
        ))}
      </motion.div>
    </section>
  )
}

function ServiceCard({ number, title, description, delay = 0 }: { number: string; title: string; description: string; delay?: number }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.article
      initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduceMotion ? undefined : { duration: 0.6, delay, ease: EASE }}
      whileHover={reduceMotion ? undefined : { backgroundColor: COLORS.cardHover }}
      style={{
        background: COLORS.card, border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 20, padding: "40px 28px",
        display: "flex", flexDirection: "column", gap: 18,
        position: "relative", overflow: "hidden", minHeight: 240, minWidth: 0,
      }}
    >
      <div aria-hidden="true" style={{
        fontFamily: DISPLAY, fontSize: 88, fontWeight: 800,
        color: "rgba(255,255,255,0.05)", lineHeight: 1, letterSpacing: -5,
        position: "absolute", top: -8, right: 14, userSelect: "none",
      }}>{number}</div>
      <h3 style={{
        fontFamily: DISPLAY, fontWeight: 800, fontSize: 22,
        color: COLORS.text, letterSpacing: -0.5, lineHeight: 1.2,
        position: "relative", zIndex: 1, paddingRight: 40, margin: 0,
      }}>{title}</h3>
      <p style={{
        fontFamily: BODY, fontSize: 15, lineHeight: 1.8,
        color: COLORS.textBody, fontWeight: 300, margin: 0,
        position: "relative", zIndex: 1,
      }}>{description}</p>
    </motion.article>
  )
}

type ContactStatus = "idle" | "sending" | "success" | "error"
type FormData = { name: string; email: string; phone: string; company: string; entity: string; message: string }
type FormErrors = Partial<Record<keyof FormData, string>>

function ContactInputField({ id, label, name, type = "text", autoComplete, inputMode, placeholder, required = false, value, error, hint, onChange }: {
  id: string; label: string; name: string; type?: string; autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string; required?: boolean; value: string; error?: string; hint?: string; onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <motion.label htmlFor={id} animate={{ top: active ? 6 : 24, fontSize: active ? 11 : 15, color: error ? COLORS.error : COLORS.text, letterSpacing: active ? 3.5 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", left: 0, fontFamily: BODY, fontWeight: active ? 700 : 400, textTransform: active ? "uppercase" : "none", pointerEvents: "none", zIndex: 1, lineHeight: 1 }}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </motion.label>
      <input id={id} name={name} type={type} value={value} required={required} autoComplete={autoComplete} inputMode={inputMode} aria-required={required || undefined} aria-invalid={error ? true : undefined} placeholder={focused ? placeholder : ""} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${error ? COLORS.error : focused ? COLORS.text : COLORS.border}`, padding: "30px 0 16px", fontFamily: BODY, fontSize: 17, color: COLORS.text, outline: "none", transition: "border-color 0.25s ease" }} />
      {hint && <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 12, color: COLORS.muted }}>{hint}</p>}
      {error && <p role="alert" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 13, color: COLORS.error }}>{error}</p>}
    </div>
  )
}

function ContactTextareaField({ id, label, name, placeholder, required = false, value, error, onChange }: {
  id: string; label: string; name: string; placeholder?: string; required?: boolean; value: string; error?: string; onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <motion.label htmlFor={id} animate={{ top: active ? 6 : 24, fontSize: active ? 11 : 15, color: error ? COLORS.error : COLORS.text, letterSpacing: active ? 3.5 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", left: 0, fontFamily: BODY, fontWeight: active ? 700 : 400, textTransform: active ? "uppercase" : "none", pointerEvents: "none", zIndex: 1, lineHeight: 1 }}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </motion.label>
      <textarea id={id} name={name} value={value} required={required} aria-required={required || undefined} aria-invalid={error ? true : undefined} placeholder={focused ? placeholder : ""} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} rows={5} style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${error ? COLORS.error : focused ? COLORS.text : COLORS.border}`, padding: "30px 0 16px", fontFamily: BODY, fontSize: 17, color: COLORS.text, outline: "none", resize: "vertical", minHeight: 130, transition: "border-color 0.25s ease" }} />
      {error && <p role="alert" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 13, color: COLORS.error }}>{error}</p>}
    </div>
  )
}

function ContactPillSelect({ label, name, options, value, onChange }: { label: string; name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const groupId = useId()
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
      <legend style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: COLORS.text, marginBottom: 18 }}>{label}</legend>
      <div role="group" aria-labelledby={groupId} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map(opt => {
          const active = value === opt
          return (
            <motion.button key={opt} type="button" aria-pressed={active} onClick={() => onChange(active ? "" : opt)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} animate={{ background: active ? "#FFFFFF" : "transparent", borderColor: active ? "#FFFFFF" : "rgba(255,255,255,0.18)", color: active ? "#000000" : "#FFFFFF" }} transition={{ duration: 0.2 }} style={{ padding: "11px 20px", borderRadius: 100, border: "1px solid", fontFamily: BODY, fontSize: 13, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer", outline: "none" }}>
              {opt}
            </motion.button>
          )
        })}
      </div>
      <input type="hidden" name={name} value={value} />
    </fieldset>
  )
}

export default function JustAgencyPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const { mobile, tablet, vw } = useResponsive(rootRef)
  const reduceMotion = useReducedMotion()

  const heroTitle1Size = fluidBetween(vw, 360, 1600, 48, 110)
  const heroTitle2Size = fluidBetween(vw, 360, 1600, 48, 118)
  const heroTitle3Size = fluidBetween(vw, 360, 1600, 40, 108)
  const heroMinHeight = mobile ? 720 : tablet ? 820 : clampNumber(820, Math.round(vw * 0.62), 980)
  const heroPadding = mobile ? "64px 24px 72px" : tablet ? "72px 40px 84px" : "60px 72px 80px"
  const pagePadding = mobile ? "36px 24px" : tablet ? "60px 40px" : "80px 72px"

  const services = [
    { title: "Jets & Hélicoptères", desc: "Vols charter, repositionnements, transferts privés et départs organisés dans des délais extrêmement courts." },
    { title: "Yachts & Croisières", desc: "Location de yachts, itinéraires exclusifs, équipage dédié et organisation complète de l'expérience à bord." },
    { title: "Supercars & Prestige", desc: "Ferrari, Lamborghini, Rolls-Royce et autres véhicules d'exception avec ou sans chauffeur." },
    { title: "Villas & Châteaux", desc: "Sélection de propriétés haut de gamme avec services sur place, sécurité et logistique dédiée." },
    { title: "Personal Shopping", desc: "Accès privilégié aux collections, pièces réservées, sourcing, stylisme et accompagnement personnalisé." },
    { title: "Gastronomie Privée", desc: "Chefs privés, tables rares, dîners signatures et expériences culinaires pensées au millimètre." },
    { title: "Événements & Accès", desc: "Premières, galas, backstage, front row et accès complexes à obtenir par les canaux classiques." },
    { title: "Joaillerie & Horlogerie", desc: "Recherche de pièces rares, montres de collection, créations sur commande et accompagnement d'acquisition." },
    { title: "Gestion de Vie", desc: "Coordination du quotidien, assistance logistique, administratif sensible et traitement rapide des imprévus." },
  ]

  const entityList = ["Just Impact", "Just Prod", "Just Agency", "Just 4 You"]

  const [formData, setFormData] = useState<FormData>({ name: "", email: "", phone: "", company: "", entity: "", message: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<ContactStatus>("idle")
  const [liveMsg, setLiveMsg] = useState("")

  const nameId = useId(), emailId = useId(), phoneId = useId(), companyId = useId(), messageId = useId()

  const update = useCallback((field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
    if (status === "error") { setStatus("idle"); setLiveMsg("") }
  }, [errors, status])

  const validate = useCallback(() => {
    const e: FormErrors = {}
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
      fd.append("subject", `[JUST] Nouveau contact — ${formData.entity || "Général"}`)
      fd.append("from_name", formData.name)
      fd.append("name", formData.name)
      fd.append("email", formData.email)
      fd.append("phone", formData.phone)
      fd.append("company", formData.company)
      fd.append("entity", formData.entity)
      fd.append("message", formData.message)
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data?.success) { setStatus("success"); setLiveMsg("Message envoyé.") }
      else { setStatus("error"); setLiveMsg(data?.message || "Une erreur est survenue.") }
    } catch { setStatus("error"); setLiveMsg("Une erreur est survenue.") }
  }, [formData, validate])

  const submitDisabled = status === "sending" || !formData.name.trim() || !formData.email.trim() || !formData.message.trim()

  return (
    <div ref={rootRef} style={{ width: "100%", background: COLORS.bg, color: COLORS.textBody, fontFamily: BODY, overflowX: "hidden", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@200;300;400;500;600;700&display=swap');
        .jag-link { color: rgba(255,255,255,0.55); text-decoration: none; transition: color .2s ease; }
        .jag-link:hover { color: rgba(255,255,255,0.9); }
        a:focus-visible, button:focus-visible { outline: 2px solid #fff; outline-offset: 4px; border-radius: 12px; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        input:-webkit-autofill, textarea:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px #000 inset !important; -webkit-text-fill-color: #fff !important; }
        @media (max-width: 980px) {
          .jag-contact-grid { grid-template-columns: 1fr !important; gap: 56px !important; }
          .jag-two-cols { grid-template-columns: 1fr !important; gap: 28px !important; }
          .jag-sticky { position: relative !important; top: 0 !important; }
        }
      `}</style>

      <header style={{ minHeight: heroMinHeight, display: "flex", flexDirection: "column", justifyContent: "center", padding: heroPadding, position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: mobile ? "28px 28px" : "40px 40px", pointerEvents: "none" }} />
        <p style={{ margin: "0 0 36px 0", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          <motion.span aria-hidden="true" animate={reduceMotion ? undefined : { scale: [1, 1.35, 1], opacity: [0.4, 0.95, 0.4] }} transition={reduceMotion ? undefined : { duration: 2.4, repeat: Infinity }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block", flexShrink: 0 }} />
          Paris · Monaco · Londres · Dubai
        </p>
        <div style={{ maxWidth: Math.min(1280, vw - (mobile ? 48 : tablet ? 80 : 144)), position: "relative", zIndex: 1 }}>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, lineHeight: 0.94, color: COLORS.text, margin: 0, letterSpacing: mobile ? -2 : -4 }}>
            <span style={{ display: "block", fontSize: heroTitle1Size }}>L'impossible</span>
            <span style={{ display: "block", color: "rgba(255,255,255,0.52)", fontSize: heroTitle2Size }}>n'est qu'une</span>
            <span style={{ display: "block", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.78)", fontSize: heroTitle3Size }}>question de temps.</span>
          </h1>
        </div>
        <p style={{ margin: "36px 0 0 0", fontSize: 16, lineHeight: 1.9, maxWidth: 620, color: COLORS.textBody, fontWeight: 300, position: "relative", zIndex: 1 }}>
          Just Agency est la conciergerie de luxe de JUST. Nous orchestrons l'inaccessible, des jets privés aux villas d'exception, pour transformer chaque demande en expérience sur mesure.
        </p>
      </header>

      <main>
        <section aria-label="Image de présentation" style={{ width: "100%", height: mobile ? 520 : tablet ? 620 : clampNumber(620, Math.round(vw * 0.5), 820), position: "relative", overflow: "hidden" }}>
          <motion.img src="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1400&q=80&auto=format&fit=crop" alt="Chaque détail compte." loading="lazy" decoding="async" initial={reduceMotion ? undefined : { opacity: 0 }} whileInView={reduceMotion ? undefined : { opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={reduceMotion ? undefined : { duration: 1, ease: EASE }} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.34) 30%, transparent 50%)", pointerEvents: "none" }} />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.34) 42%, rgba(0,0,0,0.14) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: mobile ? 28 : 56, left: mobile ? 24 : tablet ? 40 : 72, right: mobile ? 24 : tablet ? 40 : 72 }}>
            <p style={{ margin: "0 0 10px 0", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted, fontFamily: BODY }}>L'art du sur mesure</p>
            <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px,4vw,52px)", color: COLORS.text, lineHeight: 1, letterSpacing: -2 }}>Chaque détail compte.</h2>
          </div>
        </section>

        <Marquee items={["Jets privés", "Yachts", "Supercars", "Villas", "Gastronomie", "Personal shopping", "Événements", "Conciergerie"]} speed={40} />

        <section aria-label="Nos services" style={{ padding: pagePadding }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <p style={{ margin: "0 0 14px 0", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: COLORS.textMuted }}>Nos services</p>
              <h2 style={{ margin: "0 0 42px 0", fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(34px,4.5vw,58px)", color: COLORS.text, lineHeight: 1, letterSpacing: -3 }}>Tout. Partout. Maintenant.</h2>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "minmax(0,1fr)" : tablet ? "repeat(2,minmax(0,1fr))" : "repeat(3,minmax(0,1fr))", gap: 14 }}>
              {services.map((s, i) => (
                <ServiceCard key={i} number={String(i + 1).padStart(2, "0")} title={s.title} description={s.desc} delay={i * 0.04} />
              ))}
            </div>
          </div>
        </section>

        <section className="just-dark-form" aria-label="Formulaire de contact" style={{ padding: mobile ? "80px 24px 120px" : tablet ? "100px 40px 120px" : "110px 72px 140px", borderTop: `1px solid ${COLORS.borderSoft}`, position: "relative" }}>
          <div aria-live="polite" aria-atomic="true" style={srOnly}>{liveMsg}</div>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center top,rgba(255,255,255,0.03) 0%,transparent 65%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal>
              <div style={{ marginBottom: mobile ? 48 : 72 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 28px", display: "flex", alignItems: "center", gap: 12 }}>
                  <motion.span aria-hidden="true" animate={reduceMotion ? undefined : { scale: [1, 1.45, 1], opacity: [0.35, 0.85, 0.35] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
                  Formulaire de contact
                </p>
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: mobile ? "clamp(40px,12vw,58px)" : "clamp(56px,8vw,110px)", lineHeight: 0.92, color: "#fff", margin: 0, letterSpacing: mobile ? -2 : -5 }}>
                  <span style={{ display: "block" }}>Parlons</span>
                  <span style={{ display: "block", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.88)", letterSpacing: mobile ? -1 : -3 }}>de votre projet.</span>
                </h2>
                <p style={{ marginTop: 28, fontSize: 16, lineHeight: 1.9, maxWidth: 620, color: COLORS.textBody, fontWeight: 300 }}>
                  Influence, production, conciergerie ou média, quelle que soit votre ambition, on a l'entité et l'expertise qu'il vous faut. Remplissez le formulaire, on revient vers vous sous 24h.
                </p>
              </div>
            </Reveal>

            <div className="jag-contact-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,0.42fr)", gap: mobile ? 56 : 88, alignItems: "start" }}>
              <Reveal>
                <div style={{ minWidth: 0 }}>
                  {status === "success" ? (
                    <motion.section initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} style={{ textAlign: "center", padding: mobile ? "56px 24px" : "80px 40px", background: COLORS.surface, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 24 }}>
                      <motion.div initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }} animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }} transition={{ duration: 0.45, delay: 0.12, ease: EASE }} style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      </motion.div>
                      <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: mobile ? 28 : 34, color: "#fff", letterSpacing: -2, margin: "0 0 12px" }}>Message envoyé.</h3>
                      <p style={{ fontFamily: BODY, fontSize: 16, color: COLORS.textBody, fontWeight: 300, lineHeight: 1.8, maxWidth: 420, margin: "0 auto" }}>Merci pour votre intérêt. Notre équipe revient vers vous sous 24h.</p>
                      <motion.button type="button" onClick={reset} whileHover={reduceMotion ? undefined : { opacity: 0.85 }} style={{ marginTop: 36, padding: "14px 30px", borderRadius: 100, border: "1px solid #fff", background: "transparent", color: "#fff", fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
                        Nouveau message
                      </motion.button>
                    </motion.section>
                  ) : (
                    <section style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: COLORS.textMuted, margin: "0 0 14px" }}>Formulaire</p>
                      <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(32px,4vw,48px)", color: "#fff", lineHeight: 1, letterSpacing: -2, margin: "0 0 18px" }}>Dites-nous tout.</h3>
                      <p style={{ margin: "0 0 52px", fontFamily: BODY, fontSize: 15, lineHeight: 1.8, color: COLORS.textBody, maxWidth: 620 }}>Les champs marqués d'un astérisque sont obligatoires.</p>
                      <form onSubmit={handleSubmit} noValidate>
                        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                          <div className="jag-two-cols" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 44 }}>
                            <ContactInputField id={nameId} label="Nom complet" name="name" required autoComplete="name" value={formData.name} error={errors.name} placeholder="Jean Dupont" onChange={update("name")} />
                            <ContactInputField id={emailId} label="Adresse email" name="email" type="email" required autoComplete="email" inputMode="email" value={formData.email} error={errors.email} placeholder="jean@marque.com" onChange={update("email")} />
                          </div>
                          <div className="jag-two-cols" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 44 }}>
                            <ContactInputField id={phoneId} label="Téléphone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={formData.phone} placeholder="+33 6 12 34 56 78" hint="Optionnel" onChange={update("phone")} />
                            <ContactInputField id={companyId} label="Entreprise / Marque" name="company" autoComplete="organization" value={formData.company} placeholder="Votre marque" hint="Optionnel" onChange={update("company")} />
                          </div>
                          <ContactPillSelect label="Entité" name="entity" options={entityList} value={formData.entity} onChange={update("entity")} />
                          <ContactTextareaField id={messageId} label="Votre message" name="message" required value={formData.message} error={errors.message} placeholder="Décrivez votre projet, vos objectifs, vos délais..." onChange={update("message")} />
                          <AnimatePresence>
                            {status === "error" && (
                              <motion.div role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ padding: "16px 22px", borderRadius: 12, background: COLORS.errorBg, border: `1px solid ${COLORS.errorBorder}`, fontFamily: BODY, fontSize: 14, color: COLORS.error, lineHeight: 1.7 }}>
                                <strong>Une erreur est survenue.</strong> {liveMsg && liveMsg !== "Une erreur est survenue." ? liveMsg : "Veuillez réessayer ou nous contacter directement."}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <motion.button type="submit" disabled={submitDisabled} aria-disabled={submitDisabled} whileHover={!submitDisabled && !reduceMotion ? { y: -2, backgroundColor: "#fff", color: "#000" } : undefined} whileTap={!submitDisabled && !reduceMotion ? { scale: 0.98 } : undefined} style={{ display: "inline-flex", alignItems: "center", alignSelf: "flex-start", gap: 12, padding: mobile ? "16px 28px" : "18px 42px", background: "transparent", color: submitDisabled ? "rgba(255,255,255,0.25)" : "#fff", fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, letterSpacing: 4, textTransform: "uppercase", border: `1px solid ${submitDisabled ? "rgba(255,255,255,0.12)" : "#fff"}`, borderRadius: 100, cursor: submitDisabled ? "not-allowed" : "pointer", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)", opacity: status === "sending" ? 0.58 : 1 }}>
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
                <aside className="jag-sticky" aria-label="Informations de contact" style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ padding: "20px", borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.borderSoft}`, display: "flex", alignItems: "center", gap: 14 }}>
                    <motion.div aria-hidden="true" animate={reduceMotion ? undefined : { scale: [1, 1.3, 1], opacity: [0.45, 1, 0.45] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success, flexShrink: 0 }} />
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#fff" }}>Réponse sous 24h</p>
                  </div>
                  <div style={{ padding: mobile ? "24px" : "28px", borderRadius: 20, background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.borderSoft}` }}>
                    <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: COLORS.textMuted, marginBottom: 16, marginTop: 0 }}>Note</p>
                    <blockquote style={{ margin: 0, fontFamily: DISPLAY, fontSize: mobile ? 22 : 28, fontWeight: 300, lineHeight: 1.5, color: "rgba(255,255,255,0.75)", fontStyle: "italic", letterSpacing: -0.8 }}>
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