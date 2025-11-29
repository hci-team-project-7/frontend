"use client"
import { useState } from "react"
import HeroSection from "@/components/hero-section"
import TravelPlanner from "@/components/travel-planner"

export default function Home() {
  const [showPlanner, setShowPlanner] = useState(false)

  return (
    <main className="min-h-screen w-full overflow-hidden">
      {!showPlanner ? <HeroSection onStartPlanning={() => setShowPlanner(true)} /> : <TravelPlanner />}
    </main>
  )
}
