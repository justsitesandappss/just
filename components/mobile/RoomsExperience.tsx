"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"

const ROOMS_ANCHOR_ID = "just-rooms-container"
const EXPERIENCE_DONE_KEY = "just_rooms_experience_done_v1"
const IMG_RE = /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i

type Phase = "intro" | "transitionPlaying" | "rooms"
type Room = { label: string; video: string }

const INTRO_VIDEO      = "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/accueil-video-rideau.mp4"
const TRANSITION_VIDEO = "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/accueil-video-rideau-ouverturev2.mp4"
const RADIUS = 16

const ALL_ROOMS: Room[] = [
  { label: "Just",        video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Salle-Just.mp4" },
  { label: "Just Impact", video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Salle-Just-Impact.mp4" },
  { label: "Sponsors",    video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/SALLE-SPONSORS.jpg" },
  { label: "Nos Talents", video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/SALLE-NOSTALENTS.jpg" },
  { label: "Just Prod",   video: "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Salle-Just-Prod.mp4" },
]

const HOTSPOT_URLS: string[] = ["/just", "/justimpact", "/nosponsors", "/nostalents", "/media"]
const HOTSPOT_LABELS: string[] = ["Qui sommes-nous ?", "Just Impact", "Nos Sponsors", "Nos Talents", "Explorer"]

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
  `
  document.head.appendChild(s)
}

const VideoSlot = memo(function VideoSlot({ room, isActive }: {
  room: Room; isActive: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isImg    = isImage(room.video)
  const playRef  = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (isImg) return
    const el = videoRef.current; if (!el) return
    if (isActive) {
      const doPlay = () => { playRef.current = el.play(); playRef.current?.catch(() => {}) }
      playRef.current ? playRef.current.then(doPlay).catch(doPlay) : doPlay()
    } else {
      if (playRef.current) {
        playRef.current.then(() => el.pause()).catch(() => el.pause())
        playRef.current = null
      } else { el.pause() }
    }
  }, [isActive, isImg])

  if (!isActive) return null

  const media: React.CSSProperties = {
    width: "100%", height: "100%", objectFit: "cover",
    display: "block", pointerEvents: "none",
  }

  return (
    <div style={{
      position: "absolute", inset: 0,
      opacity: 1, zIndex: 1, pointerEvents: "none",
    }}>
      {isImg
        ? <img src={room.video} alt={room.label} draggable={false}
            loading="eager" decoding="async" style={media} />
        : <video ref={videoRef} src={room.video} muted loop playsInline
            preload="auto" style={media} aria-label={room.label} />
      }
    </div>
  )
})

const TransitionVideo = memo(function TransitionVideo({ src, onEnd }: {
  src: string; onEnd: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [fadeOut, setFadeOut] = useState(false)
  const onEndRef = useRef(onEnd); onEndRef.current = onEnd

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
    setVisible(false)
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
              borderRadius: 999, padding: "14px 28px", cursor: "pointer",
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
})

export default function RoomsExperienceMobile() {
  useEffect(injectStyles, [])

  const [phase, setPhase] = useState<Phase>("intro")
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [swiping, setSwiping] = useState(false)

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    setPhase(hasEnteredExperience() ? "rooms" : INTRO_VIDEO ? "intro" : "rooms")
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const idx = (e as CustomEvent<{ roomIndex?: number }>).detail?.roomIndex
      if (idx == null || idx < 0 || idx >= ALL_ROOMS.length) return
      markExperienceAsEntered(); setPhase("rooms"); setActiveIndex(idx)
    }
    window.addEventListener("just-nav-change", handler)
    return () => window.removeEventListener("just-nav-change", handler)
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("just-room-changed", { detail: { roomIndex: activeIndex } }))
  }, [activeIndex])

  const goTo = useCallback((idx: number) => {
    if (idx < 0 || idx >= ALL_ROOMS.length) return
    markExperienceAsEntered()
    setPhase("rooms")
    setActiveIndex(idx)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) < 40 && Math.abs(dy) < 40) return
    setSwiping(true)
    setTimeout(() => setSwiping(false), 300)
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -40) goTo(activeIndex + 1)
      else if (dx > 40) goTo(activeIndex - 1)
    } else {
      if (dy < -40) goTo(activeIndex + 1)
      else if (dy > 40) goTo(activeIndex - 1)
    }
  }, [activeIndex, goTo])

  const showTransition = phase === "transitionPlaying"
  const showIntro      = phase === "intro"
  const roomsVisible   = phase === "rooms"

  if (!mounted) return (
    <div aria-hidden="true" style={{
      width: "92%", margin: "0 auto",
      aspectRatio: "9/14", background: "#000", borderRadius: RADIUS,
    }} />
  )

  return (
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
          opacity: swiping ? 0.85 : 1,
          transition: "opacity 0.15s ease",
        }}
      >
        {ALL_ROOMS.map((room, i) =>
          room.video ? (
            <VideoSlot key={i} room={room} isActive={i === activeIndex} />
          ) : null
        )}

        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none",
          background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.02) 60%, rgba(0,0,0,0.12) 100%)",
        }} />

        {roomsVisible && (
          <>
            <div style={{
              position: "absolute", top: 14, left: 14, zIndex: 10,
              padding: "7px 14px", borderRadius: 999,
              background: "rgba(18,18,18,0.82)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
              color: "#fff", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.12em",
              fontFamily: "'Outfit', system-ui, sans-serif",
              textTransform: "uppercase", whiteSpace: "nowrap",
              animation: "jr-label-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
            }}>
              {ALL_ROOMS[activeIndex].label}
            </div>

            {activeIndex > 0 && (
              <button
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Salle précédente"
                style={{
                  position: "absolute", left: 14, top: "50%",
                  transform: "translateY(-50%)", zIndex: 10,
                  width: 44, height: 44, borderRadius: 22,
                  background: "rgba(18,18,18,0.82)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", touchAction: "manipulation",
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 12H5M5 12L11 6M5 12L11 18"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {activeIndex < ALL_ROOMS.length - 1 && (
              <button
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Salle suivante"
                style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)", zIndex: 10,
                  width: 44, height: 44, borderRadius: 22,
                  background: "rgba(18,18,18,0.82)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backdropFilter: "blur(10px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", touchAction: "manipulation",
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12H19M19 12L13 6M19 12L13 18"
                    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            <button
              onClick={() => {
                const url = HOTSPOT_URLS[activeIndex]
                if (url) { markExperienceAsEntered(); window.location.href = url }
              }}
              aria-label={HOTSPOT_LABELS[activeIndex]}
              style={{
                position: "absolute", bottom: 24, left: "50%",
                transform: "translateX(-50%)", zIndex: 10,
                padding: "10px 20px", borderRadius: 999,
                background: "rgba(18,18,18,0.82)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(10px)",
                color: "#fff", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.08em",
                fontFamily: "'Outfit', system-ui, sans-serif",
                textTransform: "uppercase", whiteSpace: "nowrap",
                cursor: "pointer", touchAction: "manipulation",
                animation: "jr-fade-in 0.25s cubic-bezier(0.22,1,0.36,1) both",
              }}>
              {HOTSPOT_LABELS[activeIndex]}
            </button>

            <div style={{
              position: "absolute", bottom: 80, left: "50%",
              transform: "translateX(-50%)", zIndex: 10,
              display: "flex", gap: 6,
            }}>
              {ALL_ROOMS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Aller à la salle ${i + 1}`}
                  style={{
                    width: i === activeIndex ? 18 : 6,
                    height: 6, borderRadius: 3,
                    background: i === activeIndex ? "#fff" : "rgba(255,255,255,0.35)",
                    border: "none", cursor: "pointer",
                    transition: "width 0.3s ease, background 0.3s ease",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {showTransition && (
          <TransitionVideo src={TRANSITION_VIDEO}
            onEnd={() => { markExperienceAsEntered(); setPhase("rooms") }} />
        )}
        {showIntro && (
          <IntroVideo src={INTRO_VIDEO} onExplore={() => {
            markExperienceAsEntered()
            TRANSITION_VIDEO ? setPhase("transitionPlaying") : setPhase("rooms")
          }} />
        )}
      </div>
    </section>
  )
}