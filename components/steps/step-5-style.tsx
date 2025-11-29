"use client"

interface Step5Props {
  data: any
  updateData: (key: string, value: any) => void
}

const travelStyles = [
  {
    id: "adventure",
    name: "모험",
    icon: "🥾",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "cultural",
    name: "문화",
    icon: "🏛️",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "relaxation",
    name: "휴식",
    icon: "🧘",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "food",
    name: "음식 & 와인",
    icon: "🍷",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "shopping",
    name: "쇼핑",
    icon: "🛍️",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "family",
    name: "가족 재미",
    icon: "🎡",
    image: "/placeholder.svg?height=300&width=400",
  },
]

export default function Step5Style({ data, updateData }: Step5Props) {
  const toggleStyle = (styleId: string) => {
    const updatedStyles = data.styles.includes(styleId)
      ? data.styles.filter((s: string) => s !== styleId)
      : [...data.styles, styleId]
    updateData("styles", updatedStyles)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-3 text-4xl font-bold text-gray-900">여행 스타일을 선택하세요</h1>
        <p className="text-gray-600">여러 스타일을 선택할 수 있습니다. 여정 생성이 더 정확해집니다.</p>
      </div>

      {/* Style Cards Grid 2x3 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {travelStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => toggleStyle(style.id)}
            className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
              data.styles.includes(style.id) ? "ring-4 ring-orange-400" : "hover:shadow-lg"
            }`}
          >
            <img
              src={style.image || "/placeholder.svg"}
              alt={style.name}
              className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="mb-2 text-5xl">{style.icon}</div>
              <h3 className="text-2xl font-bold text-white">{style.name}</h3>
              {data.styles.includes(style.id) && (
                <div className="mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-orange-400">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
