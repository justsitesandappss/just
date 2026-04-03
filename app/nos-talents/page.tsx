import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import NosTalentsPage from "@/components/pages/NosTalents"

export const metadata: Metadata = {
  title: "Nos Talents - Influence & Créateurs",
  description: "Un réseau de créateurs triés sur le volet, alignés avec vos valeurs. Des voix authentiques, des communautés engagées, des résultats mesurables.",
}

export default function Page() {
  return (
    <>
      <Header />
      <NosTalentsPage />
      <Footer />
    </>
  )
}