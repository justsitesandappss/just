"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useInView } from "framer-motion"

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const COUNTERS = [
  { target: 30,  suffix: "+", label: "Créateurs",        duration: 2000 },
  { target: 60,  suffix: "+", label: "Campagnes",        duration: 1800 },
  { target: 220, suffix: "M", label: "Millions de vues", duration: 2200 },
]

function useCountUp(target: number, duration: number, active: boolean, suffix: string) {
  const [value, setValue] = useState(`0${suffix}`)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      // Utiliser requestAnimationFrame pour éviter le setState synchrone
      raf.current = requestAnimationFrame(() => {
        setValue(`0${suffix}`)
      })
      return () => {
        if (raf.current) cancelAnimationFrame(raf.current)
      }
    }
    
    const start = performance.now()
    
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 4)
      setValue(`${Math.round(e * target)}${suffix}`)
      if (p < 1) {
        raf.current = requestAnimationFrame(step)
      }
    }
    
    raf.current = requestAnimationFrame(step)
    
    return () => { 
      if (raf.current) cancelAnimationFrame(raf.current) 
    }
  }, [active, target, duration, suffix])

  return value
}

function Counter({ target, suffix, label, duration, active }: {
  target: number, suffix: string, label: string, duration: number, active: boolean
}) {
  const value = useCountUp(target, duration, active, suffix)
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 300,
        fontSize: "clamp(20px, 2.5vw, 26px)", color: "#dd0909",
        letterSpacing: "-0.02em", lineHeight: 1,
        filter: "drop-shadow(0 0 8px rgba(221,9,9,0.5))",
      }}>
        {value}
      </span>
      <span style={{
        fontFamily: "'DM Mono', monospace", fontWeight: 300,
        fontSize: 8, letterSpacing: "0.38em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
        marginTop: 4, textAlign: "center",
      }}>
        {label}
      </span>
    </div>
  )
}

export default function IntroStatsDesktop() {
  const ref    = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const [countersActive, setCountersActive] = useState(false)

  useEffect(() => {
    if (!inView) return
    
    const t = setTimeout(() => setCountersActive(true), 1800)
    return () => clearTimeout(t)
  }, [inView])

  const titleLines = [
    { text: "Bienvenue",  color: "#ffffff",                italic: false },
    { text: "dans notre", color: "rgba(255,255,255,0.85)", italic: false },
    { text: "univers",    color: "#dd0909",                italic: true  },
  ]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,200;1,300&family=DM+Mono:wght@300;400&family=Syne:wght@300;400;600&display=swap');`}</style>

      <section ref={ref} style={{
        position: "relative", width: "100%",
        minHeight: "90vh", background: "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px clamp(20px, 4vw, 80px)",
        overflow: "hidden",
      }}>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 2, delay: 1 }}
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{
            width: "clamp(320px, 50vw, 700px)",
            height: "clamp(180px, 20vw, 300px)",
            background: "radial-gradient(ellipse, rgba(221,9,9,0.08) 0%, rgba(221,9,9,0.04) 50%, transparent 70%)",
            filter: "blur(80px)",
          }} />
        </motion.div>

        <div style={{
          width: "100%", maxWidth: 1200,
          display: "flex", flexDirection: "column",
          alignItems: "center", textAlign: "center",
          position: "relative", zIndex: 1,
        }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
            fontSize: "clamp(52px, 10vw, 118px)",
            lineHeight: 0.96, letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}>
            {titleLines.map((line, i) => (
              <span key={i} style={{ display: "block", overflow: "hidden", lineHeight: 1.1, paddingBottom: i === 2 ? "0.3em" : 0 }}>
                <motion.span
                  style={{
                    display: "block", color: line.color,
                    fontStyle: line.italic ? "italic" : "normal",
                    filter: line.italic ? "drop-shadow(0 0 28px rgba(221,9,9,0.4))" : "none",
                  }}
                  initial={{ y: "105%", opacity: 0, skewY: 3 }}
                  animate={inView ? { y: "0%", opacity: 1, skewY: 0 } : {}}
                  transition={{ duration: 1.1, delay: 0.55 + i * 0.17, ease: EASE }}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.3 }}
            style={{ display: "flex", alignItems: "center", gap: 16, margin: "40px 0 32px" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: 80 } : {}}
              transition={{ duration: 1.2, delay: 1.4, ease: EASE }}
              style={{ height: 1, background: "linear-gradient(90deg, transparent, #dd0909)", opacity: 0.5 }}
            />
            <motion.div
              animate={{ boxShadow: ["0 0 10px #dd0909, 0 0 24px rgba(221,9,9,0.6)", "0 0 18px #dd0909, 0 0 40px rgba(221,9,9,0.8)", "0 0 10px #dd0909, 0 0 24px rgba(221,9,9,0.6)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 5, height: 5, borderRadius: "50%", background: "#dd0909", flexShrink: 0 }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: 80 } : {}}
              transition={{ duration: 1.2, delay: 1.4, ease: EASE }}
              style={{ height: 1, background: "linear-gradient(90deg, #dd0909, transparent)", opacity: 0.5 }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 1.6, ease: EASE }}
            style={{
              display: "flex", flexWrap: "wrap",
              alignItems: "center", justifyContent: "center",
              gap: "clamp(18px, 4vw, 32px)",
            }}
          >
            {COUNTERS.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "clamp(18px, 4vw, 32px)" }}>
                {i > 0 && (
                  <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.08)" }} />
                )}
                <Counter {...c} active={countersActive} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}