import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import JustMediaPage from "@/components/pages/JustMedia"

export const metadata: Metadata = {
  title: "Just Media 4 You",
  description: "Just Media 4 You est notre propre média digital. Une audience engagée, des formats natifs et une crédibilité éditoriale pour donner à votre marque de la visibilité.",
}

export default function Page() {
  return (
    <>
      <Header />
      <JustMediaPage />
      <Footer />
    </>
  )
}