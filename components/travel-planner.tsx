"use client"
import { useState } from "react"
import Step1Destination from "@/components/steps/step-1-destination"
import Step2Cities from "@/components/steps/step-2-cities"
import Step3Dates from "@/components/steps/step-3-dates"
import Step4Travelers from "@/components/steps/step-4-travelers"
import Step5Style from "@/components/steps/step-5-style"
import ProgressBar from "@/components/progress-bar"
import ItineraryResults from "@/components/itinerary-results"
import GenerationProgress from "@/components/generation-progress"
import { Itinerary, PlannerData, PlannerFormData } from "@/lib/api-types"
import { createItinerary } from "@/lib/api"

export default function TravelPlanner() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [formData, setFormData] = useState<PlannerFormData>({
    country: null,
    cities: [],
    dateRange: null,
    travelers: { adults: 1, children: 0, type: "Solo traveler" },
    styles: [],
  })
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleGenerateItinerary = async () => {
    if (!formData.country || !formData.dateRange) {
      setError("여행지와 여행 날짜를 모두 선택해주세요.")
      return
    }

    const payload: PlannerData = {
      country: formData.country,
      cities: formData.cities,
      dateRange: formData.dateRange,
      travelers: formData.travelers,
      styles: formData.styles,
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const createdItinerary = await createItinerary(payload)
      setItinerary(createdItinerary)
      setShowResults(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "여행 일정을 생성하는 중 문제가 발생했습니다."
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateData = <K extends keyof PlannerFormData>(key: K, value: PlannerFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  if (showResults && itinerary) {
    return (
      <ItineraryResults
        itinerary={itinerary}
        onBack={() => setShowResults(false)}
        onUpdateItinerary={(updated) => setItinerary(updated)}
      />
    )
  }

  return (
    <main className="relative min-h-screen bg-white">
      {isSubmitting && <GenerationProgress />}
      <ProgressBar currentStep={currentStep} totalSteps={5} />

      <div className="mx-auto max-w-4xl px-4 py-12">
        {currentStep === 1 && <Step1Destination data={formData} updateData={updateData} />}
        {currentStep === 2 && <Step2Cities data={formData} updateData={updateData} />}
        {currentStep === 3 && <Step3Dates data={formData} updateData={updateData} />}
        {currentStep === 4 && <Step4Travelers data={formData} updateData={updateData} />}
        {currentStep === 5 && <Step5Style data={formData} updateData={updateData} />}

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
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 px-8 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-green-400/50 disabled:opacity-70"
            >
              {isSubmitting ? "일정 생성 중..." : "나의 여정 생성하기"}
            </button>
          )}
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      </div>
    </main>
  )
}
