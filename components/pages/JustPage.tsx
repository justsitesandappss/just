"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { motion } from "framer-motion"

function subscribeWindow(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("resize", callback)
  return () => window.removeEventListener("resize", callback)
}
function getWindowSnapshot() {
  if (typeof window === "undefined") return { width: 1280 }
  return { width: window.innerWidth || 1280 }
}
function getWindowServerSnapshot() {
  return { width: 1280 }
}

export default function JustPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const size = useSyncExternalStore(subscribeWindow, getWindowSnapshot, getWindowServerSnapshot)

  if (!mounted) {
    return <div style={{ background: "#000", minHeight: "100vh" }} />
  }

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ fontFamily: "sans-serif" }}
      >
        OK — framer-motion + useSyncExternalStore OK ({size.width}px)
      </motion.h1>
    </div>
  )
}