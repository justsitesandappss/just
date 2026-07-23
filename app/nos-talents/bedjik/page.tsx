import type { Metadata } from "next"
import TalentBedjik from "@/components/pages/TalentBedjik"

export const metadata: Metadata = {
  title: "Bedjik — Just Impact",
  description: "Artiste et booker au cœur de l'industrie musicale aux côtés de son frère Gims. Un profil influent à la croisée de la musique et du business.",
}

export default function BedjikPage() {
  return <TalentBedjik />
}
