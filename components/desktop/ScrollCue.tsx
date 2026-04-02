"use client"

import { useEffect } from "react"

export default function ScrollCueDesktop() {
  useEffect(() => {
    const id = "scrollcue-styles"
    if (document.getElementById(id)) return

    const style = document.createElement("style")
    style.id = id
    style.textContent = `
      @keyframes scrollWheel {
        0%   { transform: translateY(0); opacity: 1; }
        55%  { transform: translateY(10px); opacity: 0; }
        56%  { transform: translateY(0); opacity: 0; }
        80%  { opacity: 1; }
        100% { transform: translateY(0); opacity: 1; }
      }
      @keyframes scrollArrow {
        0%, 100% { transform: rotate(45deg) translateY(0); opacity: 0.35; }
        50% { transform: rotate(45deg) translateY(4px); opacity: 1; }
      }
      .scroll-wheel {
        background: #dd0909;
        border-radius: 999px;
        box-shadow: 0 0 6px #dd0909;
        animation: scrollWheel 1.7s ease-in-out infinite 1.2s;
      }
      .scroll-arrow {
        border-right: 1.5px solid #dd0909;
        border-bottom: 1.5px solid #dd0909;
        transform: rotate(45deg);
        animation: scrollArrow 1.7s ease-in-out infinite;
      }
      .scroll-arrow-1 { animation-delay: 1.35s; }
      .scroll-arrow-2 { animation-delay: 1.5s; }
      .scroll-arrow-3 { animation-delay: 1.65s; }
    `
    document.head.appendChild(style)

    return () => {
      const el = document.getElementById(id)
      if (el) el.remove()
    }
  }, [])

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        padding: "0 0 60px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "clamp(6px, 1.5vw, 12px)",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "clamp(8px, 2vw, 11px)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
            whiteSpace: "nowrap",
          }}
        >
          Scroller vers le bas
        </span>

        <div
          style={{
            width: "clamp(18px, 4vw, 24px)",
            height: "clamp(30px, 6vw, 38px)",
            borderRadius: 13,
            border: "1.5px solid rgba(255,255,255,0.4)",
            display: "flex",
            justifyContent: "center",
            paddingTop: 6,
          }}
        >
          <div
            className="scroll-wheel"
            style={{
              width: "clamp(3px, 0.8vw, 4px)",
              height: "clamp(6px, 1.5vw, 8px)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <div className="scroll-arrow scroll-arrow-1" style={{ width: 8, height: 8 }} />
          <div className="scroll-arrow scroll-arrow-2" style={{ width: 8, height: 8 }} />
          <div className="scroll-arrow scroll-arrow-3" style={{ width: 8, height: 8 }} />
        </div>

        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "clamp(7px, 1.8vw, 9px)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.22)",
            whiteSpace: "nowrap",
          }}
        >
          Pour en savoir plus
        </span>
      </div>
    </div>
  )
}
