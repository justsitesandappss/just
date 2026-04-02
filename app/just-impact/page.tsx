import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import JustImpactPage from "@/components/pages/JustImpact"

export const metadata: Metadata = {
  title: "Just Impact",
  description: "Just Impact est l'agence d'influence de JUST. On connecte les marques aux voix qui comptent, avec une stratégie data-driven et une exécution sans faille.",
}

export default function Page() {
  return (
    <>
      <Header />
      <JustImpactPage />
      <Footer />
    </>
  )
}