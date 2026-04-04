"use client"

import { useEffect, useState } from "react"

export default function JustPage() {
  const [mounted, setMounted] = useState(false)
  const [width, setWidth] = useState(1280)

  useEffect(() => {
    setMounted(true)
    setWidth(window.innerWidth)

    const handler = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  if (!mounted) {
    return <div style={{ background: "#000", minHeight: "100vh" }} />
  }

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ fontFamily: "sans-serif" }}>
        OK — sans framer-motion ({width}px)
      </h1>
    </div>
  )
}