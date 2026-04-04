"use client"

import Image from "next/image"
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import type {
  CSSProperties,
  FormEvent,
  HTMLAttributes,
  ReactNode,
} from "react"
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const WEB3FORMS_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || ""

const BP = { mobile: 640, tablet: 1024 } as const
const OP = {
  label: 0.55,
  tag: 0.58,
  desc: 0.6,
  heroDesc: 0.62,
  caption: 0.62,
  entityDesc: 0.65,
  quote: 0.75,
} as const

const JC = {
  bg: "#000000",
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

const white = (o: number) => `rgba(255,255,255,${o})`
const clampNumber = (min: number, v: number, max: number) =>
  Math.max(min, Math.min(v, max))
const fluidPx = (w: number, minPx: number, maxPx: number, ref = 1440) =>
  clampNumber(minPx, Math.round(maxPx * (w / ref)), maxPx)

function mo<T extends CSSProperties | Record<string, unknown>>(
  reduced: boolean,
  active: T,
  fallback: T
): T {
  return reduced ? fallback : active
}

function tr(reduced: boolean, duration: number, delay = 0) {
  return reduced ? { duration: 0 } : { duration, delay, ease: EASE }
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
}

function handleImageError() {
  // volontairement vide
}

const S = {
  label: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 6,
    textTransform: "uppercase" as const,
    color: white(OP.label),
    fontFamily: BODY,
    marginBottom: 14,
    marginTop: 0,
  },
  title: {
    fontFamily: DISPLAY,
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1,
    letterSpacing: -3,
    marginTop: 0,
  },
  pill: {
    padding: "8px 18px",
    borderRadius: 100,
    border: `1px solid ${white(0.08)}`,
    background: white(0.03),
    fontFamily: BODY,
    fontSize: 11,
    fontWeight: 500,
    color: white(OP.entityDesc),
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  ghost: (size: number): CSSProperties => ({
    fontFamily: DISPLAY,
    fontSize: size,
    fontWeight: 800,
    color: white(0.03),
    lineHeight: 1,
  }),
  overlay: {
    position: "absolute" as const,
    inset: 0,
    pointerEvents: "none" as const,
  },
  coverImg: {
    objectFit: "cover" as const,
    display: "block" as const,
  },
  mask: "linear-gradient(to right,transparent,black 8%,black 92%,transparent)",
  maskWide:
    "linear-gradient(to right,transparent,black 3%,black 97%,transparent)",
} as const

const VALUES = [
  {
    n: "01",
    t: "Authenticité",
    d: "Des voix vraies. Des connexions réelles. Pas de faux-semblants.",
  },
  {
    n: "02",
    t: "Précision",
    d: "Du brief à l'exécution, chaque détail est pensé.",
  },
  {
    n: "03",
    t: "Audace",
    d: "Repousser les limites du contenu et de l'expérience client.",
  },
  {
    n: "04",
    t: "Excellence",
    d: "Un standard de qualité qui ne se négocie jamais.",
  },
] as const

const ICONS = {
  play: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <polygon points="6,3 20,12 6,21" />
    </svg>
  ),
  pause: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="5" y="3" width="5" height="18" />
      <rect x="14" y="3" width="5" height="18" />
    </svg>
  ),
}

type ContactStatus = "idle" | "sending" | "success" | "error"

type ContactFormData = {
  name: string
  email: string
  phone: string
  company: string
  entity: string
  message: string
}

type ContactErrors = Partial<Record<keyof ContactFormData, string>>

type GalleryImage = {
  src: string
  label: string
  caption: string
}

type Responsive = {
  width: number
  height: number
  mobile: boolean
  tablet: boolean
  px: number
  sectionPad: string
}

function subscribeWindow(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("resize", callback)
  return () => window.removeEventListener("resize", callback)
}

function getWindowSnapshot() {
  if (typeof window === "undefined") {
    return { width: 1280, height: 900 }
  }
  return {
    width: Math.max(320, window.innerWidth || 1280),
    height: Math.max(1, window.innerHeight || 900),
  }
}

function getWindowServerSnapshot() {
  return { width: 1280, height: 900 }
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {}
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  const handler = () => callback()
  mq.addEventListener("change", handler)
  return () => mq.removeEventListener("change", handler)
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getReducedMotionServerSnapshot() {
  return false
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  )
}

function useResponsive(): Responsive {
  const size = useSyncExternalStore(
    subscribeWindow,
    getWindowSnapshot,
    getWindowServerSnapshot
  )

  const mobile = size.width <= BP.mobile
  const tablet = size.width <= BP.tablet
  const px = mobile ? 20 : tablet ? 40 : 72

  return {
    width: size.width,
    height: size.height,
    mobile,
    tablet,
    px,
    sectionPad: mobile
      ? "60px 20px"
      : tablet
        ? "80px 40px"
        : "100px 72px",
  }
}

function gridCols(
  mobile: boolean,
  tablet: boolean,
  desktop: number,
  tabletCols = 2,
  mobileCols = 1
): string {
  if (mobile) {
    return mobileCols === 1 ? "1fr" : `repeat(${mobileCols}, minmax(0,1fr))`
  }
  if (tablet) return `repeat(${tabletCols}, minmax(0,1fr))`
  return `repeat(${desktop}, minmax(0,1fr))`
}

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const visible = useInView(ref, { once: true, margin: "-60px" })
  const reduced = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={mo(reduced, { opacity: 0, y: 50 }, { opacity: 1, y: 0 })}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={tr(reduced, 0.9, delay)}
      style={{ minWidth: 0 }}
    >
      {children}
    </motion.div>
  )
}

function SectionHeader({
  label,
  title,
  titleSize = "clamp(28px,4vw,56px)",
}: {
  label: string
  title: string
  titleSize?: string
}) {
  return (
    <Reveal>
      <p style={S.label}>{label}</p>
      <h2
        style={{
          ...S.title,
          fontSize: titleSize,
          marginBottom: 0,
          margin: 0,
        }}
      >
        {title}
      </h2>
    </Reveal>
  )
}

function Marquee({
  items,
  speed = 35,
  fontSize = 72,
}: {
  items: string[]
  speed?: number
  fontSize?: number
}) {
  const rawId = useId()
  const id = useMemo(() => `mq-${rawId.replace(/[:]/g, "")}`, [rawId])
  const reduced = useReducedMotion()
  const tripled = useMemo(() => [...items, ...items, ...items], [items])

  return (
    <>
      {!reduced && (
        <style>{`
          @keyframes ${id} {
            0% { transform: translate3d(0,0,0); }
            100% { transform: translate3d(-33.333%,0,0); }
          }
        `}</style>
      )}

      <div
        aria-hidden="true"
        role="presentation"
        style={{
          overflow: "hidden",
          width: "100%",
          minWidth: 0,
          maskImage: S.mask,
          WebkitMaskImage: S.mask,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 40,
            width: "max-content",
            alignItems: "center",
            animation: reduced ? "none" : `${id} ${speed}s linear infinite`,
            willChange: reduced ? "auto" : "transform",
          }}
        >
          {tripled.map((name, i) => (
            <Fragment key={`${name}-${i}`}>
              <span
                style={{
                  ...S.ghost(fontSize),
                  letterSpacing: -3,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </span>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: white(0.08),
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}

function GalleryCard({
  img,
  cardW,
  cardH,
  priority = false,
}: {
  img: GalleryImage
  cardW: number
  cardH: number
  priority?: boolean
}) {
  return (
    <figure
      style={{
        width: cardW,
        minWidth: cardW,
        maxWidth: cardW,
        height: cardH,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        margin: 0,
      }}
    >
      <Image
        src={img.src}
        alt={`${img.caption} — ${img.label}`}
        fill
        unoptimized
        draggable={false}
        priority={priority}
        sizes={`${cardW}px`}
        onError={handleImageError}
        style={{ ...S.coverImg, pointerEvents: "none", userSelect: "none" }}
      />
      <div
        aria-hidden="true"
        style={{
          ...S.overlay,
          background:
            "linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.1) 40%,transparent 100%)",
        }}
      />
      <figcaption
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          right: 24,
        }}
      >
        <div
          style={{
            ...S.label,
            fontSize: 9,
            color: white(OP.caption),
            marginBottom: 6,
            letterSpacing: 5,
          }}
        >
          {img.caption}
        </div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 18,
            color: "#fff",
            letterSpacing: -0.5,
          }}
        >
          {img.label}
        </div>
      </figcaption>
    </figure>
  )
}

function AutoGallery({
  images,
  speed = 45,
  responsive,
}: {
  images: GalleryImage[]
  speed?: number
  responsive: Responsive
}) {
  const rawId = useId()
  const id = useMemo(() => `gal-${rawId.replace(/[:]/g, "")}`, [rawId])
  const reduced = useReducedMotion()
  const { mobile, tablet } = responsive
  const gap = 16
  const cardW = mobile ? 280 : tablet ? 340 : 420
  const cardH = mobile ? 380 : tablet ? 440 : 520
  const trackWidth = images.length * cardW + (images.length - 1) * gap

  return (
    <>
      {!reduced && (
        <style>{`
          @keyframes ${id} {
            from { transform: translate3d(0,0,0); }
            to { transform: translate3d(-${trackWidth + gap}px,0,0); }
          }
        `}</style>
      )}

      <div
        role="region"
        aria-label="Galerie photo Just"
        style={{
          width: "100%",
          minWidth: 0,
          overflow: "hidden",
          maskImage: S.maskWide,
          WebkitMaskImage: S.maskWide,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "max-content",
            willChange: reduced ? "auto" : "transform",
            animation: !reduced ? `${id} ${speed}s linear infinite` : "none",
          }}
        >
          <div style={{ display: "flex", gap, flexShrink: 0 }}>
            {images.map((img, i) => (
              <GalleryCard
                img={img}
                cardW={cardW}
                cardH={cardH}
                key={`a-${i}`}
              />
            ))}
          </div>

          {!reduced && (
            <div
              aria-hidden="true"
              style={{ display: "flex", gap, flexShrink: 0, marginLeft: gap }}
            >
              {images.map((img, i) => (
                <GalleryCard
                  img={img}
                  cardW={cardW}
                  cardH={cardH}
                  key={`b-${i}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Entity({
  number,
  name,
  tagline,
  description,
  services,
  imageUrl,
  reverse = false,
  responsive,
}: {
  number: string
  name: string
  tagline: string
  description: string
  services: string[]
  imageUrl: string
  reverse?: boolean
  responsive: Responsive
}) {
  const ref = useRef<HTMLElement | null>(null)
  const isVisible = useInView(ref, { once: true, margin: "-100px" })
  const reduced = useReducedMotion()
  const { mobile, tablet, width } = responsive
  const stacked = tablet

  const fadeDirection = stacked
    ? "linear-gradient(to bottom,transparent 50%,#000 100%)"
    : reverse
      ? "linear-gradient(to left,transparent 50%,#000 100%)"
      : "linear-gradient(to right,transparent 50%,#000 100%)"

  const visualHeight = mobile
    ? 420
    : tablet
      ? 520
      : Math.max(680, Math.min(900, Math.round(width * 0.55)))

  return (
    <section
      ref={ref}
      aria-label={name}
      style={{
        minHeight: stacked ? "auto" : `${visualHeight}px`,
        display: "grid",
        gridTemplateColumns: stacked
          ? "minmax(0,1fr)"
          : "minmax(0,1fr) minmax(0,1fr)",
        alignItems: "stretch",
        minWidth: 0,
      }}
    >
      <div
        style={{
          order: stacked ? 2 : reverse ? 2 : 1,
          padding: mobile ? "40px 20px" : tablet ? "56px 40px" : "80px 72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minWidth: 0,
        }}
      >
        <motion.div
          initial={mo(
            reduced,
            { opacity: 0, x: reverse ? 40 : -40 },
            { opacity: 1, x: 0 }
          )}
          animate={isVisible ? { opacity: 1, x: 0 } : {}}
          transition={tr(reduced, 0.8)}
          style={{ minWidth: 0 }}
        >
          <div
            aria-hidden="true"
            style={{
              ...S.ghost(mobile ? 72 : 120),
              letterSpacing: -6,
              marginBottom: mobile ? -28 : -40,
              position: "relative",
              zIndex: 0,
            }}
          >
            {number}
          </div>

          <h2
            style={{
              ...S.title,
              fontSize: mobile ? 34 : tablet ? 48 : 64,
              lineHeight: 0.95,
              marginBottom: 12,
              position: "relative",
              zIndex: 1,
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {name}
          </h2>

          <p
            style={{
              fontFamily: BODY,
              fontSize: mobile ? 11 : 13,
              fontWeight: 600,
              letterSpacing: mobile ? 3 : 5,
              textTransform: "uppercase",
              color: white(OP.tag),
              marginBottom: 24,
              overflowWrap: "break-word",
            }}
          >
            {tagline}
          </p>

          <p
            style={{
              fontFamily: BODY,
              fontSize: mobile ? 15 : 16,
              lineHeight: 1.85,
              color: white(OP.entityDesc),
              fontWeight: 300,
              maxWidth: 520,
              marginBottom: 36,
              overflowWrap: "break-word",
            }}
          >
            {description}
          </p>

          <ul
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
            aria-label={`Services ${name}`}
          >
            {services.map((service, i) => (
              <motion.li
                key={service}
                initial={mo(reduced, { opacity: 0, y: 12 }, { opacity: 1, y: 0 })}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={tr(reduced, 0.5, 0.3 + i * 0.06)}
                style={S.pill}
              >
                {service}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        style={{
          order: stacked ? 1 : reverse ? 1 : 2,
          height: `${visualHeight}px`,
          minHeight: `${visualHeight}px`,
          position: "relative",
          overflow: "hidden",
          minWidth: 0,
        }}
        initial={mo(reduced, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1 })}
        animate={isVisible ? { opacity: 1, scale: 1 } : {}}
        transition={tr(reduced, 1.2)}
      >
        <Image
          src={imageUrl}
          alt={`Photo illustrant ${name}`}
          fill
          unoptimized
          sizes={stacked ? "100vw" : "50vw"}
          onError={handleImageError}
          style={S.coverImg}
        />
        <div aria-hidden="true" style={{ ...S.overlay, background: fadeDirection }} />
        <div
          aria-hidden="true"
          style={{
            ...S.overlay,
            background: "linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 40%)",
          }}
        />
      </motion.div>
    </section>
  )
}

function Counter({
  value,
  label,
  delay = 0,
}: {
  value: string
  label: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const isVisible = useInView(ref, { once: true })
  const reduced = useReducedMotion()

  // FIX: regex-based parser pour supporter decimals et suffixes variés (200+, 50M+, 98%)
  const parsed = useMemo(() => {
    const match = value.match(/^([0-9]+(?:\.[0-9]+)?)(.*)$/)
    if (!match) return { numeric: 0, suffix: value }
    return { numeric: parseFloat(match[1]), suffix: match[2] }
  }, [value])

  const motionValue = useMotionValue(0)
  // FIX: syntaxe useTransform compatible toutes versions Framer Motion
  const rounded = useTransform(motionValue, (v) => Math.floor(v))
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    if (reduced) {
      motionValue.set(parsed.numeric)
      return
    }

    const controls = animate(motionValue, parsed.numeric, {
      duration: 2.2,
      delay,
      ease: [0.22, 1, 0.36, 1],
    })

    return () => {
      controls.stop()
    }
  }, [delay, isVisible, motionValue, parsed.numeric, reduced])

  return (
    <div ref={ref} style={{ textAlign: "center", minWidth: 0 }}>
      <div
        aria-label={`${value} ${label}`}
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: "clamp(40px,5vw,64px)",
          color: "#fff",
          lineHeight: 1,
          marginBottom: 10,
          letterSpacing: -4,
          fontVariantNumeric: "tabular-nums",
          overflowWrap: "break-word",
        }}
      >
        <span aria-hidden="true">
          {isVisible ? <motion.span>{rounded}</motion.span> : 0}
          {parsed.suffix}
        </span>
      </div>

      <div
        style={{
          ...S.label,
          fontSize: 10,
          color: white(OP.tag),
          marginBottom: 0,
          overflowWrap: "break-word",
        }}
      >
        {label}
      </div>
    </div>
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
            error ? JC.error : focused ? JC.borderFocus : JC.border
          }`,
          padding: "30px 0 16px",
          fontFamily: BODY,
          fontSize: 17,
          fontWeight: 400,
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
            lineHeight: 1.6,
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
            lineHeight: 1.6,
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
  const errorId = `${id}-error`

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
          fontWeight: 400,
          color: JC.text,
          outline: "none",
          resize: "vertical",
          minHeight: 130,
          transition: "border-color 0.25s ease",
          letterSpacing: 0.2,
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
            lineHeight: 1.6,
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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

export default function JustPage() {
  // ─── FIX PRINCIPAL : mounted guard pour éviter React hydration error #185 ───
  // useSyncExternalStore retourne des snapshots différents entre SSR et client
  // (window size, prefers-reduced-motion). Ce guard force le rendu uniquement
  // côté client, éliminant tout mismatch d'hydratation.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const reduced = useReducedMotion()
  const responsive = useResponsive()
  const { mobile, tablet, px, sectionPad, width } = responsive

  const [heroIndex, setHeroIndex] = useState(0)
  const [heroPaused, setHeroPaused] = useState(false)

  const heroSlides = useMemo(
    () => [
      { title: "Just", subtitle: "qu'un groupe" },
      { title: "Just Impact", subtitle: "qu'une agence d'influence" },
      { title: "Just Prod", subtitle: "qu'une agence de production" },
      { title: "Just Agency", subtitle: "qu'une conciergerie" },
    ],
    []
  )

  useEffect(() => {
    if (reduced || heroPaused) return

    const interval = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [heroPaused, heroSlides.length, reduced])

  const galleryImages: GalleryImage[] = useMemo(
    () => [
      {
        src: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/justagency-just.jpg",
        label: "L'équipe",
        caption: "Just Life",
      },
      {
        src: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/justagency-events.jpg",
        label: "Événements",
        caption: "Just Events",
      },
      {
        src: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/justagency-justprod2.jpg",
        label: "En tournage",
        caption: "Just Prod",
      },
      {
        src: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/justagency-justindustries.jpg",
        label: "Backstage",
        caption: "Behind the scenes",
      },
      {
        src: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/justagency-talents.jpg",
        label: "Créateurs",
        caption: "Just Impact",
      },
      {
        src: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/justagency-voyage.jpg",
        label: "Voyages",
        caption: "Just Agency",
      },
    ],
    []
  )

  const parse = useCallback(
    (s: string) =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    []
  )

  const heroFontPx1 = fluidPx(width, mobile ? 42 : 56, 120)
  const heroFontPx2 = fluidPx(width, mobile ? 42 : 56, 120)
  const heroFontPx3 = fluidPx(width, mobile ? 28 : 36, 92)
  const heroLineHeight = 0.92
  const heroPad = mobile
    ? "100px 20px 72px"
    : tablet
      ? "120px 40px 88px"
      : "120px 72px 96px"

  const heroRotatingBase: CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 800,
    lineHeight: heroLineHeight,
    letterSpacing: mobile ? -2 : -4,
    position: "absolute",
    inset: 0,
    overflowWrap: "break-word",
    wordBreak: "break-word",
    maxWidth: "100%",
    display: "block",
  }

  const rotatingSlot = (fontPx: number): CSSProperties => ({
    position: "relative",
    width: "100%",
    minHeight: Math.ceil(fontPx * heroLineHeight + 12),
    overflow: "hidden",
  })

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
  const [liveMsg, setLiveMsg] = useState("")

  const entityList = ["Just Impact", "Just Prod", "Just Agency", "Just 4 You"]

  const nameId = useId()
  const emailId = useId()
  const phoneId = useId()
  const companyId = useId()
  const messageId = useId()

  const sectionTitleId = useId()
  const sectionDescId = useId()
  const successTitleId = useId()

  const updateField = useCallback(
    (field: keyof ContactFormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }

      if (status === "error") {
        setStatus("idle")
        setLiveMsg("")
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
    setLiveMsg("")
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      const nextErrors = validateForm()
      setErrors(nextErrors)

      if (Object.keys(nextErrors).length > 0) {
        setStatus("error")
        setLiveMsg("Le formulaire contient des erreurs.")
        return
      }

      if (!WEB3FORMS_ACCESS_KEY) {
        setStatus("error")
        setLiveMsg(
          "La clé du formulaire est absente. Vérifiez votre fichier .env.local."
        )
        return
      }

      setStatus("sending")
      setLiveMsg("Envoi en cours.")

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

        const data: { success?: boolean; message?: string } = await res.json()

        if (res.ok && data?.success) {
          setStatus("success")
          setLiveMsg("Message envoyé.")
        } else {
          setStatus("error")
          setLiveMsg(data?.message || "Une erreur est survenue.")
        }
      } catch {
        setStatus("error")
        setLiveMsg("Une erreur est survenue.")
      }
    },
    [formData, validateForm]
  )

  const isSubmitDisabled =
    status === "sending" ||
    !formData.name.trim() ||
    !formData.email.trim() ||
    !formData.message.trim()

  const marqueeSize = mobile ? 44 : tablet ? 56 : 72

  // ─── Placeholder SSR : fond noir, pas de contenu interactif ───
  // Évite tout mismatch entre le HTML serveur et le rendu client.
  if (!mounted) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "#000",
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        background: "#000",
        color: "#c8c8c8",
        fontFamily: BODY,
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
        position: "relative",
      }}
    >
      <style>{`
        .jm2-contact-root input::placeholder,
        .jm2-contact-root textarea::placeholder {
          color: ${JC.placeholder};
        }

        .jm2-contact-root input:-webkit-autofill,
        .jm2-contact-root textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #000 inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff !important;
        }

        @media (max-width: 980px) {
          .jm2-contact-grid {
            grid-template-columns: 1fr !important;
            gap: 56px !important;
          }

          .jm2-contact-two-cols {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }

          .jm2-contact-sticky {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>

      <header>
        <section
          aria-label="Présentation Just Group"
          style={{
            minHeight: mobile ? "auto" : "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: heroPad,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              ...S.overlay,
              backgroundImage: `radial-gradient(${white(0.02)} 1px, transparent 1px)`,
              backgroundSize: mobile ? "28px 28px" : "40px 40px",
            }}
          />

          <motion.p
            initial={mo(reduced, { opacity: 0 }, { opacity: 1 })}
            animate={{ opacity: 1 }}
            transition={tr(reduced, 1, 0.2)}
            style={{
              ...S.label,
              fontSize: mobile ? 9 : 10,
              color: white(OP.tag),
              marginBottom: mobile ? 28 : 48,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <motion.span
              aria-hidden="true"
              animate={
                reduced
                  ? undefined
                  : {
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.8, 0.3],
                    }
              }
              transition={reduced ? {} : { duration: 2.5, repeat: Infinity }}
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#fff",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            Paris · Influence · Production · Conciergerie
          </motion.p>

          <div
            style={{
              maxWidth: Math.min(1180, width - px * 2),
              width: "100%",
              minWidth: 0,
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <h1 style={{ margin: 0, padding: 0, minWidth: 0 }}>
              <div style={rotatingSlot(heroFontPx1)}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={heroSlides[heroIndex].title}
                    initial={mo(reduced, { opacity: 0, y: 40 }, { opacity: 1, y: 0 })}
                    animate={{ opacity: 1, y: 0 }}
                    exit={mo(reduced, { opacity: 0, y: -40 }, { opacity: 1, y: 0 })}
                    transition={tr(reduced, 0.6)}
                    style={{
                      ...heroRotatingBase,
                      fontSize: `${heroFontPx1}px`,
                      color: "#fff",
                    }}
                  >
                    {heroSlides[heroIndex].title}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.span
                initial={mo(reduced, { opacity: 0, y: 40 }, { opacity: 1, y: 0 })}
                animate={{ opacity: 1, y: 0 }}
                transition={tr(reduced, 0.6, 0.2)}
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: `${heroFontPx2}px`,
                  lineHeight: heroLineHeight,
                  color: white(0.15),
                  letterSpacing: mobile ? -2 : -4,
                  display: "block",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  maxWidth: "100%",
                }}
              >
                c&apos;est bien plus
              </motion.span>

              <div style={rotatingSlot(heroFontPx3)}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={heroSlides[heroIndex].subtitle}
                    initial={mo(reduced, { opacity: 0, y: 40 }, { opacity: 1, y: 0 })}
                    animate={{ opacity: 1, y: 0 }}
                    exit={mo(reduced, { opacity: 0, y: -40 }, { opacity: 1, y: 0 })}
                    transition={tr(reduced, 0.6)}
                    style={{
                      ...heroRotatingBase,
                      fontSize: `${heroFontPx3}px`,
                      fontWeight: 300,
                      fontStyle: "italic",
                      color: white(0.12),
                      letterSpacing: mobile ? -1 : -2,
                    }}
                  >
                    {heroSlides[heroIndex].subtitle}
                  </motion.span>
                </AnimatePresence>
              </div>
            </h1>
          </div>

          <motion.p
            initial={mo(reduced, { opacity: 0, y: 30 }, { opacity: 1, y: 0 })}
            animate={{ opacity: 1, y: 0 }}
            transition={tr(reduced, 0.8, 0.8)}
            style={{
              marginTop: mobile ? 24 : 34,
              fontSize: mobile ? 15 : 16,
              lineHeight: 1.9,
              maxWidth: mobile ? "100%" : 500,
              color: white(OP.heroDesc),
              fontWeight: 300,
              minWidth: 0,
              overflowWrap: "break-word",
            }}
          >
            Un écosystème créatif qui unit influence, production et
            conciergerie de luxe. Trois entités, une seule vision : créer
            l&apos;extraordinaire.
          </motion.p>

          <motion.button
            onClick={() => setHeroPaused((p) => !p)}
            aria-label={
              heroPaused ? "Reprendre le défilement" : "Pause le défilement"
            }
            initial={mo(reduced, { opacity: 0 }, { opacity: 1 })}
            animate={{ opacity: 1 }}
            transition={reduced ? {} : { delay: 1.5 }}
            whileHover={reduced ? undefined : { scale: 1.1 }}
            whileTap={reduced ? undefined : { scale: 0.95 }}
            style={{
              position: "absolute",
              bottom: mobile ? 20 : 40,
              right: px,
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: `1px solid ${white(0.15)}`,
              background: white(0.03),
              color: white(0.6),
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              zIndex: 2,
              flexShrink: 0,
            }}
          >
            {heroPaused ? ICONS.play : ICONS.pause}
          </motion.button>

          {!mobile && (
            <motion.div
              aria-hidden="true"
              initial={mo(reduced, { opacity: 0 }, { opacity: 1 })}
              animate={{ opacity: 1 }}
              transition={reduced ? {} : { delay: 1.5 }}
              style={{
                position: "absolute",
                bottom: 40,
                left: px,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <motion.div
                animate={reduced ? undefined : { y: [0, 8, 0] }}
                transition={
                  reduced
                    ? {}
                    : { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }
                style={{
                  width: 1,
                  height: 40,
                  background: `linear-gradient(to bottom,${white(0.5)},transparent)`,
                }}
              />
              <span
                style={{
                  ...S.label,
                  fontSize: 9,
                  letterSpacing: 4,
                  marginBottom: 0,
                }}
              >
                Scroll
              </span>
            </motion.div>
          )}
        </section>
      </header>

      <div style={{ minWidth: 0 }}>
        <Marquee
          items={[
            "Just",
            "Just Impact",
            "Just Prod",
            "Just Agency",
            "Influence",
            "Production",
            "Conciergerie",
            "Luxe",
          ]}
          speed={40}
          fontSize={marqueeSize}
        />

        <Entity
          number="01"
          name="Just Impact"
          tagline="Agence d'influence"
          description="JUST IMPACT connecte les marques aux voix qui comptent. Stratégie data-driven, créateurs triés sur le volet, exécution sans faille."
          services={parse(
            "Influence Marketing, Casting Créateurs, Social Media, Brand Content, KPI & Reporting"
          )}
          imageUrl="https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/justagency-tennis.jpg"
          responsive={responsive}
        />

        <Entity
          number="02"
          name="Just Prod"
          tagline="Studio de production"
          description="JUST PROD donne vie à vos idées. Du concept créatif au livrable final, on produit du contenu qui performe."
          services={parse(
            "Direction Artistique, Réalisation Vidéo, Photo, Post-Production, Motion Design"
          )}
          imageUrl="https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/justagency-justprod.jpg"
          reverse
          responsive={responsive}
        />

        <Entity
          number="03"
          name="Just Agency"
          tagline="Conciergerie de luxe"
          description="JUST AGENCY orchestre l&apos;exceptionnel. Biens de luxe, jets privés, yachts — l&apos;impossible n&apos;est qu&apos;une question de temps."
          services={parse(
            "Conciergerie Privée, Biens de Luxe, Véhicules, Jets Privés, Yachts"
          )}
          imageUrl="https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/justagency-justagency.jpg"
          responsive={responsive}
        />

        <div style={{ padding: mobile ? "24px 0" : "40px 0" }}>
          <Marquee
            items={[
              "Authenticité",
              "Précision",
              "Audace",
              "Impact",
              "Excellence",
              "Créativité",
            ]}
            speed={30}
            fontSize={mobile ? 36 : tablet ? 48 : marqueeSize}
          />
        </div>

        <section
          aria-label="Chiffres clés"
          style={{ padding: sectionPad, position: "relative" }}
        >
          <div
            aria-hidden="true"
            style={{
              ...S.overlay,
              background:
                "radial-gradient(ellipse at center,rgba(255,255,255,0.02) 0%,transparent 70%)",
            }}
          />
          <Reveal>
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: gridCols(mobile, tablet, 4, 2, 2),
                gap: mobile ? 28 : 48,
                minWidth: 0,
              }}
            >
              <Counter value="200+" label="Campagnes livrées" delay={0} />
              <Counter value="80+" label="Créateurs managés" delay={0.1} />
              <Counter value="50M+" label="Reach mensuel" delay={0.2} />
              <Counter value="98%" label="Taux de satisfaction" delay={0.3} />
            </div>
          </Reveal>
        </section>

        <section
          aria-label="Manifesto"
          style={{ padding: sectionPad, display: "flex", justifyContent: "center" }}
        >
          <Reveal>
            <div style={{ maxWidth: 800, textAlign: "center", minWidth: 0 }}>
              <h2 style={S.label}>Manifesto</h2>
              <blockquote
                style={{
                  fontFamily: DISPLAY,
                  fontSize: mobile ? "28px" : "clamp(22px,3.5vw,42px)",
                  fontWeight: 300,
                  lineHeight: 1.45,
                  color: white(OP.quote),
                  margin: 0,
                  letterSpacing: -1,
                  fontStyle: "italic",
                  overflowWrap: "break-word",
                }}
              >
                &laquo;&nbsp;On ne fait pas du bruit. On crée de l&apos;impact.&nbsp;&raquo;
              </blockquote>

              <motion.div
                aria-hidden="true"
                initial={mo(reduced, { width: 0 }, { width: 60 })}
                whileInView={mo(reduced, { width: 60 }, { width: 60 })}
                viewport={{ once: true }}
                transition={tr(reduced, 1, 0.3)}
                style={{
                  height: 2,
                  width: reduced ? 60 : 0,
                  background: white(0.15),
                  margin: "36px auto 0",
                }}
              />
            </div>
          </Reveal>
        </section>

        <section aria-label="Galerie photo" style={{ padding: "60px 0" }}>
          <div style={{ padding: `0 ${px}px`, marginBottom: 40 }}>
            <SectionHeader label="Inside Just" title="Dans les coulisses" />
          </div>
          <AutoGallery images={galleryImages} speed={45} responsive={responsive} />
        </section>

        <section aria-label="Nos valeurs" style={{ padding: sectionPad }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", minWidth: 0 }}>
            <SectionHeader
              label="Ce qui nous définit"
              title="Nos valeurs"
              titleSize="clamp(30px,4.5vw,58px)"
            />

            {/* FIX: structure ul > li correcte, Reveal à l'intérieur du li */}
            <ul
              style={{
                display: "grid",
                gridTemplateColumns: gridCols(mobile, tablet, 4),
                gap: 1,
                borderRadius: 20,
                overflow: "hidden",
                listStyle: "none",
                padding: 0,
                margin: "48px 0 0",
                minWidth: 0,
              }}
            >
              {VALUES.map((v, i) => (
                <li key={v.n} style={{ minWidth: 0 }}>
                  <Reveal delay={i * 0.06}>
                    <motion.div
                      whileHover={reduced ? undefined : { backgroundColor: white(0.03) }}
                      transition={{ duration: 0.3 }}
                      style={{
                        background: white(0.01),
                        padding: mobile ? "40px 20px" : "56px 24px",
                        textAlign: "center",
                        cursor: "default",
                        borderTop: `1px solid ${white(0.04)}`,
                        minHeight: mobile ? 180 : 220,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 0,
                      }}
                    >
                      <div aria-hidden="true" style={S.ghost(mobile ? 40 : 56)}>
                        {v.n}
                      </div>
                      <h3
                        style={{
                          fontFamily: DISPLAY,
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#fff",
                          marginBottom: 10,
                          marginTop: 16,
                          overflowWrap: "break-word",
                        }}
                      >
                        {v.t}
                      </h3>
                      <p
                        style={{
                          fontSize: 12,
                          color: white(OP.desc),
                          lineHeight: 1.7,
                          margin: 0,
                          fontWeight: 300,
                          maxWidth: 220,
                          overflowWrap: "break-word",
                        }}
                      >
                        {v.d}
                      </p>
                    </motion.div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="jm2-contact-root"
          aria-labelledby={sectionTitleId}
          aria-describedby={sectionDescId}
          style={{
            padding: mobile
              ? "80px 20px 100px"
              : tablet
                ? "100px 40px 120px"
                : "110px 72px 140px",
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
            {liveMsg}
          </div>

          <div
            aria-hidden="true"
            style={{
              ...S.overlay,
              background:
                "radial-gradient(ellipse at center top,rgba(255,255,255,0.03) 0%,transparent 65%)",
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
              <div style={{ marginBottom: mobile ? 48 : 72 }}>
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
                      reduced
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
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 800,
                    fontSize: mobile
                      ? "clamp(40px,12vw,58px)"
                      : "clamp(56px,8vw,110px)",
                    lineHeight: 0.92,
                    color: "#ffffff",
                    margin: 0,
                    letterSpacing: mobile ? -2 : -5,
                  }}
                >
                  <span style={{ display: "block" }}>Parlons</span>
                  <span
                    style={{
                      display: "block",
                      fontWeight: 300,
                      fontStyle: "italic",
                      color: white(0.88),
                      letterSpacing: mobile ? -1 : -3,
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
                  Influence, production, conciergerie ou média, quelle que soit
                  votre ambition, on a l&apos;entité et l&apos;expertise
                  qu&apos;il vous faut. Remplissez le formulaire, on revient vers
                  vous sous 24h.
                </p>
              </div>
            </Reveal>

            <div
              className="jm2-contact-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) minmax(280px,0.42fr)",
                gap: mobile ? 56 : 88,
                alignItems: "start",
              }}
            >
              <Reveal>
                <div>
                  {status === "success" ? (
                    <motion.section
                      aria-labelledby={successTitleId}
                      initial={reduced ? false : { opacity: 0, y: 24 }}
                      animate={reduced ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.7, ease: EASE }}
                      style={{
                        textAlign: "center",
                        padding: mobile ? "56px 24px" : "80px 40px",
                        background: JC.surface,
                        border: `1px solid ${JC.border}`,
                        borderRadius: 24,
                      }}
                    >
                      <motion.div
                        initial={reduced ? false : { scale: 0.85, opacity: 0 }}
                        animate={reduced ? undefined : { scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.12,
                          ease: EASE,
                        }}
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
                        Merci pour votre intérêt. Notre équipe revient vers vous
                        sous 24h.
                      </p>

                      <motion.button
                        type="button"
                        onClick={resetForm}
                        whileHover={reduced ? undefined : { opacity: 0.85 }}
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
                        id={sectionTitleId}
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
                        id={sectionDescId}
                        style={{
                          margin: "0 0 52px",
                          fontFamily: BODY,
                          fontSize: 15,
                          lineHeight: 1.8,
                          color: white(OP.desc),
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
                            className="jm2-contact-two-cols"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 44,
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
                            className="jm2-contact-two-cols"
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 44,
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
                                  background: JC.errorBg,
                                  border: `1px solid ${JC.errorBorder}`,
                                  fontFamily: BODY,
                                  fontSize: 14,
                                  color: JC.error,
                                  fontWeight: 400,
                                  lineHeight: 1.7,
                                }}
                              >
                                <strong>Une erreur est survenue.</strong>{" "}
                                {liveMsg && liveMsg !== "Une erreur est survenue."
                                  ? liveMsg
                                  : "Veuillez réessayer ou nous contacter directement."}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <motion.button
                            type="submit"
                            disabled={isSubmitDisabled}
                            aria-disabled={isSubmitDisabled}
                            whileHover={
                              !isSubmitDisabled && !reduced
                                ? { y: -2, backgroundColor: "#ffffff", color: "#000000" }
                                : undefined
                            }
                            whileTap={
                              !isSubmitDisabled && !reduced
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
                                ? "rgba(255,255,255,0.25)"
                                : "#ffffff",
                              fontFamily: DISPLAY,
                              fontWeight: 700,
                              fontSize: 13,
                              letterSpacing: 4,
                              textTransform: "uppercase",
                              border: `1px solid ${
                                isSubmitDisabled
                                  ? "rgba(255,255,255,0.12)"
                                  : "#ffffff"
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
                  className="jm2-contact-sticky"
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
                        reduced
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
                      padding: mobile ? "24px" : "28px",
                      borderRadius: 20,
                      background: white(0.02),
                      border: `1px solid ${white(0.08)}`,
                    }}
                  >
                    <p
                      style={{
                        ...S.label,
                        marginBottom: 16,
                        color: white(OP.tag),
                      }}
                    >
                      Note
                    </p>
                    <blockquote
                      style={{
                        margin: 0,
                        fontFamily: DISPLAY,
                        fontSize: mobile ? 22 : 28,
                        fontWeight: 300,
                        lineHeight: 1.5,
                        color: white(OP.quote),
                        fontStyle: "italic",
                        letterSpacing: -0.8,
                      }}
                    >
                      &quot;Chaque projet commence par une conversation. La vôtre commence ici.&quot;
                    </blockquote>
                  </div>
                </aside>
              </Reveal>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}