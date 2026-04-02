"use client"

import { useRef, useEffect } from "react"

const VIDEO_URL = "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/Intro.mp4"

export default function HeroMediaMobile() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.muted = true
    el.setAttribute("muted", "")
    el.setAttribute("playsinline", "")
    el.setAttribute("webkit-playsinline", "")
  }, [])

  function handleCanPlay() {
    const el = videoRef.current
    if (!el) return
    el.muted = true
    const p = el.play()
    if (p?.catch) {
      p.catch(() => {
        setTimeout(() => {
          if (!videoRef.current) return
          videoRef.current.muted = true
          videoRef.current.play().catch(() => {})
        }, 100)
      })
    }
  }

  return (
    <section
      aria-label="Vidéo de présentation Just"
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
        background: "#000",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        autoPlay
        preload="auto"
        onCanPlay={handleCanPlay}
        aria-label="Vidéo de présentation Just"
        style={{
          width: "100%",
          height: "100",
          display: "block",
          objectFit: "cover",
        }}
      />
    </section>
  )
}