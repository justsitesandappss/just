import type { Metadata } from "next"
import Header from "@/components/Header"
import JustSponsorsPage from "@/components/pages/JustSponsors"

export const metadata: Metadata = {
  title: "Nos Sponsors",
  description: "De grandes marques internationales aux acteurs locaux les plus ambitieux, nos partenaires partagent notre vision de l'excellence.",
}

export default function Page() {
  return (
    <>
      <Header />
      <JustSponsorsPage />
    </>
  )
}