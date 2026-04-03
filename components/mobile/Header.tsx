"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const ROOMS_ANCHOR_ID = "just-rooms-container"
const scrollOffset = -80

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
  { label: "Just Agency", page: "nav4", href: "/just-agency" },
  { label: "Nos Talents", page: "nav6", room: 4 },
  { label: "Just Prod", page: "nav5", room: 5 },
]

export default function HeaderMobile() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [current, setCurrent] = useState("nav1")
  const [open, setOpen] = useState(false)

  function scrollToRooms() {
    const el = document.getElementById(ROOMS_ANCHOR_ID)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY + scrollOffset
    window.scrollTo({ top, behavior: "smooth" })
  }

  function handleClick(item: NavItem) {
    setOpen(false)

    if (item.href) {
      setCurrent(item.page)
      router.push(item.href)
      return
    }

    if (typeof item.room !== "number") return

    setCurrent(item.page)

    if (pathname !== "/") {
      router.push(`/?jumpToRoom=${item.room - 1}`)
      return
    }

    window.dispatchEvent(
      new CustomEvent("just-nav-change", {
        detail: { roomIndex: item.room - 1 },
      })
    )

    scrollToRooms()
  }

  useEffect(() => {
    if (pathname === "/just-agency") {
      setCurrent("nav4")
      return
    }

    const jump = searchParams.get("jumpToRoom")

    if (pathname === "/" && jump !== null) {
      const roomIndex = parseInt(jump, 10)
      if (!Number.isNaN(roomIndex)) {
        const match = navItems.find((item) => item.room === roomIndex + 1)
        if (match) {
          setCurrent(match.page)
          return
        }
      }
    }

    if (pathname === "/") {
      setCurrent("nav1")
    }
  }, [pathname, searchParams])

  useEffect(() => {
    function onRoomChanged(e: Event) {
      const roomIndex = (e as CustomEvent<{ roomIndex?: number }>).detail?.roomIndex
      if (roomIndex == null) return

      const match = navItems.find((item) => item.room === roomIndex + 1)
      if (match) setCurrent(match.page)
    }

    window.addEventListener("just-room-changed", onRoomChanged)
    return () => window.removeEventListener("just-room-changed", onRoomChanged)
  }, [])

  return (
    <>
      <header
        style={{
          width: "100%",
          height: 64,
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 110,
          background: "rgba(0,0,0,0.88)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => router.push("/")}
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
          }}
        >
          JUST
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/contact"
            style={{
              color: "#e82828",
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Contact
          </Link>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.03)",
              color: "#fff",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span
              style={{
                display: "block",
                width: 16,
                height: 2,
                background: "#fff",
                boxShadow: open
                  ? "none"
                  : "0 5px 0 #fff, 0 -5px 0 #fff",
                transform: open ? "rotate(45deg)" : "none",
                transition: "all 0.2s ease",
              }}
            />
          </button>
        </div>
      </header>

      {open && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            zIndex: 109,
            background: "rgba(0,0,0,0.96)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "14px 18px 20px",
          }}
        >
          <nav
            aria-label="Navigation mobile"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {navItems.map((item) => {
              const isActive = current === item.page

              return (
                <button
                  key={item.page}
                  onClick={() => handleClick(item)}
                  style={{
                    width: "100%",
                    minHeight: 46,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: isActive
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.03)",
                    color: "#fff",
                    textAlign: "left",
                    padding: "0 14px",
                    fontFamily: BODY,
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}