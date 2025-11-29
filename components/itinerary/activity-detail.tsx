"use client"
import { useState } from "react"

interface Activity {
  id: string
  name: string
  location: string
  time: string
  duration: string
  description: string
  image: string
  openHours: string
  price: string
  tips: string[]
  nearbyFood: string[]
  estimatedDuration: string
  bestTime: string
}

export default function ActivityDetail({ activity }: { activity: Activity }) {
  const [isFavorite, setIsFavorite] = useState(false)

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
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            지도에서 보기
          </button>
          <button className="bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            길찾기
          </button>
        </div>
      </div>
    </div>
  )
}
