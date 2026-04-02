"use client"

import { useState, useEffect } from "react"
import Desktop from "@/components/desktop/ScrollCue"
import Mobile from "@/components/mobile/ScrollCue"

export default function ScrollCue() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)

    check()
    window.addEventListener("resize", check)

    return () => window.removeEventListener("resize", check)
  }, [])

  if (isMobile === null) return null

  return isMobile ? <Mobile /> : <Desktop />
}