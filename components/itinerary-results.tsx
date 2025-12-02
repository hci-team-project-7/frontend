"use client"
import { useEffect, useMemo, useState } from "react"
import { Menu } from "lucide-react"
import ItineraryOverview from "@/components/itinerary/overview"
import DailyDetailPage from "@/components/itinerary/daily-detail"
import ItineraryChat from "@/components/itinerary-chat"
import { Button } from "@/components/ui/button"
import { Activity, ChatChange, Itinerary, TransportLeg } from "@/lib/api-types"

type ChatLaunchContext =
  | { type: "activity"; day: number; activityId: string; name: string; location: string }
  | { type: "transport"; day: number; from: string; to: string }

interface ItineraryResultsProps {
  itinerary: Itinerary
  onBack: () => void
  onUpdateItinerary: (itinerary: Itinerary) => void
}

export default function ItineraryResults({ itinerary, onBack, onUpdateItinerary }: ItineraryResultsProps) {
  const firstDay = itinerary.overview[0]?.day ?? 1
  const [view, setView] = useState<"overview" | "daily">("overview")
  const [selectedDay, setSelectedDay] = useState<number>(firstDay)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatLaunchContext, setChatLaunchContext] = useState<ChatLaunchContext | null>(null)
  const [highlightedTransport, setHighlightedTransport] = useState<{ day: number; fromActivityId: string } | null>(
    null,
  )

  const availableDays = useMemo(() => itinerary.overview.map((day) => day.day), [itinerary.overview])
  const activitiesForDay: Activity[] = useMemo(() => {
    return itinerary.activitiesByDay[String(selectedDay)] || []
  }, [itinerary.activitiesByDay, selectedDay])
  const transportsForDay: TransportLeg[] = useMemo(() => {
    return itinerary.overview.find((day) => day.day === selectedDay)?.transports || []
  }, [itinerary.overview, selectedDay])

  useEffect(() => {
    const hasSelectedDay = itinerary.overview.some((day) => day.day === selectedDay)
    if (!hasSelectedDay && itinerary.overview.length > 0) {
      setSelectedDay(itinerary.overview[0].day)
    }
  }, [itinerary, selectedDay])

  const handleSelectDay = (day: number) => {
    setSelectedDay(day)
    setView("daily")
  }

  const handleUpdateItinerary = (next: Itinerary) => {
    onUpdateItinerary(next)
    const hasSelectedDay = next.overview.some((day) => day.day === selectedDay)
    if (!hasSelectedDay && next.overview.length > 0) {
      setSelectedDay(next.overview[0].day)
    }
  }

  const handleApplyResult = (changes: ChatChange[], updated: Itinerary) => {
    const transportChange = changes.find((c) => c.action === "transport")
    if (transportChange && transportChange.fromLocation && transportChange.toLocation) {
      const dayKey = String(transportChange.day || selectedDay)
      const acts = updated.activitiesByDay[dayKey] || []
      const fromIdx = acts.findIndex(
        (a) =>
          transportChange.fromLocation &&
          (a.name.toLowerCase().includes(transportChange.fromLocation.toLowerCase()) ||
            a.location.toLowerCase().includes(transportChange.fromLocation.toLowerCase())),
      )
      const toIdx = acts.findIndex(
        (a) =>
          transportChange.toLocation &&
          (a.name.toLowerCase().includes(transportChange.toLocation.toLowerCase()) ||
            a.location.toLowerCase().includes(transportChange.toLocation.toLowerCase())),
      )
      if (fromIdx !== -1 && toIdx !== -1 && Math.abs(toIdx - fromIdx) === 1) {
        const fromAct = acts[Math.min(fromIdx, toIdx)]
        setHighlightedTransport({ day: transportChange.day || selectedDay, fromActivityId: fromAct.id })
        setTimeout(() => setHighlightedTransport(null), 2600)
      }
    }
  }

  const openChatForActivity = (activity: Activity, day: number) => {
    setIsChatOpen(true)
    setChatLaunchContext({
      type: "activity",
      day,
      activityId: activity.id,
      name: activity.name,
      location: activity.location,
    })
  }

  const openChatForTransport = (leg: TransportLeg, from: Activity, to: Activity, day: number) => {
    setIsChatOpen(true)
    setChatLaunchContext({
      type: "transport",
      day,
      from: from.name,
      to: to.name,
    })
    setHighlightedTransport({ day, fromActivityId: leg.fromActivityId })
    setTimeout(() => setHighlightedTransport(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="sticky top-0 z-10 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(true)}
              className="h-10 w-10 rounded-lg border border-blue-200 bg-white text-blue-600 transition-all hover:bg-blue-50 hover:shadow-md"
              aria-label="채팅 메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-blue-900">여행 일정</h1>
          </div>
          <div className="flex gap-4">
            {view === "daily" && (
              <button
                onClick={() => setView("overview")}
                className="rounded-lg px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
              >
                개요로 돌아가기
              </button>
            )}
            <button
              onClick={onBack}
              className="rounded-lg border-2 border-orange-400 px-4 py-2 font-semibold text-orange-400 transition-colors hover:bg-orange-50"
            >
              처음으로
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {view === "overview" && <ItineraryOverview itinerary={itinerary.overview} onSelectDay={handleSelectDay} />}
        {view === "daily" && (
          <DailyDetailPage
            day={selectedDay}
            activities={activitiesForDay}
            transports={transportsForDay}
            availableDays={availableDays}
            onSelectDay={handleSelectDay}
            highlightTransportFromId={
              highlightedTransport && highlightedTransport.day === selectedDay ? highlightedTransport.fromActivityId : null
            }
            onOpenChatForActivity={openChatForActivity}
            onOpenChatForTransport={openChatForTransport}
          />
        )}
      </div>

      <ItineraryChat
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false)
          setChatLaunchContext(null)
        }}
        currentView={view}
        currentDay={selectedDay}
        itinerary={itinerary}
        launchContext={chatLaunchContext}
        onItineraryUpdate={handleUpdateItinerary}
        onApplyResult={handleApplyResult}
      />
    </main>
  )
}
