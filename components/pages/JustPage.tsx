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

type WindowSnapshot = {
  width: number
  height: number
}

const DEFAULT_WINDOW_SNAPSHOT: WindowSnapshot = {
  width: 1280,
  height: 900,
}

let lastWindowSnapshot: WindowSnapshot = DEFAULT_WINDOW_SNAPSHOT

function subscribeWindow(callback: () => void) {
  if (typeof window === "undefined") return () => {}

  window.addEventListener("resize", callback)
  return () => window.removeEventListener("resize", callback)
}

function getWindowSnapshot(): WindowSnapshot {
  if (typeof window === "undefined") {
    return DEFAULT_WINDOW_SNAPSHOT
  }

  const width = Math.max(320, window.innerWidth || 1280)
  const height = Math.max(1, window.innerHeight || 900)

  if (
    lastWindowSnapshot.width === width &&
    lastWindowSnapshot.height === height
  ) {
    return lastWindowSnapshot
  }

  lastWindowSnapshot = { width, height }
  return lastWindowSnapshot
}

function getWindowServerSnapshot(): WindowSnapshot {
  return DEFAULT_WINDOW_SNAPSHOT
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