"use client"

import TalentTemplate, { type TalentData } from "@/components/pages/TalentTemplate"

const data: TalentData = {
  name: "Selma 8émerveille",
  handle: "@selma8émerveille",
  categories: ["Beauté", "Lifestyle", "Mode"],
  bio: "Créatrice de contenu spécialisée dans la beauté, le lifestyle et la mode. Maman et femme inspirante, elle véhicule des valeurs de confiance en soi, de détermination et d'épanouissement qui résonnent auprès d'une communauté fidèle et engagée.",
  location: "France",
  image: "/talent-selma.jpg",
  platforms: [
    { name: "Instagram", followers: "67.8K", desc: "Plateforme principale. Contenus beauté, mode et lifestyle mis en avant de façon naturelle auprès d'une communauté fidèle.", main: true },
    { name: "TikTok", followers: "34.4K", desc: "Formats courts et spontanés : ses vidéos dépassent régulièrement les centaines de milliers de vues.", main: false },
    { name: "Snapchat", followers: "6.8K", desc: "Quotidien et proximité, un lien direct et sincère avec sa communauté.", main: false },
  ],
  stats: [
    { value: "67.8K", label: "Abonnés Instagram" },
    { value: "34.4K", label: "Abonnés TikTok" },
    { value: "6.8K", label: "Abonnés Snapchat" },
    { value: "61.9K", label: "J'aime TikTok" },
    { value: "271.5K", label: "Vues (top vidéo)" },
  ],
  pillars: [
    { title: "Beauté & skincare", desc: "Maquillage, soins et routines : un univers soigné qui parle à une audience féminine attentive aux recommandations.", icon: "💄" },
    { title: "Mode & lifestyle", desc: "Outfits, quotidien et inspirations, un style féminin et moderne partagé avec authenticité et proximité.", icon: "✨" },
    { title: "Maman & femme inspirante", desc: "Confiance en soi, détermination et épanouissement personnel : des valeurs fortes qui résonnent auprès de sa communauté.", icon: "👑" },
    { title: "Confiance & proximité", desc: "Une véritable relation de confiance construite avec ses abonnés, qui fait d'elle un relais crédible pour les marques.", icon: "🤝" },
  ],
  quote: "Son univers féminin, moderne et bienveillant en fait un profil particulièrement pertinent pour les campagnes beauté, skincare, mode et lifestyle.",
  quoteEyebrow: "Son univers",
  manifesto: "Grâce à l'engagement de sa communauté et à la relation de confiance qu'elle a construite, Selma est un excellent relais pour les marques souhaitant toucher une audience féminine, attentive aux recommandations authentiques.",
  manifestoEyebrow: "Pourquoi Selma",
  sectors: ["Beauté", "Skincare", "Mode", "Bien-être", "Famille", "Lifestyle"],
}

export default function TalentSelma() {
  return <TalentTemplate data={data} />
}
