import type { Metadata } from "next"
import TalentLenny from "@/components/pages/TalentLenny"

export const metadata: Metadata = {
  title: "Lenny Freestyle — Just Impact",
  description: "Créateur de contenu spécialisé dans le divertissement : défis, lifestyle et sport. Plus de 2M d'abonnés cumulés et des vidéos à plusieurs millions de vues.",
}

export default function LennyFreestylePage() {
  return <TalentLenny />
}
