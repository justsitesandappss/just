import type { Metadata } from "next"
import JustPage from "@/components/pages/JustPage"

export const metadata: Metadata = {
  title: "Just",
  description:
    "Découvrez Just, un écosystème créatif qui réunit influence, production et conciergerie de luxe.",
}

export default function Page() {
  return <JustPage />
}