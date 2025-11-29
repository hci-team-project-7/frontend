"use client"
import { useState } from "react"
import Step1Destination from "@/components/steps/step-1-destination"
import Step2Cities from "@/components/steps/step-2-cities"
import Step3Dates from "@/components/steps/step-3-dates"
import Step4Travelers from "@/components/steps/step-4-travelers"
import Step5Style from "@/components/steps/step-5-style"
import ProgressBar from "@/components/progress-bar"
import ItineraryResults from "@/components/itinerary-results"

interface PlannerData {
  country: string | null
  cities: string[]
  dateRange: { start: string; end: string } | null
  travelers: { adults: number; children: number; type: string }
  styles: string[]
}

export default function TravelPlanner() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [data, setData] = useState<PlannerData>({
    country: null,
    cities: [],
    dateRange: null,
    travelers: { adults: 1, children: 0, type: "Solo traveler" },
    styles: [],
  })

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerateItinerary = () => {
    setShowResults(true)
  }

  const updateData = (key: keyof PlannerData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  if (showResults) {
    return <ItineraryResults data={data} onBack={() => setShowResults(false)} />
  }

  return (
    <main className="min-h-screen bg-white">
      <ProgressBar currentStep={currentStep} totalSteps={5} />

      <div className="mx-auto max-w-4xl px-4 py-12">
        {currentStep === 1 && <Step1Destination data={data} updateData={updateData} />}
        {currentStep === 2 && <Step2Cities data={data} updateData={updateData} />}
        {currentStep === 3 && <Step3Dates data={data} updateData={updateData} />}
        {currentStep === 4 && <Step4Travelers data={data} updateData={updateData} />}
        {currentStep === 5 && <Step5Style data={data} updateData={updateData} />}

        {/* Navigation Buttons */}
        <div className="mt-12 flex justify-between">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="rounded-lg border-2 border-orange-400 px-8 py-3 font-semibold text-orange-400 transition-colors hover:bg-orange-50"
            >
              돌아가기
            </button>
          )}
          <div className="flex-1" />
          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 px-8 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-400/50"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleGenerateItinerary}
              className="rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 px-8 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-green-400/50"
            >
              나의 여정 생성하기
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
