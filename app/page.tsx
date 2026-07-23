import { Suspense } from "react"
import HeroMedia from "@/components/HeroMedia"
import ScrollCue from "@/components/ScrollCue"
import IntroStats from "@/components/IntroStats"
import RoomsExperience from "@/components/RoomsExperience"

export default function HomePage() {
  return (
    <>
      <HeroMedia />
      <ScrollCue />
      <IntroStats />
      <Suspense fallback={null}>
        <RoomsExperience />
      </Suspense>
    </>
  )
}