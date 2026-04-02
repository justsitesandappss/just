import type { Metadata } from "next"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import JustPodcastPage from "@/components/pages/JustPodcast"

export const metadata: Metadata = {
  title: "Just Podcast",
  description: "Just conçoit, produit et distribue des podcasts de marque pour renforcer votre crédibilité, engager vos audiences et faire entendre votre expertise.",
}

export default function Page() {
  return (
    <>
      <Header />
      <JustPodcastPage />
      <Footer />
    </>
  )
}