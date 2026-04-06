"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const ROOMS_ANCHOR_ID = "just-rooms-container"
const scrollOffset = -80
const SCROLL_STORAGE_KEY = "just-scroll-restore"

type NavItem = {
  label: string
  page: string
  room?: number
  href?: string
}

const navItems: NavItem[] = [
  { label: "Just", page: "nav1", room: 1 },
  { label: "Just Impact", page: "nav2", room: 2 },
  { label: "Nos Sponsors", page: "nav3", room: 3 },
  { label: "Nos Talents", page: "nav5", room: 4 },
  { label: "Just Prod", page: "nav6", room: 5 },
  { label: "Just Agency", page: "nav4", href: "/just-agency" },
]

const PATHNAME_TO_PAGE: Record<string, string> = {
  "/": "nav1",
  "/just-impact": "nav2",
  "/nosponsors": "nav3",
  "/just-agency": "nav4",
  "/nos-talents": "nav5",
  "/just-prod": "nav6",
  "/media": "nav6",
  "/podcast": "nav6",
  "/contact": "nav-contact",
}

export default function HeaderDesktop() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const jumpToRoom = searchParams.get("jumpToRoom")

  const [current, setCurrent] = useState("nav1")
  const [hovered, setHovered] = useState<string | null>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const pendingPageRef = useRef<string | null>(null)

  const isContactActive = current === "nav-contact"

  function saveScrollPosition() {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY))
  }

  function scrollToRooms() {
    const el = document.getElementById(ROOMS_ANCHOR_ID)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY + scrollOffset
    window.scrollTo({ top, behavior: "smooth" })
  }

  function handleClick(item: NavItem) {
    if (item.href) {
      setCurrent(item.page)
      router.push(item.href)
      return
    }

    if (typeof item.room !== "number") return

    setCurrent(item.page)

    if (pathname === "/") {
      window.dispatchEvent(
        new CustomEvent("just-nav-change", {
          detail: { roomIndex: item.room - 1 },
        })
      )
      scrollToRooms()
      return
    }

    saveScrollPosition()
    pendingPageRef.current = item.page
    router.push(`/?jumpToRoom=${item.room - 1}`)
  }

  function handleLogoClick() {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    saveScrollPosition()
    pendingPageRef.current = "nav1"
    router.push("/?jumpToRoom=0")
  }

  useEffect(() => {
    const handlePopState = () => {
      const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY)
      if (savedScroll !== null) {
        const y = parseInt(savedScroll, 10)
        sessionStorage.removeItem(SCROLL_STORAGE_KEY)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: "instant" })
          })
        })
      }
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    const mapped = PATHNAME_TO_PAGE[pathname]

    if (mapped) {
      setTimeout(() => setCurrent(mapped), 0)
      pendingPageRef.current = null
      return
    }

    if (pathname === "/") {
      if (jumpToRoom !== null) {
        const roomIndex = parseInt(jumpToRoom, 10)
        if (!Number.isNaN(roomIndex)) {
          const match = navItems.find((item) => item.room === roomIndex + 1)
          if (match) {
            setTimeout(() => setCurrent(match.page), 0)
            pendingPageRef.current = null
            return
          }
        }
      }

      if (pendingPageRef.current !== null) {
        const pending = pendingPageRef.current
        setTimeout(() => setCurrent(pending), 0)
        pendingPageRef.current = null
        return
      }

      setTimeout(() => setCurrent("nav1"), 0)
    }
  }, [pathname, jumpToRoom])

  useEffect(() => {
    function onRoomChanged(e: Event) {
      const roomIndex = (e as CustomEvent<{ roomIndex?: number }>).detail?.roomIndex
      if (roomIndex == null) return
      if (pendingPageRef.current !== null) return
      const match = navItems.find((item) => item.room === roomIndex + 1)
      if (match) setCurrent(match.page)
    }
    window.addEventListener("just-room-changed", onRoomChanged)
    return () => window.removeEventListener("just-room-changed", onRoomChanged)
  }, [])

  const targetPage = hovered ?? current

  useEffect(() => {
    const update = () => {
      const el = itemRefs.current[targetPage]
      const nav = navRef.current
      if (!el || !nav) return
      const navRect = nav.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const next = {
        left: elRect.left - navRect.left,
        width: elRect.width,
      }
      if (next.width > 0) setPillStyle(next)
    }
    const t = window.setTimeout(update, 50)
    window.addEventListener("resize", update)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("resize", update)
    }
  }, [targetPage, current, pathname])

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
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        boxSizing: "border-box",
      }}
    >
      <button
        onClick={handleLogoClick}
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
        }}
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
        {/* Pill cachée quand on est sur /contact */}
        {!isContactActive && (
          <motion.div
            aria-hidden="true"
            animate={{ left: pillStyle.left, width: pillStyle.width }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
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
        )}

        {navItems.map((item) => {
          const isActive = current === item.page
          const isHov = hovered === item.page

          return (
            <button
              key={item.page}
              ref={(el) => {
                itemRefs.current[item.page] = el
              }}
              onClick={() => handleClick(item)}
              onMouseEnter={() => setHovered(item.page)}
              onMouseLeave={() => setHovered(null)}
              aria-current={isActive && !isContactActive ? "page" : undefined}
              style={{
                position: "relative",
                zIndex: 1,
                padding: "0 18px",
                height: 32,
                cursor: "pointer",
                fontFamily: BODY,
                fontSize: 11,
                fontWeight: isActive && !isContactActive ? 600 : 400,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color:
                  (isActive && !isContactActive) || isHov
                    ? "#fff"
                    : "rgba(255,255,255,0.7)",
                textShadow: isHov
                  ? "0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.4)"
                  : "none",
                transition: "color 0.3s ease, text-shadow 0.3s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                userSelect: "none",
                background: "transparent",
                border: "none",
              }}
            >
              {/* Dot uniquement si actif ET pas sur /contact */}
              {isActive && !isContactActive && dot}
              {item.label}
            </button>
          )
        })}
      </nav>

      <Link
        href="/contact"
        aria-current={isContactActive ? "page" : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 24px",
          background: isContactActive ? "rgba(255,255,255,0.06)" : "transparent",
          color: isContactActive ? "#ffffff" : "#e82828",
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          textDecoration: "none",
          borderRadius: 100,
          border: isContactActive
            ? "1px solid rgba(255,255,255,0.14)"
            : "none",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.3s ease",
        }}
      >
        {isContactActive && (
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#ff3b3b",
              flexShrink: 0,
              boxShadow: "0 0 8px rgba(255,59,59,0.5)",
            }}
          />
        )}
        Nous contacter
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>
    </header>
  )
}