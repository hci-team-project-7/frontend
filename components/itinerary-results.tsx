"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { Menu } from "lucide-react"
import ItineraryOverview from "@/components/itinerary/overview"
import DailyDetailPage from "@/components/itinerary/daily-detail"
import ItineraryChat from "@/components/itinerary-chat"
import { GuidedSpotlight } from "@/components/guided-spotlight"
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
  const [highlightedActivity, setHighlightedActivity] = useState<{ day: number; activityId: string } | null>(null)
  const [pendingHighlight, setPendingHighlight] = useState<
    | { type: "activity"; day: number; activityId: string }
    | { type: "transport"; day: number; fromActivityId: string }
    | null
  >(null)
  const [showOverviewGuide, setShowOverviewGuide] = useState(false)
  const [overviewStep, setOverviewStep] = useState(0)
  const [showDailyGuide, setShowDailyGuide] = useState(false)
  const [dailyStep, setDailyStep] = useState(0)

  const overviewSidebarRef = useRef<HTMLDivElement>(null)
  const overviewContentRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

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

  useEffect(() => {
    if (typeof window === "undefined") return
    const seen = localStorage.getItem("tour_overview_seen")
    if (!seen) {
      setShowOverviewGuide(true)
      setOverviewStep(0)
    }
  }, [])

  useEffect(() => {
    if (view !== "daily") return
    if (typeof window === "undefined") return
    const seenDaily = localStorage.getItem("tour_daily_seen")
    if (!seenDaily) {
      setDailyStep(0)
      setShowDailyGuide(true)
    }
    if (showOverviewGuide) {
      setShowOverviewGuide(false)
      setOverviewStep(0)
      localStorage.setItem("tour_overview_seen", "1")
    }
  }, [view, showOverviewGuide])

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
        setPendingHighlight({ type: "transport", day: transportChange.day || selectedDay, fromActivityId: fromAct.id })
      }
    }

    const activityChange = changes.find((c) => c.action === "replace" || c.action === "add" || c.action === "modify")
    if (activityChange) {
      const day = activityChange.day || selectedDay
      const acts = updated.activitiesByDay[String(day)] || []
      const targetName = activityChange.location || activityChange.targetLocation
      if (targetName) {
        const targetLower = targetName.toLowerCase()
        const match = acts.find(
          (a) =>
            a.name.toLowerCase().includes(targetLower) ||
            (a.location && a.location.toLowerCase().includes(targetLower)),
        )
        if (match) {
          setPendingHighlight({ type: "activity", day, activityId: match.id })
        }
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
  }

  const triggerPendingHighlight = () => {
    if (!pendingHighlight) return
    if (pendingHighlight.type === "transport") {
      setHighlightedTransport({ day: pendingHighlight.day, fromActivityId: pendingHighlight.fromActivityId })
      setTimeout(() => setHighlightedTransport(null), 2600)
    } else {
      setHighlightedActivity({ day: pendingHighlight.day, activityId: pendingHighlight.activityId })
      setTimeout(() => setHighlightedActivity(null), 2600)
    }
    setPendingHighlight(null)
  }

  const finishOverviewGuide = () => {
    setShowOverviewGuide(false)
    setOverviewStep(0)
    if (typeof window !== "undefined") {
      localStorage.setItem("tour_overview_seen", "1")
    }
  }

  const finishDailyGuide = () => {
    setShowDailyGuide(false)
    setDailyStep(0)
    if (typeof window !== "undefined") {
      localStorage.setItem("tour_daily_seen", "1")
    }
  }

  const overviewGuideSteps = useMemo(
    () => [
      {
        id: "overview-cards",
        title: "일정 카드 고르기",
        description: "왼쪽의 카드를 누르면 오른쪽에서 일정 정보와 지도를 보실 수 있습니다.",
        targetRef: overviewSidebarRef,
      },
      {
        id: "overview-dive",
        title: "상세 일정으로 이동",
        description: "카드를 한 번 더 누르면 상세 일정 페이지로 이동합니다.",
        targetRef: overviewSidebarRef,
      },
    ],
    [],
  )

  const dailyGuideSteps = useMemo(
    () => [
      {
        id: "daily-timeline",
        title: "일정 카드 살펴보기",
        description: "카드를 선택하면 오른쪽에서 상세 일정과 지도를 보실 수 있습니다.",
        targetRef: timelineRef,
      },
      {
        id: "daily-activity",
        title: "장소 변경 · 맛집 추천",
        description: "장소 카드를 더블클릭하고 AI에게 장소 변경을 요청하거나 근처 맛집을 추천받을 수 있습니다.",
        targetRef: timelineRef,
      },
      {
        id: "daily-transport",
        title: "이동 수단 변경",
        description: "이동 카드를 더블클릭하고 AI에게 이동 수단 변경을 요청할 수 있습니다.",
        targetRef: timelineRef,
      },
      {
        id: "daily-chat",
        title: "채팅 열기",
        description: "왼쪽 상단의 메뉴 버튼을 눌러 채팅창을 열고 생성된 일정에 대해 자세히 물어보세요.",
        targetRef: menuButtonRef,
      },
    ],
    [],
  )

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
              ref={menuButtonRef}
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
        {view === "overview" && (
          <ItineraryOverview
            itinerary={itinerary.overview}
            onSelectDay={handleSelectDay}
            sidebarRef={overviewSidebarRef}
            contentRef={overviewContentRef}
          />
        )}
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
            highlightActivityId={
              highlightedActivity && highlightedActivity.day === selectedDay ? highlightedActivity.activityId : null
            }
            onOpenChatForActivity={openChatForActivity}
            onOpenChatForTransport={openChatForTransport}
            timelineRef={timelineRef}
            detailRef={detailRef}
          />
        )}
      </div>

      <ItineraryChat
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false)
          setChatLaunchContext(null)
          triggerPendingHighlight()
        }}
        currentView={view}
        currentDay={selectedDay}
        itinerary={itinerary}
        launchContext={chatLaunchContext}
        onItineraryUpdate={handleUpdateItinerary}
        onApplyResult={handleApplyResult}
      />

      <GuidedSpotlight
        steps={overviewGuideSteps}
        open={showOverviewGuide && view === "overview"}
        activeIndex={overviewStep}
        onNext={() => setOverviewStep((prev) => Math.min(prev + 1, overviewGuideSteps.length - 1))}
        onPrev={() => setOverviewStep((prev) => Math.max(prev - 1, 0))}
        onClose={finishOverviewGuide}
      />

      <GuidedSpotlight
        steps={dailyGuideSteps}
        open={showDailyGuide && view === "daily"}
        activeIndex={dailyStep}
        onNext={() => setDailyStep((prev) => Math.min(prev + 1, dailyGuideSteps.length - 1))}
        onPrev={() => setDailyStep((prev) => Math.max(prev - 1, 0))}
        onClose={finishDailyGuide}
      />
    </main>
  )
}
