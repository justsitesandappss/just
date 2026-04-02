"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const ROOMS_ANCHOR_ID = "just-rooms-container"
const scrollOffset = -80

const navItems = [
  { label: "Just",         page: "nav1", room: 1 },
  { label: "Just Impact",  page: "nav2", room: 2 },
  { label: "Just Prod",    page: "nav3", room: 3 },
  { label: "Just Agency",  page: "nav4", room: 4 },
  { label: "Nos Sponsors", page: "nav5", room: 5 },
  { label: "Nos Talents",  page: "nav6", room: 6 },
]

export default function HeaderDesktop() {
  const [current, setCurrent] = useState("nav1")
  const [hovered, setHovered] = useState<string | null>(null)
  const navRef   = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLElement | null>>({})
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })

  function scrollToRooms() {
    const el = document.getElementById(ROOMS_ANCHOR_ID)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY + scrollOffset
    window.scrollTo({ top, behavior: "smooth" })
  }

  function handleClick(item: typeof navItems[0]) {
    const roomsEl = document.getElementById(ROOMS_ANCHOR_ID)
    if (!roomsEl) {
      window.location.href = `/?jumpToRoom=${item.room - 1}`
      return
    }
    setCurrent(item.page)
    window.dispatchEvent(new CustomEvent("just-nav-change", { detail: { roomIndex: item.room - 1 } }))
    scrollToRooms()
  }

  useEffect(() => {
    function onRoomChanged(e: Event) {
      const roomIndex = (e as CustomEvent).detail?.roomIndex
      if (roomIndex == null) return
      const match = navItems.find((item) => item.room === roomIndex + 1)
      if (match) setCurrent(match.page)
    }
    window.addEventListener("just-room-changed", onRoomChanged)
    return () => window.removeEventListener("just-room-changed", onRoomChanged)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const jump = params.get("jumpToRoom")
    if (jump == null) return
    const roomIndex = parseInt(jump, 10)
    if (isNaN(roomIndex)) return
    params.delete("jumpToRoom")
    const clean = params.toString()
    window.history.replaceState(null, "", window.location.pathname + (clean ? `?${clean}` : "") + window.location.hash)
    const tryJump = (attempt: number) => {
      const el = document.getElementById(ROOMS_ANCHOR_ID)
      if (el) {
        window.dispatchEvent(new CustomEvent("just-nav-change", { detail: { roomIndex } }))
        const match = navItems.find((item) => item.room === roomIndex + 1)
        if (match) setCurrent(match.page)
        setTimeout(scrollToRooms, 100)
      } else if (attempt < 20) {
        setTimeout(() => tryJump(attempt + 1), 150)
      }
    }
    tryJump(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const targetPage = hovered ?? current

  useEffect(() => {
    const update = () => {
      const el  = itemRefs.current[targetPage]
      const nav = navRef.current
      if (!el || !nav) return
      const navRect = nav.getBoundingClientRect()
      const elRect  = el.getBoundingClientRect()
      const next = { left: elRect.left - navRect.left, width: elRect.width }
      if (next.width > 0) setPillStyle(next)
    }
    const t = setTimeout(update, 50)
    window.addEventListener("resize", update)
    return () => { clearTimeout(t); window.removeEventListener("resize", update) }
  }, [targetPage, current])

  const dot = (
    <span style={{
      width: 4, height: 4, borderRadius: "50%",
      background: "#ff3b3b", marginRight: 8, flexShrink: 0,
      boxShadow: "0 0 8px rgba(255,59,59,0.5)",
    }} />
  )

  return (
    <header
      role="banner"
      style={{
        width: "100%",
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "0 48px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        boxSizing: "border-box",
      }}
    >
      <button
        onClick={() => handleClick(navItems[0])}
        aria-label="Just — retour à l'accueil"
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 22,
          color: "#fff",
          letterSpacing: -1,
          cursor: "pointer",
          background: "transparent",
          border: "none",
          padding: 0,
          flexShrink: 0,
          transition: "opacity 0.25s ease",
        }}
        onPointerOver={(e) => { e.currentTarget.style.opacity = "0.7" }}
        onPointerOut={(e)  => { e.currentTarget.style.opacity = "1" }}
      >
        JUST
      </button>

      <nav
        ref={navRef}
        aria-label="Navigation principale"
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
          aria-hidden="true"
          animate={{ left: pillStyle.left, width: pillStyle.width }}
          transition={{ type: "spring", stiffness: 400, damping: 35 }}
          style={{
            position: "absolute",
            top: 0,
            height: 32,
            borderRadius: 100,
            background: current === targetPage ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {navItems.map((item) => {
          const isActive = current === item.page
          const isHov    = hovered === item.page
          return (
            <button
              key={item.page}
              ref={(el) => { itemRefs.current[item.page] = el }}
              onClick={() => handleClick(item)}
              onMouseEnter={() => setHovered(item.page)}
              onMouseLeave={() => setHovered(null)}
              aria-current={isActive ? "page" : undefined}
              style={{
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
                textShadow: isHov ? "0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.4)" : "none",
                transition: "color 0.3s ease, text-shadow 0.3s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                userSelect: "none",
                background: "transparent",
                border: "none",
              }}
            >
              {isActive && dot}
              {item.label}
            </button>
          )
        })}
      </nav>

      <Link
        href="/contact"
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
          transition: "transform 0.2s ease, opacity 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.opacity = "0.7" }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)";    e.currentTarget.style.opacity = "1" }}
      >
        Nous contacter
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>
    </header>
  )
}