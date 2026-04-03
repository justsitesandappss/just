"use client"

import { useEffect, useMemo, useRef, useState, useCallback, useId } from "react"
import type { FormEvent } from "react"
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const WEB3FORMS_ACCESS_KEY = "b891692e-8148-4785-856a-e1c43f4816dc"

const COLORS = {
  bg: "#000000",
  panel: "#080808",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#ffffff",
  textSoft: "rgba(255,255,255,0.82)",
  textMuted: "rgba(255,255,255,0.70)",
  textLow: "rgba(255,255,255,0.60)",
  accent: "#ff6b4a",
  success: "#22c55e",
  surface: "rgba(255,255,255,0.03)",
  error: "#ef4444",
  errorBg: "rgba(239,68,68,0.08)",
  errorBorder: "rgba(239,68,68,0.24)",
} as const

function white(opacity: number) {
  return `rgba(255,255,255,${opacity})`
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function sanitizeText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim()
}

function useResponsive() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop")
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setBp(w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop")
    }
    check()
    window.addEventListener("resize", check, { passive: true })
    return () => window.removeEventListener("resize", check)
  }, [])
  return bp
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reducedMotion = useReducedMotion()
  if (reducedMotion) {
    return <div style={{ width: "100%", minWidth: 0 }}>{children}</div>
  }
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      style={{ width: "100%", minWidth: 0 }}
    >
      {children}
    </motion.div>
  )
}

type ContactStatus = "idle" | "sending" | "success" | "error"
type ContactFormData = { name: string; email: string; phone: string; company: string; entity: string; message: string }
type ContactErrors = Partial<Record<keyof ContactFormData, string>>

function ContactInputField({ id, label, name, type = "text", autoComplete, inputMode, placeholder, required = false, value, error, hint, onChange }: {
  id: string; label: string; name: string; type?: string; autoComplete?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; placeholder?: string; required?: boolean; value: string; error?: string; hint?: string; onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <motion.label htmlFor={id} animate={{ top: active ? 6 : 24, fontSize: active ? 11 : 15, color: error ? COLORS.error : COLORS.text, letterSpacing: active ? 3.5 : 0 }} transition={{ duration: 0.22 }} style={{ position: "absolute", left: 0, fontFamily: BODY, fontWeight: active ? 700 : 400, textTransform: active ? "uppercase" : "none", pointerEvents: "none", zIndex: 1, lineHeight: 1 }}>
        {label}{required && <span aria-hidden="true"> *</span>}
      </motion.label>
      <input id={id} name={name} type={type} value={value} required={required} autoComplete={autoComplete} inputMode={inputMode} aria-required={required || undefined} aria-invalid={error ? true : undefined} placeholder={focused ? placeholder : ""} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${error ? COLORS.error : focused ? COLORS.text : COLORS.border}`, padding: "30px 0 16px", fontFamily: BODY, fontSize: 17, fontWeight: 400, color: COLORS.text, outline: "none", transition: "border-color 0.25s ease", letterSpacing: 0.2 }} />
      {hint && <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 12, color: COLORS.textMuted }}>{hint}</p>}
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
      <textarea id={id} name={name} value={value} required={required} aria-required={required || undefined} aria-invalid={error ? true : undefined} placeholder={focused ? placeholder : ""} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} rows={5} style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${error ? COLORS.error : focused ? COLORS.text : COLORS.border}`, padding: "30px 0 16px", fontFamily: BODY, fontSize: 17, fontWeight: 400, color: COLORS.text, outline: "none", resize: "vertical", minHeight: 130, transition: "border-color 0.25s ease", letterSpacing: 0.2 }} />
      {error && <p role="alert" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 13, color: COLORS.error }}>{error}</p>}
    </div>
  )
}

function ContactPillSelect({ label, name, options, value, onChange }: { label: string; name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const groupId = useId()
  const reducedMotion = useReducedMotion()
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
      <legend id={groupId} style={{ fontFamily: BODY, fontSize: 11, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: COLORS.text, marginBottom: 18 }}>{label}</legend>
      <div role="group" aria-labelledby={groupId} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((opt) => {
          const isActive = value === opt
          return (
            <motion.button key={opt} type="button" aria-pressed={isActive} onClick={() => onChange(isActive ? "" : opt)} whileHover={reducedMotion ? undefined : { scale: 1.02 }} whileTap={reducedMotion ? undefined : { scale: 0.98 }} animate={{ background: isActive ? "#ffffff" : "transparent", borderColor: isActive ? "#ffffff" : "rgba(255,255,255,0.18)", color: isActive ? "#000000" : "#ffffff" }} transition={{ duration: 0.2 }} style={{ padding: "11px 20px", borderRadius: 100, border: "1px solid", fontFamily: BODY, fontSize: 13, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", cursor: "pointer", outline: "none", boxShadow: "none" }}>
              {opt}
            </motion.button>
          )
        })}
      </div>
      <input type="hidden" name={name} value={value} />
    </fieldset>
  )
}

function PlatformIcon({ platform, size = 16 }: { platform: string; size?: number }) {
  const p = sanitizeText(platform).toLowerCase()
  const color = "currentColor"
  if (p === "instagram")
    return (
      <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none" /></svg>
    )
  if (p === "tiktok")
    return (
      <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
    )
  if (p === "youtube")
    return (
      <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
    )
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M2 12h20" /></svg>
  )
}

export default function RilesFreestyle() {
  const bp = useResponsive()
  const reducedMotion = useReducedMotion()
  const isMobile = bp === "mobile"
  const isTablet = bp === "tablet"
  
  const nameId = useId(), emailId = useId(), phoneId = useId(), companyId = useId(), messageId = useId(), successTitleId = useId()
  
  const [formData, setFormData] = useState<ContactFormData>({ name: "", email: "", phone: "", company: "", entity: "", message: "" })
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<ContactStatus>("idle")
  const [liveMessage, setLiveMessage] = useState("")
  const entityList = ["Just Impact", "Just Prod", "Just Agency", "Just 4 You"]

  const updateField = useCallback((field: keyof ContactFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (status === "error") { setStatus("idle"); setLiveMessage("") }
  }, [errors, status])

  const validateForm = useCallback(() => {
    const e: ContactErrors = {}
    if (!formData.name.trim()) e.name = "Merci d'indiquer votre nom."
    if (!formData.email.trim()) e.email = "Merci d'indiquer votre adresse email."
    else if (!isValidEmail(formData.email)) e.email = "L'adresse email semble invalide."
    if (!formData.message.trim()) e.message = "Merci de préciser votre demande."
    else if (formData.message.trim().length < 10) e.message = "Votre message est un peu trop court."
    return e
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData({ name: "", email: "", phone: "", company: "", entity: "", message: "" })
    setErrors({}); setStatus("idle"); setLiveMessage("")
  }, [])

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const nextErrors = validateForm()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) { setStatus("error"); setLiveMessage("Le formulaire contient des erreurs."); return }
    setStatus("sending"); setLiveMessage("Envoi du formulaire en cours.")
    try {
      const fd = new FormData()
      fd.append("access_key", WEB3FORMS_ACCESS_KEY)
      fd.append("subject", `[JUST] Nouveau contact — ${formData.entity || "Général"}`)
      fd.append("from_name", formData.name)
      fd.append("name", formData.name); fd.append("email", formData.email)
      fd.append("phone", formData.phone); fd.append("company", formData.company)
      fd.append("entity", formData.entity); fd.append("message", formData.message)
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data?.success) { setStatus("success"); setLiveMessage("Message envoyé.") }
      else { setStatus("error"); setLiveMessage(data?.message || "Une erreur est survenue.") }
    } catch { setStatus("error"); setLiveMessage("Une erreur est survenue.") }
  }, [formData, validateForm])

  const isSubmitDisabled = status === "sending" || !formData.name.trim() || !formData.email.trim() || !formData.message.trim()
  const sectionPadding = isMobile ? "60px 20px" : isTablet ? "80px 40px" : "100px 72px"

  const stats = [
    { platform: "Instagram", count: "200.9K", icon: "instagram" },
    { platform: "TikTok", count: "1.3M", icon: "tiktok" },
    { platform: "YouTube", count: "61.9K", icon: "youtube" },
  ]

  return (
    <div style={{ width: "100%", minWidth: 0, background: COLORS.bg, color: COLORS.textSoft, fontFamily: BODY, overflowX: "hidden", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@300;400;500;600;700;800&family=Outfit:wght@200;300;400;500;600;700&display=swap');input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.28);}input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,textarea:-webkit-autofill{-webkit-box-shadow:0 0 0px 1000px #000 inset!important;-webkit-text-fill-color:#fff!important;caret-color:#fff!important;}a:focus-visible,button:focus-visible{outline:2px solid ${COLORS.text};outline-offset:3px;box-shadow:0 0 0 4px rgba(255,255,255,0.14);}`}</style>

      {/* Hero Section */}
      <section style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-riles.jpg)", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.4)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)" }} />
        
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: sectionPadding }}>
          <motion.div initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: 1, delay: 0.2, ease: EASE }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 5, textTransform: "uppercase", color: COLORS.accent, margin: "0 0 20px 0" }}>Foot Freestyle · Journalisme</p>
            <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(48px, 10vw, 120px)", lineHeight: 0.9, color: COLORS.text, margin: 0, letterSpacing: -4 }}>
              RILES<br />
              <span style={{ fontWeight: 300, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>FREESTYLE</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 500, color: COLORS.textMuted, marginTop: 32, fontWeight: 300 }}>
              Pro du foot freestyle. Partenaire PSG, Canal+ et SNCF. 139M+ de vues cumulées.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.6, ease: EASE }} style={{ display: "flex", gap: 32, marginTop: 48, flexWrap: "wrap" }}>
            {stats.map((stat) => (
              <div key={stat.platform} style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", background: "rgba(255,255,255,0.05)", borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
                <PlatformIcon platform={stat.icon} size={20} />
                <div>
                  <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: COLORS.text }}>{stat.count}</p>
                  <p style={{ margin: 0, fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>{stat.platform}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bio Section */}
      <section style={{ padding: sectionPadding, borderTop: `1px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 64, alignItems: "start" }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", color: COLORS.textLow, margin: "0 0 20px 0" }}>À propos</p>
                <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(28px, 4vw, 48px)", color: COLORS.text, lineHeight: 1.1, letterSpacing: -2, margin: "0 0 32px 0" }}>
                  Le ballon comme<br />langage universel
                </h2>
                <p style={{ fontSize: 16, lineHeight: 1.9, color: COLORS.textMuted, fontWeight: 300, margin: "0 0 24px 0" }}>
                  Riles Freestyle a transformé sa passion pour le football en art de vivre. Avec plus de 139 millions de vues sur ses contenus, il incarne la nouvelle génération de créateurs sportifs qui allient performance technique et storytelling authentique.
                </p>
                <p style={{ fontSize: 16, lineHeight: 1.9, color: COLORS.textMuted, fontWeight: 300, margin: 0 }}>
                  Partenaire officiel du PSG, de Canal+ et de la SNCF, il maîtrise aussi bien les caméras cachées que les collaborations corporate. Son approche décalée et son talent indéniable en font un atout précieux pour les marques seeking authenticité et reach.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: 32, background: COLORS.panel, borderRadius: 20, border: `1px solid ${COLORS.border}` }}>
                  <p style={{ fontSize: 48, fontWeight: 800, fontFamily: DISPLAY, color: COLORS.accent, margin: "0 0 8px 0" }}>139M+</p>
                  <p style={{ margin: 0, fontSize: 14, color: COLORS.textMuted }}>Vues cumulées</p>
                </div>
                <div style={{ padding: 32, background: COLORS.panel, borderRadius: 20, border: `1px solid ${COLORS.border}` }}>
                  <p style={{ fontSize: 48, fontWeight: 800, fontFamily: DISPLAY, color: COLORS.accent, margin: "0 0 8px 0" }}>3</p>
                  <p style={{ margin: 0, fontSize: 14, color: COLORS.textMuted }}>Partenariats majeurs (PSG, Canal+, SNCF)</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" aria-label="Formulaire de contact" style={{ padding: isMobile ? "80px 20px 100px" : isTablet ? "100px 40px 120px" : "110px 72px 140px", borderTop: `1px solid ${white(0.06)}`, position: "relative" }}>
        <div aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>{liveMessage}</div>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center top,rgba(255,255,255,0.03) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{ marginBottom: isMobile ? 48 : 72 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: white(0.58), margin: "0 0 28px", display: "flex", alignItems: "center", gap: 12 }}>
                <motion.span aria-hidden="true" animate={reducedMotion ? undefined : { scale: [1, 1.45, 1], opacity: [0.35, 0.85, 0.35] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ width: 5, height: 5, borderRadius: "50%", background: "#ffffff", display: "inline-block" }} />
                Collaboration
              </p>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: isMobile ? "clamp(40px, 12vw, 58px)" : "clamp(56px, 8vw, 110px)", lineHeight: 0.92, color: "#ffffff", margin: 0, letterSpacing: isMobile ? -2 : -5 }}>
                <span style={{ display: "block" }}>Travaillons</span>
                <span style={{ display: "block", fontWeight: 300, fontStyle: "italic", color: white(0.88), letterSpacing: isMobile ? -1 : -3 }}>ensemble.</span>
              </h2>
              <p style={{ marginTop: 28, fontSize: 16, lineHeight: 1.9, maxWidth: 620, color: white(0.62), fontWeight: 300 }}>
                Vous souhaitez collaborer avec Riles Freestyle ? Remplissez le formulaire ci-dessous.
              </p>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(280px,0.42fr)", gap: isMobile ? 56 : 88, alignItems: "start" }}>
            <Reveal>
              <div>
                {status === "success" ? (
                  <motion.section aria-labelledby={successTitleId} initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={reducedMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} style={{ textAlign: "center", padding: isMobile ? "56px 24px" : "80px 40px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24 }}>
                    <motion.div initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }} animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }} transition={{ duration: 0.45, delay: 0.12, ease: EASE }} style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid #ffffff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </motion.div>
                    <h3 id={successTitleId} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: "#ffffff", letterSpacing: -2, margin: "0 0 12px" }}>Message envoyé.</h3>
                    <p style={{ fontFamily: BODY, fontSize: 16, color: white(0.6), fontWeight: 300, lineHeight: 1.8, maxWidth: 420, margin: "0 auto" }}>Merci pour votre intérêt. Notre équipe revient vers vous sous 24h.</p>
                    <motion.button type="button" onClick={resetForm} whileHover={reducedMotion ? undefined : { opacity: 0.85 }} style={{ marginTop: 36, padding: "14px 30px", borderRadius: 100, border: "1px solid #ffffff", background: "transparent", color: "#ffffff", fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
                      Nouveau message
                    </motion.button>
                  </motion.section>
                ) : (
                  <section>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: white(0.58), margin: "0 0 14px" }}>Formulaire</p>
                    <h3 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "clamp(32px, 4vw, 48px)", color: "#ffffff", lineHeight: 1, letterSpacing: -2, margin: "0 0 18px" }}>Dites-nous tout.</h3>
                    <p style={{ margin: "0 0 52px", fontFamily: BODY, fontSize: 15, lineHeight: 1.8, color: white(0.6), maxWidth: 620 }}>Les champs marqués d'un astérisque sont obligatoires.</p>
                    <form onSubmit={handleSubmit} noValidate>
                      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0,1fr)" : "repeat(2,minmax(0,1fr))", gap: isMobile ? 28 : 44 }}>
                          <ContactInputField id={nameId} label="Nom complet" name="name" required autoComplete="name" value={formData.name} error={errors.name} placeholder="Jean Dupont" onChange={updateField("name")} />
                          <ContactInputField id={emailId} label="Adresse email" name="email" type="email" required autoComplete="email" inputMode="email" value={formData.email} error={errors.email} placeholder="jean@marque.com" onChange={updateField("email")} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "minmax(0,1fr)" : "repeat(2,minmax(0,1fr))", gap: isMobile ? 28 : 44 }}>
                          <ContactInputField id={phoneId} label="Téléphone" name="phone" type="tel" autoComplete="tel" inputMode="tel" value={formData.phone} placeholder="+33 6 12 34 56 78" hint="Optionnel" onChange={updateField("phone")} />
                          <ContactInputField id={companyId} label="Entreprise / Marque" name="company" autoComplete="organization" value={formData.company} placeholder="Votre marque" hint="Optionnel" onChange={updateField("company")} />
                        </div>
                        <ContactPillSelect label="Entité" name="entity" options={entityList} value={formData.entity} onChange={updateField("entity")} />
                        <ContactTextareaField id={messageId} label="Votre message" name="message" required value={formData.message} error={errors.message} placeholder="Décrivez votre projet, vos objectifs, vos délais..." onChange={updateField("message")} />
                        <AnimatePresence>
                          {status === "error" && (
                            <motion.div role="alert" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ padding: "16px 22px", borderRadius: 12, background: COLORS.errorBg, border: `1px solid ${COLORS.errorBorder}`, fontFamily: BODY, fontSize: 14, color: COLORS.error, fontWeight: 400, lineHeight: 1.7 }}>
                              <strong>Une erreur est survenue.</strong> {liveMessage && liveMessage !== "Une erreur est survenue." ? liveMessage : "Veuillez réessayer ou nous contacter directement."}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <motion.button type="submit" disabled={isSubmitDisabled} aria-disabled={isSubmitDisabled} whileHover={!isSubmitDisabled && !reducedMotion ? { y: -2, backgroundColor: "#ffffff", color: "#000000" } : undefined} whileTap={!isSubmitDisabled && !reducedMotion ? { scale: 0.98 } : undefined} style={{ display: "inline-flex", alignItems: "center", alignSelf: "flex-start", gap: 12, padding: "18px 42px", background: "transparent", color: isSubmitDisabled ? "rgba(255,255,255,0.25)" : "#ffffff", fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, letterSpacing: 4, textTransform: "uppercase", border: `1px solid ${isSubmitDisabled ? "rgba(255,255,255,0.12)" : "#ffffff"}`, borderRadius: 100, cursor: isSubmitDisabled ? "not-allowed" : "pointer", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)", opacity: status === "sending" ? 0.58 : 1 }}>
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
              <aside aria-label="Informations de contact" style={{ position: isMobile ? "relative" : "sticky", top: 100, display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ padding: "20px", borderRadius: 16, background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 14 }}>
                  <motion.div aria-hidden="true" animate={reducedMotion ? undefined : { scale: [1, 1.3, 1], opacity: [0.45, 1, 0.45] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#ffffff" }}>Réponse sous 24h</p>
                </div>
                <div style={{ padding: isMobile ? "24px" : "28px", borderRadius: 20, background: white(0.02), border: `1px solid ${white(0.08)}` }}>
                  <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: white(0.55), marginBottom: 16, marginTop: 0 }}>Note</p>
                  <blockquote style={{ margin: 0, fontFamily: DISPLAY, fontSize: isMobile ? 22 : 28, fontWeight: 300, lineHeight: 1.5, color: white(0.75), fontStyle: "italic", letterSpacing: -0.8 }}>
                    "Chaque projet commence par une conversation. La vôtre commence ici."
                  </blockquote>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}