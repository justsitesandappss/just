import type { Metadata } from "next"
import JustContactPage from "@/components/pages/JustContact"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Just pour vos projets d’influence, de production, de conciergerie et de média.",
}

export default function Page() {
  return <JustContactPage />
}