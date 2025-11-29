"use client"
import { Plus, Minus } from "lucide-react"

interface Step4Props {
  data: any
  updateData: (key: string, value: any) => void
}

const travelerTypes = [
  { id: "solo", name: "혼자 여행", icon: "👤", description: "1명" },
  { id: "couple", name: "커플", icon: "👥", description: "2명" },
  { id: "family", name: "가족", icon: "👨‍👩‍👧‍👦", description: "가족" },
  { id: "friends", name: "친구들", icon: "👫", description: "그룹" },
]

export default function Step4Travelers({ data, updateData }: Step4Props) {
  const handleIncrement = (type: "adults" | "children") => {
    const newTravelers = {
      ...data.travelers,
      [type]: data.travelers[type] + 1,
    }
    updateData("travelers", newTravelers)
  }

  const handleDecrement = (type: "adults" | "children") => {
    if (data.travelers[type] > 0) {
      const newTravelers = {
        ...data.travelers,
        [type]: data.travelers[type] - 1,
      }
      updateData("travelers", newTravelers)
    }
  }

  const selectTravelerType = (type: string) => {
    let adults = 1
    let children = 0

    if (type === "couple") {
      adults = 2
    } else if (type === "family") {
      adults = 2
      children = 1
    } else if (type === "friends") {
      adults = 4
    }

    updateData("travelers", { adults, children, type })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-3 text-4xl font-bold text-gray-900">누가 함께 여행하시나요?</h1>
        <p className="text-gray-600">여행 유형을 선택하거나 인원수를 직접 입력하세요.</p>
      </div>

      {/* Traveler Type Selection */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {travelerTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => selectTravelerType(type.id)}
            className={`rounded-lg border-2 p-6 transition-all ${
              data.travelers.type === type.id
                ? "border-orange-400 bg-orange-50"
                : "border-gray-200 hover:border-orange-200"
            }`}
          >
            <div className="mb-3 text-4xl">{type.icon}</div>
            <h3 className="mb-1 font-bold text-gray-900">{type.name}</h3>
            <p className="text-sm text-gray-600">{type.description}</p>
          </button>
        ))}
      </div>

      {/* Number Selection */}
      <div className="mx-auto max-w-md space-y-6 rounded-lg bg-gray-50 p-8">
        {/* Adults */}
        <div>
          <label className="mb-4 block font-semibold text-gray-900">성인 인원수</label>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => handleDecrement("adults")}
              className="rounded-lg border-2 border-orange-400 p-3 text-orange-400 hover:bg-orange-50"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-4xl font-bold text-gray-900">{data.travelers.adults}</span>
            <button
              onClick={() => handleIncrement("adults")}
              className="rounded-lg border-2 border-orange-400 p-3 text-orange-400 hover:bg-orange-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div>
          <label className="mb-4 block font-semibold text-gray-900">어린이 인원수</label>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => handleDecrement("children")}
              className="rounded-lg border-2 border-orange-400 p-3 text-orange-400 hover:bg-orange-50"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-4xl font-bold text-gray-900">{data.travelers.children}</span>
            <button
              onClick={() => handleIncrement("children")}
              className="rounded-lg border-2 border-orange-400 p-3 text-orange-400 hover:bg-orange-50"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-white p-4 text-center">
          <p className="text-sm text-gray-600">현재 선택</p>
          <p className="text-xl font-bold text-gray-900">
            성인 {data.travelers.adults}명, 어린이 {data.travelers.children}명
          </p>
        </div>
      </div>
    </div>
  )
}
