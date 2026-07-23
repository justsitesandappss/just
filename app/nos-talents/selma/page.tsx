import type { Metadata } from "next"
import TalentSelma from "@/components/pages/TalentSelma"

export const metadata: Metadata = {
  title: "Selma 8émerveille — Just Impact",
  description: "Créatrice beauté, lifestyle et mode. Maman et femme inspirante, une communauté féminine fidèle et engagée, relais authentique pour les marques.",
}

export default function SelmaPage() {
  return <TalentSelma />
}
