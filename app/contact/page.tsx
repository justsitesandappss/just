import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import JustContactPage from "@/components/pages/JustContact"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Just Group — Influence, production, conciergerie ou média.",
}

export default function Page() {
  return (
    <>
      <Header />
      <JustContactPage />
      <Footer />
    </>
  )
}