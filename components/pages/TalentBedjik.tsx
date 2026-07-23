"use client"

import TalentTemplate, { type TalentData } from "@/components/pages/TalentTemplate"

const data: TalentData = {
  name: "Bedjik",
  handle: "@bedjikoff",
  categories: ["Musique", "Business", "Networking"],
  bio: "Bedjik évolue depuis plusieurs années au cœur de l'industrie musicale et artistique, aux côtés de son frère Gims. Artiste et booker reconnu, il s'est construit une véritable crédibilité grâce à son réseau, sa vision et sa capacité à créer des collaborations fortes.",
  location: "France",
  image: "/talent-bedjik-portrait.jpg",
  platforms: [
    { name: "Snapchat", followers: "51.3K", desc: "Coulisses de l'industrie musicale, projets et masterclass. Un accès privilégié à son univers business et artistique.", main: true },
    { name: "TikTok", followers: "40.8K", desc: "Contenus lifestyle et divertissement, avec des vidéos qui dépassent régulièrement le million de vues.", main: false },
  ],
  stats: [
    { value: "51.3K", label: "Abonnés Snapchat" },
    { value: "40.8K", label: "Abonnés TikTok" },
    { value: "1.3M", label: "J'aime TikTok" },
    { value: "2.4M", label: "Vues (top vidéo)" },
  ],
  pillars: [
    { title: "Industrie musicale", desc: "Au cœur du milieu de la musique aux côtés de son frère Gims, Bedjik connaît les codes et les acteurs du secteur.", icon: "🎵" },
    { title: "Booker & réseau", desc: "Artiste et booker reconnu, il crée des connexions et des collaborations fortes entre marques, artistes et projets.", icon: "🤝" },
    { title: "Vision business", desc: "Un profil influent à la croisée de la musique, de l'artistique et du business, apprécié pour son professionnalisme.", icon: "📈" },
    { title: "Univers digital", desc: "Il développe sa présence sur les réseaux pour mettre en lumière son univers, ses projets et ses collaborations.", icon: "📱" },
  ],
  quote: "Bedjik s'est construit une crédibilité rare : celle d'un homme de réseau qui comprend à la fois l'artistique, la scène et le business.",
  quoteEyebrow: "Son univers",
  manifesto: "Avec Bedjik, une marque n'accède pas seulement à une audience : elle entre dans un réseau, celui de la musique et du divertissement.",
  manifestoEyebrow: "Pourquoi Bedjik",
  sectors: ["Musique", "Événementiel", "Mode", "Lifestyle", "Business", "Streetwear"],
}

export default function TalentBedjik() {
  return <TalentTemplate data={data} />
}
