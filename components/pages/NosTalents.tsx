// components/NosTalents.tsx
"use client"

import * as React from "react"
import { useState, useEffect, useRef, useCallback, useId, useMemo } from "react"
import {
    motion,
    AnimatePresence,
    useInView,
    useReducedMotion,
} from "framer-motion"

// ══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION PARTAGÉE
// ══════════════════════════════════════════════════════════════════════════════

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const NUMERIC = "'Satoshi', 'Inter', 'Segoe UI', Arial, sans-serif"
const ROOMS_ANCHOR_ID = "just-rooms-container"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

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
} as const

const JC = {
    bg: "#000000",
    text: "#ffffff",
    border: "rgba(255,255,255,0.16)",
    borderStrong: "rgba(255,255,255,0.3)",
    borderFocus: "#ffffff",
    surface: "rgba(255,255,255,0.03)",
    error: "#ef4444",
    errorBg: "rgba(239,68,68,0.08)",
    errorBorder: "rgba(239,68,68,0.24)",
    success: "#22c55e",
    placeholder: "rgba(255,255,255,0.28)",
    muted: "rgba(255,255,255,0.65)",
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

const white = (opacity: number) => `rgba(255,255,255,${opacity})`

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function cxErrorId(id: string) {
    return `${id}-error`
}

function cxHintId(id: string) {
    return `${id}-hint`
}

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

// ══════════════════════════════════════════════════════════════════════════════
// FONTS
// ══════════════════════════════════════════════════════════════════════════════

let _fontsLoaded = false
function loadFonts() {
    if (_fontsLoaded || typeof document === "undefined") return
    _fontsLoaded = true
    if (document.getElementById("just-merged-fonts")) return

    const l = document.createElement("link")
    l.id = "just-merged-fonts"
    l.rel = "stylesheet"
    l.href =
        "https://fonts.googleapis.com/css2?family=Syne:wght@300;400;500;600;700;800&family=Outfit:wght@200;300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,200;1,300&family=DM+Mono:wght@300;400&display=swap"
    document.head.appendChild(l)

    if (!document.getElementById("just-merged-numeric-fonts")) {
        const l2 = document.createElement("link")
        l2.id = "just-merged-numeric-fonts"
        l2.rel = "stylesheet"
        l2.href =
            "https://api.fontshare.com/v2/css?f[]=satoshi@700,800,900&display=swap"
        document.head.appendChild(l2)
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ══════════════════════════════════════════════════════════════════════════════

function useGlobalStyles() {
    useEffect(() => {
        loadFonts()

        if (document.getElementById("just-merged-styles")) return
        const style = document.createElement("style")
        style.id = "just-merged-styles"
        style.innerHTML = `
            .just-merged-root,
            .just-merged-root * {
                box-sizing: border-box;
            }

            .just-merged-root {
                color-scheme: dark;
                width: 100%;
                min-width: 0;
            }

            .just-merged-root main,
            .just-merged-root section,
            .just-merged-root div,
            .just-merged-root article,
            .just-merged-root p,
            .just-merged-root h1,
            .just-merged-root h2,
            .just-merged-root h3,
            .just-merged-root ul,
            .just-merged-root li,
            .just-merged-root blockquote {
                min-width: 0;
            }

            .just-merged-root img {
                max-width: 100%;
                display: block;
            }

            .just-merged-root a,
            .just-merged-root button {
                -webkit-tap-highlight-color: transparent;
            }

            .just-merged-root a:focus-visible,
            .just-merged-root button:focus-visible {
                outline: 2px solid ${COLORS.focus};
                outline-offset: 3px;
                box-shadow: 0 0 0 4px rgba(255,255,255,0.14);
            }

            .just-merged-root .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }

            .just-merged-root .jm-link-overlay {
                position: absolute;
                inset: 0;
                z-index: 5;
                border-radius: inherit;
            }

            .just-merged-root .jm-section-inner {
                width: 100%;
                max-width: 1200px;
                margin-left: auto;
                margin-right: auto;
            }

            .just-merged-root .jm-center-wrap {
                width: 100%;
                display: flex;
                justify-content: center;
            }

            .just-merged-root .jm-cards-grid > *,
            .just-merged-root .jm-values-grid > *,
            .just-merged-root .jm-stats-grid > * {
                min-width: 0;
            }

            .jm2-contact-root input::placeholder,
            .jm2-contact-root textarea::placeholder {
                color: ${JC.placeholder};
            }

            .jm2-contact-root input:-webkit-autofill,
            .jm2-contact-root input:-webkit-autofill:hover,
            .jm2-contact-root input:-webkit-autofill:focus,
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

            @media (max-width: 640px) {
                .jm2-contact-root .jm2-contact-pad {
                    padding-left: 20px !important;
                    padding-right: 20px !important;
                }
            }

            @media (max-width: 1279px) {
                .just-merged-root .jm-section {
                    padding-left: 48px !important;
                    padding-right: 48px !important;
                }
                .just-merged-root .jm-hero-scroll {
                    left: 48px !important;
                }
                .just-merged-root .jm-cards-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
                .just-merged-root .jm-values-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                }
                .just-merged-root .jm-stats-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    gap: 32px !important;
                }
            }

            @media (max-width: 767px) {
                .just-merged-root .jm-section {
                    padding-left: 20px !important;
                    padding-right: 20px !important;
                }
                .just-merged-root .jm-hero {
                    min-height: auto !important;
                    padding-top: 72px !important;
                    padding-bottom: 72px !important;
                }
                .just-merged-root .jm-hero-tagline {
                    gap: 8px !important;
                    margin-bottom: 28px !important;
                    letter-spacing: 2.5px !important;
                    line-height: 1.5 !important;
                    flex-wrap: wrap !important;
                }
                .just-merged-root .jm-hero-title {
                    letter-spacing: -2px !important;
                    line-height: 0.98 !important;
                }
                .just-merged-root .jm-hero-desc {
                    margin-top: 24px !important;
                    font-size: 14px !important;
                    line-height: 1.8 !important;
                }
                .just-merged-root .jm-stats-grid,
                .just-merged-root .jm-cards-grid,
                .just-merged-root .jm-values-grid {
                    grid-template-columns: minmax(0, 1fr) !important;
                }
                .just-merged-root .jm-stats-grid {
                    gap: 24px !important;
                }
                .just-merged-root .jm-filter-wrap {
                    margin-bottom: 32px !important;
                }
                .just-merged-root .jm-card-body {
                    padding: 18px 18px 22px !important;
                }
                .just-merged-root .jm-card-number {
                    top: 12px !important;
                    left: 14px !important;
                    font-size: 22px !important;
                }
                .just-merged-root .jm-card-views {
                    top: 12px !important;
                    right: 12px !important;
                    padding: 5px 10px !important;
                }
                .just-merged-root .jm-footer {
                    flex-direction: column !important;
                    align-items: flex-start !important;
                    gap: 12px !important;
                }
                .just-merged-root .jm-hero-scroll {
                    display: none !important;
                }
                .just-merged-root .jm-marquee-item {
                    letter-spacing: -1px !important;
                }
            }

            @media (max-width: 479px) {
                .just-merged-root .jm-section {
                    padding-left: 16px !important;
                    padding-right: 16px !important;
                }
                .just-merged-root .jm-filter-pill {
                    padding: 9px 14px !important;
                    font-size: 10px !important;
                    letter-spacing: 1.4px !important;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                .just-merged-root *,
                .just-merged-root *::before,
                .just-merged-root *::after {
                    scroll-behavior: auto !important;
                }
            }
        `
        document.head.appendChild(style)
    }, [])
}

// ══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ══════════════════════════════════════════════════════════════════════════════

function useBreakpoint() {
    const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">(() => {
        if (typeof window === "undefined") return "desktop"
        const w = window.innerWidth
        return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop"
    })

    useEffect(() => {
        let raf = 0
        const check = () => {
            if (raf) return
            raf = requestAnimationFrame(() => {
                raf = 0
                const w = window.innerWidth
                const next =
                    w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop"
                setBp((prev) => (prev === next ? prev : next))
            })
        }
        window.addEventListener("resize", check)
        return () => {
            window.removeEventListener("resize", check)
            cancelAnimationFrame(raf)
        }
    }, [])

    return bp
}

// ══════════════════════════════════════════════════════════════════════════════
// UTILITAIRES
// ══════════════════════════════════════════════════════════════════════════════

function sanitizeText(value: unknown): string {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
}

function safeHref(value: unknown): string {
    const href = sanitizeText(value)
    if (!href || href === "#") return ""
    if (/^\s*javascript:/i.test(href)) return ""
    return href
}

function safeImageSrc(value: unknown): string {
    const src = sanitizeText(value)
    if (!src) return ""
    if (/^\s*javascript:/i.test(src)) return ""
    return src
}

function isExternalUrl(href: string): boolean {
    return /^(https?:)?\/\//i.test(href)
}

function getMotionProps(
    reducedMotion: boolean | null,
    inView = true,
    initialY = 30,
    duration = 0.7,
    delay = 0
) {
    if (reducedMotion) {
        return {
            initial: { opacity: 1, y: 0 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0 },
        }
    }
    return {
        initial: { opacity: 0, y: initialY },
        animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: initialY },
        transition: { duration, delay, ease: EASE },
    }
}

function parseCountValue(raw: string): { numeric: number; suffix: string } {
    const value = sanitizeText(raw)
    const numeric = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0
    const suffix = value.replace(/[0-9]/g, "")
    return { numeric, suffix }
}

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

type Follower = { platform: string; count: string }

type Talent = {
    imageUrl: string
    name: string
    handle: string
    categories: string[]
    followers: Follower[]
    views: string
    bio: string
    number: string
    link: string
}

// ══════════════════════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS RÉUTILISABLES
// ══════════════════════════════════════════════════════════════════════════════

function Reveal({
    children,
    delay = 0,
}: {
    children: React.ReactNode
    delay?: number
}) {
    const ref = useRef<HTMLDivElement | null>(null)
    const inView = useInView(ref, { once: true, margin: "-60px" })
    const reducedMotion = useReducedMotion()

    return (
        <motion.div
            ref={ref}
            {...getMotionProps(reducedMotion, inView, 40, 0.8, delay)}
            style={{ width: "100%", minWidth: 0 }}
        >
            {children}
        </motion.div>
    )
}

function Marquee({
    items,
    speed = 35,
    label = "Liste défilante",
}: {
    items: string[]
    speed?: number
    label?: string
}) {
    const reducedMotion = useReducedMotion()
    const visibleItems = items.map(sanitizeText).filter(Boolean)
    const tripled = [...visibleItems, ...visibleItems, ...visibleItems]

    if (visibleItems.length === 0) return null

    return (
        <div
            role="region"
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
                animate={
                    reducedMotion ? { x: "0%" } : { x: ["0%", "-33.333%"] }
                }
                transition={
                    reducedMotion
                        ? { duration: 0 }
                        : { duration: speed, repeat: Infinity, ease: "linear" }
                }
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
                            className="jm-marquee-item"
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
        let raf = 0
        const timer = window.setTimeout(() => {
            const duration = 2200
            const start = performance.now()
            const animate = (now: number) => {
                const progress = Math.min((now - start) / duration, 1)
                const eased = 1 - Math.pow(1 - progress, 4)
                setCount(Math.floor(eased * numeric))
                if (progress < 1) raf = requestAnimationFrame(animate)
            }
            raf = requestAnimationFrame(animate)
        }, delay * 1000)
        return () => {
            window.clearTimeout(timer)
            if (raf) cancelAnimationFrame(raf)
        }
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

function PlatformIcon({
    platform,
    size = 14,
}: {
    platform: string
    size?: number
}) {
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

function TalentCard({
    imageUrl,
    name,
    handle,
    categories,
    followers,
    views,
    bio,
    number,
    link,
    delay = 0,
}: Talent & { delay?: number }) {
    const ref = useRef<HTMLElement | null>(null)
    const inView = useInView(ref, { once: true, margin: "-40px" })
    const [hovered, setHovered] = useState(false)
    const reducedMotion = useReducedMotion()
    const titleId = useId()
    const descId = useId()

    const safeName = sanitizeText(name) || "Talent"
    const safeHandle = sanitizeText(handle)
    const safeBio = sanitizeText(bio)
    const safeViews = sanitizeText(views)
    const safeNumber = sanitizeText(number)
    const safeImage = safeImageSrc(imageUrl)
    const href = safeHref(link)
    const hasLink = Boolean(href)
    const external = hasLink ? isExternalUrl(href) : false

    const filteredCategories = categories.map(sanitizeText).filter(Boolean)
    const filteredFollowers = followers.filter(
        (f) => sanitizeText(f.platform) || sanitizeText(f.count)
    )

    return (
        <motion.article
            ref={ref}
            {...getMotionProps(reducedMotion, inView, 40, 0.7, delay)}
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
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    aria-label={`Voir le profil de ${safeName}${external ? " (nouvel onglet)" : ""}`}
                    className="jm-link-overlay"
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
                    animate={
                        reducedMotion
                            ? { scale: 1.01 }
                            : { scale: hovered ? 1.04 : 1.01 }
                    }
                    transition={
                        reducedMotion
                            ? { duration: 0 }
                            : { duration: 0.6, ease: EASE }
                    }
                    style={{
                        width: "100%",
                        height: "100%",
                        transformOrigin: "center center",
                    }}
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
                                background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
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
                        className="jm-card-number"
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
                        className="jm-card-views"
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
                        <span aria-hidden="true" style={{ fontSize: 11 }}>
                            🔥
                        </span>
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
                        animate={
                            reducedMotion
                                ? { opacity: 1 }
                                : { opacity: hovered ? 1 : 0 }
                        }
                        transition={
                            reducedMotion ? { duration: 0 } : { duration: 0.3 }
                        }
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
                className="jm-card-body"
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

                {filteredCategories.length > 0 && (
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
                        {filteredCategories.map((cat, i) => (
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

                {filteredFollowers.length > 0 && (
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
                        {filteredFollowers.map((f, i) => {
                            const platform =
                                sanitizeText(f.platform) || "Plateforme"
                            const count = sanitizeText(f.count) || "N/A"
                            return (
                                <li
                                    key={`${platform}-${count}-${i}`}
                                    style={{ minWidth: 0, maxWidth: "100%" }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 5,
                                            padding: "6px 10px",
                                            borderRadius: 8,
                                            background:
                                                "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.06)",
                                            color: COLORS.textSoft,
                                            minWidth: 0,
                                            maxWidth: "100%",
                                        }}
                                    >
                                        <PlatformIcon
                                            platform={platform}
                                            size={12}
                                        />
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
                                            <span className="sr-only">
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
                            transform:
                                reducedMotion || !hovered
                                    ? "translateX(0)"
                                    : "translateX(4px)",
                            transition: reducedMotion
                                ? "none"
                                : "transform 0.3s ease, opacity 0.3s ease",
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

function FilterPill({
    label,
    active,
    onClick,
}: {
    label: string
    active: boolean
    onClick: () => void
}) {
    const reducedMotion = useReducedMotion()
    return (
        <motion.button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className="jm-filter-pill"
            whileHover={reducedMotion ? undefined : { scale: 1.04 }}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            animate={{
                background: active
                    ? "rgba(255,255,255,0.14)"
                    : "rgba(255,255,255,0.04)",
                borderColor: active
                    ? "rgba(255,255,255,0.22)"
                    : "rgba(255,255,255,0.08)",
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

// ══════════════════════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS DU FORMULAIRE DE CONTACT
// ══════════════════════════════════════════════════════════════════════════════

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

            {hint ? (
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
            ) : null}

            {error ? (
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
            ) : null}
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

            {hint ? (
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
            ) : null}

            {error ? (
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
            ) : null}
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
        <fieldset
            style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}
        >
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
                    const isActive = value === opt
                    return (
                        <motion.button
                            key={opt}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => onChange(isActive ? "" : opt)}
                            whileHover={
                                reducedMotion ? undefined : { scale: 1.02 }
                            }
                            whileTap={
                                reducedMotion ? undefined : { scale: 0.98 }
                            }
                            animate={{
                                background: isActive
                                    ? "#ffffff"
                                    : "transparent",
                                borderColor: isActive
                                    ? "#ffffff"
                                    : "rgba(255,255,255,0.18)",
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

function parseTalent(
    name: string,
    handle: string,
    imageUrl: string,
    cats: string,
    followersStr: string,
    views: string,
    bio: string,
    number: string,
    link: string
): Talent {
    const categories = sanitizeText(cats)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    const followers = sanitizeText(followersStr)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((entry) => {
            const parts = entry.split(":")
            const platform = sanitizeText(parts[0]) || "Plateforme"
            const count = sanitizeText(parts.slice(1).join(":")) || "N/A"
            return { platform, count }
        })
    return {
        name: sanitizeText(name),
        handle: sanitizeText(handle),
        imageUrl: safeImageSrc(imageUrl),
        categories,
        followers,
        views: sanitizeText(views),
        bio: sanitizeText(bio),
        number: sanitizeText(number),
        link: safeHref(link),
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export default function NosTalents() {
    useGlobalStyles()
    const reducedMotion = useReducedMotion()
    const resultCountId = useId()
    const bp = useBreakpoint()
    const isMobile = bp === "mobile"
    const isTablet = bp === "tablet"
    const isMobileOrTablet = isMobile || isTablet

    // ── Props par défaut (anciennement via addPropertyControls) ──
    const p = {
        activePage: "nav1",
        logoText: "JUST",
        contactLabel: "Nous contacter",
        contactUrl: "#contact",
        nav1Label: "Just",
        nav2Label: "Just Agency",
        nav3Label: "Just Prod",
        nav4Label: "Just Impact",
        nav5Label: "",
        nav6Label: "",
        nav1Mode: "room" as "room" | "page",
        nav2Mode: "room" as "room" | "page",
        nav3Mode: "room" as "room" | "page",
        nav4Mode: "room" as "room" | "page",
        nav5Mode: "room" as "room" | "page",
        nav6Mode: "room" as "room" | "page",
        nav1Room: 1,
        nav2Room: 2,
        nav3Room: 3,
        nav4Room: 4,
        nav5Room: 5,
        nav6Room: 6,
        nav1Url: "",
        nav2Url: "",
        nav3Url: "",
        nav4Url: "",
        nav5Url: "",
        nav6Url: "",
        scrollOffset: -80,
        homeUrl: "/",
        heroTagline: "Influence · Créativité · Authenticité · Résultats",
        heroTitle1: "Nos talents",
        heroTitle2: "font la différence.",
        heroDesc: "Un réseau de créateurs triés sur le volet, alignés avec vos valeurs. Des voix authentiques, des communautés engagées, des résultats mesurables, c'est la force de Just Impact.",
        stat1: "9+",
        stat1Label: "Créateurs & Artistes",
        stat2: "50M+",
        stat2Label: "Reach cumulé",
        stat3: "4.8%",
        stat3Label: "Engagement moyen",
        stat4: "200+",
        stat4Label: "Campagnes activées",
        t1Name: "Karim Lipton",
        t1Handle: "@karimlipton94",
        t1Image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-karimlipton.jpg",
        t1Cats: "Humour, Voyage, Lifestyle",
        t1Followers: "Instagram:1.4M, TikTok:650.7K, YouTube:100K",
        t1Views: "7.4M",
        t1Bio: "Créateur dynamique et authentique, reconnu pour son sens du divertissement.",
        t1Link: "/nos-talents/karim-lipton",
        t2Name: "Riles Freestyle",
        t2Handle: "@rilesfreestyle",
        t2Image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-riles.jpg",
        t2Cats: "Foot, Journalisme, Lifestyle",
        t2Followers: "Instagram:200.9K, TikTok:1.3M, YouTube:61.9K",
        t2Views: "139.1M",
        t2Bio: "Pro du foot freestyle. Partenaire PSG, Canal+ et SNCF.",
        t2Link: "/nos-talents/riles-freestyle",
        t3Name: "Moumlame",
        t3Handle: "@moumlame59",
        t3Image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-moumlame.jpg",
        t3Cats: "Musique, Lifestyle",
        t3Followers: "Instagram:604.8K, TikTok:732.7K, Snapchat:19K, YouTube:12.9K",
        t3Views: "7.9M",
        t3Bio: "Figure de la Team Nasdas. Spontanéité et authenticité de la nouvelle scène digitale.",
        t3Link: "/nos-talents/moumlame",
        t4Name: "Romain Benn",
        t4Handle: "@romain.benn",
        t4Image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-romainbenn.jpg",
        t4Cats: "Fitness, Lifestyle",
        t4Followers: "Instagram:144.2K, TikTok:703.1K, YouTube:185K",
        t4Views: "4.3M",
        t4Bio: "Vainqueur The Circle France. Ambassadeur Lifestyle & Fitness.",
        t4Link: "/nos-talents/romain-benn",
        t5Name: "Kimo DJZ",
        t5Handle: "@kimo_djz",
        t5Image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-kimodjz.jpg",
        t5Cats: "Voyage, Caméras Cachées, Lifestyle",
        t5Followers: "Instagram:170.8K, TikTok:86.3K, YouTube:22.7K",
        t5Views: "3.1M",
        t5Bio: "Bac+6 en marketing digital. Caméras cachées, voyage et actions humanitaires.",
        t5Link: "/nos-talents/kimo-djz",
        t6Name: "Inès HMZ",
        t6Handle: "@ines_hmz04",
        t6Image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-ineshmz.jpg",
        t6Cats: "Voyage, Lifestyle",
        t6Followers: "Instagram:160K, TikTok:34.6K, YouTube:14.6K",
        t6Views: "4.2M",
        t6Bio: "Figure montante du lifestyle et du voyage.",
        t6Link: "/nos-talents/ines-hmz",
        t7Name: "Naoil Kohlanta",
        t7Handle: "@naoil_kohlanta2k20",
        t7Image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-naoil.jpg",
        t7Cats: "Voyage, Boxe, Lifestyle",
        t7Followers: "Instagram:1.7K, TikTok:95.5K, YouTube:82.8K",
        t7Views: "1.6M",
        t7Bio: "Gagnante Koh-Lanta. Ancienne boxeuse pro, inspiration quotidienne.",
        t7Link: "/nos-talents/naoil-kohlanta",
        t8Name: "D.Chinois 93",
        t8Handle: "@d.chinois93",
        t8Image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-dchinois.jpg",
        t8Cats: "Humour, Lifestyle",
        t8Followers: "Instagram:150K, TikTok:3.1K",
        t8Views: "79.5K",
        t8Bio: "Humour spontané et style direct qui résonne avec une audience jeune.",
        t8Link: "/nos-talents/d-chinois-93",
        t9Name: "Just Mini",
        t9Handle: "@justminioff",
        t9Image: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-justmini.jpg",
        t9Cats: "Boxe, Lifestyle",
        t9Followers: "Instagram:40K, TikTok:19.4K, YouTube:38.7K",
        t9Views: "3.2M",
        t9Bio: "Créateur dynamique et boxeur engagé. Performance sportive et authenticité.",
        t9Link: "/nos-talents/just-mini",
        formHeroEyebrow: "Formulaire de contact",
        formEyebrow: "Formulaire",
        formTitle: "Dites-nous tout.",
        formDesc: "Les champs marqués d'un astérisque sont obligatoires.",
        formHeroTitle1: "Parlons",
        formHeroTitle2: "de votre projet.",
        formHeroDesc: "Influence, production, conciergerie ou média, quelle que soit votre ambition, on a l'entité et l'expertise qu'il vous faut. Remplissez le formulaire, on revient vers vous sous 24h.",
        formLabelName: "Nom complet",
        formLabelEmail: "Adresse email",
        formLabelPhone: "Téléphone",
        formLabelCompany: "Entreprise / Marque",
        formLabelMessage: "Votre message",
        formLabelEntity: "Entité",
        formEntityOptions: "Just Impact, Just Prod, Just Agency, Just 4 You",
        formSuccessTitle: "Message envoyé.",
        formSuccessDesc: "Merci pour votre intérêt. Notre équipe revient vers vous sous 24h.",
        formErrorTitle: "Une erreur est survenue.",
        formErrorDesc: "Veuillez réessayer ou nous contacter directement.",
        formManifesto: "Chaque projet commence par une conversation. La vôtre commence ici.",
        formResponseNote: "Réponse sous 24h",
        footerInstagram: "https://instagram.com/justgroup",
        footerTikTok: "https://tiktok.com/@justgroup",
        footerLinkedIn: "https://linkedin.com/company/justgroup",
        footerEmail: "contact@justgroup.fr",
    }

    const WEB3FORMS_ACCESS_KEY = "b891692e-8148-4785-856a-e1c43f4816dc"

    // ── État du formulaire de contact ──
    const [contactFormData, setContactFormData] =
        useState<ContactFormDataState>({
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

    const contactEntityList = useMemo(
        () =>
            p.formEntityOptions
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean),
        [p.formEntityOptions]
    )

    const contactNameId = useId()
    const contactEmailId = useId()
    const contactPhoneId = useId()
    const contactCompanyId = useId()
    const contactMessageId = useId()
    const contactSectionTitleId = useId()
    const contactSectionDescId = useId()
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
        if (!contactFormData.name.trim()) e.name = "Merci d'indiquer votre nom."
        if (!contactFormData.email.trim()) {
            e.email = "Merci d'indiquer votre adresse email."
        } else if (!isValidEmail(contactFormData.email)) {
            e.email = "L'adresse email semble invalide."
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
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()
            const nextErrors = validateContactForm()
            setContactErrors(nextErrors)
            if (Object.keys(nextErrors).length > 0) {
                setContactStatus("error")
                setContactLiveMessage("Le formulaire contient des erreurs.")
                return
            }
            setContactStatus("sending")
            setContactLiveMessage("Envoi du formulaire en cours.")
            try {
                const fd = new FormData()
                fd.append("access_key", WEB3FORMS_ACCESS_KEY)
                fd.append(
                    "subject",
                    `[JUST] Nouveau contact — ${contactFormData.entity || "Général"}`
                )
                fd.append("from_name", contactFormData.name)
                fd.append("name", contactFormData.name)
                fd.append("email", contactFormData.email)
                fd.append("phone", contactFormData.phone)
                fd.append("company", contactFormData.company)
                fd.append("entity", contactFormData.entity)
                fd.append("message", contactFormData.message)
                const res = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: fd,
                })
                const data = await res.json()
                if (res.ok && data?.success) {
                    setContactStatus("success")
                    setContactLiveMessage(p.formSuccessTitle)
                } else {
                    setContactStatus("error")
                    setContactLiveMessage(data?.message || p.formErrorTitle)
                }
            } catch (err) {
                setContactStatus("error")
                setContactLiveMessage(p.formErrorTitle)
            }
        },
        [contactFormData, p.formSuccessTitle, p.formErrorTitle, validateContactForm]
    )

    const isContactSubmitDisabled =
        contactStatus === "sending" ||
        !contactFormData.name.trim() ||
        !contactFormData.email.trim() ||
        !contactFormData.message.trim()

    // ── Items de navigation ──
    const allNavItems = useMemo(
        () =>
            [
                {
                    label: p.nav1Label,
                    page: "nav1",
                    mode: p.nav1Mode,
                    room: p.nav1Room,
                    url: p.nav1Url,
                },
                {
                    label: p.nav2Label,
                    page: "nav2",
                    mode: p.nav2Mode,
                    room: p.nav2Room,
                    url: p.nav2Url,
                },
                {
                    label: p.nav3Label,
                    page: "nav3",
                    mode: p.nav3Mode,
                    room: p.nav3Room,
                    url: p.nav3Url,
                },
                {
                    label: p.nav4Label,
                    page: "nav4",
                    mode: p.nav4Mode,
                    room: p.nav4Room,
                    url: p.nav4Url,
                },
                {
                    label: p.nav5Label,
                    page: "nav5",
                    mode: p.nav5Mode,
                    room: p.nav5Room,
                    url: p.nav5Url,
                },
                {
                    label: p.nav6Label,
                    page: "nav6",
                    mode: p.nav6Mode,
                    room: p.nav6Room,
                    url: p.nav6Url,
                },
            ].filter((item) => item.label && item.label.trim() !== ""),
        [p]
    )

    // ── État de navigation ──
    const [current, setCurrent] = useState(p.activePage)
    const [hovered, setHovered] = useState<string | null>(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const navRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<Record<string, HTMLElement | null>>({})

    useEffect(() => {
        setCurrent(p.activePage)
    }, [p.activePage])
    useEffect(() => {
        if (!isMobileOrTablet) setMenuOpen(false)
    }, [isMobileOrTablet])
    useEffect(() => {
        if (menuOpen) document.body.style.overflow = "hidden"
        else document.body.style.overflow = ""
        return () => {
            document.body.style.overflow = ""
        }
    }, [menuOpen])

    useEffect(() => {
        function handleRoomChanged(e: any) {
            const roomIndex = e.detail?.roomIndex
            if (roomIndex == null) return
            const match = allNavItems.find(
                (item) => item.mode === "room" && item.room === roomIndex + 1
            )
            if (match) setCurrent(match.page)
        }
        window.addEventListener("just-room-changed", handleRoomChanged)
        return () =>
            window.removeEventListener("just-room-changed", handleRoomChanged)
    }, [allNavItems])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const jump = params.get("jumpToRoom")
        if (jump == null) return
        const roomIndex = parseInt(jump, 10)
        if (isNaN(roomIndex) || roomIndex < 0) return
        params.delete("jumpToRoom")
        const clean = params.toString()
        window.history.replaceState(
            null,
            "",
            window.location.pathname +
                (clean ? `?${clean}` : "") +
                window.location.hash
        )
        const tryJump = (attempt: number) => {
            const el = document.getElementById(ROOMS_ANCHOR_ID)
            if (el) {
                window.dispatchEvent(
                    new CustomEvent("just-nav-change", {
                        detail: { roomIndex },
                    })
                )
                const match = allNavItems.find(
                    (item) =>
                        item.mode === "room" && item.room === roomIndex + 1
                )
                if (match) setCurrent(match.page)
                setTimeout(scrollToRooms, 100)
            } else if (attempt < 20) {
                setTimeout(() => tryJump(attempt + 1), 150)
            }
        }
        tryJump(0)
    }, [])

    const scrollToRooms = useCallback(() => {
        const el = document.getElementById(ROOMS_ANCHOR_ID)
        if (el) {
            const top =
                el.getBoundingClientRect().top +
                window.scrollY +
                (p.scrollOffset || 0)
            window.scrollTo({ top, behavior: "smooth" })
        }
    }, [p.scrollOffset])

    const handleClick = useCallback(
        (item: (typeof allNavItems)[0]) => {
            if (item.mode === "page" && item.url) {
                setMenuOpen(false)
                return
            }
            const roomsEl = document.getElementById(ROOMS_ANCHOR_ID)
            if (!roomsEl) {
                const sep = p.homeUrl.includes("?") ? "&" : "?"
                window.location.href = `${p.homeUrl}${sep}jumpToRoom=${item.room - 1}`
                return
            }
            setCurrent(item.page)
            setMenuOpen(false)
            window.dispatchEvent(
                new CustomEvent("just-nav-change", {
                    detail: { roomIndex: item.room - 1 },
                })
            )
            scrollToRooms()
        },
        [p.homeUrl, scrollToRooms]
    )

    const targetPage = hovered || current
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })

    useEffect(() => {
        if (isMobileOrTablet) return
        const update = () => {
            const el = itemRefs.current[targetPage]
            const nav = navRef.current
            if (!el || !nav) return
            const navRect = nav.getBoundingClientRect()
            const elRect = el.getBoundingClientRect()
            const rect = {
                left: elRect.left - navRect.left,
                width: elRect.width,
            }
            if (rect.width > 0) setPillStyle(rect)
        }
        const t = setTimeout(update, 50)
        window.addEventListener("resize", update)
        return () => {
            clearTimeout(t)
            window.removeEventListener("resize", update)
        }
    }, [targetPage, current, isMobileOrTablet])

    const mkStyle = (
        isActive: boolean,
        isHov: boolean
    ): React.CSSProperties => ({
        position: "relative",
        zIndex: 1,
        padding: "0 18px",
        height: 32,
        cursor: "pointer",
        fontFamily: BODY,
        fontSize: 11,
        fontWeight: isActive ? 600 : 400,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        color: isActive || isHov ? "#fff" : "rgba(255,255,255,0.7)",
        textShadow: isHov
            ? "0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.4)"
            : "none",
        transition: "color 0.3s ease, text-shadow 0.3s ease",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        userSelect: "none",
        textDecoration: "none",
        border: "none",
        background: "transparent",
    })

    const dot = (
        <span
            style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#ff3b3b",
                marginRight: 8,
                flexShrink: 0,
                boxShadow: "0 0 8px rgba(255,59,59,0.5)",
            }}
        />
    )

    const navHeight = isMobile ? 56 : 64

    // ── Données des talents ──
    const allTalents = useMemo(
        () =>
            [
                parseTalent(
                    p.t1Name,
                    p.t1Handle,
                    p.t1Image,
                    p.t1Cats,
                    p.t1Followers,
                    p.t1Views,
                    p.t1Bio,
                    "01",
                    p.t1Link
                ),
                parseTalent(
                    p.t2Name,
                    p.t2Handle,
                    p.t2Image,
                    p.t2Cats,
                    p.t2Followers,
                    p.t2Views,
                    p.t2Bio,
                    "02",
                    p.t2Link
                ),
                parseTalent(
                    p.t3Name,
                    p.t3Handle,
                    p.t3Image,
                    p.t3Cats,
                    p.t3Followers,
                    p.t3Views,
                    p.t3Bio,
                    "03",
                    p.t3Link
                ),
                parseTalent(
                    p.t4Name,
                    p.t4Handle,
                    p.t4Image,
                    p.t4Cats,
                    p.t4Followers,
                    p.t4Views,
                    p.t4Bio,
                    "04",
                    p.t4Link
                ),
                parseTalent(
                    p.t5Name,
                    p.t5Handle,
                    p.t5Image,
                    p.t5Cats,
                    p.t5Followers,
                    p.t5Views,
                    p.t5Bio,
                    "05",
                    p.t5Link
                ),
                parseTalent(
                    p.t6Name,
                    p.t6Handle,
                    p.t6Image,
                    p.t6Cats,
                    p.t6Followers,
                    p.t6Views,
                    p.t6Bio,
                    "06",
                    p.t6Link
                ),
                parseTalent(
                    p.t7Name,
                    p.t7Handle,
                    p.t7Image,
                    p.t7Cats,
                    p.t7Followers,
                    p.t7Views,
                    p.t7Bio,
                    "07",
                    p.t7Link
                ),
                parseTalent(
                    p.t8Name,
                    p.t8Handle,
                    p.t8Image,
                    p.t8Cats,
                    p.t8Followers,
                    p.t8Views,
                    p.t8Bio,
                    "08",
                    p.t8Link
                ),
                parseTalent(
                    p.t9Name,
                    p.t9Handle,
                    p.t9Image,
                    p.t9Cats,
                    p.t9Followers,
                    p.t9Views,
                    p.t9Bio,
                    "09",
                    p.t9Link
                ),
            ].filter((talent) => talent.name || talent.handle || talent.bio),
        [p]
    )

    const allCats = useMemo(
        () => Array.from(new Set(allTalents.flatMap((t) => t.categories))),
        [allTalents]
    )
    const filterOptions = useMemo(() => ["Tous", ...allCats], [allCats])
    const [activeFilter, setActiveFilter] = useState("Tous")
    const filteredTalents = useMemo(() => {
        if (activeFilter === "Tous") return allTalents
        return allTalents.filter((talent) =>
            talent.categories.includes(activeFilter)
        )
    }, [activeFilter, allTalents])

    const navPadding = isMobile ? "0 20px" : isTablet ? "0 32px" : "0 48px"

    const socials = useMemo(
        () =>
            [
                p.footerInstagram
                    ? {
                          href: p.footerInstagram,
                          label: "Instagram",
                          icon: ICONS.instagram,
                      }
                    : null,
                p.footerTikTok
                    ? {
                          href: p.footerTikTok,
                          label: "TikTok",
                          icon: ICONS.tiktok,
                      }
                    : null,
                p.footerLinkedIn
                    ? {
                          href: p.footerLinkedIn,
                          label: "LinkedIn",
                          icon: ICONS.linkedin,
                      }
                    : null,
            ].filter(Boolean) as any[],
        [p.footerInstagram, p.footerTikTok, p.footerLinkedIn]
    )

    // ══════════════════════════════════════════════════════════════════════════
    // RENDU
    // ══════════════════════════════════════════════════════════════════════════

    return (
        <div
            className="just-merged-root"
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
            {/* ═══════ NAVBAR ═══════ */}
            <nav
                style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.88)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    padding: navPadding,
                    height: navHeight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: BODY,
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 100,
                    boxSizing: "border-box",
                }}
            >
                <div
                    onClick={() => {
                        if (allNavItems.length > 0) handleClick(allNavItems[0])
                    }}
                    style={{
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: isMobile ? 20 : 22,
                        color: "#fff",
                        letterSpacing: -1,
                        cursor: "pointer",
                        userSelect: "none",
                        flexShrink: 0,
                        transition: "opacity 0.25s ease",
                    }}
                    onPointerOver={(e) => {
                        e.currentTarget.style.opacity = "0.7"
                    }}
                    onPointerOut={(e) => {
                        e.currentTarget.style.opacity = "1"
                    }}
                >
                    {p.logoText}
                </div>

                {!isMobileOrTablet && (
                    <div
                        ref={navRef}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            position: "relative",
                            marginLeft: 48,
                            marginRight: "auto",
                            paddingLeft: 48,
                            borderLeft: "1px solid rgba(255,255,255,0.06)",
                            height: 32,
                        }}
                    >
                        <motion.div
                            animate={{
                                left: pillStyle.left,
                                width: pillStyle.width,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 35,
                            }}
                            style={{
                                position: "absolute",
                                top: 0,
                                height: 32,
                                borderRadius: 100,
                                background:
                                    current === targetPage
                                        ? "rgba(255,255,255,0.06)"
                                        : "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                pointerEvents: "none",
                                zIndex: 0,
                            }}
                        />
                        {allNavItems.map((item) => {
                            const isActive = current === item.page
                            const isHov = hovered === item.page
                            const isPageMode = item.mode === "page" && item.url
                            if (isPageMode) {
                                return (
                                    <a
                                        key={item.page}
                                        href={item.url}
                                        ref={(el) => {
                                            itemRefs.current[item.page] = el
                                        }}
                                        onMouseEnter={() =>
                                            setHovered(item.page)
                                        }
                                        onMouseLeave={() => setHovered(null)}
                                        style={mkStyle(isActive, isHov) as any}
                                    >
                                        {isActive && dot}
                                        {item.label}
                                    </a>
                                )
                            }
                            return (
                                <div
                                    key={item.page}
                                    ref={(el) => {
                                        itemRefs.current[item.page] = el
                                    }}
                                    onClick={() => handleClick(item)}
                                    onMouseEnter={() => setHovered(item.page)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={mkStyle(isActive, isHov)}
                                >
                                    {isActive && dot}
                                    {item.label}
                                </div>
                            )
                        })}
                    </div>
                )}

                {!isMobileOrTablet && (
                    <a
                        href={p.contactUrl}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 24px",
                            background: "transparent",
                            color: "#e82828",
                            fontFamily: BODY,
                            fontWeight: 600,
                            fontSize: 10,
                            letterSpacing: 2.5,
                            textTransform: "uppercase",
                            textDecoration: "none",
                            borderRadius: 100,
                            border: "none",
                            cursor: "pointer",
                            flexShrink: 0,
                            transition:
                                "transform 0.2s ease, opacity 0.2s ease",
                        }}
                        onPointerOver={(e) => {
                            e.currentTarget.style.transform = "scale(1.03)"
                            e.currentTarget.style.opacity = "0.7"
                        }}
                        onPointerOut={(e) => {
                            e.currentTarget.style.transform = "scale(1)"
                            e.currentTarget.style.opacity = "1"
                        }}
                    >
                        {p.contactLabel}
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </a>
                )}

                {isMobileOrTablet && (
                    <button
                        onClick={() => setMenuOpen((prev) => !prev)}
                        style={{
                            width: 40,
                            height: 40,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: menuOpen ? 0 : 5,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            position: "relative",
                            zIndex: 200,
                        }}
                        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    >
                        <span
                            style={{
                                display: "block",
                                height: 1.5,
                                background: menuOpen ? "#000" : "#fff",
                                borderRadius: 2,
                                width: menuOpen ? 20 : 18,
                                transformOrigin: "center",
                                transform: menuOpen ? "rotate(45deg) translateY(1px)" : "none",
                                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                            }}
                        />
                        <span
                            style={{
                                display: "block",
                                height: 1.5,
                                width: 14,
                                background: menuOpen ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)",
                                borderRadius: 2,
                                opacity: menuOpen ? 0 : 1,
                                transform: menuOpen ? "scale(0)" : "scale(1)",
                                transition: "all 0.2s ease",
                            }}
                        />
                        <span
                            style={{
                                display: "block",
                                height: 1.5,
                                background: menuOpen ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)",
                                borderRadius: 2,
                                alignSelf: "flex-start",
                                marginLeft: 10,
                                width: menuOpen ? 20 : 10,
                                transformOrigin: "center",
                                transform: menuOpen
                                    ? "rotate(-45deg) translateY(-1px)"
                                    : "none",
                                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                            }}
                        />
                    </button>
                )}
            </nav>

            {/* ═══════ MENU MOBILE ═══════ */}
            <AnimatePresence>
                {menuOpen && isMobileOrTablet && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            top: navHeight,
                            background: "#ffffff",
                            zIndex: 99,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 8,
                            padding: "0 24px",
                        }}
                    >
                        {allNavItems.map((item, i) => {
                            const isActive = current === item.page
                            const isPageMode = item.mode === "page" && item.url
                            const inner = (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: i * 0.05,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    style={{
                                        padding: "16px 0",
                                        fontFamily: DISPLAY,
                                        fontSize: 28,
                                        fontWeight: isActive ? 800 : 400,
                                        color: isActive
                                            ? "#000"
                                            : "rgba(0,0,0,0.40)",
                                        letterSpacing: -1,
                                        textTransform: "uppercase",
                                        cursor: "pointer",
                                        textAlign: "center",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 10,
                                        textDecoration: "none",
                                    }}
                                >
                                    {isActive && (
                                        <span
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: "50%",
                                                background: "#ff3b3b",
                                                boxShadow:
                                                    "0 0 12px rgba(255,59,59,0.6)",
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                    {item.label}
                                </motion.div>
                            )
                            if (isPageMode)
                                return (
                                    <a
                                        key={item.page}
                                        href={item.url}
                                        onClick={() => setMenuOpen(false)}
                                        style={{ textDecoration: "none" }}
                                    >
                                        {inner}
                                    </a>
                                )
                            return (
                                <div
                                    key={item.page}
                                    onClick={() => handleClick(item)}
                                >
                                    {inner}
                                </div>
                            )
                        })}

                        <motion.a
                            href={p.contactUrl}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 0.4,
                                delay: allNavItems.length * 0.05 + 0.1,
                            }}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                marginTop: 32,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "14px 32px",
                                border: "1px solid rgba(0,0,0,0.15)",
                                borderRadius: 100,
                                color: "#e82828",
                                fontFamily: BODY,
                                fontWeight: 600,
                                fontSize: 11,
                                letterSpacing: 2.5,
                                textTransform: "uppercase",
                                textDecoration: "none",
                                background: "rgba(232,40,40,0.04)",
                            }}
                        >
                            {p.contactLabel}
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </motion.a>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* NAV SPACER */}
            <div style={{ height: navHeight }} />

            {/* ═══════ CONTENU DE PAGE ═══════ */}
            <main
                id="main-content"
                aria-label="Présentation des talents Just Impact"
                style={{ width: "100%", minWidth: 0 }}
            >
                {/* HERO */}
                <section
                    className="jm-section jm-hero"
                    aria-labelledby="jm-main-title"
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: "60px 72px 80px",
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
                            backgroundImage:
                                "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                            pointerEvents: "none",
                        }}
                    />

                    {sanitizeText(p.heroTagline) && (
                        <motion.p
                            className="jm-hero-tagline"
                            {...getMotionProps(reducedMotion, true, 0, 1, 0.2)}
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
                                animate={
                                    reducedMotion
                                        ? { scale: 1, opacity: 0.65 }
                                        : {
                                              scale: [1, 1.5, 1],
                                              opacity: [0.35, 0.85, 0.35],
                                          }
                                }
                                transition={
                                    reducedMotion
                                        ? { duration: 0 }
                                        : { duration: 2.5, repeat: Infinity }
                                }
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: COLORS.text,
                                    display: "inline-block",
                                    flexShrink: 0,
                                }}
                            />
                            {p.heroTagline}
                        </motion.p>
                    )}

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
                            id="jm-main-title"
                            className="jm-hero-title"
                            {...getMotionProps(reducedMotion, true, 60, 1, 0.4)}
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
                            <span style={{ display: "block" }}>
                                {p.heroTitle1}
                            </span>
                            <span
                                style={{
                                    display: "block",
                                    fontWeight: 300,
                                    color: "rgba(255,255,255,0.30)",
                                    fontStyle: "italic",
                                }}
                            >
                                {p.heroTitle2}
                            </span>
                        </motion.h1>
                    </div>

                    {sanitizeText(p.heroDesc) && (
                        <motion.p
                            className="jm-hero-desc"
                            {...getMotionProps(
                                reducedMotion,
                                true,
                                30,
                                0.8,
                                0.8
                            )}
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
                            {p.heroDesc}
                        </motion.p>
                    )}

                    <motion.div
                        className="jm-hero-scroll"
                        {...getMotionProps(reducedMotion, true, 0, 0.8, 1.2)}
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            bottom: 40,
                            left: 72,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <motion.div
                            animate={
                                reducedMotion ? { y: 0 } : { y: [0, 8, 0] }
                            }
                            transition={
                                reducedMotion
                                    ? { duration: 0 }
                                    : {
                                          duration: 2,
                                          repeat: Infinity,
                                          ease: "easeInOut",
                                      }
                            }
                            style={{
                                width: 1,
                                height: 40,
                                background:
                                    "linear-gradient(to bottom, rgba(255,255,255,0.42), transparent)",
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
                    items={[
                        "Influenceurs",
                        "Artistes",
                        "Créateurs",
                        "Talents",
                        "Authenticité",
                        "Engagement",
                        "Impact",
                        "Communauté",
                    ]}
                    speed={40}
                    label="Mots-clés de l'univers Just Impact"
                />

                {/* STATS */}
                <section
                    className="jm-section"
                    aria-labelledby="jm-stats-title"
                    style={{ padding: "100px 72px", position: "relative" }}
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
                    <Reveal>
                        <div className="jm-section-inner">
                            <h2
                                id="jm-stats-title"
                                className="sr-only"
                                style={{ margin: 0 }}
                            >
                                Chiffres clés
                            </h2>
                            <div
                                className="jm-stats-grid"
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(4, minmax(0, 1fr))",
                                    gap: 48,
                                    width: "100%",
                                    minWidth: 0,
                                }}
                            >
                                <Counter
                                    value={p.stat1}
                                    label={p.stat1Label}
                                    delay={0}
                                />
                                <Counter
                                    value={p.stat2}
                                    label={p.stat2Label}
                                    delay={0.1}
                                />
                                <Counter
                                    value={p.stat3}
                                    label={p.stat3Label}
                                    delay={0.2}
                                />
                                <Counter
                                    value={p.stat4}
                                    label={p.stat4Label}
                                    delay={0.3}
                                />
                            </div>
                        </div>
                    </Reveal>
                </section>

                {/* ROSTER / CARDS */}
                <section
                    className="jm-section"
                    aria-labelledby="jm-roster-title"
                    style={{ padding: "40px 72px 100px" }}
                >
                    <div className="jm-section-inner">
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
                                id="jm-roster-title"
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
                                <span
                                    style={{ color: "rgba(255,255,255,0.30)" }}
                                >
                                    & artistes.
                                </span>
                            </h2>
                        </Reveal>

                        <Reveal delay={0.05}>
                            <div
                                className="jm-filter-wrap"
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
                            className="sr-only"
                        >
                            {filteredTalents.length} talent
                            {filteredTalents.length > 1 ? "s" : ""} affiché
                            {filteredTalents.length > 1 ? "s" : ""} pour le
                            filtre {activeFilter}.
                        </p>

                        <motion.div
                            layout={!reducedMotion}
                            className="jm-cards-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(3, minmax(0, 1fr))",
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
                                        initial={
                                            reducedMotion
                                                ? { opacity: 1, scale: 1 }
                                                : { opacity: 0, scale: 0.96 }
                                        }
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={
                                            reducedMotion
                                                ? { opacity: 0 }
                                                : { opacity: 0, scale: 0.96 }
                                        }
                                        transition={
                                            reducedMotion
                                                ? { duration: 0 }
                                                : { duration: 0.4, ease: EASE }
                                        }
                                        style={{
                                            width: "100%",
                                            minWidth: 0,
                                            display: "flex",
                                        }}
                                    >
                                        <TalentCard
                                            {...talent}
                                            delay={index * 0.04}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </section>

                {/* WHY */}
                <section
                    className="jm-section"
                    aria-labelledby="jm-why-title"
                    style={{ padding: "80px 72px" }}
                >
                    <div className="jm-section-inner">
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
                                id="jm-why-title"
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
                                <span
                                    style={{ color: "rgba(255,255,255,0.30)" }}
                                >
                                    uniques.
                                </span>
                            </h2>
                        </Reveal>

                        <div
                            className="jm-values-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(3, minmax(0, 1fr))",
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
                                            background:
                                                "rgba(255,255,255,0.015)",
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
                    items={[
                        "Humour",
                        "Sport",
                        "Musique",
                        "Fitness",
                        "Voyage",
                        "Lifestyle",
                        "Boxe",
                        "Foot",
                    ]}
                    speed={30}
                    label="Catégories des talents"
                />

                {/* ═══════ SECTION FORMULAIRE DE CONTACT ═══════ */}
                <section
                    className="jm2-contact-root jm2-contact-pad"
                    aria-labelledby={contactSectionTitleId}
                    aria-describedby={contactSectionDescId}
                    style={{
                        padding: isMobile
                            ? "80px 20px 100px"
                            : isTablet
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
                                                      opacity: [
                                                          0.35, 0.85, 0.35,
                                                      ],
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
                                    {p.formHeroEyebrow}
                                </p>

                                <h2
                                    style={{
                                        fontFamily: DISPLAY,
                                        fontWeight: 800,
                                        fontSize: isMobile
                                            ? "clamp(40px, 12vw, 58px)"
                                            : "clamp(56px, 8vw, 110px)",
                                        lineHeight: 0.92,
                                        color: "#ffffff",
                                        margin: 0,
                                        letterSpacing: isMobile ? -2 : -5,
                                    }}
                                >
                                    <span style={{ display: "block" }}>
                                        {p.formHeroTitle1}
                                    </span>
                                    <span
                                        style={{
                                            display: "block",
                                            fontWeight: 300,
                                            fontStyle: "italic",
                                            color: white(0.88),
                                            letterSpacing: isMobile ? -1 : -3,
                                        }}
                                    >
                                        {p.formHeroTitle2}
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
                                    {p.formHeroDesc}
                                </p>
                            </div>
                        </Reveal>

                        <div
                            className="jm2-contact-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "minmax(0,1fr) minmax(280px,0.42fr)",
                                gap: isMobile ? 56 : 88,
                                alignItems: "start",
                            }}
                        >
                            <Reveal>
                                <div>
                                    {contactStatus === "success" ? (
                                        <motion.section
                                            aria-labelledby={
                                                contactSuccessTitleId
                                            }
                                            initial={
                                                reducedMotion
                                                    ? false
                                                    : { opacity: 0, y: 24 }
                                            }
                                            animate={
                                                reducedMotion
                                                    ? undefined
                                                    : { opacity: 1, y: 0 }
                                            }
                                            transition={{
                                                duration: 0.7,
                                                ease: EASE,
                                            }}
                                            style={{
                                                textAlign: "center",
                                                padding: isMobile
                                                    ? "56px 24px"
                                                    : "80px 40px",
                                                background: JC.surface,
                                                border: `1px solid ${JC.border}`,
                                                borderRadius: 24,
                                            }}
                                        >
                                            <motion.div
                                                initial={
                                                    reducedMotion
                                                        ? false
                                                        : {
                                                              scale: 0.85,
                                                              opacity: 0,
                                                          }
                                                }
                                                animate={
                                                    reducedMotion
                                                        ? undefined
                                                        : {
                                                              scale: 1,
                                                              opacity: 1,
                                                          }
                                                }
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
                                                {p.formSuccessTitle}
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
                                                {p.formSuccessDesc}
                                            </p>

                                            <motion.button
                                                type="button"
                                                onClick={resetContactForm}
                                                whileHover={
                                                    reducedMotion
                                                        ? undefined
                                                        : { opacity: 0.85 }
                                                }
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
                                                {p.formEyebrow}
                                            </p>

                                            <h3
                                                id={contactSectionTitleId}
                                                style={{
                                                    fontFamily: DISPLAY,
                                                    fontWeight: 800,
                                                    fontSize:
                                                        "clamp(32px, 4vw, 48px)",
                                                    color: "#ffffff",
                                                    lineHeight: 1,
                                                    letterSpacing: -2,
                                                    margin: "0 0 18px",
                                                }}
                                            >
                                                {p.formTitle}
                                            </h3>

                                            <p
                                                id={contactSectionDescId}
                                                style={{
                                                    margin: "0 0 52px",
                                                    fontFamily: BODY,
                                                    fontSize: 15,
                                                    lineHeight: 1.8,
                                                    color: white(OP.desc),
                                                    maxWidth: 620,
                                                }}
                                            >
                                                {p.formDesc}
                                            </p>

                                            <form
                                                onSubmit={handleContactSubmit}
                                                noValidate
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
                                                            gridTemplateColumns:
                                                                "1fr 1fr",
                                                            gap: 44,
                                                        }}
                                                    >
                                                        <ContactInputField
                                                            id={contactNameId}
                                                            label={
                                                                p.formLabelName
                                                            }
                                                            name="name"
                                                            required
                                                            autoComplete="name"
                                                            value={
                                                                contactFormData.name
                                                            }
                                                            error={
                                                                contactErrors.name
                                                            }
                                                            placeholder="Jean Dupont"
                                                            onChange={updateContactField(
                                                                "name"
                                                            )}
                                                        />
                                                        <ContactInputField
                                                            id={contactEmailId}
                                                            label={
                                                                p.formLabelEmail
                                                            }
                                                            name="email"
                                                            type="email"
                                                            required
                                                            autoComplete="email"
                                                            inputMode="email"
                                                            value={
                                                                contactFormData.email
                                                            }
                                                            error={
                                                                contactErrors.email
                                                            }
                                                            placeholder="jean@marque.com"
                                                            onChange={updateContactField(
                                                                "email"
                                                            )}
                                                        />
                                                    </div>

                                                    <div
                                                        className="jm2-contact-two-cols"
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns:
                                                                "1fr 1fr",
                                                            gap: 44,
                                                        }}
                                                    >
                                                        <ContactInputField
                                                            id={contactPhoneId}
                                                            label={
                                                                p.formLabelPhone
                                                            }
                                                            name="phone"
                                                            type="tel"
                                                            autoComplete="tel"
                                                            inputMode="tel"
                                                            value={
                                                                contactFormData.phone
                                                            }
                                                            placeholder="+33 6 12 34 56 78"
                                                            hint="Optionnel"
                                                            onChange={updateContactField(
                                                                "phone"
                                                            )}
                                                        />
                                                        <ContactInputField
                                                            id={
                                                                contactCompanyId
                                                            }
                                                            label={
                                                                p.formLabelCompany
                                                            }
                                                            name="company"
                                                            autoComplete="organization"
                                                            value={
                                                                contactFormData.company
                                                            }
                                                            placeholder="Votre marque"
                                                            hint="Optionnel"
                                                            onChange={updateContactField(
                                                                "company"
                                                            )}
                                                        />
                                                    </div>

                                                    <ContactPillSelect
                                                        label={p.formLabelEntity}
                                                        name="entity"
                                                        options={
                                                            contactEntityList
                                                        }
                                                        value={
                                                            contactFormData.entity
                                                        }
                                                        onChange={updateContactField(
                                                            "entity"
                                                        )}
                                                    />

                                                    <ContactTextareaField
                                                        id={contactMessageId}
                                                        label={p.formLabelMessage}
                                                        name="message"
                                                        required
                                                        value={
                                                            contactFormData.message
                                                        }
                                                        error={
                                                            contactErrors.message
                                                        }
                                                        placeholder="Décrivez votre projet, vos objectifs, vos délais..."
                                                        onChange={updateContactField(
                                                            "message"
                                                        )}
                                                    />

                                                    <AnimatePresence>
                                                        {contactStatus ===
                                                        "error" ? (
                                                            <motion.div
                                                                role="alert"
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 8,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    y: -8,
                                                                }}
                                                                style={{
                                                                    padding:
                                                                        "16px 22px",
                                                                    borderRadius: 12,
                                                                    background:
                                                                        JC.errorBg,
                                                                    border: `1px solid ${JC.errorBorder}`,
                                                                    fontFamily:
                                                                        BODY,
                                                                    fontSize: 14,
                                                                    color: JC.error,
                                                                    fontWeight: 400,
                                                                    lineHeight: 1.7,
                                                                }}
                                                            >
                                                                <strong>
                                                                    {
                                                                        p.formErrorTitle
                                                                    }
                                                                </strong>{" "}
                                                                {contactLiveMessage &&
                                                                contactLiveMessage !==
                                                                    p.formErrorTitle
                                                                    ? contactLiveMessage
                                                                    : p.formErrorDesc}
                                                            </motion.div>
                                                        ) : null}
                                                    </AnimatePresence>

                                                    <motion.button
                                                        type="submit"
                                                        disabled={
                                                            isContactSubmitDisabled
                                                        }
                                                        aria-disabled={
                                                            isContactSubmitDisabled
                                                        }
                                                        whileHover={
                                                            !isContactSubmitDisabled &&
                                                            !reducedMotion
                                                                ? {
                                                                      y: -2,
                                                                      backgroundColor:
                                                                          "#ffffff",
                                                                      color: "#000000",
                                                                  }
                                                                : undefined
                                                        }
                                                        whileTap={
                                                            !isContactSubmitDisabled &&
                                                            !reducedMotion
                                                                ? {
                                                                      scale: 0.98,
                                                                  }
                                                                : undefined
                                                        }
                                                        style={{
                                                            display:
                                                                "inline-flex",
                                                            alignItems:
                                                                "center",
                                                            alignSelf:
                                                                "flex-start",
                                                            gap: 12,
                                                            padding:
                                                                "18px 42px",
                                                            background:
                                                                "transparent",
                                                            color: isContactSubmitDisabled
                                                                ? "rgba(255,255,255,0.25)"
                                                                : "#ffffff",
                                                            fontFamily: DISPLAY,
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                            letterSpacing: 4,
                                                            textTransform:
                                                                "uppercase",
                                                            border: `1px solid ${isContactSubmitDisabled ? "rgba(255,255,255,0.12)" : "#ffffff"}`,
                                                            borderRadius: 100,
                                                            cursor: isContactSubmitDisabled
                                                                ? "not-allowed"
                                                                : "pointer",
                                                            transition:
                                                                "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                                                            opacity:
                                                                contactStatus ===
                                                                "sending"
                                                                    ? 0.58
                                                                    : 1,
                                                        }}
                                                    >
                                                        {contactStatus ===
                                                        "sending"
                                                            ? "Envoi en cours..."
                                                            : "Envoyer"}
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
                                                reducedMotion
                                                    ? undefined
                                                    : {
                                                          scale: [1, 1.3, 1],
                                                          opacity: [
                                                              0.45, 1, 0.45,
                                                          ],
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
                                            {p.formResponseNote}
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
                                            "{p.formManifesto}"
                                        </blockquote>
                                    </div>
                                </aside>
                            </Reveal>
                        </div>
                    </div>
                </section>
            </main>

            {/* ═══════ FOOTER ═══════ */}
            <footer
                style={{
                    padding: isMobile ? "32px 20px" : "40px 72px",
                    borderTop: `1px solid ${white(0.06)}`,
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: "0 auto",
                        display: "grid",
                        gridTemplateColumns: isMobile
                            ? "minmax(0,1fr)"
                            : isTablet
                              ? "minmax(0,1fr) minmax(0,1fr)"
                              : "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
                        gap: isMobile ? 32 : 24,
                        alignItems: "start",
                        minWidth: 0,
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <p
                            style={{
                                fontSize: 14,
                                color: white(OP.label),
                                letterSpacing: 4,
                                margin: "0 0 8px 0",
                                fontWeight: 700,
                                fontFamily: DISPLAY,
                            }}
                        >
                            JUST<span style={{ color: white(0.3) }}>.</span>
                        </p>
                        <p
                            style={{
                                fontSize: 12,
                                color: white(OP.label),
                                margin: 0,
                                fontFamily: BODY,
                                lineHeight: 1.6,
                            }}
                        >
                            Paris, France
                            <br />© {new Date().getFullYear()} Just Group
                        </p>
                    </div>

                    <nav
                        aria-label="Liens du pied de page"
                        style={{ minWidth: 0 }}
                    >
                        <ul
                            style={{
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {FOOTER_NAV.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        style={{
                                            fontSize: 12,
                                            fontFamily: BODY,
                                            fontWeight: 500,
                                            letterSpacing: 1,
                                            overflowWrap: "break-word",
                                            color: white(0.55),
                                            textDecoration: "none",
                                            transition: "color 0.2s ease",
                                        }}
                                        onPointerOver={(e) => {
                                            e.currentTarget.style.color =
                                                white(0.9)
                                        }}
                                        onPointerOut={(e) => {
                                            e.currentTarget.style.color =
                                                white(0.55)
                                        }}
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            alignItems: isMobile
                                ? "flex-start"
                                : isTablet
                                  ? "flex-start"
                                  : "flex-end",
                            minWidth: 0,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                gap: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            {socials.map((s: any) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    style={{
                                        color: white(0.55),
                                        textDecoration: "none",
                                        transition: "color 0.2s ease",
                                    }}
                                    onPointerOver={(e) => {
                                        e.currentTarget.style.color = white(0.9)
                                    }}
                                    onPointerOut={(e) => {
                                        e.currentTarget.style.color =
                                            white(0.55)
                                    }}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                        {p.footerEmail && (
                            <a
                                href={`mailto:${p.footerEmail}`}
                                style={{
                                    fontSize: 12,
                                    fontFamily: BODY,
                                    fontWeight: 400,
                                    overflowWrap: "break-word",
                                    color: white(0.55),
                                    textDecoration: "none",
                                    transition: "color 0.2s ease",
                                }}
                                onPointerOver={(e) => {
                                    e.currentTarget.style.color = white(0.9)
                                }}
                                onPointerOut={(e) => {
                                    e.currentTarget.style.color =
                                        white(0.55)
                                }}
                            >
                                {p.footerEmail}
                            </a>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    )
}