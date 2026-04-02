import Header from "@/components/Header"
import HeroMedia from "@/components/HeroMedia"
import ScrollCue from "@/components/ScrollCue"
import IntroStats from "@/components/IntroStats"

export default function HomePage() {
  return (
    <main id="main-content">
      <Header />
      <HeroMedia />
      <ScrollCue />
      <IntroStats />
    </main>
  )
}