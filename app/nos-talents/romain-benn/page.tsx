import type { Metadata } from "next"
import Header from "@/components/Header"
import TalentRomainBenn from "@/components/pages/TalentRomainBenn"

export const metadata: Metadata = {
  title: "Romain Benn — Just Impact",
  description: "Influenceur lifestyle et fitness. Vainqueur The Circle France, ambassadeur bien-être avec 144K abonnés Instagram et 703K TikTok.",
}

export default function Page() {
  return (
    <>
      <Header />
      <TalentRomainBenn />
    </>
  )
}