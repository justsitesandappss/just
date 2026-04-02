"use client"

import { useState, useEffect } from "react"
import Desktop from "@/components/desktop/Header"
import Mobile from "@/components/mobile/Header"

export default function Header() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    setMounted(true)
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (!mounted) return null
  return isMobile ? <Mobile /> : <Desktop />
}