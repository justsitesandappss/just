"use client"

import { useState, useEffect } from "react"
import Desktop from "@/components/desktop/RoomsExperience"
import Mobile from "@/components/mobile/RoomsExperience"

export default function RoomsExperience() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    setMounted(true)
    const handler = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted) return null
  return isMobile ? <Mobile /> : <Desktop />
}