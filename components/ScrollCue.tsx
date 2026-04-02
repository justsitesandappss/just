"use client"

import { useState, useEffect } from "react"
import Desktop from "@/components/desktop/ScrollCue"
import Mobile from "@/components/mobile/ScrollCue"

export default function ScrollCue() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener("resize", check)
    setMounted(true)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (!mounted) return null
  return isMobile ? <Mobile /> : <Desktop />
}