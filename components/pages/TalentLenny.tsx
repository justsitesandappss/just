"use client"

import TalentTemplate, { type TalentData } from "@/components/pages/TalentTemplate"

const data: TalentData = {
  name: "Lenny Freestyle",
  handle: "@lennyfreestyle",
  categories: ["Sport", "Divertissement", "Lifestyle"],
  bio: "Lenny est un créateur de contenu spécialisé dans le divertissement. À travers des défis, des expériences et des contenus lifestyle et sportifs, il propose des vidéos qui touchent un large public et génèrent régulièrement plusieurs millions de vues.",
  location: "Marseille, France",
  image: "/talent-lenny2.jpg",
  platforms: [
    { name: "Snapchat", followers: "672K", desc: "Stories quotidiennes, coulisses et proximité avec sa communauté. Une audience fidèle et très engagée.", main: true },
    { name: "YouTube", followers: "647K", desc: "Formats longs, défis et vlogs. La maison de ses concepts les plus ambitieux.", main: false },
    { name: "TikTok", followers: "565.1K", desc: "Vidéos courtes et virales : ses contenus dépassent régulièrement le million de vues.", main: false },
    { name: "Instagram", followers: "156K", desc: "Photos, extraits et communication directe autour de son univers sport et lifestyle.", main: false },
  ],
  stats: [
    { value: "672K", label: "Abonnés Snapchat" },
    { value: "647K", label: "Abonnés YouTube" },
    { value: "565.1K", label: "Abonnés TikTok" },
    { value: "156K", label: "Abonnés Instagram" },
    { value: "13.6M", label: "J'aime TikTok" },
    { value: "3.5M", label: "Vues (top vidéo)" },
  ],
  pillars: [
    { title: "Défis & concepts", desc: "Des challenges et expériences pensés pour l'engagement, avec une vraie mécanique de divertissement.", icon: "🔥" },
    { title: "Univers sportif", desc: "Le sport comme fil conducteur : énergie, dépassement de soi et contenus qui parlent à une audience jeune.", icon: "⚽" },
    { title: "Lifestyle", desc: "Il partage son quotidien et son univers, créant une proximité forte avec sa communauté.", icon: "✨" },
    { title: "Régularité", desc: "Sa constance et sa capacité à créer des contenus engageants lui permettent de s'adapter à tout type de campagne.", icon: "🎯" },
  ],
  quote: "Ses contenus génèrent régulièrement des centaines de milliers, voire plusieurs millions de vues, faisant de lui un profil idéal pour gagner en visibilité.",
  quoteEyebrow: "Son univers",
  manifesto: "Lenny met en avant les marques de manière authentique. Son univers, sa régularité et son énergie en font un partenaire naturel pour toucher une audience large et engagée.",
  manifestoEyebrow: "Pourquoi Lenny",
  sectors: ["Sport", "Mode", "Food", "Gaming", "Lifestyle", "Tech"],
}

export default function TalentLenny() {
  return <TalentTemplate data={data} />
}
