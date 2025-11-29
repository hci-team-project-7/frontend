"use client"
import { useState } from "react"
import { Search } from "lucide-react"

interface Step1Props {
  data: any
  updateData: (key: string, value: any) => void
}

const popularCountries = [
  {
    id: "france",
    name: "프랑스",
    flag: "🇫🇷",
    landmark: "/eiffel-tower-paris.png",
  },
  {
    id: "japan",
    name: "일본",
    flag: "🇯🇵",
    landmark: "/mount-fuji-japan.png",
  },
  {
    id: "italy",
    name: "이탈리아",
    flag: "🇮🇹",
    landmark: "/colosseum-rome.png",
  },
  {
    id: "spain",
    name: "스페인",
    flag: "🇪🇸",
    landmark: "/sagrada-familia-barcelona.png",
  },
  {
    id: "greece",
    name: "그리스",
    flag: "🇬🇷",
    landmark: "/santorini-greece.png",
  },
  {
    id: "thailand",
    name: "태국",
    flag: "🇹🇭",
    landmark: "/grand-palace-bangkok.png",
  },
]

export default function Step1Destination({ data, updateData }: Step1Props) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCountries = popularCountries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-3 text-4xl font-bold text-gray-900">어디로 여행을 가고 싶으신가요?</h1>
        <p className="text-gray-600">여행할 나라를 선택하세요. 나중에 도시를 선택할 수 있습니다.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="나라 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {/* Country Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCountries.map((country) => (
          <button
            key={country.id}
            onClick={() => updateData("country", country.name)}
            className={`group relative overflow-hidden rounded-lg transition-all duration-300 ${
              data.country === country.name ? "ring-4 ring-orange-400" : "hover:shadow-lg"
            }`}
          >
            <img src={country.landmark || "/placeholder.svg"} alt={country.name} className="h-40 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl">{country.flag}</div>
              <div className="mt-2 text-2xl font-bold text-white">{country.name}</div>
            </div>
          </button>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">검색 결과가 없습니다. 다른 검색어를 시도해보세요.</p>
        </div>
      )}
    </div>
  )
}
