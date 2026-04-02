"use client"

import { useEffect } from "react"

export default function ScrollCueMobile() {
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
  }, [])

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        padding: "0px 0 20px",
        marginTop: "-24px", // ← remonte le composant
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 8,
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
            width: 18,
            height: 28,
            borderRadius: 13,
            border: "1.5px solid rgba(255,255,255,0.4)",
            display: "flex",
            justifyContent: "center",
            paddingTop: 5,
          }}
        >
          <div className="scroll-wheel" style={{ width: 3, height: 5 }} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <div className="scroll-arrow scroll-arrow-1" style={{ width: 6, height: 6 }} />
          <div className="scroll-arrow scroll-arrow-2" style={{ width: 6, height: 6 }} />
          <div className="scroll-arrow scroll-arrow-3" style={{ width: 6, height: 6 }} />
        </div>

        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 7,
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