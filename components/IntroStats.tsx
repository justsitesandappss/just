"use client"

import { useState, useEffect } from "react"
import Desktop from "@/components/desktop/IntroStats"
import Mobile from "@/components/mobile/IntroStats"

export default function IntroStats() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)")

    const listener = () => setIsMobile(media.matches)

    listener() // init propre
    media.addEventListener("change", listener)

    return () => media.removeEventListener("change", listener)
  }, [])

  return isMobile ? <Mobile /> : <Desktop />
}