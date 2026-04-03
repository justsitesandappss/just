import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import KarimLipton from "@/components/pages/talents/KarimLipton"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  const titles: Record<string, string> = {
    karimlipton: "Karim Lipton",
    // Ajoute d'autres talents ici
  }
  
  return {
    title: titles[slug] || "Talent",
    description: `Découvrez ${titles[slug] || "ce talent"} chez Just.`,
  }
}

export default async function TalentPage({ params }: Props) {
  const { slug } = await params
  
  // Pour l'instant, on ne gère que karimlipton
  // Tu peux étendre ça pour d'autres talents plus tard
  
  return (
    <>
      <Header />
      <KarimLipton />
      <Footer />
    </>
  )
}