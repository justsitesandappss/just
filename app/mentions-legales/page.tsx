"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import LegalPages from "@/components/LegalPages"

type PageKey = "conditions" | "confidentialite" | "cookies"
const VALID_TABS: PageKey[] = ["conditions", "confidentialite", "cookies"]

function LegalContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab")
  const activePage: PageKey =
    tab && VALID_TABS.includes(tab as PageKey) ? (tab as PageKey) : "conditions"

  return <LegalPages page={activePage} />
}

export default function MentionsLegalesPage() {
  return (
    <Suspense
      fallback={<div style={{ background: "#0a0a0a", minHeight: "100vh" }} />}
    >
      <LegalContent />
    </Suspense>
  )
}