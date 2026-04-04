"use client"

import Link from "next/link"
import Image from "next/image"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useId,
} from "react"
import type { CSSProperties, FormEvent, ReactNode, RefObject } from "react"
import {
  motion,
  useInView,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const NUMERIC = "'Inter', 'Segoe UI', Arial, sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const COLORS = {
  bg: "#000000",
  text: "rgba(255,255,255,0.96)",
  textSoft: "rgba(255,255,255,0.82)",
  textMuted: "rgba(255,255,255,0.72)",
  textSubtle: "rgba(255,255,255,0.60)",
  textGhost: "rgba(255,255,255,0.16)",
  border: "rgba(255,255,255,0.16)",
  borderSoft: "rgba(255,255,255,0.10)",
  panel: "rgba(255,255,255,0.035)",
  panelHover: "rgba(255,255,255,0.055)",
  accent: "#ffffff",
  accentSoft: "rgba(255,255,255,0.18)",
} as const

const JC = {
  text: "#ffffff",
  border: "rgba(255,255,255,0.16)",
  borderFocus: "#ffffff",
  surface: "rgba(255,255,255,0.03)",
  error: "#ef4444",
  errorBg: "rgba(239,68,68,0.08)",
  errorBorder: "rgba(239,68,68,0.24)",
  success: "#22c55e",
  placeholder: "rgba(255,255,255,0.28)",
  muted: "rgba(255,255,255,0.65)",
} as const

type ContactStatus = "idle" | "sending" | "success" | "error"

type ContactFormDataState = {
  name: string
  email: string
  phone: string
  company: string
  entity: string
  message: string
}

type ContactErrorState = Partial<Record<keyof ContactFormDataState, string>>

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function cxErrorId(id: string) {
  return `${id}-error`
}

function cxHintId(id: string) {
  return `${id}-hint`
}

function white(opacity: number) {
  return `rgba(255,255,255,${opacity})`
}

function clampNumber(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

function fluidBetween(
  width: number,
  minVp: number,
  maxVp: number,
  minV: number,
  maxV: number
) {
  if (width <= minVp) return minV
  if (width >= maxVp) return maxV
  return minV + (maxV - minV) * ((width - minVp) / (maxVp - minVp))
}

function getVisuallyHiddenStyle(): CSSProperties {
  return {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  }
}

function getExternalLinkProps(url: string) {
  const isExternal =
    /^https?:\/\//i.test(url) ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:")
  if (!isExternal) return {}
  return {
    target: "_blank" as const,
    rel: "noopener noreferrer",
  }
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

function getSectionPadding(isMobile: boolean, isTablet: boolean) {
  if (isMobile) return "72px 20px"
  if (isTablet) return "88px 36px"
  return "104px 72px"
}

function getCardRadius(isMobile: boolean) {
  return isMobile ? 16 : 22
}

type MetricMeta =
  | { kind: "range"; raw: string; start: number; end: number }
  | { kind: "text"; raw: string }
  | {
      kind: "number"
      raw: string
      value: number
      suffix: string
      hasDecimal: boolean
      decimals: number
    }

function parseMetric(value: string): MetricMeta {
  const trimmed = String(value).trim()

  if (/^\d+\s*[-–]\s*\d+$/.test(trimmed)) {
    const parts = trimmed.split(/[-–]/).map((p) => p.trim())
    return {
      kind: "range",
      raw: trimmed,
      start: parseInt(parts[0], 10) || 0,
      end: parseInt(parts[1], 10) || 0,
    }
  }

  const numericPart = trimmed.replace(/[^0-9.]/g, "")
  const num = parseFloat(numericPart)

  if (Number.isNaN(num)) {
    return { kind: "text", raw: trimmed }
  }

  const hasDecimal = numericPart.includes(".")
  const suffix = trimmed.replace(numericPart, "")

  return {
    kind: "number",
    raw: trimmed,
    value: num,
    suffix,
    hasDecimal,
    decimals: hasDecimal ? numericPart.split(".")[1]?.length || 1 : 0,
  }
}

function formatMetric(meta: MetricMeta, animatedValue: number): string {
  if (meta.kind === "range") return `${meta.start}-${meta.end}`
  if (meta.kind === "text") return meta.raw

  const rounded = meta.hasDecimal
    ? animatedValue.toFixed(meta.decimals)
    : Math.round(animatedValue).toString()

  return `${rounded}${meta.suffix}`
}

const FOOTER_NAV = [
  { label: "Just Impact", href: "/just-impact" },
  { label: "Just Prod", href: "/just-prod" },
  { label: "Just Agency", href: "/just-agency" },
  { label: "Contact", href: "/contact" },
] as const

const ICONS = {
  instagram: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" />
    </svg>
  ),
  tiktok: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.92 2.92 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.07A6.33 6.33 0 0 0 3 15.64 6.33 6.33 0 0 0 9.37 22a6.33 6.33 0 0 0 6.33-6.33V9.19a8.16 8.16 0 0 0 3.89.98V6.69Z" />
    </svg>
  ),
  linkedin: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
} as const

function useViewport(containerRef: RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 1440, height: 900 })

  useEffect(() => {
    if (typeof window === "undefined") return
    const node = containerRef.current
    if (!node) return

    let rafId: number | null = null

    const update = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)

      rafId = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect()
        setSize({
          width: Math.max(
            320,
            Math.round(rect.width || window.innerWidth || 1440)
          ),
          height: Math.max(
            1,
            Math.round(rect.height || window.innerHeight || 900)
          ),
        })
      })
    }

    update()

    let ro: ResizeObserver | null = null

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update)
      ro.observe(node)
    }

    window.addEventListener("resize", update)

    return () => {
      window.removeEventListener("resize", update)
      ro?.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [containerRef])

  return useMemo(
    () => ({
      width: size.width,
      height: size.height,
      isMobile: size.width <= 767,
      isTablet: size.width > 767 && size.width <= 1024,
      isDesktop: size.width > 1024,
    }),
    [size]
  )
}

function SectionIntro({
  eyebrow,
  title,
  accent,
  titleId,
  centered = false,
}: {
  eyebrow: string
  title: string
  accent?: string
  titleId: string
  centered?: boolean
}) {
  return (
    <div
      style={{
        textAlign: centered ? "center" : "left",
        marginBottom: 48,
        minWidth: 0,
      }}
    >
      <p
        style={{
          margin: "0 0 14px 0",
          fontFamily: BODY,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: COLORS.textMuted,
        }}
      >
        {eyebrow}
      </p>

      <h2
        id={titleId}
        style={{
          margin: 0,
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: "clamp(28px, 4.4vw, 58px)",
          lineHeight: 1.02,
          letterSpacing: -1.8,
          color: COLORS.text,
          minWidth: 0,
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {title}
        {accent ? (
          <>
            {" "}
            <span style={{ color: COLORS.textMuted }}>{accent}</span>
          </>
        ) : null}
      </h2>
    </div>
  )
}

function Reveal({
  children,
  delay = 0,
  reducedMotion = false,
}: {
  children: ReactNode
  delay?: number
  reducedMotion?: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-60px 0px" })

  if (reducedMotion) {
    return (
      <div ref={ref} style={{ height: "100%", minWidth: 0 }}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, delay, ease: EASE }}
      style={{ height: "100%", minWidth: 0 }}
    >
      {children}
    </motion.div>
  )
}

function Marquee({
  items,
  speed = 34,
  reducedMotion = false,
  label,
  fontSize,
}: {
  items: string[]
  speed?: number
  reducedMotion?: boolean
  label: string
  fontSize?: string
}) {
  const tripled = useMemo(() => [...items, ...items, ...items], [items])

  return (
    <div
      aria-label={label}
      style={{
        overflow: "hidden",
        width: "100%",
        minWidth: 0,
        maskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <motion.div
        aria-hidden="true"
        animate={reducedMotion ? undefined : { x: ["0%", "-33.333%"] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: speed, repeat: Infinity, ease: "linear" }
        }
        style={{
          display: "flex",
          gap: 36,
          width: "max-content",
          alignItems: "center",
        }}
      >
        {tripled.map((item, index) => (
          <span
            key={`${item}-${index}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 36 }}
          >
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: fontSize || "clamp(34px, 6vw, 72px)",
                fontWeight: 800,
                color: "rgba(255,255,255,0.10)",
                letterSpacing: -2,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
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
                background: "rgba(255,255,255,0.28)",
                flexShrink: 0,
              }}
            />
          </span>
        ))}
      </motion.div>
    </div>
  )
}

function Counter({
  value,
  label,
  delay = 0,
  reducedMotion = false,
}: {
  value: string
  label: string
  delay?: number
  reducedMotion?: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })
  const meta = useMemo(() => parseMetric(value), [value])

  const [animatedValue, setAnimatedValue] = useState<number>(() => {
    if (meta.kind !== "number") return 0
    return reducedMotion ? meta.value : 0
  })

  useEffect(() => {
    if (meta.kind !== "number") return
    if (reducedMotion) return
    if (!inView) return

    let rafId = 0
    const timeoutId = window.setTimeout(() => {
      const duration = 1800
      const start = performance.now()

      const run = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        setAnimatedValue(meta.value * easeOutQuart(progress))

        if (progress < 1) {
          rafId = window.requestAnimationFrame(run)
        }
      }

      rafId = window.requestAnimationFrame(run)
    }, delay * 1000)

    return () => {
      window.clearTimeout(timeoutId)
      if (rafId) window.cancelAnimationFrame(rafId)
    }
  }, [delay, inView, meta, reducedMotion])

  const renderedValue = useMemo(() => {
    if (meta.kind !== "number") return meta.raw
    if (reducedMotion) return meta.raw
    return formatMetric(meta, animatedValue)
  }, [meta, reducedMotion, animatedValue])

  return (
    <div ref={ref} style={{ width: "100%", textAlign: "center", minWidth: 0 }}>
      <p
        style={{
          margin: "0 0 12px 0",
          fontFamily: NUMERIC,
          fontWeight: 800,
          fontSize: "clamp(38px, 5vw, 78px)",
          color: COLORS.text,
          lineHeight: 0.95,
          letterSpacing: -2,
          whiteSpace: "nowrap",
          minWidth: 0,
        }}
        aria-label={`${label} : ${value}`}
      >
        {renderedValue}
      </p>

      <p
        style={{
          margin: 0,
          fontFamily: BODY,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2.4,
          textTransform: "uppercase",
          color: COLORS.textMuted,
          lineHeight: 1.5,
          minWidth: 0,
          overflowWrap: "break-word",
        }}
      >
        {label}
      </p>
    </div>
  )
}

function ProcessStep({
  number,
  title,
  description,
  isLast = false,
  delay = 0,
  reducedMotion = false,
  isMobile = false,
}: {
  number: string
  title: string
  description: string
  isLast?: boolean
  delay?: number
  reducedMotion?: boolean
  isMobile?: boolean
}) {
  const ref = useRef<HTMLLIElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-40px 0px" })

  return (
    <motion.li
      ref={ref}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      animate={
        reducedMotion ? undefined : inView ? { opacity: 1, y: 0 } : undefined
      }
      transition={{ duration: 0.7, delay, ease: EASE }}
      style={{
        flex: 1,
        position: "relative",
        listStyle: "none",
        paddingRight: isMobile || isLast ? 0 : 32,
        paddingBottom: isMobile && !isLast ? 28 : 0,
        minWidth: 0,
      }}
    >
      {!isLast && !isMobile && (
        <motion.div
          aria-hidden="true"
          initial={reducedMotion ? false : { scaleX: 0 }}
          animate={reducedMotion ? undefined : inView ? { scaleX: 1 } : undefined}
          transition={{ duration: 0.9, delay: delay + 0.2, ease: EASE }}
          style={{
            position: "absolute",
            top: 15,
            left: 32,
            right: 0,
            height: 1,
            background:
              "linear-gradient(to right, rgba(255,255,255,0.22), rgba(255,255,255,0.05))",
            transformOrigin: "left",
          }}
        />
      )}

      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          position: "relative",
          zIndex: 1,
          background: COLORS.bg,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: NUMERIC,
            fontSize: 11,
            fontWeight: 700,
            color: COLORS.textMuted,
          }}
        >
          {number}
        </span>
      </div>

      <h3
        style={{
          margin: "0 0 10px 0",
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 20,
          lineHeight: 1.2,
          color: COLORS.text,
          letterSpacing: -0.4,
          minWidth: 0,
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          maxWidth: 280,
          fontFamily: BODY,
          fontSize: 14,
          lineHeight: 1.8,
          color: COLORS.textSoft,
          fontWeight: 300,
          minWidth: 0,
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {description}
      </p>
    </motion.li>
  )
}

function FeedPulse({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const items = ["LIVE", "REELS", "STORIES", "ARTICLES", "VIDÉOS"]

  return (
    <ul
      aria-label="Formats de diffusion"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        marginTop: 36,
        marginBottom: 0,
        padding: 0,
        flexWrap: "wrap",
        listStyle: "none",
        minWidth: 0,
      }}
    >
      {items.map((label, index) => (
        <motion.li
          key={label}
          initial={reducedMotion ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.8 + index * 0.08, ease: EASE }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 999,
            border: `1px solid ${COLORS.borderSoft}`,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <motion.span
            aria-hidden="true"
            animate={
              reducedMotion
                ? undefined
                : {
                    opacity: [0.4, 1, 0.4],
                    scale: [0.9, 1.15, 0.9],
                  }
            }
            transition={
              reducedMotion
                ? undefined
                : { duration: 2, repeat: Infinity, delay: index * 0.25 }
            }
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: index === 0 ? "#ff5a5a" : "rgba(255,255,255,0.55)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: BODY,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: COLORS.textMuted,
            }}
          >
            {label}
          </span>
        </motion.li>
      ))}
    </ul>
  )
}

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
  const errorId = cxErrorId(id)
  const hintId = cxHintId(id)

  return (
    <div style={{ position: "relative" }}>
      <motion.label
        htmlFor={id}
        animate={{
          top: active ? 6 : 24,
          fontSize: active ? 11 : 15,
          color: error ? JC.error : JC.text,
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
          <span aria-hidden="true" style={{ color: JC.text }}>
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
        aria-describedby={[hint ? hintId : null, error ? errorId : null]
          .filter(Boolean)
          .join(" ") || undefined}
        placeholder={focused ? placeholder : ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${
            error ? JC.error : focused ? JC.borderFocus : JC.border
          }`,
          padding: "30px 0 16px",
          fontFamily: BODY,
          fontSize: 17,
          color: JC.text,
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
            color: JC.muted,
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
            color: JC.error,
          }}
        >
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
  const errorId = cxErrorId(id)

  return (
    <div style={{ position: "relative" }}>
      <motion.label
        htmlFor={id}
        animate={{
          top: active ? 6 : 24,
          fontSize: active ? 11 : 15,
          color: error ? JC.error : JC.text,
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
          <span aria-hidden="true" style={{ color: JC.text }}>
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
        aria-describedby={error ? errorId : undefined}
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
            error ? JC.error : focused ? JC.borderFocus : JC.border
          }`,
          padding: "30px 0 16px",
          fontFamily: BODY,
          fontSize: 17,
          color: JC.text,
          outline: "none",
          resize: "vertical",
          minHeight: 130,
          transition: "border-color 0.25s ease",
        }}
      />

      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            margin: "10px 0 0",
            fontFamily: BODY,
            fontSize: 13,
            color: JC.error,
          }}
        >
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
  reducedMotion = false,
}: {
  label: string
  name: string
  options: string[]
  value: string
  onChange: (v: string) => void
  reducedMotion?: boolean
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
          color: JC.text,
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
              whileHover={reducedMotion ? undefined : { scale: 1.02 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              animate={{
                background: active ? "#ffffff" : "transparent",
                borderColor: active ? "#ffffff" : "rgba(255,255,255,0.18)",
                color: active ? "#000000" : "#ffffff",
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

export default function JustMediaPage() {
  const WEB3FORMS_ACCESS_KEY =
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() || ""

  const rootRef = useRef<HTMLDivElement | null>(null)
  const { isMobile, isTablet, width } = useViewport(rootRef)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (typeof document === "undefined") return

    if (!document.getElementById("just-media-fonts")) {
      const link = document.createElement("link")
      link.id = "just-media-fonts"
      link.rel = "stylesheet"
      link.href =
        "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
      document.head.appendChild(link)
    }

    if (!document.getElementById("just-media-a11y-style")) {
      const style = document.createElement("style")
      style.id = "just-media-a11y-style"
      style.textContent = `
        .just-media-root, .just-media-root * { box-sizing: border-box; }
        .just-media-root a:focus-visible,
        .just-media-root button:focus-visible,
        .just-media-root input:focus-visible,
        .just-media-root textarea:focus-visible {
          outline: 2px solid rgba(255,255,255,0.96);
          outline-offset: 3px;
        }
        .just-media-root input::placeholder,
        .just-media-root textarea::placeholder {
          color: ${JC.placeholder};
        }
        .just-media-root input:-webkit-autofill,
        .just-media-root textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #000 inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        .just-media-root .jm-footer-link {
          color: ${white(0.55)};
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .just-media-root .jm-footer-link:hover {
          color: ${white(0.9)};
        }
        @media (max-width: 980px) {
          .just-media-root .jm-contact-grid {
            grid-template-columns: 1fr !important;
            gap: 56px !important;
          }
          .just-media-root .jm-contact-two-cols {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .just-media-root .jm-contact-sticky {
            position: relative !important;
            top: 0 !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .just-media-root * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  const formats = [
    {
      title: "Placement Reels & Vidéos",
      desc:
        "Intégration native de votre marque dans nos reels et vidéos les plus performants. Format vertical, pensé pour capter l’attention.",
      image:
        "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/media-phone.jpg",
    },
    {
      title: "Stories & Highlights",
      desc:
        "Séquences de stories dédiées avec call-to-action, interactions et visibilité prolongée grâce aux highlights.",
      image:
        "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/media-cables.jpg",
    },
    {
      title: "Articles & Brand Content",
      desc:
        "Contenus rédactionnels conçus pour approfondir le discours de marque et renforcer la visibilité sur plusieurs canaux.",
      image:
        "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/media-journal.jpg",
    },
    {
      title: "Lives & Événements",
      desc:
        "Lives, lancements, interviews et temps forts en direct pour créer de l’attention et de l’engagement immédiat.",
      image:
        "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/media-live.jpg",
    },
  ]

  const whys = [
    {
      n: "01",
      t: "Audience qualifiée",
      d:
        "Notre communauté est construite organiquement depuis des années. Pas de followers achetés, uniquement de l’engagement réel et pertinent.",
    },
    {
      n: "02",
      t: "Crédibilité éditoriale",
      d:
        "Votre marque apparaît dans un environnement éditorial cohérent, crédible et déjà adopté par notre audience.",
    },
    {
      n: "03",
      t: "Formats natifs",
      d:
        "Pas de publicité intrusive. Votre message s’intègre naturellement dans des formats que l’audience consomme déjà.",
    },
    {
      n: "04",
      t: "Performance mesurable",
      d:
        "Impressions, engagement, clics et conversions : chaque campagne s’accompagne d’indicateurs concrets.",
    },
  ]

  const services = [
    {
      title: "Stratégie de placement",
      desc:
        "Analyse de la marque, des objectifs et de l’audience pour définir le bon format, le bon angle et le bon moment.",
    },
    {
      title: "Création de contenu",
      desc:
        "Production du contenu en interne avec respect de l’identité éditoriale et adaptation aux codes de votre marque.",
    },
    {
      title: "Publication & amplification",
      desc:
        "Publication aux meilleurs créneaux et amplification via nos relais pour maximiser la portée organique.",
    },
    {
      title: "Cross-promotion talents",
      desc:
        "Activation complémentaire de talents et influenceurs associés pour multiplier les points de contact.",
    },
    {
      title: "Reporting complet",
      desc:
        "Tableau de bord de campagne avec reach, impressions, engagement, clics, partages et enseignements clés.",
    },
    {
      title: "Packs & abonnements",
      desc:
        "Formules ponctuelles ou récurrentes selon vos objectifs, votre rythme et votre budget.",
    },
  ]

  const demos = [
    { label: "18–24 ans", value: "42%" },
    { label: "25–34 ans", value: "35%" },
    { label: "France", value: "78%" },
    { label: "Francophonie", value: "22%" },
    { label: "Hommes", value: "55%" },
    { label: "Femmes", value: "45%" },
  ]

  const contactEntityList = [
    "Reels & Vidéos",
    "Stories",
    "Brand Content",
    "Lives & Événements",
  ]

  const socials = [
    {
      href: "https://instagram.com/justgroup",
      label: "Instagram",
      icon: ICONS.instagram,
    },
    {
      href: "https://tiktok.com/@justgroup",
      label: "TikTok",
      icon: ICONS.tiktok,
    },
    {
      href: "https://linkedin.com/company/justgroup",
      label: "LinkedIn",
      icon: ICONS.linkedin,
    },
  ]

  const [contactFormData, setContactFormData] = useState<ContactFormDataState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    entity: "",
    message: "",
  })
  const [contactErrors, setContactErrors] = useState<ContactErrorState>({})
  const [contactStatus, setContactStatus] = useState<ContactStatus>("idle")
  const [contactLiveMessage, setContactLiveMessage] = useState("")

  const contactNameId = useId()
  const contactEmailId = useId()
  const contactPhoneId = useId()
  const contactCompanyId = useId()
  const contactMessageId = useId()
  const contactFormSectionId = useId()
  const contactSuccessTitleId = useId()

  const updateContactField = useCallback(
    (field: keyof ContactFormDataState) => (value: string) => {
      setContactFormData((prev) => ({ ...prev, [field]: value }))

      if (contactErrors[field]) {
        setContactErrors((prev) => ({ ...prev, [field]: undefined }))
      }

      if (contactStatus === "error") {
        setContactStatus("idle")
        setContactLiveMessage("")
      }
    },
    [contactErrors, contactStatus]
  )

  const validateContactForm = useCallback(() => {
    const e: ContactErrorState = {}

    if (!contactFormData.name.trim()) {
      e.name = "Merci d’indiquer votre nom."
    }

    if (!contactFormData.email.trim()) {
      e.email = "Merci d’indiquer votre adresse email."
    } else if (!isValidEmail(contactFormData.email)) {
      e.email = "L’adresse email semble invalide."
    }

    if (!contactFormData.message.trim()) {
      e.message = "Merci de préciser votre demande."
    } else if (contactFormData.message.trim().length < 10) {
      e.message = "Votre message est un peu trop court."
    }

    return e
  }, [contactFormData])

  const resetContactForm = useCallback(() => {
    setContactFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      entity: "",
      message: "",
    })
    setContactErrors({})
    setContactStatus("idle")
    setContactLiveMessage("")
  }, [])

  const handleContactSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const nextErrors = validateContactForm()
      setContactErrors(nextErrors)

      if (Object.keys(nextErrors).length > 0) {
        setContactStatus("error")
        setContactLiveMessage("Le formulaire contient des erreurs.")
        return
      }

      if (!WEB3FORMS_ACCESS_KEY) {
        setContactStatus("error")
        setContactLiveMessage(
          "La clé Web3Forms est absente. Vérifiez votre fichier .env.local."
        )
        return
      }

      setContactStatus("sending")
      setContactLiveMessage("Envoi du formulaire en cours.")

      try {
        const fd = new FormData()
        fd.append("access_key", WEB3FORMS_ACCESS_KEY)
        fd.append(
          "subject",
          `[JUST MEDIA 4 YOU] Nouveau contact — ${
            contactFormData.entity || "Général"
          }`
        )
        fd.append("from_name", contactFormData.name)
        fd.append("name", contactFormData.name)
        fd.append("email", contactFormData.email)
        fd.append("phone", contactFormData.phone)
        fd.append("company", contactFormData.company)
        fd.append("entity", contactFormData.entity)
        fd.append("message", contactFormData.message)
        fd.append("botcheck", "")

        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: fd,
        })
        const data = await res.json()

        if (res.ok && data?.success) {
          setContactStatus("success")
          setContactLiveMessage("Message envoyé.")
        } else {
          setContactStatus("error")
          setContactLiveMessage(data?.message || "Une erreur est survenue.")
        }
      } catch {
        setContactStatus("error")
        setContactLiveMessage("Une erreur est survenue.")
      }
    },
    [WEB3FORMS_ACCESS_KEY, contactFormData, validateContactForm]
  )

  const isContactSubmitDisabled =
    contactStatus === "sending" ||
    !contactFormData.name.trim() ||
    !contactFormData.email.trim() ||
    !contactFormData.message.trim()

  const heroHeadingId = useId()
  const audienceId = useId()
  const whyId = useId()
  const formatsId = useId()
  const demoId = useId()
  const offerId = useId()
  const processId = useId()
  const footerNavId = useId()
  const footerSocialId = useId()

  const heroMinHeight = isMobile
    ? 760
    : isTablet
    ? 860
    : clampNumber(860, Math.round(width * 0.72), 1040)

  const heroTitleSize = fluidBetween(width, 360, 1600, 42, 110)
  const heroPadding = isMobile
    ? "56px 20px 72px"
    : isTablet
    ? "56px 36px 80px"
    : "60px 72px 88px"
  const sectionPadding = getSectionPadding(isMobile, isTablet)
  const marqueeFont = isMobile
    ? "clamp(28px, 7vw, 40px)"
    : isTablet
    ? "clamp(34px, 6vw, 56px)"
    : "clamp(34px, 6vw, 72px)"

  return (
    <div
      ref={rootRef}
      className="just-media-root"
      style={{
        width: "100%",
        minWidth: 0,
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: BODY,
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <a
        href="#just-media-main"
        style={getVisuallyHiddenStyle()}
        onFocus={(e) => {
          Object.assign(e.currentTarget.style, {
            position: "fixed",
            left: "16px",
            top: "16px",
            width: "auto",
            height: "auto",
            margin: "0",
            padding: "10px 14px",
            clip: "auto",
            overflow: "visible",
            background: "#fff",
            color: "#000",
            zIndex: "9999",
            borderRadius: "10px",
            fontWeight: "700",
          })
        }}
        onBlur={(e) => {
          Object.assign(e.currentTarget.style, getVisuallyHiddenStyle())
        }}
      >
        Aller au contenu principal
      </a>

      <section
        aria-labelledby={heroHeadingId}
        style={{
          minHeight: heroMinHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: heroPadding,
          position: "relative",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: isMobile ? "28px 28px" : "40px 40px",
            pointerEvents: "none",
          }}
        />

        <motion.p
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          style={{
            margin: "0 0 32px 0",
            fontFamily: BODY,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: COLORS.textMuted,
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "relative",
            zIndex: 1,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          <motion.span
            aria-hidden="true"
            animate={
              reducedMotion
                ? undefined
                : { scale: [1, 1.35, 1], opacity: [0.35, 0.9, 0.35] }
            }
            transition={{
              duration: 2.2,
              repeat: reducedMotion ? 0 : Infinity,
            }}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#fff",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          Média · Audience · Visibilité · Performance
        </motion.p>

        <div
          style={{
            maxWidth: Math.min(1100, width - (isMobile ? 40 : isTablet ? 72 : 144)),
            position: "relative",
            zIndex: 1,
            minWidth: 0,
          }}
        >
          <h1
            id={heroHeadingId}
            style={{
              margin: 0,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: heroTitleSize,
              lineHeight: 0.94,
              color: COLORS.text,
              letterSpacing: isMobile ? -2 : -3,
              minWidth: 0,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            Un média.
          </h1>

          <p
            aria-hidden="true"
            style={{
              margin: 0,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: heroTitleSize,
              lineHeight: 0.94,
              color: "rgba(255,255,255,0.56)",
              letterSpacing: isMobile ? -2 : -3,
              minWidth: 0,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            Votre vitrine.
          </p>

          <p
            aria-hidden="true"
            style={{
              margin: 0,
              fontFamily: DISPLAY,
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: heroTitleSize,
              lineHeight: 0.94,
              color: "rgba(255,255,255,0.46)",
              letterSpacing: isMobile ? -1 : -2,
              minWidth: 0,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            Notre audience.
          </p>
        </div>

        <FeedPulse reducedMotion={!!reducedMotion} />

        <p
          style={{
            margin: "28px 0 0 0",
            maxWidth: 680,
            fontFamily: BODY,
            fontSize: 16,
            lineHeight: 1.85,
            color: COLORS.textSoft,
            fontWeight: 300,
            position: "relative",
            zIndex: 1,
            minWidth: 0,
            overflowWrap: "break-word",
            wordBreak: "break-word",
          }}
        >
          Just Media 4 You est notre propre média digital. Une audience engagée,
          des formats natifs, une crédibilité éditoriale et une plateforme pensée
          pour donner à votre marque de la visibilité dans un environnement de
          confiance.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            marginTop: 30,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Link
            href="#contact-media"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 28px",
              borderRadius: 999,
              background: "#ffffff",
              color: "#000000",
              textDecoration: "none",
              fontFamily: BODY,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            Nous contacter
          </Link>

          <Link
            href="/contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 28px",
              borderRadius: 999,
              background: "transparent",
              color: "#ffffff",
              textDecoration: "none",
              border: `1px solid ${COLORS.border}`,
              fontFamily: BODY,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            Contact général
          </Link>
        </div>

        {!isMobile && (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 36,
              left: isTablet ? 36 : 72,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
              transition={{
                duration: 2,
                repeat: reducedMotion ? 0 : Infinity,
                ease: "easeInOut",
              }}
              style={{
                width: 1,
                height: 40,
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)",
              }}
            />
            <span
              style={{
                fontSize: 10,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: COLORS.textMuted,
                fontWeight: 700,
              }}
            >
              Scroll
            </span>
          </motion.div>
        )}
      </section>

      <main id="just-media-main" tabIndex={-1} style={{ minWidth: 0 }}>
        <Marquee
          items={[
            "Just Media 4 You",
            "Média",
            "Reels",
            "Stories",
            "Articles",
            "Lives",
            "Brand Content",
            "Audience",
          ]}
          speed={40}
          reducedMotion={!!reducedMotion}
          label="Mots-clés de l'activité média"
          fontSize={marqueeFont}
        />

        <section
          aria-labelledby={audienceId}
          style={{ padding: sectionPadding, position: "relative", minWidth: 0 }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0 }}>
            <Reveal reducedMotion={!!reducedMotion}>
              <SectionIntro
                eyebrow="Notre audience"
                title="Une communauté qui"
                accent="s'engage."
                titleId={audienceId}
                centered
              />
            </Reveal>

            <Reveal reducedMotion={!!reducedMotion}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(1,minmax(0,1fr))"
                    : isTablet
                    ? "repeat(2,minmax(0,1fr))"
                    : "repeat(4,minmax(0,1fr))",
                  gap: 32,
                  alignItems: "start",
                  minWidth: 0,
                }}
              >
                <Counter
                  value="2M+"
                  label="Followers cumulés"
                  delay={0}
                  reducedMotion={!!reducedMotion}
                />
                <Counter
                  value="15M+"
                  label="Impressions mensuelles"
                  delay={0.08}
                  reducedMotion={!!reducedMotion}
                />
                <Counter
                  value="8.5%"
                  label="Taux d'engagement"
                  delay={0.16}
                  reducedMotion={!!reducedMotion}
                />
                <Counter
                  value="18-35"
                  label="Cœur de cible (ans)"
                  delay={0.24}
                  reducedMotion={!!reducedMotion}
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section
          aria-labelledby={whyId}
          style={{
            padding: isMobile ? "8px 20px 72px" : isTablet ? "16px 36px 96px" : "16px 72px 96px",
            minWidth: 0,
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0 }}>
            <Reveal reducedMotion={!!reducedMotion}>
              <SectionIntro
                eyebrow="Pourquoi Just Media 4 You"
                title="Pas de la pub."
                accent="Du contenu."
                titleId={whyId}
              />
            </Reveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(1,minmax(0,1fr))"
                  : isTablet
                  ? "repeat(2,minmax(0,1fr))"
                  : "repeat(4,minmax(0,1fr))",
                gap: 12,
                alignItems: "stretch",
                minWidth: 0,
              }}
            >
              {whys.map((item, index) => (
                <Reveal
                  key={item.n}
                  delay={index * 0.04}
                  reducedMotion={!!reducedMotion}
                >
                  <motion.article
                    whileHover={
                      reducedMotion
                        ? undefined
                        : {
                            backgroundColor: COLORS.panelHover,
                            borderColor: "rgba(255,255,255,0.18)",
                          }
                    }
                    transition={{ duration: 0.25 }}
                    style={{
                      background: COLORS.panel,
                      border: `1px solid ${COLORS.borderSoft}`,
                      borderRadius: getCardRadius(isMobile),
                      padding: "36px 24px",
                      textAlign: "center",
                      minHeight: 280,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 0,
                    }}
                  >
                    <p
                      aria-hidden="true"
                      style={{
                        margin: "0 0 16px 0",
                        fontFamily: NUMERIC,
                        fontSize: 56,
                        fontWeight: 800,
                        color: "rgba(255,255,255,0.12)",
                        lineHeight: 1,
                      }}
                    >
                      {item.n}
                    </p>

                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: 18,
                        color: COLORS.text,
                        letterSpacing: -0.3,
                        minWidth: 0,
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.t}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        maxWidth: 240,
                        fontFamily: BODY,
                        fontSize: 14,
                        lineHeight: 1.75,
                        color: COLORS.textSoft,
                        fontWeight: 300,
                        minWidth: 0,
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.d}
                    </p>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby={formatsId}
          style={{
            padding: isMobile ? "8px 20px 72px" : isTablet ? "16px 36px 96px" : "16px 72px 96px",
            minWidth: 0,
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0 }}>
            <Reveal reducedMotion={!!reducedMotion}>
              <SectionIntro
                eyebrow="Nos formats"
                title="Votre marque,"
                accent="nos formats."
                titleId={formatsId}
              />
            </Reveal>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              {formats.map((format, index) => {
                const reverse = index % 2 === 1
                const imageHeight = isMobile
                  ? 240
                  : isTablet
                  ? 300
                  : clampNumber(280, Math.round(width * 0.22), 360)

                return (
                  <Reveal
                    key={format.title}
                    delay={index * 0.04}
                    reducedMotion={!!reducedMotion}
                  >
                    <article
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                          ? "minmax(0,1fr)"
                          : reverse
                          ? "minmax(0,1fr) minmax(0,1.2fr)"
                          : "minmax(0,1.2fr) minmax(0,1fr)",
                        background: COLORS.panel,
                        border: `1px solid ${COLORS.borderSoft}`,
                        borderRadius: isMobile ? 18 : 24,
                        overflow: "hidden",
                        minHeight: isMobile ? "auto" : imageHeight,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          order: isMobile ? 1 : reverse ? 2 : 1,
                          position: "relative",
                          overflow: "hidden",
                          minHeight: imageHeight,
                          minWidth: 0,
                        }}
                      >
                        <Image
                          src={format.image}
                          alt={`${format.title} - illustration`}
                          fill
                          sizes={
                            isMobile
                              ? "100vw"
                              : isTablet
                              ? "100vw"
                              : "(max-width: 1200px) 50vw, 600px"
                          }
                          loading="lazy"
                          style={{ objectFit: "cover" }}
                        />
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: isMobile
                              ? "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.10))"
                              : reverse
                              ? "linear-gradient(to left, transparent 40%, rgba(0,0,0,0.56) 100%)"
                              : "linear-gradient(to right, transparent 40%, rgba(0,0,0,0.56) 100%)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>

                      <div
                        style={{
                          order: isMobile ? 2 : reverse ? 1 : 2,
                          padding: isMobile ? "28px 20px" : isTablet ? "36px 28px" : "44px 40px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          minWidth: 0,
                        }}
                      >
                        <p
                          aria-hidden="true"
                          style={{
                            margin: "0 0 -8px 0",
                            fontFamily: NUMERIC,
                            fontSize: isMobile ? 54 : 80,
                            fontWeight: 800,
                            color: "rgba(255,255,255,0.14)",
                            lineHeight: 1,
                            letterSpacing: -3,
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </p>

                        <h3
                          style={{
                            margin: "0 0 16px 0",
                            fontFamily: DISPLAY,
                            fontWeight: 800,
                            fontSize: 24,
                            color: COLORS.text,
                            letterSpacing: -0.8,
                            lineHeight: 1.15,
                            minWidth: 0,
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                        >
                          {format.title}
                        </h3>

                        <p
                          style={{
                            margin: 0,
                            maxWidth: 460,
                            fontFamily: BODY,
                            fontSize: 15,
                            lineHeight: 1.8,
                            color: COLORS.textSoft,
                            fontWeight: 300,
                            minWidth: 0,
                            overflowWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                        >
                          {format.desc}
                        </p>
                      </div>
                    </article>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>
                <section
          aria-labelledby={demoId}
          style={{
            padding: isMobile ? "8px 20px 72px" : isTablet ? "80px 36px" : "80px 72px",
            minWidth: 0,
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0 }}>
            <Reveal reducedMotion={!!reducedMotion}>
              <SectionIntro
                eyebrow="Démographie"
                title="Qui nous"
                accent="suit."
                titleId={demoId}
              />
            </Reveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(2,minmax(0,1fr))"
                  : isTablet
                  ? "repeat(3,minmax(0,1fr))"
                  : "repeat(6,minmax(0,1fr))",
                gap: 12,
                alignItems: "stretch",
                minWidth: 0,
              }}
            >
              {demos.map((demo, index) => (
                <Reveal
                  key={demo.label}
                  delay={index * 0.03}
                  reducedMotion={!!reducedMotion}
                >
                  <article
                    style={{
                      background: COLORS.panel,
                      border: `1px solid ${COLORS.borderSoft}`,
                      borderRadius: getCardRadius(isMobile),
                      padding: "32px 18px",
                      textAlign: "center",
                      minHeight: 132,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 0,
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 8px 0",
                        fontFamily: NUMERIC,
                        fontWeight: 800,
                        fontSize: 36,
                        color: COLORS.text,
                        letterSpacing: -1.5,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        minWidth: 0,
                      }}
                    >
                      {demo.value}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontFamily: BODY,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        color: COLORS.textMuted,
                        lineHeight: 1.5,
                        minWidth: 0,
                        overflowWrap: "break-word",
                      }}
                    >
                      {demo.label}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div style={{ padding: "24px 0 40px", minWidth: 0 }}>
          <Marquee
            items={["Instagram", "TikTok", "YouTube", "Snapchat", "Twitter", "LinkedIn"]}
            speed={30}
            reducedMotion={!!reducedMotion}
            label="Plateformes de diffusion"
            fontSize={
              isMobile
                ? "clamp(26px, 7vw, 36px)"
                : isTablet
                ? "clamp(30px, 6vw, 46px)"
                : "clamp(34px, 6vw, 72px)"
            }
          />
        </div>

        <section
          aria-labelledby={offerId}
          style={{
            padding: isMobile ? "8px 20px 72px" : isTablet ? "80px 36px" : "80px 72px",
            minWidth: 0,
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0 }}>
            <Reveal reducedMotion={!!reducedMotion}>
              <SectionIntro eyebrow="Notre offre" title="Tout est inclus." titleId={offerId} />
            </Reveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(1,minmax(0,1fr))"
                  : isTablet
                  ? "repeat(2,minmax(0,1fr))"
                  : "repeat(3,minmax(0,1fr))",
                gap: 12,
                alignItems: "stretch",
                minWidth: 0,
              }}
            >
              {services.map((service, index) => (
                <Reveal
                  key={service.title}
                  delay={index * 0.03}
                  reducedMotion={!!reducedMotion}
                >
                  <motion.article
                    whileHover={reducedMotion ? undefined : { backgroundColor: COLORS.panelHover }}
                    transition={{ duration: 0.25 }}
                    style={{
                      background: COLORS.panel,
                      border: `1px solid ${COLORS.borderSoft}`,
                      borderRadius: getCardRadius(isMobile),
                      padding: "40px 26px",
                      position: "relative",
                      overflow: "hidden",
                      minHeight: 240,
                      height: "100%",
                      minWidth: 0,
                    }}
                  >
                    <p
                      aria-hidden="true"
                      style={{
                        margin: 0,
                        position: "absolute",
                        top: -2,
                        right: 14,
                        fontFamily: NUMERIC,
                        fontSize: 76,
                        fontWeight: 800,
                        color: "rgba(255,255,255,0.12)",
                        lineHeight: 1,
                        letterSpacing: -3,
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>

                    <h3
                      style={{
                        margin: "0 0 12px 0",
                        minHeight: 44,
                        position: "relative",
                        zIndex: 1,
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: 19,
                        color: COLORS.text,
                        letterSpacing: -0.4,
                        lineHeight: 1.2,
                        minWidth: 0,
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      {service.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        position: "relative",
                        zIndex: 1,
                        fontFamily: BODY,
                        fontSize: 14,
                        lineHeight: 1.85,
                        color: COLORS.textSoft,
                        fontWeight: 300,
                        minWidth: 0,
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                      }}
                    >
                      {service.desc}
                    </p>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby={processId}
          style={{
            padding: isMobile ? "8px 20px 72px" : isTablet ? "80px 36px" : "80px 72px",
            minWidth: 0,
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0 }}>
            <Reveal reducedMotion={!!reducedMotion}>
              <SectionIntro
                eyebrow="Comment ça marche"
                title="Simple. Efficace."
                titleId={processId}
              />
            </Reveal>

            <ol
              style={{
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 20 : 0,
                minWidth: 0,
              }}
            >
              <ProcessStep
                number="01"
                title="Brief"
                description="Compréhension de votre marque, de vos objectifs et de votre cible pour construire une recommandation pertinente."
                delay={0}
                reducedMotion={!!reducedMotion}
                isMobile={isMobile}
              />
              <ProcessStep
                number="02"
                title="Création"
                description="Production du contenu natif dans le respect des codes éditoriaux, des contraintes créatives et du message de marque."
                delay={0.08}
                reducedMotion={!!reducedMotion}
                isMobile={isMobile}
              />
              <ProcessStep
                number="03"
                title="Publication"
                description="Mise en ligne, relais, optimisation et suivi opérationnel pendant toute la diffusion."
                delay={0.16}
                reducedMotion={!!reducedMotion}
                isMobile={isMobile}
              />
              <ProcessStep
                number="04"
                title="Résultats"
                description="Analyse détaillée, bilan de performance et recommandations stratégiques pour la suite."
                isLast
                delay={0.24}
                reducedMotion={!!reducedMotion}
                isMobile={isMobile}
              />
            </ol>
          </div>
        </section>

        <section
          id="contact-media"
          aria-labelledby={contactFormSectionId}
          style={{
            padding: isMobile ? "80px 20px 100px" : isTablet ? "100px 36px 120px" : "110px 72px 140px",
            borderTop: `1px solid ${COLORS.borderSoft}`,
            position: "relative",
            minWidth: 0,
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
            {contactLiveMessage}
          </div>

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center top,rgba(255,255,255,0.03) 0%,transparent 65%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative", zIndex: 1 }}>
            <Reveal reducedMotion={!!reducedMotion}>
              <div style={{ marginBottom: isMobile ? 48 : 72 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 6,
                    textTransform: "uppercase",
                    color: COLORS.textMuted,
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
                        : { scale: [1, 1.45, 1], opacity: [0.35, 0.85, 0.35] }
                    }
                    transition={{ duration: 2.5, repeat: Infinity }}
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
                  id={contactFormSectionId}
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: isMobile
                      ? "clamp(40px,12vw,58px)"
                      : "clamp(56px,8vw,110px)",
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
                      color: "rgba(255,255,255,0.88)",
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
                    color: COLORS.textSoft,
                    fontWeight: 300,
                  }}
                >
                  Audience, placement natif, brand content ou live : quelle que soit
                  votre ambition, on a le format qu’il vous faut. Remplissez le
                  formulaire, on revient vers vous sous 24h.
                </p>
              </div>
            </Reveal>

            <div
              className="jm-contact-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) minmax(280px,0.42fr)",
                gap: isMobile ? 56 : 88,
                alignItems: "start",
              }}
            >
              <Reveal reducedMotion={!!reducedMotion}>
                <div>
                  {contactStatus === "success" ? (
                    <motion.section
                      aria-labelledby={contactSuccessTitleId}
                      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
                      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: EASE }}
                      style={{
                        textAlign: "center",
                        padding: isMobile ? "56px 24px" : "80px 40px",
                        background: JC.surface,
                        border: `1px solid ${JC.border}`,
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
                        id={contactSuccessTitleId}
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
                          color: COLORS.textSoft,
                          fontWeight: 300,
                          lineHeight: 1.8,
                          maxWidth: 420,
                          margin: "0 auto",
                        }}
                      >
                        Merci pour votre intérêt. Notre équipe revient vers vous sous
                        24h.
                      </p>

                      <motion.button
                        type="button"
                        onClick={resetContactForm}
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
                          color: COLORS.textMuted,
                          margin: "0 0 14px",
                        }}
                      >
                        Formulaire
                      </p>

                      <h3
                        style={{
                          fontFamily: DISPLAY,
                          fontWeight: 800,
                          fontSize: "clamp(32px,4vw,48px)",
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
                          color: COLORS.textSoft,
                          maxWidth: 620,
                        }}
                      >
                        Les champs marqués d’un astérisque sont obligatoires.
                      </p>

                      <form onSubmit={handleContactSubmit} noValidate>
                        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                          <div
                            className="jm-contact-two-cols"
                            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}
                          >
                            <ContactInputField
                              id={contactNameId}
                              label="Nom complet"
                              name="name"
                              required
                              autoComplete="name"
                              value={contactFormData.name}
                              error={contactErrors.name}
                              placeholder="Jean Dupont"
                              onChange={updateContactField("name")}
                            />

                            <ContactInputField
                              id={contactEmailId}
                              label="Adresse email"
                              name="email"
                              type="email"
                              required
                              autoComplete="email"
                              inputMode="email"
                              value={contactFormData.email}
                              error={contactErrors.email}
                              placeholder="jean@marque.com"
                              onChange={updateContactField("email")}
                            />
                          </div>

                          <div
                            className="jm-contact-two-cols"
                            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}
                          >
                            <ContactInputField
                              id={contactPhoneId}
                              label="Téléphone"
                              name="phone"
                              type="tel"
                              autoComplete="tel"
                              inputMode="tel"
                              value={contactFormData.phone}
                              placeholder="+33 6 12 34 56 78"
                              hint="Optionnel"
                              onChange={updateContactField("phone")}
                            />

                            <ContactInputField
                              id={contactCompanyId}
                              label="Entreprise / Marque"
                              name="company"
                              autoComplete="organization"
                              value={contactFormData.company}
                              placeholder="Votre marque"
                              hint="Optionnel"
                              onChange={updateContactField("company")}
                            />
                          </div>

                          <ContactPillSelect
                            label="Format souhaité"
                            name="entity"
                            options={contactEntityList}
                            value={contactFormData.entity}
                            onChange={updateContactField("entity")}
                            reducedMotion={!!reducedMotion}
                          />

                          <ContactTextareaField
                            id={contactMessageId}
                            label="Votre message"
                            name="message"
                            required
                            value={contactFormData.message}
                            error={contactErrors.message}
                            placeholder="Décrivez votre projet, vos objectifs, vos délais..."
                            onChange={updateContactField("message")}
                          />

                          <AnimatePresence>
                            {contactStatus === "error" && (
                              <motion.div
                                role="alert"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                style={{
                                  padding: "16px 22px",
                                  borderRadius: 12,
                                  background: JC.errorBg,
                                  border: `1px solid ${JC.errorBorder}`,
                                  fontFamily: BODY,
                                  fontSize: 14,
                                  color: JC.error,
                                  lineHeight: 1.7,
                                }}
                              >
                                <strong>Une erreur est survenue.</strong>{" "}
                                {contactLiveMessage &&
                                contactLiveMessage !== "Une erreur est survenue."
                                  ? contactLiveMessage
                                  : "Veuillez réessayer ou nous contacter directement."}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <motion.button
                            type="submit"
                            disabled={isContactSubmitDisabled}
                            aria-disabled={isContactSubmitDisabled}
                            aria-busy={contactStatus === "sending"}
                            whileHover={
                              !isContactSubmitDisabled && !reducedMotion
                                ? { y: -2, backgroundColor: "#ffffff", color: "#000000" }
                                : undefined
                            }
                            whileTap={
                              !isContactSubmitDisabled && !reducedMotion
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
                              color: isContactSubmitDisabled
                                ? "rgba(255,255,255,0.25)"
                                : "#ffffff",
                              fontFamily: DISPLAY,
                              fontWeight: 700,
                              fontSize: 13,
                              letterSpacing: 4,
                              textTransform: "uppercase",
                              border: `1px solid ${
                                isContactSubmitDisabled
                                  ? "rgba(255,255,255,0.12)"
                                  : "#ffffff"
                              }`,
                              borderRadius: 100,
                              cursor: isContactSubmitDisabled ? "not-allowed" : "pointer",
                              transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                              opacity: contactStatus === "sending" ? 0.58 : 1,
                            }}
                          >
                            {contactStatus === "sending" ? "Envoi en cours..." : "Envoyer"}
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

              <Reveal delay={0.15} reducedMotion={!!reducedMotion}>
                <aside
                  className="jm-contact-sticky"
                  aria-label="Informations de contact"
                  style={{
                    position: "sticky",
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
                      background: JC.surface,
                      border: `1px solid ${JC.border}`,
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
                          : { scale: [1, 1.3, 1], opacity: [0.45, 1, 0.45] }
                      }
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: JC.success,
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
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 16px",
                        fontFamily: BODY,
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 4,
                        textTransform: "uppercase",
                        color: COLORS.textMuted,
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
                        color: "rgba(255,255,255,0.9)",
                        fontStyle: "italic",
                        letterSpacing: -0.8,
                      }}
                    >
                      &ldquo;Chaque projet commence par une conversation. La vôtre
                      commence ici.&rdquo;
                    </blockquote>
                  </div>
                </aside>
              </Reveal>
            </div>
          </div>
        </section>

        <footer
          role="contentinfo"
          style={{
            borderTop: `1px solid ${COLORS.borderSoft}`,
            padding: isMobile ? "48px 20px 64px" : "56px 72px 72px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1fr) auto auto",
              gap: isMobile ? 28 : 40,
              alignItems: "start",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 10px 0",
                  fontFamily: DISPLAY,
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: -0.8,
                }}
              >
                Just Media 4 You
              </p>
              <p
                style={{
                  margin: 0,
                  maxWidth: 420,
                  fontFamily: BODY,
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: COLORS.textSoft,
                }}
              >
                Média digital, brand content, visibilité, diffusion et stratégie
                éditoriale pour les marques qui veulent apparaître au bon endroit,
                devant les bonnes personnes.
              </p>
            </div>

            <nav aria-labelledby={footerNavId}>
              <p
                id={footerNavId}
                style={{
                  margin: "0 0 14px 0",
                  fontFamily: BODY,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: COLORS.textMuted,
                }}
              >
                Navigation
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                {FOOTER_NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="jm-footer-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby={footerSocialId}>
              <p
                id={footerSocialId}
                style={{
                  margin: "0 0 14px 0",
                  fontFamily: BODY,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: COLORS.textMuted,
                }}
              >
                Social
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                {socials.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      {...getExternalLinkProps(item.href)}
                      className="jm-footer-link"
                      aria-label={`${item.label} (s’ouvre dans un nouvel onglet)`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  )
}