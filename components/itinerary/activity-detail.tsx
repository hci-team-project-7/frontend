"use client"
import { useEffect, useMemo, useState } from "react"
import { Activity } from "@/lib/api-types"

export default function ActivityDetail({ activity }: { activity: Activity }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [view, setView] = useState<"detail" | "map">("detail")

  // Reset view when activity changes
  useEffect(() => {
    setView("detail")
  }, [activity.id])

  const mapEmbed = useMemo(() => {
    const latNum = typeof activity.lat === "string" ? parseFloat(activity.lat) : activity.lat
    const lngNum = typeof activity.lng === "string" ? parseFloat(activity.lng) : activity.lng
    if (latNum === undefined || lngNum === undefined || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      return { url: null, error: "이 일정에는 위치 정보가 없습니다." }
    }
    const delta = 0.02
    const bbox = [lngNum - delta, latNum - delta, lngNum + delta, latNum + delta]
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.join(",")}&layer=mapnik&marker=${latNum},${lngNum}`
    return { url, error: null }
  }, [activity.lat, activity.lng])

  if (view === "map") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">📍 {activity.location}</p>
            <h2 className="text-2xl font-bold text-blue-900 mt-1">{activity.name}</h2>
          </div>
          <button
            onClick={() => setView("detail")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            뒤로 가기
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border-2 border-gray-200 h-96 relative">
          {mapEmbed.url ? (
            <iframe
              title={`${activity.name} map`}
              src={mapEmbed.url}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-sm text-gray-700">
              {mapEmbed.error || "지도를 불러오지 못했습니다."}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Image Gallery */}
      <div className="rounded-xl overflow-hidden bg-gray-200 h-80">
        <img src={activity.image || "/placeholder.svg"} alt={activity.name} className="w-full h-full object-cover" />
      </div>

      {/* Activity Info */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">{activity.name}</h2>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">📍 {activity.location}</p>
          </div>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`text-3xl transition-all ${isFavorite ? "text-red-500" : "text-gray-300 hover:text-red-500"}`}
          >
            ❤
          </button>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">운영 시간</p>
            <p className="font-semibold text-blue-900">{activity.openHours}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">입장료</p>
            <p className="font-semibold text-orange-700">{activity.price}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">방문 시간</p>
            <p className="font-semibold text-green-700">{activity.estimatedDuration}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">최적 시간</p>
            <p className="font-semibold text-purple-700">{activity.bestTime}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">설명</h3>
          <p className="text-gray-700 leading-relaxed">{activity.description}</p>
        </div>

        {/* Tips */}
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">여행 팁</h3>
          <ul className="space-y-1">
            {activity.tips.map((tip, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Nearby Food */}
        <div>
          <h3 className="font-semibold text-blue-900 mb-2">주변 음식점</h3>
          <div className="flex gap-2 flex-wrap">
            {activity.nearbyFood.map((food, idx) => (
              <span key={idx} className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                🍽 {food}
              </span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setView("map")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            지도에서 보기
          </button>
        </div>
      </div>
    </div>
  )
}
