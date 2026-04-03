"use client"

import { Fragment, useId, useMemo, useRef, useState, useCallback } from "react"
import type { ReactNode, HTMLAttributes, FormEvent } from "react"
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const C = {
  bg: "#ffffff",
  text: "#000000",
  border: "rgba(0,0,0,0.15)",
  borderStrong: "rgba(0,0,0,0.3)",
  borderFocus: "#000000",
  surface: "rgba(0,0,0,0.03)",
  error: "#dc2626",
  errorBg: "rgba(220,38,38,0.06)",
  errorBorder: "rgba(220,38,38,0.18)",
  success: "#16a34a",
} as const

type Status = "idle" | "sending" | "success" | "error"

type FormDataState = {
  name: string
  email: string
  phone: string
  company: string
  entity: string
  message: string
}

type ErrorState = Partial<Record<keyof FormDataState, string>>

const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || ""

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function Reveal({
  children,
  delay = 0,
  y = 36,
}: {
  children: ReactNode
  delay?: number
  y?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduceMotion = useReducedMotion()

  if (reduceMotion) return <div ref={ref}>{children}</div>

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function Marquee({ items, speed = 35 }: { items: string[]; speed?: number }) {
  const reduceMotion = useReducedMotion()
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
        animate={reduceMotion ? undefined : { x: ["0%", "-33.333%"] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: speed, repeat: Infinity, ease: "linear" }
        }
        style={{
          display: "flex",
          gap: 40,
          width: "max-content",
          alignItems: "center",
        }}
      >
        {tripled.map((item, i) => (
          <Fragment key={`${item}-${i}`}>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: 800,
                color: "rgba(0,0,0,0.06)",
                letterSpacing: -3,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              {item}
            </span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.12)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          </Fragment>
        ))}
      </motion.div>
    </div>
  )
}

function InputField({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  required = false,
  value,
  error,
  hint,
  onChange,
}: {
  id: string
  label: string
  name: string
  type?: string
  autoComplete?: string
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"]
  placeholder?: string
  required?: boolean
  value: string
  error?: string
  hint?: string
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div style={{ position: "relative" }}>
      <motion.label
        htmlFor={id}
        animate={{
          top: active ? 6 : 24,
          fontSize: active ? 11 : 15,
          color: error ? C.error : "#000000",
          letterSpacing: active ? 3.5 : 0,
        }}
        transition={{ duration: 0.22 }}
        style={{
          position: "absolute",
          left: 0,
          fontFamily: BODY,
          fontWeight: active ? 700 : 400,
          textTransform: active ? "uppercase" : "none",
          pointerEvents: "none",
          zIndex: 1,
          lineHeight: 1,
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: "#000000" }}>
            {" "}
            *
          </span>
        )}
      </motion.label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? hintId : null, error ? errorId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        placeholder={focused ? placeholder : ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${
            error ? C.error : focused ? C.borderFocus : C.border
          }`,
          padding: "30px 0 16px",
          fontFamily: BODY,
          fontSize: 17,
          fontWeight: 400,
          color: "#000000",
          outline: "none",
          transition: "border-color 0.25s ease",
          letterSpacing: 0.2,
        }}
      />

      {hint && (
        <p
          id={hintId}
          style={{
            margin: "10px 0 0",
            fontFamily: BODY,
            fontSize: 12,
            lineHeight: 1.6,
            color: "#000000",
          }}
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: "10px 0 0",
            fontFamily: BODY,
            fontSize: 13,
            lineHeight: 1.6,
            color: C.error,
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

function TextareaField({
  id,
  label,
  name,
  placeholder,
  required = false,
  value,
  error,
  hint,
  onChange,
}: {
  id: string
  label: string
  name: string
  placeholder?: string
  required?: boolean
  value: string
  error?: string
  hint?: string
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div style={{ position: "relative" }}>
      <motion.label
        htmlFor={id}
        animate={{
          top: active ? 6 : 24,
          fontSize: active ? 11 : 15,
          color: error ? C.error : "#000000",
          letterSpacing: active ? 3.5 : 0,
        }}
        transition={{ duration: 0.22 }}
        style={{
          position: "absolute",
          left: 0,
          fontFamily: BODY,
          fontWeight: active ? 700 : 400,
          textTransform: active ? "uppercase" : "none",
          pointerEvents: "none",
          zIndex: 1,
          lineHeight: 1,
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: "#000000" }}>
            {" "}
            *
          </span>
        )}
      </motion.label>

      <textarea
        id={id}
        name={name}
        value={value}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? hintId : null, error ? errorId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        placeholder={focused ? placeholder : ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={5}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${
            error ? C.error : focused ? C.borderFocus : C.border
          }`,
          padding: "30px 0 16px",
          fontFamily: BODY,
          fontSize: 17,
          fontWeight: 400,
          color: "#000000",
          outline: "none",
          resize: "vertical",
          minHeight: 130,
          transition: "border-color 0.25s ease",
          letterSpacing: 0.2,
        }}
      />

      {hint && (
        <p
          id={hintId}
          style={{
            margin: "10px 0 0",
            fontFamily: BODY,
            fontSize: 12,
            lineHeight: 1.6,
            color: "#000000",
          }}
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: "10px 0 0",
            fontFamily: BODY,
            fontSize: 13,
            lineHeight: 1.6,
            color: C.error,
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

function PillSelect({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string
  name: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  const groupId = useId()

  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}>
      <legend
        id={groupId}
        style={{
          fontFamily: BODY,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#000000",
          marginBottom: 18,
        }}
      >
        {label}
      </legend>

      <div
        role="group"
        aria-labelledby={groupId}
        style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
      >
        {options.map((opt) => {
          const active = value === opt

          return (
            <motion.button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? "" : opt)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                background: active ? "#000000" : "transparent",
                borderColor: active ? "#000000" : "rgba(0,0,0,0.18)",
                color: active ? "#ffffff" : "#000000",
              }}
              transition={{ duration: 0.2 }}
              style={{
                padding: "11px 20px",
                borderRadius: 100,
                border: "1px solid",
                fontFamily: BODY,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                cursor: "pointer",
                outline: "none",
                boxShadow: "none",
              }}
            >
              {opt}
            </motion.button>
          )
        })}
      </div>

      <input type="hidden" name={name} value={value} />
    </fieldset>
  )
}

export default function JustContactPage() {
  const reduceMotion = useReducedMotion()

  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    entity: "",
    message: "",
  })

  const [errors, setErrors] = useState<ErrorState>({})
  const [status, setStatus] = useState<Status>("idle")
  const [liveMessage, setLiveMessage] = useState("")

  const entityList = ["Just Impact", "Just Prod", "Just Agency", "Just 4 You"]

  const nameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const companyId = useId()
  const messageId = useId()

  const sectionTitleId = useId()
  const sectionDescId = useId()
  const successTitleId = useId()

  const update = useCallback(
    (field: keyof FormDataState) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }

      if (status === "error") {
        setStatus("idle")
        setLiveMessage("")
      }
    },
    [errors, status]
  )

  const validate = useCallback(() => {
    const e: ErrorState = {}

    if (!formData.name.trim()) e.name = "Merci d'indiquer votre nom."

    if (!formData.email.trim()) {
      e.email = "Merci d'indiquer votre adresse email."
    } else if (!isValidEmail(formData.email)) {
      e.email = "L'adresse email semble invalide."
    }

    if (!formData.message.trim()) {
      e.message = "Merci de préciser votre demande."
    } else if (formData.message.trim().length < 10) {
      e.message = "Votre message est un peu trop court."
    }

    return e
  }, [formData])

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      entity: "",
      message: "",
    })
    setErrors({})
    setStatus("idle")
    setLiveMessage("")
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const nextErrors = validate()
      setErrors(nextErrors)

      if (Object.keys(nextErrors).length > 0) {
        setStatus("error")
        setLiveMessage("Le formulaire contient des erreurs.")
        return
      }

      if (!WEB3FORMS_ACCESS_KEY) {
        setStatus("error")
        setLiveMessage(
          "La clé du formulaire est absente. Vérifiez votre fichier .env.local."
        )
        return
      }

      setStatus("sending")
      setLiveMessage("Envoi du formulaire en cours.")

      try {
        const fd = new FormData()
        fd.append("access_key", WEB3FORMS_ACCESS_KEY)
        fd.append(
          "subject",
          `[JUST] Nouveau contact — ${formData.entity || "Général"}`
        )
        fd.append("from_name", formData.name)
        fd.append("name", formData.name)
        fd.append("email", formData.email)
        fd.append("phone", formData.phone)
        fd.append("company", formData.company)
        fd.append("entity", formData.entity)
        fd.append("message", formData.message)

        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: fd,
        })

        const data = await res.json()

        if (res.ok && data?.success) {
          setStatus("success")
          setLiveMessage("Message envoyé.")
        } else {
          setStatus("error")
          setLiveMessage(data?.message || "Une erreur est survenue.")
        }
      } catch {
        setStatus("error")
        setLiveMessage("Une erreur est survenue.")
      }
    },
    [formData, validate]
  )

  const isSubmitDisabled =
    status === "sending" ||
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.message.trim()

  return (
    <div
      className="just-contact-root"
      style={{
        width: "100%",
        background: "#ffffff",
        color: "#000000",
        fontFamily: BODY,
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <style>{`
        .just-contact-root * { box-sizing: border-box; }
        .just-contact-root input::placeholder,
        .just-contact-root textarea::placeholder { color: rgba(0,0,0,0.3); }

        .just-contact-root button:focus-visible,
        .just-contact-root input:focus-visible,
        .just-contact-root textarea:focus-visible,
        .just-contact-root a:focus-visible {
          outline: 2px solid #000000;
          outline-offset: 4px;
          border-radius: 8px;
        }

        .just-contact-root input:-webkit-autofill,
        .just-contact-root input:-webkit-autofill:hover,
        .just-contact-root input:-webkit-autofill:focus,
        .just-contact-root textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #fff inset !important;
          -webkit-text-fill-color: #000 !important;
          caret-color: #000 !important;
        }

        @media (max-width: 980px) {
          .just-contact-grid {
            grid-template-columns: 1fr !important;
            gap: 56px !important;
          }

          .just-contact-two-cols {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }

          .just-contact-sticky {
            position: relative !important;
            top: 0 !important;
          }
        }

        @media (max-width: 640px) {
          .just-contact-root .jc-section-pad {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }

          .just-contact-root .jc-footer {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
      `}</style>

      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {liveMessage}
      </div>

      <header
        className="jc-section-pad"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 72px 60px",
          position: "relative",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#000000",
            margin: "0 0 48px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "relative",
            zIndex: 1,
          }}
        >
          <motion.span
            aria-hidden="true"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.45, 1], opacity: [0.35, 0.85, 0.35] }
            }
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#000000",
              display: "inline-block",
            }}
          />
          Formulaire de contact
        </motion.p>

        <div style={{ maxWidth: 920, position: "relative", zIndex: 1 }}>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 50 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.25, ease: EASE }}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(52px, 9vw, 120px)",
              lineHeight: 0.92,
              color: "#000000",
              margin: 0,
              letterSpacing: -5,
            }}
          >
            <span style={{ display: "block" }}>Parlons</span>
            <span
              style={{
                display: "block",
                fontWeight: 300,
                fontStyle: "italic",
                color: "#000000",
                letterSpacing: -3,
              }}
            >
              de votre projet.
            </span>
          </motion.h1>
        </div>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          style={{
            marginTop: 36,
            fontSize: 17,
            lineHeight: 1.9,
            maxWidth: 560,
            color: "#000000",
            fontWeight: 300,
            position: "relative",
            zIndex: 1,
          }}
        >
          Influence, production, conciergerie ou média, quelle que soit votre
          ambition, on a l&apos;entité et l&apos;expertise qu&apos;il vous faut. Remplissez le 
          formulaire, on revient vers vous sous 24h.
        </motion.p>
      </header>

      <Marquee
        items={[
          "Just Impact",
          "Just Prod",
          "Just Agency",
          "Just 4 You",
          "Influence",
          "Production",
          "Conciergerie",
          "Média",
        ]}
        speed={40}
      />

      <section
        aria-labelledby={sectionTitleId}
        aria-describedby={sectionDescId}
        className="jc-section-pad"
        style={{ padding: "80px 72px 120px" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            className="just-contact-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 0.45fr",
              gap: 100,
              alignItems: "start",
            }}
          >
            <Reveal>
              <div>
                {status === "success" ? (
                  <motion.section
                    aria-labelledby={successTitleId}
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE }}
                    style={{
                      textAlign: "center",
                      padding: "80px 40px",
                      background: C.surface,
                      border: `1px solid ${C.border}`,
                      borderRadius: 24,
                    }}
                  >
                    <motion.div
                      initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
                      animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                      transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        border: "2px solid #000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 28px",
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </motion.div>

                    <h2
                      id={successTitleId}
                      style={{
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: 34,
                        color: "#000000",
                        letterSpacing: -2,
                        margin: "0 0 12px",
                      }}
                    >
                      Message envoyé.
                    </h2>

                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: 16,
                        color: "#000000",
                        fontWeight: 300,
                        lineHeight: 1.8,
                        maxWidth: 420,
                        margin: "0 auto",
                      }}
                    >
                      Merci pour votre intérêt. Notre équipe revient vers vous
                      sous 24h.
                    </p>

                    <motion.button
                      type="button"
                      onClick={resetForm}
                      whileHover={reduceMotion ? undefined : { opacity: 0.85 }}
                      style={{
                        marginTop: 36,
                        padding: "14px 30px",
                        borderRadius: 100,
                        border: "1px solid #000000",
                        background: "transparent",
                        color: "#000000",
                        fontFamily: BODY,
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      Nouveau message
                    </motion.button>
                  </motion.section>
                ) : (
                  <section>
                    <p
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 6,
                        textTransform: "uppercase",
                        color: "#000000",
                        margin: "0 0 14px",
                      }}
                    >
                      Formulaire
                    </p>

                    <h2
                      id={sectionTitleId}
                      style={{
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: "clamp(32px, 4vw, 48px)",
                        color: "#000000",
                        lineHeight: 1,
                        letterSpacing: -2,
                        margin: "0 0 18px",
                      }}
                    >
                      Dites-nous tout.
                    </h2>

                    <p
                      id={sectionDescId}
                      style={{
                        margin: "0 0 52px",
                        fontFamily: BODY,
                        fontSize: 15,
                        lineHeight: 1.8,
                        color: "#000000",
                        maxWidth: 620,
                      }}
                    >
                      Les champs marqués d&apos;un astérisque sont obligatoires.
                    </p>

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      aria-busy={status === "sending"}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 36,
                        }}
                      >
                        <div
                          className="just-contact-two-cols"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 44,
                          }}
                        >
                          <InputField
                            id={nameId}
                            label="Nom complet"
                            name="name"
                            required
                            autoComplete="name"
                            value={formData.name}
                            error={errors.name}
                            placeholder="Jean Dupont"
                            onChange={update("name")}
                          />

                          <InputField
                            id={emailId}
                            label="Adresse email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            inputMode="email"
                            value={formData.email}
                            error={errors.email}
                            placeholder="jean@marque.com"
                            onChange={update("email")}
                          />
                        </div>

                        <div
                          className="just-contact-two-cols"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 44,
                          }}
                        >
                          <InputField
                            id={phoneId}
                            label="Téléphone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            inputMode="tel"
                            value={formData.phone}
                            placeholder="+33 6 12 34 56 78"
                            hint="Optionnel"
                            onChange={update("phone")}
                          />

                          <InputField
                            id={companyId}
                            label="Entreprise / Marque"
                            name="company"
                            autoComplete="organization"
                            value={formData.company}
                            placeholder="Votre marque"
                            hint="Optionnel"
                            onChange={update("company")}
                          />
                        </div>

                        <PillSelect
                          label="Entité"
                          name="entity"
                          options={entityList}
                          value={formData.entity}
                          onChange={update("entity")}
                        />

                        <TextareaField
                          id={messageId}
                          label="Votre message"
                          name="message"
                          required
                          value={formData.message}
                          error={errors.message}
                          placeholder="Décrivez votre projet, vos objectifs, vos délais..."
                          onChange={update("message")}
                        />

                        <AnimatePresence>
                          {status === "error" && (
                            <motion.div
                              role="alert"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              style={{
                                padding: "16px 22px",
                                borderRadius: 12,
                                background: C.errorBg,
                                border: `1px solid ${C.errorBorder}`,
                                fontFamily: BODY,
                                fontSize: 14,
                                color: C.error,
                                fontWeight: 400,
                                lineHeight: 1.7,
                              }}
                            >
                              <strong>Une erreur est survenue.</strong>{" "}
                              {liveMessage &&
                              liveMessage !== "Une erreur est survenue."
                                ? liveMessage
                                : "Veuillez réessayer ou nous contacter directement."}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.button
                          type="submit"
                          disabled={isSubmitDisabled}
                          aria-disabled={isSubmitDisabled}
                          whileHover={
                            !isSubmitDisabled && !reduceMotion
                              ? { y: -2, backgroundColor: "#000", color: "#fff" }
                              : undefined
                          }
                          whileTap={
                            !isSubmitDisabled && !reduceMotion
                              ? { scale: 0.98 }
                              : undefined
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            alignSelf: "flex-start",
                            gap: 12,
                            padding: "18px 42px",
                            background: "transparent",
                            color: isSubmitDisabled
                              ? "rgba(0,0,0,0.25)"
                              : "#000000",
                            fontFamily: DISPLAY,
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: 4,
                            textTransform: "uppercase",
                            border: `1px solid ${
                              isSubmitDisabled
                                ? "rgba(0,0,0,0.12)"
                                : "#000000"
                            }`,
                            borderRadius: 100,
                            cursor: isSubmitDisabled ? "not-allowed" : "pointer",
                            transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                            opacity: status === "sending" ? 0.58 : 1,
                          }}
                        >
                          {status === "sending" ? "Envoi en cours..." : "Envoyer"}
                          <svg
                            aria-hidden="true"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </motion.button>
                      </div>
                    </form>
                  </section>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <aside
                className="just-contact-sticky"
                aria-label="Informations de contact"
                style={{
                  position: "sticky",
                  top: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: 40,
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    borderRadius: 16,
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <motion.div
                    aria-hidden="true"
                    animate={
                      reduceMotion
                        ? undefined
                        : { scale: [1, 1.3, 1], opacity: [0.45, 1, 0.45] }
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: C.success,
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontFamily: BODY,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#000000",
                    }}
                  >
                    Réponse sous 24h
                  </p>
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        className="jc-section-pad"
        aria-label="Manifeste"
        style={{
          padding: "80px 72px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Reveal>
          <div style={{ maxWidth: 800, textAlign: "center" }}>
            <blockquote
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(24px, 3.5vw, 42px)",
                fontWeight: 300,
                lineHeight: 1.45,
                color: "#000000",
                margin: 0,
                letterSpacing: -1,
                fontStyle: "italic",
              }}
            >
              &quot;Chaque projet commence par une conversation. La vôtre commence ici.&quot;
            </blockquote>

            <motion.div
              aria-hidden="true"
              initial={reduceMotion ? false : { width: 0 }}
              whileInView={reduceMotion ? undefined : { width: 60 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
              style={{
                height: 2,
                background: "rgba(0,0,0,0.15)",
                margin: "36px auto 0",
              }}
            />
          </div>
        </Reveal>
      </section>
    </div>
  )
}