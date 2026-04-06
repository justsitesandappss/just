"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

const ROOMS_ANCHOR_ID = "just-rooms-container"
const EXPERIENCE_DONE_KEY = "just_rooms_experience_done_v1"
const ROOM_RESTORE_KEY = "just-room-restore"
const SCROLL_STORAGE_KEY = "just-scroll-restore"
const SIDES = ["left", "top", "right", "bottom"] as const
const IMG_RE = /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i
const HEADER_OFFSET = 56

type Side = (typeof SIDES)[number]
type Phase = "intro" | "transitionPlaying" | "rooms"
type Room = { label: string; video: string }
type EdgeConfig = { show: boolean; target: number; pageUrl: string; pageLabel: string }
type Hotspot = { label: string; x: number; y: number; url: string }

const ARROW_ROT: Record<Side, number> = { right: 0, left: 180, bottom: 90, top: -90 }

const EMPTY_EDGE: Record<Side, EdgeConfig> = {
  left:   { show: false, target: 1, pageUrl: "", pageLabel: "" },
  top:    { show: false, target: 1, pageUrl: "", pageLabel: "" },
  right:  { show: false, target: 1, pageUrl: "", pageLabel: "" },
  bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
}

const INTRO_VIDEO      = "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/accueil-video-rideau.mp4"
const TRANSITION_VIDEO = "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/accueil-video-rideau-ouverturev2.mp4"
const RADIUS      = 16
const ARROW_SIZE  = 44
const ARROW_INSET = 14

const ALL_ROOMS: Room[] = [
  { label: "Just",        video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Salle-Just.mp4" },
  { label: "Just Impact", video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Salle-Just-Impact.mp4" },
  { label: "Sponsors",    video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/SALLE-SPONSORS.jpg" },
  { label: "Nos Talents", video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/SALLE-NOSTALENTS.jpg" },
  { label: "Just Prod",   video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Salle-Just-Prod.mp4" },
]

const HOTSPOTS: Hotspot[][] = [
  [{ label: "Qui sommes-nous ?", x: 50, y: 52, url: "/just" }],
  [{ label: "Just Impact",       x: 50, y: 52, url: "/just-impact" }],
  [{ label: "Nos Sponsors",      x: 50, y: 52, url: "/nosponsors" }],
  [{ label: "Nos Talents",       x: 50, y: 52, url: "/nos-talents" }],
  [
    { label: "Media",   x: 35, y: 52, url: "/media" },
    { label: "Podcast", x: 65, y: 52, url: "/podcast" },
  ],
]

const EDGES: Record<number, Record<Side, EdgeConfig>> = {
  0: {
    left:   { show: true,  target: 1, pageUrl: "/just-agency", pageLabel: "Just Agency" },
    top:    { show: false, target: 1, pageUrl: "", pageLabel: "" },
    right:  { show: true,  target: 2, pageUrl: "", pageLabel: "Just Impact" },
    bottom: { show: true,  target: 5, pageUrl: "", pageLabel: "Just Prod" },
  },
  1: {
    left:   { show: true,  target: 1, pageUrl: "", pageLabel: "Just" },
    top:    { show: false, target: 1, pageUrl: "", pageLabel: "" },
    right:  { show: true,  target: 3, pageUrl: "", pageLabel: "Sponsors" },
    bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  },
  2: {
    left:   { show: true,  target: 2, pageUrl: "", pageLabel: "Just Impact" },
    top:    { show: false, target: 1, pageUrl: "", pageLabel: "" },
    right:  { show: true,  target: 4, pageUrl: "", pageLabel: "Nos Talents" },
    bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  },
  3: {
    left:   { show: true,  target: 3, pageUrl: "", pageLabel: "Sponsors" },
    top:    { show: false, target: 1, pageUrl: "", pageLabel: "" },
    right:  { show: false, target: 1, pageUrl: "", pageLabel: "" },
    bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  },
  4: {
    left:   { show: false, target: 1, pageUrl: "", pageLabel: "" },
    top:    { show: true,  target: 1, pageUrl: "", pageLabel: "Just" },
    right:  { show: false, target: 1, pageUrl: "", pageLabel: "" },
    bottom: { show: false, target: 1, pageUrl: "", pageLabel: "" },
  },
}

const EDGE_POS: Record<Side, React.CSSProperties> = {
  left:   { position: "absolute", zIndex: 8, pointerEvents: "all", left:   ARROW_INSET, top:    "50%", transform: "translateY(-50%)" },
  right:  { position: "absolute", zIndex: 8, pointerEvents: "all", right:  ARROW_INSET, top:    "50%", transform: "translateY(-50%)" },
  top:    { position: "absolute", zIndex: 8, pointerEvents: "all", top:    ARROW_INSET, left:   "50%", transform: "translateX(-50%)" },
  bottom: { position: "absolute", zIndex: 8, pointerEvents: "all", bottom: ARROW_INSET, left:   "50%", transform: "translateX(-50%)" },
}

function isImage(url: string): boolean {
  if (!url) return false
  try { return IMG_RE.test(new URL(url, "https://x").pathname) }
  catch { return IMG_RE.test(url) }
}

function hasEnteredExperience(): boolean {
  if (typeof window === "undefined") return false
  try { return window.sessionStorage.getItem(EXPERIENCE_DONE_KEY) === "1" } catch { return false }
}

function markExperienceAsEntered() {
  if (typeof window === "undefined") return
  try { window.sessionStorage.setItem(EXPERIENCE_DONE_KEY, "1") } catch {}
}

let _stylesInjected = false
function injectStyles() {
  if (_stylesInjected || typeof document === "undefined") return
  _stylesInjected = true
  const s = document.createElement("style")
  s.textContent = `
    @keyframes jr-fade-in {
      from { opacity:0; transform:translate(-50%,-50%) scale(0.88); }
      to   { opacity:1; transform:translate(-50%,-50%) scale(1); }
    }
    @keyframes jr-label-in {
      from { opacity:0; transform:translateY(-6px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes jr-btn-in {
      from { opacity:0; transform:translate(-50%,-50%) translateY(20px); }
      to   { opacity:1; transform:translate(-50%,-50%) translateY(0); }
    }
    @keyframes jr-modal-in {
      from { opacity:0; transform:scale(0.92) translateY(14px); }
      to   { opacity:1; transform:scale(1) translateY(0); }
    }
  `
  document.head.appendChild(s)
}

// ─── Modal de confirmation ────────────────────────────────────────────────────
const ConfirmModal = memo(function ConfirmModal({
  label,
  onConfirm,
  onCancel,
}: {
  label: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(14,14,14,0.98)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 24,
          padding: "36px 28px 28px",
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "jr-modal-in 0.28s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Icône */}
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12H19M19 12L13 6M19 12L13 18"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Texte */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{
            fontFamily: "'Syne', system-ui, sans-serif",
            fontSize: 17, fontWeight: 700,
            color: "#fff", letterSpacing: -0.4,
            margin: 0,
          }}>
            Quitter l&apos;expérience ?
          </p>
          <p style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: 13, fontWeight: 400,
            color: "rgba(255,255,255,0.48)",
            lineHeight: 1.65, margin: 0,
          }}>
            Vous allez ouvrir la page{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>{label}</span>.{" "}
            Voulez-vous continuer ?
          </p>
        </div>

        {/* Boutons */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 100,
              border: "1px solid rgba(255,255,255,0.09)",
              background: "transparent",
              color: "rgba(255,255,255,0.45)",
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "color 0.2s ease, border-color 0.2s ease",
            }}
            onPointerOver={(e) => {
              e.currentTarget.style.color = "#fff"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"
            }}
            onPointerOut={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.45)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"
            }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "13px 0",
              borderRadius: 100,
              border: "none",
              background: "#fff",
              color: "#000",
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: 11, fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "opacity 0.2s ease",
            }}
            onPointerOver={(e) => { e.currentTarget.style.opacity = "0.82" }}
            onPointerOut={(e) => { e.currentTarget.style.opacity = "1" }}
          >
            Continuer
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
})

// ─── Composants utilitaires ───────────────────────────────────────────────────
const ArrowIcon = memo(function ArrowIcon({ side }: { side: Side }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ display: "block", flexShrink: 0, transform: `rotate(${ARROW_ROT[side]}deg)` }}>
      <path d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
})

const EdgeArrowButton = memo(function EdgeArrowButton({ side, onClick }: {
  side: Side; label: string; isPageLink: boolean; onClick: () => void
}) {
  const [pressed, setPressed] = useState(false)
  return (
    <div style={EDGE_POS[side]}>
      <div
        role="button"
        tabIndex={0}
        aria-label={side}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === "Enter") onClick() }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          width: ARROW_SIZE, height: ARROW_SIZE,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(18,18,18,0.82)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", touchAction: "manipulation",
          transform: pressed ? "scale(0.94)" : "scale(1)",
          opacity: pressed ? 0.82 : 1,
          transition: "transform 0.15s ease, opacity 0.15s ease",
          willChange: "transform",
        }}>
        <ArrowIcon side={side} />
      </div>
    </div>
  )
})

const HotspotBtn = memo(function HotspotBtn({
  label, x, y, url, onNavigate,
}: Hotspot & { onNavigate: (url: string) => void }) {
  const [hovered, setHovered] = useState(false)
  if (!label) return null
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => { if (!url) return; onNavigate(url) }}
      onKeyDown={(e) => { if (e.key === "Enter" && url) onNavigate(url) }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      style={{
        position: "absolute", left: `${x}%`, top: `${y}%`,
        transform: hovered ? "translate(-50%,-50%) scale(1.04)" : "translate(-50%,-50%) scale(1)",
        zIndex: 9, cursor: url ? "pointer" : "default",
        display: "flex", alignItems: "center",
        background: "rgba(18,18,18,0.82)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 100, padding: "8px 14px", color: "#fff",
        fontSize: 11, fontFamily: "'Outfit', system-ui, sans-serif",
        fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", whiteSpace: "nowrap",
        backdropFilter: "blur(10px)",
        userSelect: "none", pointerEvents: "all",
        animation: "jr-fade-in 0.25s cubic-bezier(0.22,1,0.36,1) both",
        transition: "transform 0.15s ease",
        willChange: "transform",
      }}>
      {label}
    </div>
  )
})

const VideoSlot = memo(function VideoSlot({ room, isActive, isNeighbor }: {
  room: Room; isActive: boolean; isNeighbor: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isImg    = isImage(room.video)
  const playRef  = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (isImg) return
    const el = videoRef.current; if (!el) return
    if (isActive) {
      const doPlay = () => {
        playRef.current = el.play()
        playRef.current.catch(() => {})
      }
      if (playRef.current) {
        playRef.current.then(doPlay).catch(doPlay)
      } else {
        doPlay()
      }
    } else {
      if (playRef.current) {
        playRef.current.then(() => el.pause()).catch(() => el.pause())
        playRef.current = null
      } else { el.pause() }
    }
  }, [isActive, isImg])

  if (!isActive && !isNeighbor) return null

  const media: React.CSSProperties = {
    width: "100%", height: "100%", objectFit: "cover",
    display: "block", pointerEvents: "none",
  }

  return (
    <div style={{
      position: "absolute", inset: 0,
      opacity: isActive ? 1 : 0, transition: "opacity 0.35s ease",
      zIndex: isActive ? 1 : 0, pointerEvents: "none",
      visibility: isActive ? "visible" : "hidden",
    }}>
      <div style={{ width: "100%", height: "100%" }}>
        {isImg
          ? (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Image
                src={room.video}
                alt={room.label}
                fill
                sizes="92vw"
                loading={isActive ? "eager" : "lazy"}
                style={{ objectFit: "cover", pointerEvents: "none" }}
              />
            </div>
          )
          : <video ref={videoRef} src={room.video} muted loop playsInline
              preload={isActive ? "auto" : "metadata"} style={media} aria-label={room.label} />
        }
      </div>
    </div>
  )
})

const TransitionVideo = memo(function TransitionVideo({ src, onEnd }: {
  src: string; onEnd: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [fadeOut, setFadeOut] = useState(false)
  const onEndRef = useRef(onEnd)
  useEffect(() => { onEndRef.current = onEnd }, [onEnd])

  useEffect(() => {
    const el = videoRef.current; if (!el) return
    el.currentTime = 0; el.play().catch(() => {})
    let t: ReturnType<typeof setTimeout>
    const handleEnded = () => { setFadeOut(true); t = setTimeout(() => onEndRef.current(), 700) }
    el.addEventListener("ended", handleEnded)
    return () => { el.removeEventListener("ended", handleEnded); clearTimeout(t) }
  }, [])

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 25, background: "#000",
      pointerEvents: "none", opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.7s cubic-bezier(0.22,1,0.36,1)",
    }}>
      <video ref={videoRef} src={src} muted playsInline preload="auto" aria-hidden="true" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", display: "block",
      }} />
    </div>
  )
})

const IntroVideo = memo(function IntroVideo({ src, onExplore }: {
  src: string; onExplore: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)

  useEffect(() => {
    videoRef.current?.play().catch(() => {})
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [src])

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 30, background: "#000" }}>
      <video ref={videoRef} src={src} muted loop playsInline preload="auto" aria-hidden="true"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.22)", pointerEvents: "none" }} aria-hidden="true" />
      {visible && (
        <div style={{
          position: "absolute", left: "50%", top: "80%",
          transform: "translate(-50%,-50%)", zIndex: 2,
          animation: "jr-btn-in 0.65s cubic-bezier(0.22,1,0.36,1) both",
        }}>
          <button
            onClick={onExplore}
            onPointerOver={() => setBtnHovered(true)}
            onPointerOut={() => setBtnHovered(false)}
            aria-label="Explorer l'expérience"
            style={{
              fontFamily: "'Outfit', system-ui, sans-serif",
              fontSize: 16, fontWeight: 800,
              letterSpacing: "0.18em", textTransform: "uppercase", color: "#fff",
              background: "rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 999, padding: "12px 24px", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 12,
              backdropFilter: "blur(10px)",
              transform: btnHovered ? "scale(1.06)" : "scale(1)",
              opacity: btnHovered ? 0.8 : 1,
              transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s",
              whiteSpace: "nowrap",
              textShadow: "0 0 20px rgba(255,255,255,0.9), 0 4px 20px rgba(0,0,0,0.6)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}>
            Explorer
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.7))" }}>
              <path d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
})

// ─── Phase initiale ───────────────────────────────────────────────────────────
function getInitialPhase(): Phase {
  if (typeof window === "undefined") return "intro"
  return hasEnteredExperience() ? "rooms" : INTRO_VIDEO ? "intro" : "rooms"
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function RoomsExperienceMobile() {
  useEffect(injectStyles, [])

  const router = useRouter()

  const [phase, setPhase] = useState<Phase>(getInitialPhase)
  const [activeIndex, setActiveIndex] = useState(0)

  // null = modal fermée | { url, label } = modal ouverte
  const [confirm, setConfirm] = useState<{ url: string; label: string } | null>(null)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasMountedRef = useRef(false)

  const navigate = useCallback(
    (url: string) => {
      sessionStorage.setItem(ROOM_RESTORE_KEY, String(activeIndex))
      sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY))
      markExperienceAsEntered()
      router.push(url)
    },
    [router, activeIndex]
  )

  // Restaure la room au retour arrière
  useEffect(() => {
    const savedRoom = sessionStorage.getItem(ROOM_RESTORE_KEY)
    if (savedRoom === null) return
    const roomIndex = parseInt(savedRoom, 10)
    sessionStorage.removeItem(ROOM_RESTORE_KEY)
    if (
      Number.isNaN(roomIndex) ||
      roomIndex < 0 ||
      roomIndex >= ALL_ROOMS.length ||
      !ALL_ROOMS[roomIndex]?.video
    ) return
    markExperienceAsEntered()
    setTimeout(() => {
      setPhase("rooms")
      setActiveIndex(roomIndex)
      const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY)
      if (savedScroll !== null) {
        sessionStorage.removeItem(SCROLL_STORAGE_KEY)
        const y = parseInt(savedScroll, 10)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: "instant" })
          })
        })
      } else {
        requestAnimationFrame(() => {
          const el = document.getElementById(ROOMS_ANCHOR_ID)
          if (!el) return
          const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
          window.scrollTo({ top, behavior: "instant" })
        })
      }
    }, 80)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<{ roomIndex?: number }>).detail?.roomIndex
      if (idx == null || idx < 0 || idx >= ALL_ROOMS.length || !ALL_ROOMS[idx]?.video) return
      markExperienceAsEntered()
      setPhase("rooms")
      setActiveIndex(idx)
    }
    window.addEventListener("just-nav-change", handler)
    return () => window.removeEventListener("just-nav-change", handler)
  }, [])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    window.dispatchEvent(new CustomEvent("just-room-changed", { detail: { roomIndex: activeIndex } }))
  }, [activeIndex])

  // ✅ Si pageUrl → ouvre la modal de confirmation au lieu de naviguer directement
  const handleEdgeClick = useCallback((edge: EdgeConfig) => {
    if (!edge?.show) return
    markExperienceAsEntered()
    if (edge.pageUrl) {
      setConfirm({ url: edge.pageUrl, label: edge.pageLabel || edge.pageUrl })
      return
    }
    const idx = edge.target - 1
    if (idx >= 0 && idx < ALL_ROOMS.length && ALL_ROOMS[idx]?.video) {
      setPhase("rooms")
      setActiveIndex(idx)
    }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return
    const edges = EDGES[activeIndex] || EMPTY_EDGE
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -40) handleEdgeClick(edges.right)
      else if (dx > 40) handleEdgeClick(edges.left)
    } else {
      if (dy < -40) handleEdgeClick(edges.bottom)
      else if (dy > 40) handleEdgeClick(edges.top)
    }
  }, [activeIndex, handleEdgeClick])

  const currentRoom     = ALL_ROOMS[activeIndex]
  const currentEdges    = EDGES[activeIndex] || EMPTY_EDGE
  const currentHotspots = HOTSPOTS[activeIndex] || []
  const roomsVisible    = phase === "rooms"
  const showTransition  = phase === "transitionPlaying"
  const showIntro       = phase === "intro"

  const neighborIndices = new Set<number>()
  for (const side of SIDES) {
    const edge = currentEdges[side]
    if (edge.show && !edge.pageUrl) {
      const idx = edge.target - 1
      if (idx >= 0 && idx < ALL_ROOMS.length && ALL_ROOMS[idx]?.video) neighborIndices.add(idx)
    }
  }

  if (typeof window === "undefined") return (
    <div aria-hidden="true" style={{
      width: "92%", margin: "0 auto",
      aspectRatio: "9/14", background: "#000", borderRadius: RADIUS,
    }} />
  )

  return (
    <>
      {/* Modal de confirmation — s'affiche uniquement pour les liens page (ex: Just Agency) */}
      {confirm && (
        <ConfirmModal
          label={confirm.label}
          onConfirm={() => {
            setConfirm(null)
            navigate(confirm.url)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <section aria-label="Expérience immersive Just" style={{
        width: "100%", background: "#000", padding: "0 0 40px",
      }}>
        <div
          id={ROOMS_ANCHOR_ID}
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            width: "92%", margin: "0 auto",
            aspectRatio: "9/14",
            position: "relative",
            borderRadius: RADIUS,
            background: "#000",
            overflow: "hidden",
            contain: "layout style paint",
          }}
        >
          <div style={{
            position: "absolute", inset: 0,
            overflow: "hidden", borderRadius: RADIUS, zIndex: 1,
          }}>
            {ALL_ROOMS.map((room, i) =>
              room.video ? (
                <VideoSlot key={i} room={room}
                  isActive={i === activeIndex}
                  isNeighbor={neighborIndices.has(i)} />
              ) : null
            )}
            <div style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "auto" }}>
              {currentHotspots.map((spot, i) =>
                spot.label
                  ? <HotspotBtn key={`${activeIndex}-h${i}`} {...spot} onNavigate={navigate} />
                  : null
              )}
            </div>
            <div aria-hidden="true" style={{
              position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none",
              background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.02) 55%, rgba(0,0,0,0.10) 100%)",
            }} />
          </div>

          <div style={{
            position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none",
            opacity: roomsVisible ? 1 : 0, transition: "opacity 0.5s ease",
          }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <div key={`label-${activeIndex}`} style={{
                position: "absolute", top: 14, left: 14, pointerEvents: "none",
                padding: "7px 12px", borderRadius: 999,
                background: "rgba(18,18,18,0.82)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
                color: "#fff", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.12em",
                fontFamily: "'Outfit', system-ui, sans-serif",
                textTransform: "uppercase", whiteSpace: "nowrap",
                animation: "jr-label-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
              }}>
                {currentRoom.label}
              </div>

              {roomsVisible && SIDES.map(side => {
                const edge = currentEdges[side]
                if (!edge.show) return null
                if (!edge.pageUrl) {
                  const idx = edge.target - 1
                  if (idx < 0 || idx >= ALL_ROOMS.length || !ALL_ROOMS[idx]?.video) return null
                }
                const label = edge.pageUrl
                  ? (edge.pageLabel || "Page")
                  : ALL_ROOMS[edge.target - 1]?.label || ""
                return (
                  <EdgeArrowButton key={side} side={side} label={label}
                    isPageLink={!!edge.pageUrl} onClick={() => handleEdgeClick(edge)} />
                )
              })}
            </div>
          </div>

          {showTransition && (
            <TransitionVideo src={TRANSITION_VIDEO}
              onEnd={() => { markExperienceAsEntered(); setPhase("rooms") }} />
          )}
          {showIntro && (
            <IntroVideo src={INTRO_VIDEO} onExplore={() => {
              markExperienceAsEntered()
              if (TRANSITION_VIDEO) { setPhase("transitionPlaying") } else { setPhase("rooms") }
            }} />
          )}
        </div>
      </section>
    </>
  )
}