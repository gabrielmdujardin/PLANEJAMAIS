"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()

  return (
    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
      <ArrowLeft className="h-5 w-5" />
      <span className="sr-only">Voltar</span>
    </Button>
  )
}
