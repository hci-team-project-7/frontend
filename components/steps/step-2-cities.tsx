"use client"
import { PlannerFormData } from "@/lib/api-types"

type UpdatePlannerData = <K extends keyof PlannerFormData>(key: K, value: PlannerFormData[K]) => void
type City = { id: string; name: string; image: string }

interface Step2Props {
  data: PlannerFormData
  updateData: UpdatePlannerData
}

const cityDatabase: Record<string, City[]> = {
  프랑스: [
    {
      id: "paris",
      name: "파리",
      image: "/paris-eiffel-tower.png",
    },
    {
      id: "lyon",
      name: "리옹",
      image: "/lyon-france-city.jpg",
    },
    {
      id: "marseille",
      name: "마르세유",
      image: "/marseille-french-riviera.jpg",
    },
    {
      id: "nice",
      name: "니스",
      image: "/nice-french-riviera.jpg",
    },
    {
      id: "versailles",
      name: "베르사유",
      image: "/versailles-palace.png",
    },
    {
      id: "toulouse",
      name: "툴루즈",
      image: "/toulouse-france.jpg",
    },
  ],
  일본: [
    {
      id: "tokyo",
      name: "도쿄",
      image: "/tokyo-skyline.png",
    },
    {
      id: "kyoto",
      name: "교토",
      image: "/kyoto-temples.png",
    },
    {
      id: "osaka",
      name: "오사카",
      image: "/osaka-cityscape.png",
    },
    {
      id: "hokkaido",
      name: "홋카이도",
      image: "/hokkaido-japan-snow.jpg",
    },
    {
      id: "hiroshima",
      name: "히로시마",
      image: "/hiroshima-japan.jpg",
    },
    {
      id: "fujisan",
      name: "후지산",
      image: "/mount-fuji.png",
    },
  ],
  이탈리아: [
    {
      id: "rome",
      name: "로마",
      image: "/rome-colosseum.png",
    },
    {
      id: "venice",
      name: "베니스",
      image: "/venice-italy-canals.jpg",
    },
    {
      id: "florence",
      name: "피렌체",
      image: "/florence-duomo.jpg",
    },
    {
      id: "milan",
      name: "밀라노",
      image: "/milan-italy.jpg",
    },
    {
      id: "cinque-terre",
      name: "친퀘테레",
      image: "/cinque-terre-italy.jpg",
    },
    {
      id: "capri",
      name: "카프리",
      image: "/capri-italy-island.jpg",
    },
  ],
  스페인: [
    {
      id: "barcelona",
      name: "바르셀로나",
      image: "/barcelona-sagrada-familia.jpg",
    },
    {
      id: "madrid",
      name: "마드리드",
      image: "/madrid-spain.jpg",
    },
    {
      id: "seville",
      name: "세비야",
      image: "/seville-spain.jpg",
    },
    {
      id: "granada",
      name: "그라나다",
      image: "/granada-alhambra.jpg",
    },
    {
      id: "valencia",
      name: "발렌시아",
      image: "/valencia-spain.jpg",
    },
    {
      id: "ibiza",
      name: "이비자",
      image: "/placeholder.svg?height=250&width=400",
    },
  ],
  그리스: [
    {
      id: "athens",
      name: "아테네",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "santorini",
      name: "산토리니",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "mykonos",
      name: "미코노스",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "rhodes",
      name: "로도스",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "crete",
      name: "크레타",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "delphi",
      name: "델포이",
      image: "/placeholder.svg?height=250&width=400",
    },
  ],
  태국: [
    {
      id: "bangkok",
      name: "방콕",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "phuket",
      name: "푸켓",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "chiang-mai",
      name: "치앙마이",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "pattaya",
      name: "파타야",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "krabi",
      name: "크래비",
      image: "/placeholder.svg?height=250&width=400",
    },
    {
      id: "samui",
      name: "사무이",
      image: "/placeholder.svg?height=250&width=400",
    },
  ],
}

export default function Step2Cities({ data, updateData }: Step2Props) {
  const cities = data.country ? cityDatabase[data.country] || [] : []

  const toggleCity = (cityName: string) => {
    const updatedCities = data.cities.includes(cityName)
      ? data.cities.filter((c: string) => c !== cityName)
      : [...data.cities, cityName]
    updateData("cities", updatedCities)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-3 text-4xl font-bold text-gray-900">어느 도시들을 방문하고 싶으신가요?</h1>
        <p className="mb-4 text-gray-600">{data.country} 여행에서 방문할 도시를 선택하세요.</p>
        <p className="text-sm text-gray-500">여러 도시를 선택할 수 있습니다.</p>
      </div>

      {/* Cities Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city: City) => (
          <button
            key={city.id}
            onClick={() => toggleCity(city.name)}
            className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
              data.cities.includes(city.name) ? "ring-4 ring-orange-400" : "hover:shadow-lg"
            }`}
          >
            <img src={city.image || "/placeholder.svg"} alt={city.name} className="h-48 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {data.cities.includes(city.name) && (
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-400">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="text-xl font-bold text-white">{city.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
