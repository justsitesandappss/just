"use client"

import { useEffect, useMemo, useRef, useState, useCallback, useId } from "react"
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const NUMERIC = "'Satoshi', 'Inter', 'Segoe UI', Arial, sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const WEB3FORMS_ACCESS_KEY = "b891692e-8148-4785-856a-e1c43f4816dc"

const COLORS = {
  bg: "#000000",
  panel: "#080808",
  panelSoft: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#ffffff",
  textSoft: "rgba(255,255,255,0.82)",
  textMuted: "rgba(255,255,255,0.70)",
  textLow: "rgba(255,255,255,0.60)",
  textFaint: "rgba(255,255,255,0.42)",
  accent: "#ff6b4a",
  accentSoft: "rgba(255,107,74,0.18)",
  focus: "#ffffff",
  error: "#ef4444",
  errorBg: "rgba(239,68,68,0.08)",
  errorBorder: "rgba(239,68,68,0.24)",
  success: "#22c55e",
  surface: "rgba(255,255,255,0.03)",
} as const

const OP = {
  label: 0.55,
  tag: 0.58,
  desc: 0.6,
  heroDesc: 0.62,
  caption: 0.62,
  entityDesc: 0.65,
  quote: 0.75,
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

function safeImageSrc(value: unknown): string {
  const src = sanitizeText(value)
  if (!src) return ""
  if (/^\s*javascript:/i.test(src)) return ""
  return src
}

function parseCountValue(raw: string): { numeric: number; suffix: string } {
  const value = sanitizeText(raw)
  const numeric = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0
  const suffix = value.replace(/[0-9]/g, "")
  return { numeric, suffix }
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

// ═════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

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

function Marquee({ items, speed = 35 }: { items: string[]; speed?: number }) {
  const reducedMotion = useReducedMotion()
  const visibleItems = items.map(sanitizeText).filter(Boolean)
  const tripled = [...visibleItems, ...visibleItems, ...visibleItems]

  if (visibleItems.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Mots-clés"
      style={{
        overflow: "hidden",
        width: "100%",
        minWidth: 0,
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <motion.div
        aria-hidden="true"
        animate={reducedMotion ? { x: "0%" } : { x: ["0%", "-33.333%"] }}
        transition={reducedMotion ? { duration: 0 } : { duration: speed, repeat: Infinity, ease: "linear" }}
        style={{
          display: "flex",
          gap: 40,
          width: "max-content",
          alignItems: "center",
          minWidth: 0,
        }}
      >
        {tripled.map((item, i) => (
          <React.Fragment key={`${item}-${i}`}>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(34px, 7vw, 72px)",
                fontWeight: 800,
                color: "rgba(255,255,255,0.08)",
                letterSpacing: -2,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {item}
            </span>
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.14)",
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

function Counter({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true })
  const reducedMotion = useReducedMotion()
  const { numeric, suffix } = useMemo(() => parseCountValue(value), [value])
  const [count, setCount] = useState(reducedMotion ? numeric : 0)

  useEffect(() => {
    if (!inView) return
    if (reducedMotion) {
      setCount(numeric)
      return
    }
    const timer = window.setTimeout(() => {
      const duration = 2200
      const start = performance.now()
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        setCount(Math.floor(eased * numeric))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }, delay * 1000)
    return () => window.clearTimeout(timer)
  }, [delay, inView, numeric, reducedMotion])

  return (
    <div
      ref={ref}
      style={{ textAlign: "center", width: "100%", minWidth: 0 }}
      aria-label={`${sanitizeText(label)} : ${sanitizeText(value)}`}
    >
      <p
        style={{
          fontFamily: NUMERIC,
          fontWeight: 900,
          fontSize: "clamp(34px, 6vw, 64px)",
          color: COLORS.text,
          lineHeight: 0.95,
          margin: "0 0 10px 0",
          letterSpacing: -2,
          fontVariantNumeric: "tabular-nums lining-nums",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        <span aria-hidden="true">
          {inView || reducedMotion ? count : 0}
          {suffix}
        </span>
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: COLORS.textMuted,
          fontWeight: 600,
          letterSpacing: 3,
          textTransform: "uppercase",
          fontFamily: BODY,
          lineHeight: 1.5,
          overflowWrap: "anywhere",
        }}
      >
        {label}
      </p>
    </div>
  )
}

function PlatformIcon({ platform, size = 14 }: { platform: string; size?: number }) {
  const p = sanitizeText(platform).toLowerCase()
  const color = "currentColor"

  if (p === "instagram")
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none" />
      </svg>
    )
  if (p === "tiktok")
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    )
  if (p === "youtube")
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    )
  if (p === "snapchat")
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M12 2C8 2 6 5 6 8v2c-1 0-2 .5-2 1s1 1 2 1c-.5 2-2 3-4 4 0 .5.5 1 2 1 0 .5 0 1 .5 1.5S6 19 8 19.5c0 1 .5 2.5 4 2.5s4-1.5 4-2.5c2-.5 3-1 3.5-1.5s.5-1 .5-1.5c1.5 0 2-.5 2-1-2-1-3.5-2-4-4 1 0 2-.5 2-1s-1-1-2-1V8c0-3-2-6-6-6z" />
      </svg>
    )
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M2 12h20" />
    </svg>
  )
}

type Talent = {
  imageUrl: string
  name: string
  handle: string
  categories: string[]
  followers: { platform: string; count: string }[]
  views: string
  bio: string
  number: string
  link: string
}

function TalentCard({ talent, delay = 0 }: { talent: Talent; delay?: number }) {
  const ref = useRef<HTMLElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const [hovered, setHovered] = useState(false)
  const reducedMotion = useReducedMotion()
  const titleId = useId()
  const descId = useId()

  const safeName = sanitizeText(talent.name) || "Talent"
  const safeHandle = sanitizeText(talent.handle)
  const safeBio = sanitizeText(talent.bio)
  const safeViews = sanitizeText(talent.views)
  const safeNumber = sanitizeText(talent.number)
  const safeImage = safeImageSrc(talent.imageUrl)
  const hasLink = Boolean(talent.link)

  return (
    <motion.article
      ref={ref}
      initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.7, delay, ease: EASE }}
      aria-labelledby={titleId}
      aria-describedby={safeBio ? descId : undefined}
      style={{
        borderRadius: 24,
        overflow: "hidden",
        position: "relative",
        background: COLORS.panel,
        border: `1px solid ${hovered && hasLink ? COLORS.borderStrong : COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        transition: reducedMotion ? "none" : "border-color 0.3s ease",
        minHeight: "100%",
        width: "100%",
        minWidth: 0,
        justifySelf: "stretch",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hasLink && (
        <a
          href={talent.link}
          aria-label={`Voir le profil de ${safeName}`}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            borderRadius: "inherit",
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          overflow: "hidden",
          background: COLORS.panel,
          width: "100%",
          minWidth: 0,
        }}
      >
        <motion.div
          animate={reducedMotion ? { scale: 1.01 } : { scale: hovered ? 1.04 : 1.01 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.6, ease: EASE }}
          style={{ width: "100%", height: "100%", transformOrigin: "center center" }}
        >
          {safeImage ? (
            <img
              src={safeImage}
              alt={`Portrait de ${safeName}`}
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
            />
          ) : (
            <div
              role="img"
              aria-label={`Illustration indisponible pour ${safeName}`}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                color: COLORS.textLow,
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 18,
                textTransform: "uppercase",
                letterSpacing: 1,
                textAlign: "center",
                padding: 20,
              }}
            >
              Image indisponible
            </div>
          )}
        </motion.div>

        {safeNumber && (
          <p
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 16,
              left: 18,
              margin: 0,
              fontFamily: DISPLAY,
              fontSize: 28,
              fontWeight: 800,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: -1,
              zIndex: 3,
              lineHeight: 1,
            }}
          >
            {safeNumber}
          </p>
        )}

        {safeViews && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 3,
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 12px",
              borderRadius: 100,
              background: "rgba(0,0,0,0.66)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              maxWidth: "calc(100% - 32px)",
            }}
            aria-label={`${safeViews} vues`}
          >
            <span aria-hidden="true" style={{ fontSize: 11 }}>🔥</span>
            <span
              style={{
                fontFamily: BODY,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: COLORS.accent,
                whiteSpace: "nowrap",
              }}
            >
              {safeViews} vues
            </span>
          </div>
        )}

        {hasLink && (
          <motion.div
            aria-hidden="true"
            animate={reducedMotion ? { opacity: 1 } : { opacity: hovered ? 1 : 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 4,
              pointerEvents: "none",
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.18)",
                maxWidth: "100%",
              }}
            >
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: COLORS.text,
                  whiteSpace: "nowrap",
                }}
              >
                Voir le profil
              </span>
              <svg
                aria-hidden="true"
                focusable="false"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: COLORS.text, flexShrink: 0 }}
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </motion.div>
        )}
      </div>

      <div
        style={{
          padding: "20px 22px 28px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          position: "relative",
          background: COLORS.panel,
          zIndex: 3,
          width: "100%",
          minWidth: 0,
        }}
      >
        <header style={{ minWidth: 0 }}>
          <h3
            id={titleId}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 20,
              color: COLORS.text,
              letterSpacing: -0.5,
              lineHeight: 1.1,
              textTransform: "uppercase",
              margin: "0 0 4px 0",
              overflowWrap: "anywhere",
            }}
          >
            {safeName}
          </h3>
          {safeHandle && (
            <p
              style={{
                fontFamily: BODY,
                fontSize: 12,
                color: COLORS.textMuted,
                fontWeight: 400,
                margin: 0,
                overflowWrap: "anywhere",
              }}
            >
              {safeHandle}
            </p>
          )}
        </header>

        {talent.categories.length > 0 && (
          <ul
            aria-label={`Catégories de ${safeName}`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              listStyle: "none",
              margin: 0,
              padding: 0,
              minWidth: 0,
            }}
          >
            {talent.categories.map((cat, i) => (
              <li
                key={`${cat}-${i}`}
                style={{
                  fontFamily: BODY,
                  fontSize: 11,
                  fontWeight: 500,
                  color: COLORS.accent,
                  letterSpacing: 0.3,
                  overflowWrap: "anywhere",
                }}
              >
                {cat}
              </li>
            ))}
          </ul>
        )}

        {talent.followers.length > 0 && (
          <ul
            aria-label={`Plateformes et audiences de ${safeName}`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              listStyle: "none",
              margin: 0,
              padding: 0,
              minWidth: 0,
            }}
          >
            {talent.followers.map((f, i) => {
              const platform = sanitizeText(f.platform) || "Plateforme"
              const count = sanitizeText(f.count) || "N/A"
              return (
                <li key={`${platform}-${count}-${i}`} style={{ minWidth: 0, maxWidth: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: COLORS.textSoft,
                      minWidth: 0,
                      maxWidth: "100%",
                    }}
                  >
                    <PlatformIcon platform={platform} size={12} />
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: 11,
                        fontWeight: 700,
                        color: COLORS.text,
                        letterSpacing: 0.3,
                        minWidth: 0,
                        overflowWrap: "anywhere",
                      }}
                    >
                      <span style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}>
                        {platform}{" "}
                      </span>
                      {count}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {safeBio && (
          <p
            id={descId}
            style={{
              fontFamily: BODY,
              fontSize: 13,
              lineHeight: 1.7,
              color: COLORS.textMuted,
              fontWeight: 300,
              margin: 0,
              marginTop: "auto",
              overflowWrap: "anywhere",
            }}
          >
            {safeBio}
          </p>
        )}

        {hasLink && (
          <div
            aria-hidden="true"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
              opacity: hovered ? 1 : 0.72,
              transform: reducedMotion || !hovered ? "translateX(0)" : "translateX(4px)",
              transition: reducedMotion ? "none" : "transform 0.3s ease, opacity 0.3s ease",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: BODY,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: COLORS.textLow,
              }}
            >
              Découvrir
            </span>
            <svg
              aria-hidden="true"
              focusable="false"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: COLORS.textLow, flexShrink: 0 }}
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </motion.article>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileHover={reducedMotion ? undefined : { scale: 1.04 }}
      whileTap={reducedMotion ? undefined : { scale: 0.97 }}
      animate={{
        background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)",
        borderColor: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
        color: active ? COLORS.text : COLORS.textMuted,
      }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
      style={{
        padding: "10px 20px",
        borderRadius: 100,
        border: "1px solid",
        fontFamily: BODY,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 2,
        textTransform: "uppercase",
        cursor: "pointer",
        boxShadow: "none",
        backgroundClip: "padding-box",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {label}
    </motion.button>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// CONTACT FORM COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

type ContactStatus = "idle" | "sending" | "success" | "error"
type ContactFormData = { name: string; email: string; phone: string; company: string; entity: string; message: string }
type ContactErrors = Partial<Record<keyof ContactFormData, string>>

function ContactInputField({
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
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  placeholder?: string
  required?: boolean
  value: string
  error?: string
  hint?: string
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <motion.label
        htmlFor={id}
        animate={{
          top: active ? 6 : 24,
          fontSize: active ? 11 : 15,
          color: error ? COLORS.error : COLORS.text,
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
        {required && <span aria-hidden="true"> *</span>}
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
        placeholder={focused ? placeholder : ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${error ? COLORS.error : focused ? COLORS.text : COLORS.border}`,
          padding: "30px 0 16px",
          fontFamily: BODY,
          fontSize: 17,
          fontWeight: 400,
          color: COLORS.text,
          outline: "none",
          transition: "border-color 0.25s ease",
          letterSpacing: 0.2,
        }}
      />

      {hint && (
        <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 12, color: COLORS.textMuted }}>
          {hint}
        </p>
      )}

      {error && (
        <p role="alert" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 13, color: COLORS.error }}>
          {error}
        </p>
      )}
    </div>
  )
}

function ContactTextareaField({
  id,
  label,
  name,
  placeholder,
  required = false,
  value,
  error,
  onChange,
}: {
  id: string
  label: string
  name: string
  placeholder?: string
  required?: boolean
  value: string
  error?: string
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div style={{ position: "relative", minWidth: 0 }}>
      <motion.label
        htmlFor={id}
        animate={{
          top: active ? 6 : 24,
          fontSize: active ? 11 : 15,
          color: error ? COLORS.error : COLORS.text,
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
        {required && <span aria-hidden="true"> *</span>}
      </motion.label>

      <textarea
        id={id}
        name={name}
        value={value}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        placeholder={focused ? placeholder : ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={5}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${error ? COLORS.error : focused ? COLORS.text : COLORS.border}`,
          padding: "30px 0 16px",
          fontFamily: BODY,
          fontSize: 17,
          fontWeight: 400,
          color: COLORS.text,
          outline: "none",
          resize: "vertical",
          minHeight: 130,
          transition: "border-color 0.25s ease",
          letterSpacing: 0.2,
        }}
      />

      {error && (
        <p role="alert" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 13, color: COLORS.error }}>
          {error}
        </p>
      )}
    </div>
  )
}

function ContactPillSelect({
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
  const reducedMotion = useReducedMotion()

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
          color: COLORS.text,
          marginBottom: 18,
        }}
      >
        {label}
      </legend>

      <div role="group" aria-labelledby={groupId} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((opt) => {
          const isActive = value === opt
          return (
            <motion.button
              key={opt}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(isActive ? "" : opt)}
              whileHover={reducedMotion ? undefined : { scale: 1.02 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              animate={{
                background: isActive ? "#ffffff" : "transparent",
                borderColor: isActive ? "#ffffff" : "rgba(255,255,255,0.18)",
                color: isActive ? "#000000" : "#ffffff",
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

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function NosTalentsPage() {
  const bp = useResponsive()
  const reducedMotion = useReducedMotion()
  const resultCountId = useId()
  
  const isMobile = bp === "mobile"
  const isTablet = bp === "tablet"

  // ── Talents data ──
  const talents: Talent[] = useMemo(() => [
    {
      name: "Karim Lipton",
      handle: "@karimlipton94",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80&auto=format&fit=crop",
      categories: ["Humour", "Voyage", "Lifestyle"],
      followers: [
        { platform: "Instagram", count: "1.4M" },
        { platform: "TikTok", count: "650.7K" },
        { platform: "YouTube", count: "100K" },
      ],
      views: "7.4M",
      bio: "Créateur dynamique et authentique, reconnu pour son sens du divertissement.",
      number: "01",
      link: "/talents/karim-lipton",
    },
    {
      name: "Riles Freestyle",
      handle: "@rilesfreestyle",
      imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80&auto=format&fit=crop",
      categories: ["Foot", "Journalisme", "Lifestyle"],
      followers: [
        { platform: "Instagram", count: "200.9K" },
        { platform: "TikTok", count: "1.3M" },
        { platform: "YouTube", count: "61.9K" },
      ],
      views: "139.1M",
      bio: "Pro du foot freestyle. Partenaire PSG, Canal+ et SNCF.",
      number: "02",
      link: "/talents/riles-freestyle",
    },
    {
      name: "Moumlame",
      handle: "@moumlame59",
      imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&q=80&auto=format&fit=crop",
      categories: ["Musique", "Lifestyle"],
      followers: [
        { platform: "Instagram", count: "604.8K" },
        { platform: "TikTok", count: "732.7K" },
        { platform: "Snapchat", count: "19K" },
        { platform: "YouTube", count: "12.9K" },
      ],
      views: "7.9M",
      bio: "Figure de la Team Nasdas. Spontanéité et authenticité de la nouvelle scène digitale.",
      number: "03",
      link: "/talents/moumlame",
    },
    {
      name: "Romain Benn",
      handle: "@romain.benn",
      imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80&auto=format&fit=crop",
      categories: ["Fitness", "Lifestyle"],
      followers: [
        { platform: "Instagram", count: "144.2K" },
        { platform: "TikTok", count: "703.1K" },
        { platform: "YouTube", count: "185K" },
      ],
      views: "4.3M",
      bio: "Vainqueur The Circle France. Ambassadeur Lifestyle & Fitness.",
      number: "04",
      link: "/talents/romain-benn",
    },
    {
      name: "Kimo DJZ",
      handle: "@kimo_djz",
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80&auto=format&fit=crop",
      categories: ["Voyage", "Caméras Cachées", "Lifestyle"],
      followers: [
        { platform: "Instagram", count: "170.8K" },
        { platform: "TikTok", count: "86.3K" },
        { platform: "YouTube", count: "22.7K" },
      ],
      views: "3.1M",
      bio: "Bac+6 en marketing digital. Caméras cachées, voyage et actions humanitaires.",
      number: "05",
      link: "/talents/kimo-djz",
    },
    {
      name: "Inès HMZ",
      handle: "@ines_hmz04",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80&auto=format&fit=crop",
      categories: ["Voyage", "Lifestyle"],
      followers: [
        { platform: "Instagram", count: "160K" },
        { platform: "TikTok", count: "34.6K" },
        { platform: "YouTube", count: "14.6K" },
      ],
      views: "4.2M",
      bio: "Figure montante du lifestyle et du voyage.",
      number: "06",
      link: "/talents/ines-hmz",
    },
    {
      name: "Naoil Kohlanta",
      handle: "@naoil_kohlanta2k20",
      imageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80&auto=format&fit=crop",
      categories: ["Voyage", "Boxe", "Lifestyle"],
      followers: [
        { platform: "Instagram", count: "1.7K" },
        { platform: "TikTok", count: "95.5K" },
        { platform: "YouTube", count: "82.8K" },
      ],
      views: "1.6M",
      bio: "Gagnante Koh-Lanta. Ancienne boxeuse pro, inspiration quotidienne.",
      number: "07",
      link: "/talents/naoil-kohlanta",
    },
    {
      name: "D.Chinois 93",
      handle: "@d.chinois93",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=900&q=80&auto=format&fit=crop",
      categories: ["Humour", "Lifestyle"],
      followers: [
        { platform: "Instagram", count: "150K" },
        { platform: "TikTok", count: "3.1K" },
      ],
      views: "79.5K",
      bio: "Humour spontané et style direct qui résonne avec une audience jeune.",
      number: "08",
      link: "/talents/d-chinois-93",
    },
    {
      name: "Just Mini",
      handle: "@justminioff",
      imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80&auto=format&fit=crop",
      categories: ["Boxe", "Lifestyle"],
      followers: [
        { platform: "Instagram", count: "40K" },
        { platform: "TikTok", count: "19.4K" },
        { platform: "YouTube", count: "38.7K" },
      ],
      views: "3.2M",
      bio: "Créateur dynamique et boxeur engagé. Performance sportive et authenticité.",
      number: "09",
      link: "/talents/just-mini",
    },
  ], [])

  const allCats = useMemo(() => Array.from(new Set(talents.flatMap((t) => t.categories))), [talents])
  const filterOptions = useMemo(() => ["Tous", ...allCats], [allCats])
  const [activeFilter, setActiveFilter] = useState("Tous")

  const filteredTalents = useMemo(() => {
    if (activeFilter === "Tous") return talents
    return talents.filter((talent) => talent.categories.includes(activeFilter))
  }, [activeFilter, talents])

  // ── Contact form state ──
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    company: "",
    entity: "",
    message: "",
  })
  const [errors, setErrors] = useState<ContactErrors>({})
  const [status, setStatus] = useState<ContactStatus>("idle")
  const [liveMessage, setLiveMessage] = useState("")

  const entityList = ["Just Impact", "Just Prod", "Just Agency", "Just 4 You"]

  const nameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const companyId = useId()
  const messageId = useId()
  const successTitleId = useId()

  const updateField = useCallback(
    (field: keyof ContactFormData) => (value: string) => {
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

  const validateForm = useCallback(() => {
    const e: ContactErrors = {}
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
    setFormData({ name: "", email: "", phone: "", company: "", entity: "", message: "" })
    setErrors({})
    setStatus("idle")
    setLiveMessage("")
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const nextErrors = validateForm()
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        setStatus("error")
        setLiveMessage("Le formulaire contient des erreurs.")
        return
      }
      setStatus("sending")
      setLiveMessage("Envoi du formulaire en cours.")
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
    [formData, validateForm]
  )

  const isSubmitDisabled =
    status === "sending" ||
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.message.trim()

  const sectionPadding = isMobile ? "60px 20px" : isTablet ? "80px 40px" : "100px 72px"

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        background: COLORS.bg,
        color: COLORS.textSoft,
        fontFamily: BODY,
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@300;400;500;600;700;800&family=Outfit:wght@200;300;400;500;600;700&family=Satoshi:wght@700;800;900&display=swap');
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.28); }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #000 inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff !important;
        }
        a:focus-visible, button:focus-visible {
          outline: 2px solid ${COLORS.focus};
          outline-offset: 3px;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.14);
        }
      `}</style>

      <main
        id="main-content"
        aria-label="Présentation des talents"
        style={{ width: "100%", minWidth: 0 }}
      >
        {/* HERO */}
        <section
          aria-labelledby="main-title"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: sectionPadding,
            position: "relative",
            width: "100%",
            minWidth: 0,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              pointerEvents: "none",
            }}
          />

          <motion.p
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 1, delay: 0.2, ease: EASE }}
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: COLORS.textMuted,
              margin: "0 0 48px 0",
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "relative",
              zIndex: 1,
              lineHeight: 1.5,
            }}
          >
            <motion.span
              aria-hidden="true"
              animate={reducedMotion ? { scale: 1, opacity: 0.65 } : { scale: [1, 1.5, 1], opacity: [0.35, 0.85, 0.35] }}
              transition={reducedMotion ? { duration: 0 } : { duration: 2.5, repeat: Infinity }}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: COLORS.text,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            Influence · Créativité · Authenticité · Résultats
          </motion.p>

          <div
            style={{
              width: "100%",
              maxWidth: 1100,
              position: "relative",
              zIndex: 1,
              minWidth: 0,
            }}
          >
            <motion.h1
              id="main-title"
              initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 1, delay: 0.4, ease: EASE }}
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: "clamp(44px, 9vw, 130px)",
                lineHeight: 0.95,
                color: COLORS.text,
                margin: 0,
                letterSpacing: -4,
                width: "100%",
                minWidth: 0,
              }}
            >
              <span style={{ display: "block" }}>Nos talents</span>
              <span
                style={{
                  display: "block",
                  fontWeight: 300,
                  color: "rgba(255,255,255,0.30)",
                  fontStyle: "italic",
                }}
              >
                font la différence.
              </span>
            </motion.h1>
          </div>

          <motion.p
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 0.8, ease: EASE }}
            style={{
              marginTop: 40,
              marginBottom: 0,
              fontSize: 16,
              lineHeight: 1.9,
              maxWidth: 560,
              color: COLORS.textMuted,
              fontWeight: 300,
              position: "relative",
              zIndex: 1,
              overflowWrap: "anywhere",
            }}
          >
            Un réseau de créateurs triés sur le volet, alignés avec vos valeurs. Des voix authentiques, des communautés engagées, des résultats mesurables, c'est la force de Just Impact.
          </motion.p>

          <motion.div
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.8, delay: 1.2, ease: EASE }}
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 40,
              left: isMobile ? 20 : isTablet ? 40 : 72,
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <motion.div
              animate={reducedMotion ? { y: 0 } : { y: [0, 8, 0] }}
              transition={reducedMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 1,
                height: 40,
                background: "linear-gradient(to bottom, rgba(255,255,255,0.42), transparent)",
              }}
            />
            <span
              style={{
                fontSize: 10,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: COLORS.textLow,
                fontWeight: 600,
              }}
            >
              Scroll
            </span>
          </motion.div>
        </section>

        {/* MARQUEE 1 */}
        <Marquee
          items={["Influenceurs", "Artistes", "Créateurs", "Talents", "Authenticité", "Engagement", "Impact", "Communauté"]}
          speed={40}
        />

        {/* STATS */}
        <section
          aria-labelledby="stats-title"
          style={{ padding: sectionPadding, position: "relative" }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <Reveal>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <h2
                id="stats-title"
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
                Chiffres clés
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "minmax(0,1fr)" : isTablet ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))",
                  gap: isMobile ? 24 : 48,
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <Counter value="9+" label="Créateurs & Artistes" delay={0} />
                <Counter value="50M+" label="Reach cumulé" delay={0.1} />
                <Counter value="4.8%" label="Engagement moyen" delay={0.2} />
                <Counter value="200+" label="Campagnes activées" delay={0.3} />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ROSTER / CARDS */}
        <section
          aria-labelledby="roster-title"
          style={{ padding: isMobile ? "40px 20px 80px" : isTablet ? "40px 40px 80px" : "40px 72px 100px" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                  color: COLORS.textLow,
                  margin: "0 0 14px 0",
                }}
              >
                Notre roster
              </p>
              <h2
                id="roster-title"
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: "clamp(34px, 4.5vw, 58px)",
                  color: COLORS.text,
                  lineHeight: 1,
                  letterSpacing: -3,
                  margin: "0 0 36px 0",
                  overflowWrap: "anywhere",
                }}
              >
                Nos influenceurs{" "}
                <span style={{ color: "rgba(255,255,255,0.30)" }}>& artistes.</span>
              </h2>
            </Reveal>

            <Reveal delay={0.05}>
              <div
                role="group"
                aria-label="Filtres des talents"
                aria-describedby={resultCountId}
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 48,
                  width: "100%",
                  minWidth: 0,
                }}
              >
                {filterOptions.map((cat) => (
                  <FilterPill
                    key={cat}
                    label={cat}
                    active={activeFilter === cat}
                    onClick={() => setActiveFilter(cat)}
                  />
                ))}
              </div>
            </Reveal>

            <p
              id={resultCountId}
              aria-live="polite"
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
              {filteredTalents.length} talent{filteredTalents.length > 1 ? "s" : ""} affiché
              {filteredTalents.length > 1 ? "s" : ""} pour le filtre {activeFilter}.
            </p>

            <motion.div
              layout={!reducedMotion}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "minmax(0,1fr)" : isTablet ? "repeat(2,minmax(0,1fr))" : "repeat(3,minmax(0,1fr))",
                gap: 16,
                width: "100%",
                minWidth: 0,
                alignItems: "stretch",
              }}
            >
              <AnimatePresence mode="popLayout">
                {filteredTalents.map((talent, index) => (
                  <motion.div
                    key={`${talent.name}-${talent.number}-${activeFilter}`}
                    layout={!reducedMotion}
                    initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: EASE }}
                    style={{
                      width: "100%",
                      minWidth: 0,
                      display: "flex",
                    }}
                  >
                    <TalentCard talent={talent} delay={index * 0.04} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* WHY */}
        <section
          aria-labelledby="why-title"
          style={{ padding: isMobile ? "60px 20px" : isTablet ? "60px 40px" : "80px 72px" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Reveal>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                  color: COLORS.textLow,
                  margin: "0 0 14px 0",
                }}
              >
                Pourquoi nos talents
              </p>
              <h2
                id="why-title"
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: "clamp(34px, 4.5vw, 58px)",
                  color: COLORS.text,
                  lineHeight: 1,
                  letterSpacing: -3,
                  margin: "0 0 48px 0",
                  overflowWrap: "anywhere",
                }}
              >
                Ce qui les rend{" "}
                <span style={{ color: "rgba(255,255,255,0.30)" }}>uniques.</span>
              </h2>
            </Reveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "minmax(0,1fr)" : isTablet ? "repeat(2,minmax(0,1fr))" : "repeat(3,minmax(0,1fr))",
                gap: 12,
                width: "100%",
                minWidth: 0,
                alignItems: "stretch",
              }}
            >
              {[
                {
                  n: "01",
                  t: "Audiences vérifiées",
                  d: "Chaque créateur est audité : vrais followers, vrais engagements. Zéro bot, zéro fake.",
                },
                {
                  n: "02",
                  t: "Alignement de marque",
                  d: "On associe les talents aux marques qui leur ressemblent. Pas de forcing, seulement de l'authenticité.",
                },
                {
                  n: "03",
                  t: "Résultats mesurables",
                  d: "KPIs clairs, reporting en temps réel, ROI traçable.",
                },
                {
                  n: "04",
                  t: "Exclusivité sectorielle",
                  d: "Nos talents s'engagent sur des exclusivités par secteur pour protéger votre partenariat.",
                },
                {
                  n: "05",
                  t: "Production intégrée",
                  d: "Grâce à Just Prod, nous produisons du contenu premium directement avec nos talents.",
                },
                {
                  n: "06",
                  t: "Management 360°",
                  d: "Négociation, planning, brief créatif, validation, nous gérons la relation talent de A à Z.",
                },
              ].map((item, index) => (
                <Reveal key={item.n} delay={index * 0.04}>
                  <article
                    style={{
                      background: "rgba(255,255,255,0.015)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 20,
                      padding: "40px 28px",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: "100%",
                      width: "100%",
                      minWidth: 0,
                    }}
                  >
                    <p
                      aria-hidden="true"
                      style={{
                        margin: 0,
                        fontFamily: DISPLAY,
                        fontSize: 64,
                        fontWeight: 800,
                        color: "rgba(255,255,255,0.05)",
                        lineHeight: 1,
                        letterSpacing: -3,
                        position: "absolute",
                        top: -4,
                        right: 16,
                      }}
                    >
                      {item.n}
                    </p>
                    <h3
                      style={{
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: 18,
                        color: COLORS.text,
                        letterSpacing: -0.5,
                        margin: "0 0 10px 0",
                        lineHeight: 1.2,
                        position: "relative",
                        zIndex: 1,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.t}
                    </h3>
                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: 14,
                        lineHeight: 1.8,
                        color: COLORS.textMuted,
                        fontWeight: 300,
                        margin: 0,
                        position: "relative",
                        zIndex: 1,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.d}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* MARQUEE 2 */}
        <Marquee
          items={["Humour", "Sport", "Musique", "Fitness", "Voyage", "Lifestyle", "Boxe", "Foot"]}
          speed={30}
        />

        {/* CONTACT FORM SECTION */}
        <section
          aria-label="Formulaire de contact"
          style={{
            padding: isMobile ? "80px 20px 100px" : isTablet ? "100px 40px 120px" : "110px 72px 140px",
            borderTop: `1px solid ${white(0.06)}`,
            position: "relative",
          }}
        >
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

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at center top,rgba(255,255,255,0.03) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 1320,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Reveal>
              <div style={{ marginBottom: isMobile ? 48 : 72 }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 6,
                    textTransform: "uppercase",
                    color: white(OP.tag),
                    margin: "0 0 28px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <motion.span
                    aria-hidden="true"
                    animate={
                      reducedMotion
                        ? undefined
                        : {
                            scale: [1, 1.45, 1],
                            opacity: [0.35, 0.85, 0.35],
                          }
                    }
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                    }}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#ffffff",
                      display: "inline-block",
                    }}
                  />
                  Formulaire de contact
                </p>

                <h2
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: isMobile ? "clamp(40px, 12vw, 58px)" : "clamp(56px, 8vw, 110px)",
                    lineHeight: 0.92,
                    color: "#ffffff",
                    margin: 0,
                    letterSpacing: isMobile ? -2 : -5,
                  }}
                >
                  <span style={{ display: "block" }}>Parlons</span>
                  <span
                    style={{
                      display: "block",
                      fontWeight: 300,
                      fontStyle: "italic",
                      color: white(0.88),
                      letterSpacing: isMobile ? -1 : -3,
                    }}
                  >
                    de votre projet.
                  </span>
                </h2>

                <p
                  style={{
                    marginTop: 28,
                    fontSize: 16,
                    lineHeight: 1.9,
                    maxWidth: 620,
                    color: white(OP.heroDesc),
                    fontWeight: 300,
                  }}
                >
                  Influence, production, conciergerie ou média, quelle que soit votre ambition, on a l'entité et l'expertise qu'il vous faut. Remplissez le formulaire, on revient vers vous sous 24h.
                </p>
              </div>
            </Reveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(280px,0.42fr)",
                gap: isMobile ? 56 : 88,
                alignItems: "start",
              }}
            >
              <Reveal>
                <div>
                  {status === "success" ? (
                    <motion.section
                      aria-labelledby={successTitleId}
                      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: EASE }}
                      style={{
                        textAlign: "center",
                        padding: isMobile ? "56px 24px" : "80px 40px",
                        background: COLORS.surface,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: 24,
                      }}
                    >
                      <motion.div
                        initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }}
                        animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }}
                        transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          border: "2px solid #ffffff",
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
                          stroke="#ffffff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </motion.div>

                      <h3
                        id={successTitleId}
                        style={{
                          fontFamily: DISPLAY,
                          fontWeight: 800,
                          fontSize: 34,
                          color: "#ffffff",
                          letterSpacing: -2,
                          margin: "0 0 12px",
                        }}
                      >
                        Message envoyé.
                      </h3>

                      <p
                        style={{
                          fontFamily: BODY,
                          fontSize: 16,
                          color: white(OP.desc),
                          fontWeight: 300,
                          lineHeight: 1.8,
                          maxWidth: 420,
                          margin: "0 auto",
                        }}
                      >
                        Merci pour votre intérêt. Notre équipe revient vers vous sous 24h.
                      </p>

                      <motion.button
                        type="button"
                        onClick={resetForm}
                        whileHover={reducedMotion ? undefined : { opacity: 0.85 }}
                        style={{
                          marginTop: 36,
                          padding: "14px 30px",
                          borderRadius: 100,
                          border: "1px solid #ffffff",
                          background: "transparent",
                          color: "#ffffff",
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
                          color: white(OP.tag),
                          margin: "0 0 14px",
                        }}
                      >
                        Formulaire
                      </p>

                      <h3
                        style={{
                          fontFamily: DISPLAY,
                          fontWeight: 800,
                          fontSize: "clamp(32px, 4vw, 48px)",
                          color: "#ffffff",
                          lineHeight: 1,
                          letterSpacing: -2,
                          margin: "0 0 18px",
                        }}
                      >
                        Dites-nous tout.
                      </h3>

                      <p
                        style={{
                          margin: "0 0 52px",
                          fontFamily: BODY,
                          fontSize: 15,
                          lineHeight: 1.8,
                          color: white(OP.desc),
                          maxWidth: 620,
                        }}
                      >
                        Les champs marqués d'un astérisque sont obligatoires.
                      </p>

                      <form onSubmit={handleSubmit} noValidate>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 36,
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: isMobile ? "minmax(0,1fr)" : "repeat(2,minmax(0,1fr))",
                              gap: isMobile ? 28 : 44,
                            }}
                          >
                            <ContactInputField
                              id={nameId}
                              label="Nom complet"
                              name="name"
                              required
                              autoComplete="name"
                              value={formData.name}
                              error={errors.name}
                              placeholder="Jean Dupont"
                              onChange={updateField("name")}
                            />
                            <ContactInputField
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
                              onChange={updateField("email")}
                            />
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: isMobile ? "minmax(0,1fr)" : "repeat(2,minmax(0,1fr))",
                              gap: isMobile ? 28 : 44,
                            }}
                          >
                            <ContactInputField
                              id={phoneId}
                              label="Téléphone"
                              name="phone"
                              type="tel"
                              autoComplete="tel"
                              inputMode="tel"
                              value={formData.phone}
                              placeholder="+33 6 12 34 56 78"
                              hint="Optionnel"
                              onChange={updateField("phone")}
                            />
                            <ContactInputField
                              id={companyId}
                              label="Entreprise / Marque"
                              name="company"
                              autoComplete="organization"
                              value={formData.company}
                              placeholder="Votre marque"
                              hint="Optionnel"
                              onChange={updateField("company")}
                            />
                          </div>

                          <ContactPillSelect
                            label="Entité"
                            name="entity"
                            options={entityList}
                            value={formData.entity}
                            onChange={updateField("entity")}
                          />

                          <ContactTextareaField
                            id={messageId}
                            label="Votre message"
                            name="message"
                            required
                            value={formData.message}
                            error={errors.message}
                            placeholder="Décrivez votre projet, vos objectifs, vos délais..."
                            onChange={updateField("message")}
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
                                  background: COLORS.errorBg,
                                  border: `1px solid ${COLORS.errorBorder}`,
                                  fontFamily: BODY,
                                  fontSize: 14,
                                  color: COLORS.error,
                                  fontWeight: 400,
                                  lineHeight: 1.7,
                                }}
                              >
                                <strong>Une erreur est survenue.</strong>{" "}
                                {liveMessage && liveMessage !== "Une erreur est survenue."
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
                              !isSubmitDisabled && !reducedMotion
                                ? {
                                    y: -2,
                                    backgroundColor: "#ffffff",
                                    color: "#000000",
                                  }
                                : undefined
                            }
                            whileTap={!isSubmitDisabled && !reducedMotion ? { scale: 0.98 } : undefined}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              alignSelf: "flex-start",
                              gap: 12,
                              padding: "18px 42px",
                              background: "transparent",
                              color: isSubmitDisabled ? "rgba(255,255,255,0.25)" : "#ffffff",
                              fontFamily: DISPLAY,
                              fontWeight: 700,
                              fontSize: 13,
                              letterSpacing: 4,
                              textTransform: "uppercase",
                              border: `1px solid ${isSubmitDisabled ? "rgba(255,255,255,0.12)" : "#ffffff"}`,
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
                  aria-label="Informations de contact"
                  style={{
                    position: isMobile ? "relative" : "sticky",
                    top: 100,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                  }}
                >
                  <div
                    style={{
                      padding: "20px",
                      borderRadius: 16,
                      background: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <motion.div
                      aria-hidden="true"
                      animate={
                        reducedMotion
                          ? undefined
                          : {
                              scale: [1, 1.3, 1],
                              opacity: [0.45, 1, 0.45],
                            }
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: COLORS.success,
                        flexShrink: 0,
                      }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontFamily: BODY,
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#ffffff",
                      }}
                    >
                      Réponse sous 24h
                    </p>
                  </div>

                  <div
                    style={{
                      padding: isMobile ? "24px" : "28px",
                      borderRadius: 20,
                      background: white(0.02),
                      border: `1px solid ${white(0.08)}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 6,
                        textTransform: "uppercase",
                        color: white(OP.label),
                        marginBottom: 16,
                        marginTop: 0,
                      }}
                    >
                      Note
                    </p>
                    <blockquote
                      style={{
                        margin: 0,
                        fontFamily: DISPLAY,
                        fontSize: isMobile ? 22 : 28,
                        fontWeight: 300,
                        lineHeight: 1.5,
                        color: white(OP.quote),
                        fontStyle: "italic",
                        letterSpacing: -0.8,
                      }}
                    >
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