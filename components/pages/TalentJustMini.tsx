"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"

const DISPLAY = "'Syne', sans-serif"
const BODY = "'Outfit', sans-serif"
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// Types
interface RevealProps {
  children: React.ReactNode
  delay?: number
}

interface MarqueeProps {
  items: string[]
  speed?: number
}

interface CounterProps {
  value: string
  label: string
  delay?: number
}

interface PlatformIconProps {
  platform: string
  size?: number
}

interface Platform {
  name: string
  followers: string
  desc: string
  main: boolean
}

interface Pillar {
  title: string
  desc: string
  icon: string
}

interface Collab {
  title: string
  desc: string
}

// Animation Components
function Reveal({ children, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

function Marquee({ items, speed = 35 }: MarqueeProps) {
  const tripleItems = [...items, ...items, ...items]

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <motion.div
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          display: "flex",
          gap: 40,
          width: "max-content",
          alignItems: "center",
        }}
      >
        {tripleItems.map((item, i) => (
          <React.Fragment key={i}>
            <span
              style={{
                fontFamily: DISPLAY,
                fontSize: 72,
                fontWeight: 800,
                color: "rgba(255,255,255,0.03)",
                letterSpacing: -3,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  )
}

function Counter({ value, label, delay = 0 }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const match = value.match(/^([+\-]?)(\d+\.?\d*)(.*)$/)
  const prefix = match ? match[1] : ""
  const num = match ? parseFloat(match[2]) : 0
  const suffix = match ? match[3] : value
  const decimals =
    match && match[2].includes(".")
      ? (match[2].split(".")[1] || "").length
      : 0
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const timeout = setTimeout(() => {
      const duration = 2200
      const startTime = Date.now()
      const run = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        const current = eased * num
        setCount(
          decimals > 0
            ? parseFloat(current.toFixed(decimals))
            : Math.floor(current)
        )
        if (progress < 1) requestAnimationFrame(run)
      }
      requestAnimationFrame(run)
    }, delay * 1000)
    return () => clearTimeout(timeout)
  }, [isInView, num, delay, decimals])

  const display = isInView
    ? `${prefix}${decimals > 0 ? count.toFixed(decimals) : count}${suffix}`
    : `${prefix}0${suffix}`

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 56,
          color: "#fff",
          lineHeight: 1,
          marginBottom: 8,
          letterSpacing: -3,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {display}
      </div>
      <div
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.2)",
          fontWeight: 600,
          letterSpacing: 4,
          textTransform: "uppercase",
          fontFamily: BODY,
        }}
      >
        {label}
      </div>
    </div>
  )
}

function PlatformIcon({ platform, size = 16 }: PlatformIconProps) {
  const p = platform.toLowerCase()
  const color = "rgba(255,255,255,0.5)"

  if (p === "snapchat") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2C8 2 6 5 6 8v2c-1 0-2 .5-2 1s1 1 2 1c-.5 2-2 3-4 4 0 .5.5 1 2 1 0 .5 0 1 .5 1.5S6 19 8 19.5c0 1 .5 2.5 4 2.5s4-1.5 4-2.5c2-.5 3-1 3.5-1.5s.5-1 .5-1.5c1.5 0 2-.5 2-1-2-1-3.5-2-4-4 1 0 2-.5 2-1s-1-1-2-1V8c0-3-2-6-6-6z" />
      </svg>
    )
  }

  if (p === "instagram") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none" />
      </svg>
    )
  }

  if (p === "tiktok") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    )
  }

  if (p === "youtube") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

// Main Component
export default function TalentJustMini() {
  // Data
  const heroImage = "https://cdn.jsdelivr.net/gh/justsitesandappss/Assets@main/talent-justmini.jpg"
  const name = "Just Mini"
  const alias = "Le Nain Boxeur"
  const handle = "@justmini"
  const bio = "Le phénomène martial des réseaux. Just Mini est un créateur de petite taille qui a fait des sports de combat — boxe, MMA — sa marque de fabrique absolue. Il casse tous les préjugés avec une énergie dingue, mélange autodérision, vraie technique sportive et sens du spectacle. Résultat : des vidéos virales qui captent l'attention et génèrent des millions de clics."
  const location = "France"

  const stats = [
    { value: "2M+", label: "Abonnés TikTok" },
    { value: "600K+", label: "Abonnés Instagram" },
    { value: "400K", label: "Abonnés Snapchat" },
    { value: "30M+", label: "Vues mensuelles" },
    { value: "3M+", label: "Vues en -24h" },
    { value: "12.7%", label: "Taux d'engagement" },
  ]

  const platforms: Platform[] = [
    {
      name: "TikTok",
      followers: "2M+",
      desc: "Son ring principal. Just Mini y déploie ses sparrings improbables, ses routines d'entraînement et ses caméras cachées en salle de boxe. Chaque vidéo est un uppercut visuel — l'algorithme ne peut pas résister à ce mélange de performance sportive et d'autodérision pure.",
      main: true,
    },
    {
      name: "Instagram",
      followers: "600K+",
      desc: "Sa vitrine de combattant. Photos d'entraînement, extraits de ses meilleurs sparrings, stories quotidiennes depuis la salle et collaborations avec des boxeurs professionnels. L'audience est ultra-engagée et fidèle.",
      main: false,
    },
    {
      name: "Snapchat",
      followers: "400K",
      desc: "Le quotidien brut de Just Mini — coulisses de ses entraînements, moments de vie, interactions avec sa communauté. Le format stories est parfait pour son énergie spontanée et son humour naturel.",
      main: false,
    },
    {
      name: "YouTube",
      followers: "250K",
      desc: "Vlogs d'entraînement, sparrings complets, documentaires sur son parcours, défis contre des combattants plus grands que lui. Le format long qui donne toute la mesure de son talent et de sa détermination.",
      main: false,
    },
  ]

  const pillars: Pillar[] = [
    {
      title: "Les Sparrings Improbables",
      desc: "C'est sa signature absolue. Just Mini monte sur le ring face à des adversaires qui font deux fois sa taille — et il tient bon. Parfois il domine, parfois il encaisse, mais à chaque fois c'est du spectacle pur. L'effet de surprise est dévastateur : on clique pour rigoler, on reste pour le talent.",
      icon: "🥊",
    },
    {
      title: "L'Autodérision Assumée",
      desc: "Just Mini ne fuit pas sa différence — il en fait son superpouvoir. Il joue avec les préjugés, les retourne, les pulvérise à coups de punchlines et de crochets du droit. Son humour est son meilleur jab : il désarme avant même de frapper. C'est cette authenticité qui rend chaque vidéo impossible à ignorer.",
      icon: "😤",
    },
    {
      title: "La Vraie Technique",
      desc: "Derrière le spectacle, il y a un vrai sportif. Just Mini s'entraîne sérieusement, maîtrise les fondamentaux de la boxe et du MMA, et partage ses routines avec sa communauté. Ses tutoriels techniques sont suivis par des milliers de passionnés qui respectent autant l'athlète que l'entertainer.",
      icon: "💪",
    },
    {
      title: "Le Sens du Spectacle",
      desc: "Chaque vidéo est une mise en scène. L'entrée dans la salle, le face-à-face avec l'adversaire, le premier coup — Just Mini sait créer la tension, le rire et l'émotion en quelques secondes. C'est du storytelling sportif à l'état pur, et c'est exactement ce que les marques recherchent pour capter l'attention.",
      icon: "🎬",
    },
  ]

  const ascensionText = "Just Mini a transformé ce que beaucoup auraient vu comme un handicap en un avantage compétitif délirant. En montant sur le ring face à des adversaires deux fois plus grands, il a créé un format que personne d'autre ne peut reproduire. Du premier TikTok filmé en salle à des millions de vues par mois, son ascension prouve une chose : le talent et l'audace n'ont pas de taille."

  const categories = ["Boxe", "MMA", "Sports de Combat", "Autodérision", "Fitness", "Divertissement"]

  const collabs: Collab[] = [
    {
      title: "Placement de produit",
      desc: "Intégration naturelle dans ses vidéos d'entraînement, stories et contenus quotidiens — équipements, nutrition, boissons, tech. Son audience fait confiance à ce qu'il porte et utilise sur le ring.",
    },
    {
      title: "Défi sponsorisé",
      desc: "Création d'un sparring ou défi sportif scénarisé autour de votre marque — le format viral signature de Just Mini avec un potentiel de partage explosif.",
    },
    {
      title: "Ambassadeur de marque",
      desc: "Partenariat long terme avec une marque de sport, nutrition ou lifestyle. Just Mini incarne la détermination et le dépassement de soi — des valeurs puissantes pour n'importe quelle marque.",
    },
    {
      title: "Événement & Activation",
      desc: "Présence en événement sportif, gala de boxe, activation en salle de sport ou meet & greet. Son charisme en live est magnétique — il ramène la foule et les caméras.",
    },
  ]

  const brandList = ["Sport", "Équipements de combat", "Nutrition", "Boissons énergétiques", "Mode", "Tech", "Gaming", "Divertissement"]

  const manifesto = "Just Mini ne demande pas la permission — il monte sur le ring. Quand un mec de petite taille enfile des gants et fait face à un adversaire deux fois plus grand, ça raconte une histoire que tout le monde comprend : celle du courage, de l'audace et du refus de se laisser définir par les autres. C'est pour ça que des millions de personnes le regardent. C'est pour ça que votre marque devrait être à ses côtés."

  return (
    <main
      style={{
        width: "100%",
        background: "#000",
        color: "#c8c8c8",
        fontFamily: BODY,
        overflowX: "hidden",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          position: "relative",
        }}
      >
        <div style={{ padding: "80px 72px" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                padding: "5px 14px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.06)",
                fontFamily: BODY,
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {alias}
            </div>
            <div
              style={{
                fontFamily: BODY,
                fontSize: 12,
                color: "rgba(255,255,255,0.25)",
              }}
            >
              {handle}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: EASE }}
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(48px, 6vw, 90px)",
              lineHeight: 0.92,
              color: "#fff",
              margin: 0,
              letterSpacing: -4,
            }}
          >
            {name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 24,
            }}
          >
            {categories.map((cat, i) => (
              <span
                key={i}
                style={{
                  padding: "6px 16px",
                  borderRadius: 100,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  fontFamily: BODY,
                  fontSize: 10,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {cat}
              </span>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            style={{
              marginTop: 28,
              fontSize: 15,
              lineHeight: 1.9,
              maxWidth: 460,
              color: "rgba(255,255,255,0.4)",
              fontWeight: 300,
            }}
          >
            {bio}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span
              style={{
                fontFamily: BODY,
                fontSize: 12,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: 1,
              }}
            >
              {location}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{ marginTop: 32, display: "flex", gap: 12 }}
          >
            {["TikTok", "Instagram", "Snapchat", "YouTube"].map((p, i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PlatformIcon platform={p} size={16} />
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
          style={{
            height: "100vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to right, #000 0%, transparent 30%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 30%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      </section>

      {/* Marquee */}
      <Marquee
        items={[
          "Just Mini",
          "Le Nain Boxeur",
          "Sparring",
          "MMA",
          "Uppercut",
          "Autodérision",
          "Ring",
          "K.O.",
        ]}
        speed={40}
      />

      {/* Stats Section */}
      <section style={{ padding: "100px 72px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.15)",
                marginBottom: 14,
              }}
            >
              En chiffres
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: "clamp(28px, 3.5vw, 44px)",
                color: "#fff",
                letterSpacing: -2,
              }}
            >
              L'audience{" "}
              <span style={{ color: "rgba(255,255,255,0.12)" }}>Just Mini.</span>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 48,
              rowGap: 56,
            }}
          >
            {stats.map((stat, i) => (
              <Counter
                key={i}
                value={stat.value}
                label={stat.label}
                delay={i * 0.06}
              />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Platforms Section */}
      <section style={{ padding: "40px 72px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.15)",
                marginBottom: 14,
              }}
            >
              Plateformes
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: "clamp(34px, 4.5vw, 58px)",
                color: "#fff",
                lineHeight: 1,
                letterSpacing: -3,
                marginBottom: 48,
              }}
            >
              Ses rings{" "}
              <span style={{ color: "rgba(255,255,255,0.12)" }}>digitaux.</span>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {platforms.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <motion.div
                  whileHover={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: "rgba(255,255,255,0.01)",
                    border: `1px solid ${p.main ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                    borderRadius: 20,
                    padding: "36px 24px",
                    cursor: "default",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {p.main && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 14,
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: "rgba(255,255,255,0.06)",
                        fontFamily: BODY,
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      Principal
                    </div>
                  )}
                  <div style={{ marginBottom: 16 }}>
                    <PlatformIcon platform={p.name} size={24} />
                  </div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 800,
                      fontSize: 14,
                      color: "#fff",
                      letterSpacing: -0.3,
                      marginBottom: 4,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 800,
                      fontSize: 32,
                      color: "#fff",
                      letterSpacing: -2,
                      lineHeight: 1,
                      marginBottom: 14,
                    }}
                  >
                    {p.followers}
                  </div>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: 12,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.3)",
                      fontWeight: 300,
                      margin: 0,
                    }}
                  >
                    {p.desc}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Ascension Quote */}
      <section
        style={{
          padding: "80px 72px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Reveal>
          <div style={{ maxWidth: 800, textAlign: "center" }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.15)",
                marginBottom: 32,
              }}
            >
              L'ascension
            </div>
            <blockquote
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(20px, 2.8vw, 34px)",
                fontWeight: 300,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.6)",
                margin: 0,
                letterSpacing: -0.5,
                fontStyle: "italic",
              }}
            >
              "{ascensionText}"
            </blockquote>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 60 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
              style={{
                height: 2,
                background: "rgba(255,255,255,0.15)",
                margin: "36px auto 0",
              }}
            />
          </div>
        </Reveal>
      </section>

      {/* Content Pillars */}
      <section style={{ padding: "40px 72px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.15)",
                marginBottom: 14,
              }}
            >
              Le contenu
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: "clamp(34px, 4.5vw, 58px)",
                color: "#fff",
                lineHeight: 1,
                letterSpacing: -3,
                marginBottom: 48,
              }}
            >
              Petit gabarit,{" "}
              <span style={{ color: "rgba(255,255,255,0.12)" }}>gros impact.</span>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
            }}
          >
            {pillars.map((p, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <motion.div
                  whileHover={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: 24,
                    padding: "48px 36px",
                    cursor: "default",
                    display: "flex",
                    gap: 24,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontSize: 36,
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: DISPLAY,
                        fontWeight: 800,
                        fontSize: 20,
                        color: "#fff",
                        letterSpacing: -0.5,
                        marginBottom: 12,
                        lineHeight: 1.2,
                      }}
                    >
                      {p.title}
                    </div>
                    <p
                      style={{
                        fontFamily: BODY,
                        fontSize: 14,
                        lineHeight: 1.85,
                        color: "rgba(255,255,255,0.35)",
                        fontWeight: 300,
                        margin: 0,
                      }}
                    >
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Second Marquee */}
      <div style={{ padding: "40px 0" }}>
        <Marquee
          items={[
            "Uppercut",
            "Sparring",
            "Crochet du droit",
            "Autodérision",
            "Salle de boxe",
            "Combat",
            "Gants",
            "K.O.",
          ]}
          speed={30}
        />
      </div>

      {/* Collaboration Section */}
      <section style={{ padding: "80px 72px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.15)",
                marginBottom: 14,
              }}
            >
              Collaborer
            </div>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: "clamp(34px, 4.5vw, 58px)",
                color: "#fff",
                lineHeight: 1,
                letterSpacing: -3,
                marginBottom: 48,
              }}
            >
              Formats de{" "}
              <span style={{ color: "rgba(255,255,255,0.12)" }}>collaboration.</span>
            </div>
          </Reveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
            }}
          >
            {collabs.map((c, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <motion.div
                  whileHover={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: "rgba(255,255,255,0.01)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: 20,
                    padding: "40px 24px",
                    cursor: "default",
                    textAlign: "center",
                    minHeight: 220,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: 56,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.02)",
                      lineHeight: 1,
                      marginBottom: 16,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 800,
                      fontSize: 16,
                      color: "#fff",
                      marginBottom: 12,
                      letterSpacing: -0.3,
                    }}
                  >
                    {c.title}
                  </div>
                  <p
                    style={{
                      fontFamily: BODY,
                      fontSize: 12,
                      lineHeight: 1.75,
                      color: "rgba(255,255,255,0.3)",
                      fontWeight: 300,
                      margin: 0,
                      maxWidth: 220,
                    }}
                  >
                    {c.desc}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Sectors */}
      <section style={{ padding: "40px 72px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.15)",
                marginBottom: 20,
              }}
            >
              Secteurs d'activité
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {brandList.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    ease: EASE,
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 100,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    fontFamily: BODY,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {b}
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Manifesto */}
      <section
        style={{
          padding: "100px 72px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Reveal>
          <div style={{ maxWidth: 800, textAlign: "center" }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.15)",
                marginBottom: 32,
              }}
            >
              Pourquoi Just Mini
            </div>
            <blockquote
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(22px, 3vw, 38px)",
                fontWeight: 300,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.7)",
                margin: 0,
                letterSpacing: -1,
                fontStyle: "italic",
              }}
            >
              "{manifesto}"
            </blockquote>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 60 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
              style={{
                height: 2,
                background: "rgba(255,255,255,0.15)",
                margin: "36px auto 0",
              }}
            />
          </div>
        </Reveal>
      </section>

      {/* CTA Section */}
      <section
        style={{
          textAlign: "center",
          padding: "120px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at center bottom, rgba(255,255,255,0.02) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <Reveal>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(44px, 7vw, 100px)",
              lineHeight: 0.95,
              marginBottom: 20,
              letterSpacing: -4,
              color: "#fff",
            }}
          >
            Collaborer avec Just Mini.
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.3)",
              maxWidth: 480,
              margin: "0 auto 40px",
              lineHeight: 1.8,
              fontWeight: 300,
            }}
          >
            Placement, défi sponsorisé, ambassadeur, activation événementielle — discutons de comment votre marque peut monter sur le ring avec Just Mini.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <motion.a
            href="#"
            whileHover={{
              y: -3,
              backgroundColor: "#fff",
              color: "#000",
            }}
            whileTap={{ scale: 0.96 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "18px 42px",
              background: "transparent",
              color: "#fff",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: 100,
              border: "1px solid rgba(255,255,255,0.2)",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            Proposer une collab
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </motion.a>
        </Reveal>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "28px 72px",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.12)",
            letterSpacing: 4,
            margin: 0,
            fontWeight: 700,
            fontFamily: DISPLAY,
          }}
        >
          JUST IMPACT
          <span style={{ color: "rgba(255,255,255,0.3)" }}>.</span> © 2026
        </p>
        <p
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.08)",
            letterSpacing: 4,
            margin: 0,
            fontFamily: BODY,
          }}
        >
          Paris, France
        </p>
      </footer>
    </main>
  )
}