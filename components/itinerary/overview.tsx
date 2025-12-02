"use client"
import { RefObject, useEffect, useMemo, useState } from "react"
import DaySidebar from "@/components/itinerary/day-sidebar"
import ItineraryMap from "@/components/itinerary/itinerary-map"
import { DayItinerary } from "@/lib/api-types"
import { formatScheduleTime } from "@/lib/time-format"

export default function ItineraryOverview({
  itinerary,
  onSelectDay,
  sidebarRef,
  contentRef,
}: {
  itinerary: DayItinerary[]
  onSelectDay: (day: number) => void
  sidebarRef?: RefObject<HTMLDivElement>
  contentRef?: RefObject<HTMLDivElement>
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(itinerary[0]?.day ?? null)

  useEffect(() => {
    if (itinerary.length === 0) {
      setSelectedDay(null)
      return
    }
    if (selectedDay === null || !itinerary.some((day) => day.day === selectedDay)) {
      setSelectedDay(itinerary[0].day)
    }
  }, [itinerary, selectedDay])

  const selected = useMemo(() => {
    if (selectedDay === null) return itinerary[0]
    return itinerary.find((day) => day.day === selectedDay) || itinerary[0]
  }, [itinerary, selectedDay])

  const handleDayClick = (day: number) => {
    if (selectedDay === day) {
      onSelectDay(day) // 이미 선택된 카드를 다시 클릭했을 때만 상세 화면으로 이동
    } else {
      setSelectedDay(day)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <DaySidebar
          itinerary={itinerary}
          selectedDay={selectedDay}
          onSelectDay={handleDayClick}
          containerRef={sidebarRef}
        />
      </div>

      <div ref={contentRef} className="col-span-12 lg:col-span-8 space-y-6">
        {selected ? (
          <>
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
              <div className="relative h-64 w-full overflow-hidden rounded-t-xl">
                <img
                  src={selected.photo || "/placeholder.svg"}
                  alt={selected.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-sm text-blue-50">Day {selected.day}</p>
                  <h3 className="text-2xl font-bold text-white">{selected.title}</h3>
                  <p className="text-sm text-blue-50">{selected.date}</p>
                </div>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-blue-900">주요 활동</h4>
                  <ul className="space-y-2">
                    {selected.activities.map((activity, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1 text-orange-500">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold text-blue-900">방문 예정 장소</h4>
                  <div className="space-y-2">
                    {selected.locations.map((location, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{location.name}</span>
                          <span className="text-xs text-gray-600">⏰ {formatScheduleTime(location.time)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <ItineraryMap itinerary={itinerary} selectedDay={selectedDay} title="지도에서 보기" />
          </>
        ) : (
          <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50 text-sm text-blue-700">
            불러올 일정이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}
