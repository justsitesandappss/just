"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  { label: "Just",         page: "nav1", room: 1 },
  { label: "Just Impact",  page: "nav2", room: 2 },
  { label: "Nos Sponsors", page: "nav3", room: 3 },
  { label: "Nos Talents",  page: "nav5", room: 4 },
  { label: "Just Prod",    page: "nav6", room: 5 },
  { label: "Just Agency",  page: "nav4", href: "/just-agency" },
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

export default function HeaderMobile() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const jumpToRoom = searchParams.get("jumpToRoom")

  const [current, setCurrent] = useState("nav1")
  const [menuOpen, setMenuOpen] = useState(false)
  const pendingPageRef = useRef<string | null>(null)

  const isContactActive = current === "nav-contact"

  useEffect(() => {
    const t = setTimeout(() => setMenuOpen(false), 0)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

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

  function saveScrollPosition() {
    sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY))
  }

  function scrollToRooms() {
    const el = document.getElementById(ROOMS_ANCHOR_ID)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY + scrollOffset
    window.scrollTo({ top, behavior: "smooth" })
  }

  function handleLogoClick() {
    setMenuOpen(false)
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    saveScrollPosition()
    pendingPageRef.current = "nav1"
    router.push("/?jumpToRoom=0")
  }

  function handleNavClick(item: NavItem) {
    if (item.href) {
      setMenuOpen(false)
      setCurrent(item.page)
      router.push(item.href)
      return
    }

    if (typeof item.room !== "number") return

    const roomIndex = item.room - 1

    setCurrent(item.page)

    if (pathname === "/") {

      setMenuOpen(false)
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("just-nav-change", {
            detail: { roomIndex },
          })
        )
        scrollToRooms()
      }, 350)
      return
    }

    setMenuOpen(false)
    saveScrollPosition()
    pendingPageRef.current = item.page
    router.push(`/?jumpToRoom=${roomIndex}`)
  }

  return (
    <>
      <header
        role="banner"
        style={{
          width: "100%",
          background: "rgba(0,0,0,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          padding: "0 20px",
          height: 56,
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
          onClick={handleLogoClick}
          aria-label="Just — retour à l'accueil"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: 20,
            color: "#fff",
            letterSpacing: -1,
            cursor: "pointer",
            background: "transparent",
            border: "none",
            padding: 0,
            transition: "opacity 0.25s ease",
          }}
          onPointerOver={(e) => { e.currentTarget.style.opacity = "0.7" }}
          onPointerOut={(e) => { e.currentTarget.style.opacity = "1" }}
        >
          JUST
        </button>

        <button
          onClick={() => setMenuOpen((p) => !p)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          style={{
            width: 40, height: 40,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: menuOpen ? 0 : 5,
            background: "transparent", border: "none",
            cursor: "pointer", padding: 0,
          }}
        >
          <span style={{
            display: "block", height: 1.5, width: menuOpen ? 20 : 18,
            background: "#fff", borderRadius: 2,
            transformOrigin: "center",
            transform: menuOpen ? "rotate(45deg) translateY(1px)" : "none",
            transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          }} />
          <span style={{
            display: "block", height: 1.5, width: 14,
            background: "rgba(255,255,255,0.5)", borderRadius: 2,
            opacity: menuOpen ? 0 : 1,
            transform: menuOpen ? "scale(0)" : "scale(1)",
            transition: "all 0.2s ease",
          }} />
          <span style={{
            display: "block", height: 1.5, width: menuOpen ? 20 : 10,
            background: "rgba(255,255,255,0.7)", borderRadius: 2,
            alignSelf: "flex-start", marginLeft: 10,
            transformOrigin: "center",
            transform: menuOpen ? "rotate(-45deg) translateY(-1px)" : "none",
            transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          }} />
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Navigation mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              inset: 0,
              top: 56,
              background: "rgba(0,0,0,0.97)",
              zIndex: 99,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              padding: "0 24px",
            }}
          >
            {navItems.map((item, i) => {
              const isActive = current === item.page && !isContactActive
              return (
                <motion.button
                  key={item.page}
                  onClick={() => handleNavClick(item)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    padding: "16px 0",
                    fontFamily: DISPLAY,
                    fontSize: 28,
                    fontWeight: isActive ? 800 : 400,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                    letterSpacing: -1,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    background: "transparent",
                    border: "none",
                    width: "100%",
                  }}
                >
                  {isActive && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#ff3b3b",
                      boxShadow: "0 0 12px rgba(255,59,59,0.6)",
                      flexShrink: 0,
                    }} />
                  )}
                  {item.label}
                </motion.button>
              )
            })}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: navItems.length * 0.05 + 0.1 }}
              style={{ marginTop: 32 }}
            >
              <Link
                href="/contact"
                aria-current={isContactActive ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 32px",
                  border: isContactActive
                    ? "1px solid rgba(255,255,255,0.18)"
                    : "1px solid rgba(255,59,59,0.3)",
                  borderRadius: 100,
                  color: isContactActive ? "#ffffff" : "#e82828",
                  background: isContactActive
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(255,59,59,0.04)",
                  fontFamily: BODY,
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
              >
                {isContactActive && (
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#ff3b3b",
                    boxShadow: "0 0 12px rgba(255,59,59,0.6)",
                    flexShrink: 0,
                  }} />
                )}
                Nous contacter
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}