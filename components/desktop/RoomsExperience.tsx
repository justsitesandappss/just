"use client"

import Image from "next/image"
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion"

const ROOMS_ANCHOR_ID = "just-rooms-container"
const EXPERIENCE_DONE_KEY = "just_rooms_experience_done_v1"
const SIDES = ["left", "top", "right", "bottom"] as const
const IMG_RE = /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i
const HEADER_OFFSET = 80

type Side = (typeof SIDES)[number]
type Phase = "intro" | "transitionPlaying" | "rooms"

type Room = {
  label: string
  video: string
}

type EdgeConfig = {
  show: boolean
  target: number
  pageUrl: string
  pageLabel: string
}

type Hotspot = {
  label: string
  x: number
  y: number
  url: string
}

const ARROW_ROT: Record<Side, number> = {
  right: 0,
  left: 180,
  bottom: 90,
  top: -90,
}

const EMPTY_EDGE: Record<Side, EdgeConfig> = {
  left: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  top: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  right: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
}

const INTRO_VIDEO =
  "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/accueil-video-rideau.mp4"
const TRANSITION_VIDEO =
  "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/accueil-video-rideau-ouverturev2.mp4"

const ZOOM = 1.05
const STRENGTH = 16
const RADIUS = 20
const ARROW_SIZE = 44
const ARROW_INSET = 20

const ALL_ROOMS: Room[] = [
  {
    label: "Just",
    video:
      "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Salle-Just.mp4",
  },
  {
    label: "Just Impact",
    video:
      "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Salle-Just-Impact.mp4",
  },
  {
    label: "Sponsors",
    video:
      "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/SALLE-SPONSORS.jpg",
  },
  {
    label: "Nos Talents",
    video:
      "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/SALLE-NOSTALENTS.jpg",
  },
  {
    label: "Just Prod",
    video:
      "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Salle-Just-Prod.mp4",
  },
]

const HOTSPOTS: Hotspot[][] = [
  [{ label: "Qui sommes-nous ?", x: 50, y: 52, url: "/just" }],
  [{ label: "Just Impact", x: 44, y: 62, url: "/just-impact" }],
  [{ label: "Nos Sponsors", x: 50, y: 50, url: "/nosponsors" }],
  [{ label: "Nos Talents", x: 50, y: 50, url: "/nos-talents" }],
  [
    { label: "Media", x: 38, y: 56, url: "/media" },
    { label: "Podcast", x: 62, y: 56, url: "/podcast" },
  ],
]

const EDGES: Record<number, Record<Side, EdgeConfig>> = {
  0: {
    left: {
      show: true,
      target: 1,
      pageUrl: "/just-agency",
      pageLabel: "Just Agency",
    },
    top: { show: false, target: 1, pageUrl: "", pageLabel: "" },
    right: { show: true, target: 2, pageUrl: "", pageLabel: "Just Impact" },
    bottom: { show: true, target: 5, pageUrl: "", pageLabel: "Just Prod" },
  },
  1: {
    left: { show: true, target: 1, pageUrl: "", pageLabel: "Just" },
    top: { show: false, target: 1, pageUrl: "", pageLabel: "" },
    right: { show: true, target: 3, pageUrl: "", pageLabel: "Sponsors" },
    bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  },
  2: {
    left: { show: true, target: 2, pageUrl: "", pageLabel: "Just Impact" },
    top: { show: false, target: 1, pageUrl: "", pageLabel: "" },
    right: { show: true, target: 4, pageUrl: "", pageLabel: "Nos Talents" },
    bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  },
  3: {
    left: { show: true, target: 3, pageUrl: "", pageLabel: "Sponsors" },
    top: { show: false, target: 1, pageUrl: "", pageLabel: "" },
    right: { show: false, target: 1, pageUrl: "", pageLabel: "" },
    bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  },
  4: {
    left: { show: false, target: 1, pageUrl: "", pageLabel: "" },
    top: { show: true, target: 1, pageUrl: "", pageLabel: "Just" },
    right: { show: false, target: 1, pageUrl: "", pageLabel: "" },
    bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  },
}

const EDGE_POS: Record<Side, CSSProperties> = {
  left: {
    position: "absolute",
    zIndex: 8,
    pointerEvents: "all",
    left: ARROW_INSET,
    top: "50%",
    transform: "translateY(-50%)",
  },
  right: {
    position: "absolute",
    zIndex: 8,
    pointerEvents: "all",
    right: ARROW_INSET,
    top: "50%",
    transform: "translateY(-50%)",
  },
  top: {
    position: "absolute",
    zIndex: 8,
    pointerEvents: "all",
    top: ARROW_INSET,
    left: "50%",
    transform: "translateX(-50%)",
  },
  bottom: {
    position: "absolute",
    zIndex: 8,
    pointerEvents: "all",
    bottom: ARROW_INSET,
    left: "50%",
    transform: "translateX(-50%)",
  },
}

function isImage(url: string): boolean {
  if (!url) return false
  try {
    return IMG_RE.test(new URL(url, "https://x").pathname)
  } catch {
    return IMG_RE.test(url)
  }
}

function hasEnteredExperience(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.sessionStorage.getItem(EXPERIENCE_DONE_KEY) === "1"
  } catch {
    return false
  }
}

function markExperienceAsEntered(): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(EXPERIENCE_DONE_KEY, "1")
  } catch {
    //
  }
}

let stylesInjected = false

function injectStyles(): void {
  if (stylesInjected || typeof document === "undefined") return
  stylesInjected = true
  const style = document.createElement("style")
  style.textContent = `
    @keyframes jr-fade-in {
      from { opacity: 0; transform: translate(-50%, -50%) scale(0.88); }
      to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    @keyframes jr-label-in {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes jr-btn-in {
      from { opacity: 0; transform: translate(-50%, -50%) translateY(20px); }
      to   { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
    }
  `
  document.head.appendChild(style)
}

function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

function useParallaxRAF(
  ref: RefObject<HTMLDivElement | null>,
  active: boolean,
  zoom: number,
  x: MotionValue<number>,
  y: MotionValue<number>
): void {
  useEffect(() => {
    if (!active) return
    const el = ref.current
    if (!el) return
    let lastX = x.get()
    let lastY = y.get()
    el.style.transform = `scale(${zoom}) translate3d(${lastX}px, ${lastY}px, 0)`
    let rafId = 0
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const node = ref.current
      if (!node) return
      const currentX = x.get()
      const currentY = y.get()
      if (
        Math.abs(currentX - lastX) > 0.01 ||
        Math.abs(currentY - lastY) > 0.01
      ) {
        node.style.transform = `scale(${zoom}) translate3d(${currentX}px, ${currentY}px, 0)`
        lastX = currentX
        lastY = currentY
      }
      rafId = window.requestAnimationFrame(tick)
    }
    rafId = window.requestAnimationFrame(tick)
    return () => {
      cancelled = true
      window.cancelAnimationFrame(rafId)
    }
  }, [active, ref, x, y, zoom])
}

const ArrowIcon = memo(function ArrowIcon({ side }: { side: Side }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{
        display: "block",
        flexShrink: 0,
        transform: `rotate(${ARROW_ROT[side]}deg)`,
      }}
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

type EdgeArrowButtonProps = {
  side: Side
  label: string
  onClick: () => void
}

const EdgeArrowButton = memo(function EdgeArrowButton({
  side,
  label,
  onClick,
}: EdgeArrowButtonProps) {
  const [pressed, setPressed] = useState(false)
  const arrowFirst = side === "left" || side === "top"
  return (
    <div style={EDGE_POS[side]}>
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick()
          }
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          height: ARROW_SIZE,
          borderRadius: ARROW_SIZE / 2,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(18,18,18,0.82)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          pointerEvents: "all",
          touchAction: "manipulation",
          padding: label ? "0 16px" : "0",
          gap: label ? 8 : 0,
          minWidth: ARROW_SIZE,
          whiteSpace: "nowrap",
          transform: pressed ? "scale(0.94)" : "scale(1)",
          opacity: pressed ? 0.82 : 1,
          transition: "transform 0.15s ease, opacity 0.15s ease",
          willChange: "transform",
        }}
      >
        {arrowFirst && <ArrowIcon side={side} />}
        {label ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "'Outfit', system-ui, sans-serif",
              letterSpacing: "0.12em",
              lineHeight: 1,
              userSelect: "none",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
        ) : null}
        {!arrowFirst && <ArrowIcon side={side} />}
      </div>
    </div>
  )
})

type HotspotBtnProps = Hotspot & {
  onNavigate: (url: string) => void
}

const HotspotBtn = memo(function HotspotBtn({
  label,
  x,
  y,
  url,
  onNavigate,
}: HotspotBtnProps) {
  const [hovered, setHovered] = useState(false)
  if (!label) return null
  const goToUrl = () => {
    if (!url) return
    markExperienceAsEntered()
    onNavigate(url)
  }
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={goToUrl}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          goToUrl()
        }
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: hovered
          ? "translate(-50%,-50%) scale(1.04)"
          : "translate(-50%,-50%) scale(1)",
        zIndex: 9,
        cursor: url ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        background: "rgba(18,18,18,0.82)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 100,
        padding: "8px 16px",
        color: "#fff",
        fontSize: 12,
        fontFamily: "'Outfit', system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        backdropFilter: "blur(10px)",
        userSelect: "none",
        pointerEvents: "all",
        animation: "jr-fade-in 0.25s cubic-bezier(0.22,1,0.36,1) both",
        transition: "transform 0.15s ease",
        willChange: "transform",
      }}
    >
      {label}
    </div>
  )
})

type ParallaxLayerProps = {
  zoom: number
  x: MotionValue<number>
  y: MotionValue<number>
  children: ReactNode
}

const ParallaxLayer = memo(function ParallaxLayer({
  zoom,
  x,
  y,
  children,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  useParallaxRAF(ref, true, zoom, x, y)
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: "center",
        willChange: "transform",
        zIndex: 5,
        pointerEvents: "auto",
      }}
    >
      {children}
    </div>
  )
})

type VideoSlotProps = {
  room: Room
  isActive: boolean
  isNeighbor: boolean
  zoom: number
  x: MotionValue<number>
  y: MotionValue<number>
}

const VideoSlot = memo(function VideoSlot({
  room,
  isActive,
  isNeighbor,
  zoom,
  x,
  y,
}: VideoSlotProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const isImg = isImage(room.video)
  const playPromiseRef = useRef<Promise<void> | null>(null)
  useParallaxRAF(wrapRef, isActive, zoom, x, y)
  useEffect(() => {
    if (isImg) return
    const el = videoRef.current
    if (!el) return
    if (isActive) {
      const startPlayback = () => {
        const playPromise = el.play()
        playPromiseRef.current = playPromise
        playPromise.catch(() => {})
      }
      if (playPromiseRef.current) {
        playPromiseRef.current.then(startPlayback).catch(startPlayback)
      } else {
        startPlayback()
      }
      return
    }
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => { el.pause() })
        .catch(() => { el.pause() })
      playPromiseRef.current = null
    } else {
      el.pause()
    }
  }, [isActive, isImg])
  if (!isActive && !isNeighbor) return null
  const mediaStyle: CSSProperties = {
    objectFit: "cover",
    pointerEvents: "none",
  }
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.35s ease",
        zIndex: isActive ? 1 : 0,
        pointerEvents: "none",
        visibility: isActive ? "visible" : "hidden",
      }}
    >
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transform: `scale(${zoom})`,
          transformOrigin: "center",
          willChange: isActive ? "transform" : "auto",
          overflow: "hidden",
        }}
      >
        {isImg ? (
          <Image
            src={room.video}
            alt={room.label}
            fill
            unoptimized
            priority={isActive}
            sizes="65vw"
            draggable={false}
            style={mediaStyle}
          />
        ) : (
          <video
            ref={videoRef}
            src={room.video}
            muted
            loop
            playsInline
            preload={isActive ? "auto" : "metadata"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              pointerEvents: "none",
            }}
            aria-label={room.label}
          />
        )}
      </div>
    </div>
  )
})

type TransitionVideoProps = {
  src: string
  onEnd: () => void
}

const TransitionVideo = memo(function TransitionVideo({
  src,
  onEnd,
}: TransitionVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [fadeOut, setFadeOut] = useState(false)
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    el.currentTime = 0
    el.play().catch(() => {})
    const handleEnded = () => {
      setFadeOut(true)
      timeoutId = setTimeout(() => { onEnd() }, 700)
    }
    el.addEventListener("ended", handleEnded)
    return () => {
      el.removeEventListener("ended", handleEnded)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [onEnd])
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 25,
        background: "#000",
        pointerEvents: "none",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  )
})

type IntroVideoProps = {
  src: string
  onExplore: () => void
}

const IntroVideo = memo(function IntroVideo({
  src,
  onExplore,
}: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)
  useEffect(() => {
    videoRef.current?.play().catch(() => {})
    const timeoutId = setTimeout(() => { setVisible(true) }, 800)
    return () => clearTimeout(timeoutId)
  }, [src])
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 30, background: "#000" }}>
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.22)",
          pointerEvents: "none",
        }}
      />
      {visible ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "80%",
            transform: "translate(-50%,-50%)",
            zIndex: 2,
            animation: "jr-btn-in 0.65s cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          <button
            onClick={onExplore}
            onPointerOver={() => setBtnHovered(true)}
            onPointerOut={() => setBtnHovered(false)}
            aria-label="Explorer l'expérience"
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#fff",
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 999,
              padding: "12px 28px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              backdropFilter: "blur(10px)",
              transform: btnHovered ? "scale(1.06)" : "scale(1)",
              opacity: btnHovered ? 0.8 : 1,
              transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s",
              whiteSpace: "nowrap",
              textShadow: "0 0 20px rgba(255,255,255,0.9), 0 4px 20px rgba(0,0,0,0.6)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            Explorer
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.7))" }}
            >
              <path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  )
})

export default function RoomsExperience() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    injectStyles()
  }, [])

  const hydrated = useHydrated()

  const [phaseOverride, setPhaseOverride] = useState<Phase | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // ✅ Guard pour éviter le re-déclenchement en boucle
  const jumpHandled = useRef(false)

  const phase: Phase = phaseOverride
    ? phaseOverride
    : hydrated
      ? hasEnteredExperience()
        ? "rooms"
        : INTRO_VIDEO
          ? "intro"
          : "rooms"
      : "intro"

  const containerRef = useRef<HTMLDivElement>(null)
  const rafMove = useRef<number>(0)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const rawX = useTransform(mouseX, [0, 1], [STRENGTH, -STRENGTH])
  const rawY = useTransform(mouseY, [0, 1], [STRENGTH, -STRENGTH])

  const x = useSpring(rawX, { stiffness: 40, damping: 25, mass: 1.2 })
  const y = useSpring(rawY, { stiffness: 40, damping: 25, mass: 1.2 })

  const navigate = useCallback(
    (url: string) => {
      router.push(url)
    },
    [router]
  )

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ roomIndex?: number }>).detail
      const idx = detail?.roomIndex
      if (
        typeof idx !== "number" ||
        idx < 0 ||
        idx >= ALL_ROOMS.length ||
        !ALL_ROOMS[idx]?.video
      ) {
        return
      }
      markExperienceAsEntered()
      setPhaseOverride("rooms")
      setActiveIndex(idx)
    }
    window.addEventListener("just-nav-change", handler)
    return () => {
      window.removeEventListener("just-nav-change", handler)
    }
  }, [])

  // ✅ useEffect corrigé — ne boucle plus grâce au ref guard
  useEffect(() => {
    const jump = searchParams.get("jumpToRoom")

    // Pas de paramètre → reset le guard pour la prochaine navigation entrante
    if (jump == null) {
      jumpHandled.current = false
      return
    }

    // Déjà traité → on ignore complètement
    if (jumpHandled.current) return

    const idx = parseInt(jump, 10)

    // Marque comme traité IMMÉDIATEMENT avant tout setState ou router call
    jumpHandled.current = true

    // Nettoie l'URL en premier, de façon synchrone
    router.replace("/", { scroll: false })

    if (
      Number.isNaN(idx) ||
      idx < 0 ||
      idx >= ALL_ROOMS.length ||
      !ALL_ROOMS[idx]?.video
    ) {
      return
    }

    markExperienceAsEntered()
    setPhaseOverride("rooms")
    setActiveIndex(idx)

    requestAnimationFrame(() => {
      const el = document.getElementById(ROOMS_ANCHOR_ID)
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
      window.scrollTo({ top, behavior: "smooth" })
    })
  }, [searchParams, router])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("just-room-changed", {
        detail: { roomIndex: activeIndex },
      })
    )
  }, [activeIndex])

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (rafMove.current) return
      const clientX = e.clientX
      const clientY = e.clientY
      rafMove.current = window.requestAnimationFrame(() => {
        rafMove.current = 0
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const nextX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const nextY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
        mouseX.set(nextX)
        mouseY.set(nextY)
      })
    },
    [mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    if (rafMove.current) {
      window.cancelAnimationFrame(rafMove.current)
      rafMove.current = 0
    }
    mouseX.set(0.5)
    mouseY.set(0.5)
  }, [mouseX, mouseY])

  const handleEdgeClick = useCallback(
    (edge: EdgeConfig) => {
      markExperienceAsEntered()
      if (edge.pageUrl) {
        navigate(edge.pageUrl)
        return
      }
      const idx = edge.target - 1
      if (idx >= 0 && idx < ALL_ROOMS.length && ALL_ROOMS[idx]?.video) {
        setPhaseOverride("rooms")
        setActiveIndex(idx)
      }
    },
    [navigate]
  )

  const currentRoom = ALL_ROOMS[activeIndex]
  const currentEdges = EDGES[activeIndex] ?? EMPTY_EDGE
  const currentHotspots = HOTSPOTS[activeIndex] ?? []

  const roomsVisible = phase === "rooms"
  const showTransition = phase === "transitionPlaying"
  const showIntro = phase === "intro"

  const neighborIndices = new Set<number>()
  for (const side of SIDES) {
    const edge = currentEdges[side]
    if (edge.show && !edge.pageUrl) {
      const idx = edge.target - 1
      if (idx >= 0 && idx < ALL_ROOMS.length && ALL_ROOMS[idx]?.video) {
        neighborIndices.add(idx)
      }
    }
  }

  if (!hydrated) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: "65%",
          margin: "0 auto",
          aspectRatio: "16/9",
          background: "#000",
          borderRadius: RADIUS,
        }}
      />
    )
  }

  return (
    <section
      aria-label="Expérience immersive Just"
      style={{
        width: "100%",
        background: "#000",
        padding: "0 0 48px",
      }}
    >
      <div
        id={ROOMS_ANCHOR_ID}
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "65%",
          margin: "0 auto",
          aspectRatio: "16/9",
          position: "relative",
          borderRadius: RADIUS,
          background: "#000",
          overflow: "hidden",
          contain: "layout style paint",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            borderRadius: RADIUS,
            zIndex: 1,
          }}
        >
          {ALL_ROOMS.map((room, index) =>
            room.video ? (
              <VideoSlot
                key={room.label}
                room={room}
                isActive={index === activeIndex}
                isNeighbor={neighborIndices.has(index)}
                zoom={ZOOM}
                x={x}
                y={y}
              />
            ) : null
          )}

          <ParallaxLayer zoom={ZOOM} x={x} y={y}>
            {currentHotspots.map((spot, index) =>
              spot.label ? (
                <HotspotBtn
                  key={`${activeIndex}-h${index}`}
                  {...spot}
                  onNavigate={navigate}
                />
              ) : null
            )}
          </ParallaxLayer>

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 6,
              pointerEvents: "none",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.02) 55%, rgba(0,0,0,0.10) 100%)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
            opacity: roomsVisible ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div
              key={`label-${activeIndex}`}
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                pointerEvents: "none",
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(18,18,18,0.82)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                fontFamily: "'Outfit', system-ui, sans-serif",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                animation: "jr-label-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              {currentRoom.label}
            </div>

            {roomsVisible
              ? SIDES.map((side) => {
                  const edge = currentEdges[side]
                  if (!edge.show) return null
                  if (!edge.pageUrl) {
                    const idx = edge.target - 1
                    if (
                      idx < 0 ||
                      idx >= ALL_ROOMS.length ||
                      !ALL_ROOMS[idx]?.video
                    ) {
                      return null
                    }
                  }
                  const label = edge.pageUrl
                    ? edge.pageLabel || "Page"
                    : ALL_ROOMS[edge.target - 1]?.label || ""
                  return (
                    <EdgeArrowButton
                      key={side}
                      side={side}
                      label={label}
                      onClick={() => handleEdgeClick(edge)}
                    />
                  )
                })
              : null}
          </div>
        </div>

        {showTransition ? (
          <TransitionVideo
            src={TRANSITION_VIDEO}
            onEnd={() => {
              markExperienceAsEntered()
              setPhaseOverride("rooms")
            }}
          />
        ) : null}

        {showIntro ? (
          <IntroVideo
            src={INTRO_VIDEO}
            onExplore={() => {
              markExperienceAsEntered()
              if (TRANSITION_VIDEO) {
                setPhaseOverride("transitionPlaying")
              } else {
                setPhaseOverride("rooms")
              }
            }}
          />
        ) : null}
      </div>
    </section>
  )
}