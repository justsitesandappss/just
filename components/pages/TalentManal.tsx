"use client"

import TalentTemplate, { type TalentData } from "@/components/pages/TalentTemplate"

const data: TalentData = {
  name: "Manal V2V",
  handle: "@manal_v2v",
  categories: ["Lifestyle", "Gaming", "Automobile"],
  bio: "Manal est une influenceuse française reconnue pour son univers esthétique affirmé et sa personnalité authentique. Passionnée de gaming et de streaming, elle partage aussi son univers automobile (covering), un double univers qui lui permet de toucher une audience large et engagée.",
  location: "France",
  image: "/talent-manal.jpg",
  platforms: [
    { name: "Snapchat", followers: "206.8K", desc: "Plateforme principale : stories immersives, quotidien et proximité. Une audience très active au fil des jours.", main: true },
    { name: "TikTok", followers: "17.6K", desc: "Contenus lifestyle et divertissement, avec des vidéos qui atteignent régulièrement le million de vues.", main: false },
  ],
  stats: [
    { value: "206.8K", label: "Abonnés Snapchat" },
    { value: "17.6K", label: "Abonnés TikTok" },
    { value: "808.4K", label: "J'aime TikTok" },
    { value: "2M", label: "Vues (top vidéo)" },
  ],
  pillars: [
    { title: "Univers esthétique", desc: "Très coquette, elle accorde une grande importance à son image et à un univers visuel soigné et affirmé.", icon: "💎" },
    { title: "Gaming & streaming", desc: "Passionnée de gaming, elle partage des moments authentiques avec sa communauté autour de sa passion.", icon: "🎮" },
    { title: "Covering automobile", desc: "Elle s'intéresse aussi au covering automobile, apportant une touche originale et atypique à son contenu.", icon: "🚗" },
    { title: "Communauté fidèle", desc: "Un double univers, féminité et technique, qui rassemble une communauté séduite par son naturel et son énergie.", icon: "💚" },
  ],
  quote: "Ce mélange entre féminité, passion gaming et univers automobile lui permet de se démarquer et de toucher une audience large et engagée.",
  quoteEyebrow: "Son univers",
  manifesto: "Manal a su créer une identité forte, rassemblant une communauté fidèle, séduite par son naturel, son énergie et sa capacité à casser les codes.",
  manifestoEyebrow: "Pourquoi Manal",
  sectors: ["Beauté", "Mode", "Gaming", "Automobile", "Lifestyle", "Tech"],
}

export default function TalentManal() {
  return <TalentTemplate data={data} />
}
