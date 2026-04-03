import type { Metadata } from "next"
import Header from "@/components/Header"
import TalentMoumlame from "@/components/pages/TalentMoumlame"

export const metadata: Metadata = {
  title: "Moumlame — Just Impact",
  description: "L'électron libre de la Team Nasdas. Moumlame, créateur viral TikTok et Snapchat, bad boy au cœur tendre.",
}

export default function Page() {
  return (
    <>
      <Header />
      <TalentMoumlame />
    </>
  )
}