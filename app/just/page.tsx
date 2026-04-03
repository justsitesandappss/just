import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import JustPage from "@/components/pages/JustPage"

export const metadata: Metadata = {
  title: "Just — Influence, Production & Conciergerie",
  description: "Un écosystème créatif qui unit influence, production et conciergerie de luxe.",
}

export default function Page() {
  return (
    <>
      <Header />
      <JustPage />
      <Footer />
    </>
  )
}