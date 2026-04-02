import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import JustAgencyPage from "@/components/pages/JustAgency"

export const metadata: Metadata = {
  title: "Just Agency",
  description: "Just Agency est la conciergerie de luxe de JUST. Nous orchestrons l'inaccessible, des jets privés aux villas d'exception.",
}

export default function Page() {
  return (
    <>
      <Header />
      <JustAgencyPage />
      <Footer />
    </>
  )
}