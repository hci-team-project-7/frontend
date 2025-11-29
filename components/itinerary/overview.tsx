"use client"
import { useState } from "react"
import DaySidebar from "@/components/itinerary/day-sidebar"
import ItineraryMap from "@/components/itinerary/itinerary-map"

interface PlannerData {
  country: string | null
  cities: string[]
  dateRange: { start: string; end: string } | null
  travelers: { adults: number; children: number; type: string }
  styles: string[]
}

const MOCK_ITINERARY = [
  {
    day: 1,
    date: "2025-06-01",
    title: "도시 도착 및 탐험",
    photo: "/city-arrival.jpg",
    activities: ["공항 도착", "호텔 체크인", "저녁 시가지 산책", "지역 레스토랑 식사"],
    locations: [
      { name: "공항", time: "10:00", lat: 40.7128, lng: -74.006 },
      { name: "호텔", time: "12:00", lat: 40.758, lng: -73.9855 },
      { name: "타임스퀘어", time: "17:00", lat: 40.758, lng: -73.9855 },
      { name: "레스토랑", time: "19:30", lat: 40.7489, lng: -73.968 },
    ],
  },
  {
    day: 2,
    date: "2025-06-02",
    title: "유명 명소 방문",
    photo: "/famous-landmarks.jpg",
    activities: ["박물관 투어", "공원 산책", "전망대 방문", "쇼핑"],
    locations: [
      { name: "박물관", time: "09:00", lat: 40.7813, lng: -73.974 },
      { name: "센트럴 파크", time: "12:00", lat: 40.7829, lng: -73.9654 },
      { name: "전망대", time: "15:00", lat: 40.7484, lng: -73.9857 },
      { name: "쇼핑 거리", time: "17:30", lat: 40.7505, lng: -73.9972 },
    ],
  },
  {
    day: 3,
    date: "2025-06-03",
    title: "문화 체험",
    photo: "/vibrant-cultural-celebration.png",
    activities: ["갤러리 방문", "극장 공연", "지역 음식 투어", "야경 촬영"],
    locations: [
      { name: "갤러리", time: "10:00", lat: 40.7736, lng: -73.9566 },
      { name: "극장", time: "14:00", lat: 40.7505, lng: -73.9972 },
      { name: "음식 시장", time: "18:00", lat: 40.7489, lng: -73.968 },
      { name: "야경 전망점", time: "20:00", lat: 40.7061, lng: -74.0088 },
    ],
  },
  {
    day: 4,
    date: "2025-06-04",
    title: "자연 탐방",
    photo: "/nature-hiking.jpg",
    activities: ["산악 하이킹", "폭포 관광", "피크닉 점심", "별 관찰"],
    locations: [
      { name: "하이킹 시작점", time: "08:00", lat: 41.0534, lng: -74.2591 },
      { name: "폭포", time: "11:00", lat: 41.0722, lng: -74.2518 },
      { name: "피크닉 지점", time: "13:00", lat: 41.0534, lng: -74.2591 },
      { name: "별 관찰소", time: "20:00", lat: 41.1315, lng: -74.1481 },
    ],
  },
  {
    day: 5,
    date: "2025-06-05",
    title: "현지 시장 투어",
    photo: "/vibrant-local-market.png",
    activities: ["전통 시장", "지역 수공예 쇼핑", "요리 교실", "야식"],
    locations: [
      { name: "시장 입구", time: "09:00", lat: 40.7128, lng: -74.006 },
      { name: "수공예 샵", time: "11:00", lat: 40.7108, lng: -74.0073 },
      { name: "요리 학교", time: "14:00", lat: 40.7147, lng: -74.0055 },
      { name: "저녁 식사", time: "19:00", lat: 40.7489, lng: -73.968 },
    ],
  },
  {
    day: 6,
    date: "2025-06-06",
    title: "휴식 및 해변",
    photo: "/beach-relaxation.png",
    activities: ["비치 데이", "수상 스포츠", "해변 카페", "선셋 감상"],
    locations: [
      { name: "해변", time: "10:00", lat: 40.5731, lng: -73.9712 },
      { name: "수상 스포츠 센터", time: "12:00", lat: 40.5731, lng: -73.9712 },
      { name: "비치 카페", time: "15:00", lat: 40.5731, lng: -73.9712 },
      { name: "선셋 스팟", time: "19:00", lat: 40.5731, lng: -73.9712 },
    ],
  },
  {
    day: 7,
    date: "2025-06-07",
    title: "출발 준비",
    photo: "/departure-airport.jpg",
    activities: ["쇼핑 마무리", "기념품 구매", "호텔 체크아웃", "공항 출발"],
    locations: [
      { name: "최종 쇼핑", time: "10:00", lat: 40.7128, lng: -74.006 },
      { name: "기념품 샵", time: "12:00", lat: 40.7505, lng: -73.9972 },
      { name: "호텔", time: "14:00", lat: 40.758, lng: -73.9855 },
      { name: "공항", time: "17:00", lat: 40.7128, lng: -74.006 },
    ],
  },
]

export default function ItineraryOverview({
  data,
  onSelectDay,
}: {
  data: PlannerData
  onSelectDay: (day: number) => void
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    onSelectDay(day)
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Sidebar - 35% */}
      <div className="col-span-12 lg:col-span-4">
        <DaySidebar itinerary={MOCK_ITINERARY} selectedDay={selectedDay} onSelectDay={handleDayClick} />
      </div>

      {/* Right Side - 65% */}
      <div className="col-span-12 lg:col-span-8">
        <ItineraryMap itinerary={MOCK_ITINERARY} selectedDay={selectedDay} title="전체 주간 일정" />
      </div>
    </div>
  )
}
