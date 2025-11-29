"use client"
import { useState } from "react"
import ActivityTimeline from "@/components/itinerary/activity-timeline"
import ActivityDetail from "@/components/itinerary/activity-detail"

interface Location {
  name: string
  time: string
  lat: number
  lng: number
}

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

interface PlannerData {
  country: string | null
  cities: string[]
  dateRange: { start: string; end: string } | null
  travelers: { adults: number; children: number; type: string }
  styles: string[]
}

const ACTIVITIES: Record<number, Activity[]> = {
  1: [
    {
      id: "1-1",
      name: "공항 도착",
      location: "국제공항",
      time: "10:00 AM",
      duration: "1시간",
      description: "공항에 도착하여 짐을 받습니다.",
      image: "/airport-arrival.jpg",
      openHours: "24/7",
      price: "무료",
      tips: ["여권 준비", "수하물 확인", "환전소 위치 파악"],
      nearbyFood: ["공항 카페", "패스트푸드", "지역 음식점"],
      estimatedDuration: "1시간",
      bestTime: "오전",
    },
    {
      id: "1-2",
      name: "호텔 체크인",
      location: "럭셔리 호텔 다운타운",
      time: "12:00 PM",
      duration: "1시간",
      description: "호텔에 체크인하고 객실을 둘러봅시다.",
      image: "/hotel-check-in.jpg",
      openHours: "24시간",
      price: "1박 $150",
      tips: ["조기 체크인 요청", "객실 상태 확인", "호텔 지도 받기"],
      nearbyFood: ["호텔 레스토랑", "주변 음식점"],
      estimatedDuration: "30분",
      bestTime: "오후",
    },
    {
      id: "1-3",
      name: "저녁 시가지 산책",
      location: "다운타운 지구",
      time: "05:00 PM",
      duration: "2시간",
      description: "저녁 햇빛 아래 도시의 주요 거리를 산책합니다.",
      image: "/downtown-evening-walk.jpg",
      openHours: "항상 열려있음",
      price: "무료",
      tips: ["편한 신발 착용", "카메라 준비", "주변 방향 숙지"],
      nearbyFood: ["스트릿 푸드", "카페", "레스토랑"],
      estimatedDuration: "2시간",
      bestTime: "저녁",
    },
    {
      id: "1-4",
      name: "지역 레스토랑 식사",
      location: "전통 음식점",
      time: "07:30 PM",
      duration: "1.5시간",
      description: "지역의 전통 요리를 맛봅시다.",
      image: "/traditional-restaurant-dinner.jpg",
      openHours: "11:00 AM - 11:00 PM",
      price: "$30-50",
      tips: ["미리 예약", "현지 특선 추천", "현지인처럼 먹기"],
      nearbyFood: ["디저트 카페", "바"],
      estimatedDuration: "1.5시간",
      bestTime: "저녁",
    },
  ],
}

export default function DailyDetailPage({
  day,
  data,
}: {
  day: number
  data: PlannerData
}) {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const activities = ACTIVITIES[day] || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-blue-900">Day {day} 상세 일정</h1>
        <div className="flex gap-2">
          {Array.from({ length: 7 }, (_, i) => (
            <button
              key={i + 1}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                day === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Day {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left side - Timeline */}
        <div className="col-span-12 lg:col-span-5">
          <ActivityTimeline
            activities={activities}
            expandedActivity={expandedActivity}
            onSelectActivity={setExpandedActivity}
          />
        </div>

        {/* Right side - Map and Details */}
        <div className="col-span-12 lg:col-span-7">
          {expandedActivity ? (
            <ActivityDetail activity={activities.find((a) => a.id === expandedActivity) || activities[0]} />
          ) : (
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 text-lg">왼쪽에서 활동을 선택하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
