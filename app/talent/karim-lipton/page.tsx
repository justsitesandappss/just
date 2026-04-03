import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import KarimLipton from "@/components/pages/talents/KarimLipton"

export const metadata: Metadata = {
  title: "Karim Lipton - Talent Just",
  description: "Créateur dynamique et authentique, reconnu pour son sens du divertissement.",
}

export default function Page() {
  return (
    <>
      <Header />
      <KarimLipton />
      <Footer />
    </>
  )
}