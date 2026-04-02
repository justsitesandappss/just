import Header from "@/components/Header"
import HeroMedia from "@/components/HeroMedia"
import ScrollCue from "@/components/ScrollCue"
import IntroStats from "@/components/IntroStats"
import RoomsExperience from "@/components/RoomsExperience"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <main id="main-content">
      <Header />
      <HeroMedia />
      <ScrollCue />
      <IntroStats />
      <RoomsExperience />
      <Footer />
    </main>
  )
}