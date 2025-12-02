"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  X,
  Send,
  Bot,
  MapPin,
  Calendar,
  Users,
  Plus,
  Minus,
  Navigation,
  UtensilsCrossed,
  Check,
  RefreshCw,
  ArrowLeftRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChatChange, ChatMessage, ChatRestaurantRecommendation, Itinerary } from "@/lib/api-types"
import { applyPreview, sendChatMessage } from "@/lib/api"

type ChatLaunchContext =
  | { type: "activity"; day: number; activityId: string; name: string; location: string }
  | { type: "transport"; day: number; from: string; to: string }

type MealLabel = "아침 식사" | "점심 식사" | "저녁 식사"

interface ItineraryChatProps {
  isOpen: boolean
  onClose: () => void
  currentView: "overview" | "daily"
  currentDay: number
  itinerary: Itinerary
  launchContext?: ChatLaunchContext | null
  onItineraryUpdate: (itinerary: Itinerary) => void
  onApplyResult?: (changes: ChatChange[], updated: Itinerary) => void
}

const buildInitialMessage = (): ChatMessage => ({
  id: `intro-${Date.now()}`,
  text: "안녕하세요! 여행 일정을 수정하거나 질문이 있으시면 말씀해 주세요. 예를 들어 '2일차에 박물관 추가해줘' 또는 '식당 추천해줘' 같은 요청을 자유롭게 하실 수 있습니다.",
  sender: "assistant",
  timestamp: new Date().toISOString(),
})

export default function ItineraryChat({
  isOpen,
  onClose,
  currentView,
  currentDay,
  itinerary,
  launchContext,
  onItineraryUpdate,
  onApplyResult,
}: ItineraryChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([buildInitialMessage()])
  const [inputValue, setInputValue] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [pendingAction, setPendingAction] = useState<"remove" | "add" | "transport" | "restaurant" | "replace" | null>(null)
  const [focusedTarget, setFocusedTarget] = useState<ChatLaunchContext | null>(null)
  const [restaurantPrompt, setRestaurantPrompt] = useState<{ messageId: string; day: number } | null>(null)
  const [mealPrompt, setMealPrompt] = useState<{ restaurant: ChatRestaurantRecommendation; day: number; messageId: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const plannerData = itinerary.plannerData

  useEffect(() => {
    setMessages([buildInitialMessage()])
    setInputValue("")
    setPendingAction(null)
    setFocusedTarget(null)
    setRestaurantPrompt(null)
    setMealPrompt(null)
  }, [itinerary.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setPendingAction(null)
      setRestaurantPrompt(null)
      setMealPrompt(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!launchContext) return
    setFocusedTarget(launchContext)
    const label =
      launchContext.type === "transport"
        ? `${launchContext.from} → ${launchContext.to}`
        : launchContext.name
    const tagMessage: ChatMessage = {
      id: `focus-${Date.now()}`,
      text: `[${label}]을 선택했어요. 원하는 작업을 빠른 액션으로 이어가 보세요.`,
      sender: "assistant",
      timestamp: new Date().toISOString(),
      variant: "system",
    }
    setMessages((prev) => [...prev, tagMessage])
  }, [launchContext])

  const suggestedQuestions = useMemo(
    () => [
      "2일차 일정을 더 알차게 만들어줘",
      `${currentDay}일차에 맛집 추천해줘`,
      "쇼핑 시간을 늘려줘",
      "휴식 시간을 추가해줘",
    ],
    [currentDay],
  )

  const quickActions = [
    { icon: ArrowLeftRight, label: "장소 변경", actionType: "replace" as const, color: "text-purple-700", bgColor: "bg-purple-50 hover:bg-purple-100" },
    { icon: UtensilsCrossed, label: "맛집 추천", actionType: "restaurant" as const, color: "text-orange-600", bgColor: "bg-orange-50 hover:bg-orange-100" },
    { icon: Navigation, label: "교통 변경", actionType: "transport" as const, color: "text-blue-600", bgColor: "bg-blue-50 hover:bg-blue-100" },
  ]

  const contextInfo = currentView === "daily" ? `Day ${currentDay} 상세 일정` : "전체 일정 개요"
  const focusedLabel =
    focusedTarget && (focusedTarget.type === "transport" ? `${focusedTarget.from} → ${focusedTarget.to}` : focusedTarget.name)

  const buildReplacementSuggestions = useMemo(() => {
    if (!focusedTarget || focusedTarget.type !== "activity") return () => []
    const city = focusedTarget.location || plannerData.cities[0] || plannerData.country
    return () => [
      { name: `${city} 현대 미술 갤러리`, location: city, source: "replacement", cuisine: "전시 · 문화" },
      { name: `${city} 정원 산책`, location: city, source: "replacement", cuisine: "산책 · 휴식" },
      { name: `${city} 감성 카페`, location: city, source: "replacement", cuisine: "카페 · 휴식" },
    ]
  }, [focusedTarget, plannerData.cities, plannerData.country])

  const buildRestaurantSuggestions = useMemo(() => {
    const city = focusedTarget?.type === "activity" ? focusedTarget.location : plannerData.cities[0] || plannerData.country
    const anchor = focusedTarget?.type === "activity" ? focusedTarget.name : city
    return () => [
      { name: `${city} 브런치 스팟`, location: city, cuisine: "브런치", rating: 4.6, anchorActivityName: anchor, source: "restaurant" },
      { name: `${city} 비스트로`, location: `${city} 시내`, cuisine: "프랑스 가정식", rating: 4.5, anchorActivityName: anchor, source: "restaurant" },
      { name: `${city} 로스터리 카페`, location: `${city} 중심가`, cuisine: "커피 · 디저트", rating: 4.7, anchorActivityName: anchor, source: "restaurant" },
    ]
  }, [focusedTarget, plannerData.cities, plannerData.country])

  const detectTransportModeFromText = (text: string): ChatChange["mode"] => {
    const lowered = text.toLowerCase()
    if (lowered.includes("도보") || lowered.includes("walk")) return "walk"
    if (lowered.includes("자전거") || lowered.includes("bike")) return "bike"
    if (
      lowered.includes("버스") ||
      lowered.includes("bus") ||
      lowered.includes("대중") ||
      lowered.includes("지하철") ||
      lowered.includes("metro") ||
      lowered.includes("subway") ||
      lowered.includes("트램")
    )
      return "transit"
    return "drive"
  }

  const handleQuickAction = (actionType: "replace" | "transport" | "restaurant") => {
    const timestamp = new Date().toISOString()

    if (actionType === "replace") {
      if (!focusedTarget || focusedTarget.type !== "activity") {
        setMessages((prev) => [
          ...prev,
          {
            id: `need-target-${Date.now()}`,
            text: "변경할 장소 카드를 더블클릭해서 선택해 주세요.",
            sender: "assistant",
            timestamp,
          },
        ])
        return
      }
      const recommendations = buildReplacementSuggestions()
      const messageId = `replace-${Date.now()}`
      setPendingAction("replace")
      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          text: `${focusedTarget.name}을 일정에서 제거하겠습니다. 대신 이 자리에 들어갈 장소를 추천해드릴게요. 아래와 같은 장소는 어떠신가요? 모두 마음에 안드신다면 가고 싶은 곳을 직접 입력해주세요`,
          sender: "assistant",
          timestamp,
          preview: {
            type: "recommendation",
            title: `${focusedTarget.name} 대체 추천`,
            recommendations,
          },
        },
      ])
      inputRef.current?.focus()
      return
    }

    if (actionType === "restaurant") {
      if (!focusedTarget) {
        setMessages((prev) => [
          ...prev,
          {
            id: `need-restaurant-${Date.now()}`,
            text: "맛집을 추천받을 카드를 먼저 더블클릭해 주세요.",
            sender: "assistant",
            timestamp,
          },
        ])
        return
      }
      const anchorName =
        focusedTarget.type === "activity" ? focusedTarget.name : `${focusedTarget.from} → ${focusedTarget.to}`
      const messageId = `restaurant-${Date.now()}`
      setRestaurantPrompt({ messageId, day: focusedTarget.day })
      setPendingAction("restaurant")
      setMessages((prev) => [
        ...prev,
        {
          id: messageId,
          text: `${anchorName} 주변에서 가볼 만한 맛집을 골라봤어요. 마음에 드는 곳을 선택하면 일정에 반영해드리겠습니다.`,
          sender: "assistant",
          timestamp,
          preview: {
            type: "recommendation",
            title: `${anchorName} 주변 추천`,
            recommendations: buildRestaurantSuggestions(),
          },
        },
      ])
      inputRef.current?.focus()
      return
    }

    if (actionType === "transport") {
      if (!focusedTarget || focusedTarget.type !== "transport") {
        setMessages((prev) => [
          ...prev,
          {
            id: `need-transport-${Date.now()}`,
            text: "교통을 바꿀 이동 카드를 더블클릭해 주세요.",
            sender: "assistant",
            timestamp,
          },
        ])
        return
      }
      setPendingAction("transport")
      setMessages((prev) => [
        ...prev,
        {
          id: `transport-${Date.now()}`,
          text: `${focusedTarget.from}과 ${focusedTarget.to} 사이의 이동 수단을 무엇으로 변경하고 싶으신가요? (자동차, 대중교통, 자전거 등이 있습니다)`,
          sender: "assistant",
          timestamp,
        },
      ])
      inputRef.current?.focus()
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isRequesting) return

    const text = inputValue.trim()
    const timestamp = new Date().toISOString()
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: "user",
      timestamp,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    if (mealPrompt) {
      const lower = text.toLowerCase()
      const mealMatch: MealLabel | null =
        lower.includes("아침") || lower.includes("breakfast")
          ? "아침 식사"
          : lower.includes("점심") || lower.includes("lunch")
            ? "점심 식사"
            : lower.includes("저녁") || lower.includes("dinner")
              ? "저녁 식사"
              : null
      if (mealMatch) {
        await handleMealChoice(mealMatch)
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `meal-help-${Date.now()}`,
            text: "아침, 점심, 저녁 중 하나를 선택해 주세요.",
            sender: "assistant",
            timestamp: new Date().toISOString(),
          },
        ])
      }
      return
    }

    if (pendingAction === "replace" && focusedTarget?.type === "activity") {
      await applyReplacementChange(text, userMessage.id)
      return
    }

    if (pendingAction === "restaurant" && restaurantPrompt) {
      const promptId = `meal-${Date.now()}`
      setMealPrompt({
        restaurant: { name: text, location: text, source: "restaurant" },
        day: restaurantPrompt.day || currentDay,
        messageId: promptId,
      })
      setRestaurantPrompt(null)
      setPendingAction(null)
      setMessages((prev) => [
        ...prev,
        {
          id: promptId,
          text: "아침 식사, 점심 식사, 저녁 식사 일정 중 어디에 반영해드릴까요?",
          sender: "assistant",
          timestamp: new Date().toISOString(),
        },
      ])
      return
    }

    if (pendingAction === "transport" && focusedTarget?.type === "transport") {
      await applyTransportChange(text, userMessage.id)
      return
    }

    setIsRequesting(true)

    try {
      const response = await sendChatMessage(itinerary.id, {
        message: { text, timestamp },
        context: {
          currentView,
          currentDay: focusedTarget?.day ?? currentDay,
          pendingAction,
        },
      })

      if (response.reply) {
        setMessages((prev) => [...prev, response.reply])
      }
      if (response.updatedItinerary) {
        onItineraryUpdate(response.updatedItinerary)
      }
      setPendingAction(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "요청 처리 중 오류가 발생했습니다."
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: `요청을 처리하는 중 문제가 발생했습니다: ${errorMessage}`,
          sender: "assistant",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsRequesting(false)
    }
  }

  const applyReplacementChange = async (
    newName: string,
    sourceMessageId?: string,
    meta?: ChatRestaurantRecommendation,
  ) => {
    if (!focusedTarget || focusedTarget.type !== "activity") return
    setIsRequesting(true)
    const targetName = focusedTarget.name
    const change: ChatChange = {
      action: "replace",
      day: focusedTarget.day,
      targetLocation: targetName,
      location: newName,
      details: meta?.cuisine ? `${meta.cuisine} 스팟으로 교체합니다.` : `${targetName}을 ${newName}으로 교체합니다.`,
      lat: meta?.lat,
      lng: meta?.lng,
      address: meta?.address,
    }

    try {
      const response = await applyPreview(itinerary.id, {
        sourceMessageId: sourceMessageId || `replace-${Date.now()}`,
        changes: [change],
      })
      onItineraryUpdate(response.updatedItinerary)
      onApplyResult?.([change], response.updatedItinerary)
      setMessages((prev) => [
        ...prev,
        {
          id: `replace-done-${Date.now()}`,
          text: response.systemMessage || `${targetName}을 ${newName}으로 변경했어요.`,
          sender: "assistant",
          variant: "system",
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "장소를 변경하지 못했습니다."
      setMessages((prev) => [
        ...prev,
        {
          id: `replace-error-${Date.now()}`,
          text: `변경 처리 중 오류가 발생했습니다: ${errorMessage}`,
          sender: "assistant",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsRequesting(false)
      setPendingAction(null)
    }
  }

  const applyTransportChange = async (modeText: string, sourceMessageId?: string) => {
    if (!focusedTarget || focusedTarget.type !== "transport") return
    setIsRequesting(true)
    const mode = detectTransportModeFromText(modeText)
    const readable = { drive: "자동차", walk: "도보", transit: "대중교통", bike: "자전거" }[mode] || "이동"
    const change: ChatChange = {
      action: "transport",
      day: focusedTarget.day,
      fromLocation: focusedTarget.from,
      toLocation: focusedTarget.to,
      details: `${focusedTarget.from}과 ${focusedTarget.to} 사이 이동을 ${readable}로 변경`,
      mode,
    }
    try {
      const response = await applyPreview(itinerary.id, {
        sourceMessageId: sourceMessageId || `transport-${Date.now()}`,
        changes: [change],
      })
      onItineraryUpdate(response.updatedItinerary)
      onApplyResult?.([change], response.updatedItinerary)
      setMessages((prev) => [
        ...prev,
        {
          id: `transport-done-${Date.now()}`,
          text: response.systemMessage || `${focusedTarget.from} → ${focusedTarget.to} 구간을 ${readable}로 변경했습니다.`,
          sender: "assistant",
          variant: "system",
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "이동 수단 변경에 실패했습니다."
      setMessages((prev) => [
        ...prev,
        {
          id: `transport-error-${Date.now()}`,
          text: `요청을 처리하는 중 문제가 발생했습니다: ${errorMessage}`,
          sender: "assistant",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsRequesting(false)
      setPendingAction(null)
    }
  }

  const handleMealChoice = async (meal: MealLabel) => {
    if (!mealPrompt) return
    const day = mealPrompt.day || currentDay
    const dayKey = String(day)
    const activitiesForDay = itinerary.activitiesByDay[dayKey] || []
    const targetMeal =
      activitiesForDay.find((act) => act.name.includes(meal)) ||
      activitiesForDay.find((act) => act.name.toLowerCase().includes("breakfast") && meal === "아침 식사") ||
      activitiesForDay.find((act) => act.name.toLowerCase().includes("lunch") && meal === "점심 식사") ||
      activitiesForDay.find((act) => act.name.toLowerCase().includes("dinner") && meal === "저녁 식사")

    const change: ChatChange = {
      action: "replace",
      day,
      targetLocation: targetMeal?.name || meal,
      location: `${meal} - ${mealPrompt.restaurant.name}`,
      details: `${meal} 일정에 ${mealPrompt.restaurant.name}을 반영합니다.`,
      lat: mealPrompt.restaurant.lat,
      lng: mealPrompt.restaurant.lng,
      address: mealPrompt.restaurant.address,
    }

    setIsRequesting(true)
    try {
      const response = await applyPreview(itinerary.id, {
        sourceMessageId: mealPrompt.messageId,
        changes: [change],
      })
      onItineraryUpdate(response.updatedItinerary)
      onApplyResult?.([change], response.updatedItinerary)
      setMessages((prev) => [
        ...prev,
        {
          id: `meal-apply-${Date.now()}`,
          text: response.systemMessage || `${meal} 일정이 ${mealPrompt.restaurant.name}으로 변경되었습니다.`,
          sender: "assistant",
          variant: "system",
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "일정에 반영하지 못했습니다."
      setMessages((prev) => [
        ...prev,
        {
          id: `meal-error-${Date.now()}`,
          text: `요청 처리 중 오류가 발생했습니다: ${errorMessage}`,
          sender: "assistant",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsRequesting(false)
      setPendingAction(null)
      setMealPrompt(null)
    }
  }

  const handleSkipRecommendation = () => {
    const timestamp = new Date().toISOString()
    setMessages((prev) => [
      ...prev,
      {
        id: `skip-${Date.now()}`,
        text: "네 일정에 반영하지 않겠습니다.",
        sender: "assistant",
        variant: "system",
        timestamp,
      },
    ])
    setRestaurantPrompt(null)
    setPendingAction(null)
  }

  const handleApplyChanges = async (messageId: string) => {
    const target = messages.find((msg) => msg.id === messageId)
    const changes = target?.preview?.changes
    if (!changes?.length || isRequesting) return

    setIsRequesting(true)
    try {
      const response = await applyPreview(itinerary.id, {
        sourceMessageId: messageId,
        changes,
      })
      onItineraryUpdate(response.updatedItinerary)
      onApplyResult?.(changes, response.updatedItinerary)
      setMessages((prev) => [
        ...prev,
        {
          id: `apply-${Date.now()}`,
          text: response.systemMessage || "변경사항을 일정에 반영했습니다.",
          sender: "assistant",
          variant: "system",
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "변경사항 적용에 실패했습니다."
      setMessages((prev) => [
        ...prev,
        {
          id: `apply-error-${Date.now()}`,
          text: `변경사항 적용 중 오류가 발생했습니다: ${errorMessage}`,
          sender: "assistant",
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setIsRequesting(false)
    }
  }

  const handleSelectRecommendation = async (recommendation: ChatRestaurantRecommendation, messageId: string) => {
    if (isRequesting) return
    if (recommendation.source === "replacement") {
      await applyReplacementChange(recommendation.name, messageId, recommendation)
      return
    }

    const promptId = `meal-${Date.now()}`
    setRestaurantPrompt(null)
    setPendingAction(null)
    setMealPrompt({
      restaurant: recommendation,
      day: focusedTarget?.day || currentDay,
      messageId: promptId,
    })
    setMessages((prev) => [
      ...prev,
      {
        id: promptId,
        text: "아침 식사, 점심 식사, 저녁 식사 일정 중 어디에 반영해드릴까요?",
        sender: "assistant",
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })

  const cityNames = plannerData.cities.join(", ") || plannerData.country

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">여행 일정 어시스턴트</h2>
              <div className="mt-0.5 flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-500" />
                <p className="text-xs text-gray-500">{contextInfo}</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 rounded-full hover:bg-gray-200">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{cityNames}</span>
            </div>
            {plannerData.dateRange && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(plannerData.dateRange.start).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(plannerData.dateRange.end).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{plannerData.travelers.adults}명</span>
            </div>
          </div>
        </div>

        {focusedLabel && (
          <div className="border-b border-gray-100 bg-white px-6 py-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs text-blue-800">
              <span className="font-semibold">선택됨</span>
              <span className="text-gray-700">{focusedLabel}</span>
              {focusedTarget?.type === "transport" && <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] text-blue-600">이동 카드</span>}
            </div>
          </div>
        )}

        <div className="border-b border-gray-200 bg-white px-6 py-3">
          <p className="mb-2 text-xs font-medium text-gray-600">빠른 액션</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.actionType}
                onClick={() => handleQuickAction(action.actionType)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium transition-colors",
                  action.bgColor,
                  action.color,
                )}
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-[calc(100vh-350px)] flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={cn(
                      "flex gap-3",
                      message.sender === "user" ? "justify-end" : "justify-start",
                      message.variant === "system" && "justify-center",
                    )}
                  >
                    {message.sender === "assistant" && message.variant !== "system" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                        message.variant === "system"
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : message.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900",
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          message.variant === "system"
                            ? "text-slate-500"
                            : message.sender === "user"
                              ? "text-blue-100"
                              : "text-gray-500",
                        )}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-xs font-semibold text-gray-600">나</span>
                      </div>
                    )}
                  </div>

                  {message.preview && message.preview.type === "change" && message.preview.changes && (
                    <div className="mt-3 ml-11 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">{message.preview.title}</h4>
                        <Button
                          size="sm"
                          disabled={isRequesting}
                          onClick={() => handleApplyChanges(message.id)}
                          className="h-7 rounded-lg bg-blue-500 px-3 text-xs text-white hover:bg-blue-600 disabled:opacity-60"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          적용
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {message.preview.changes.map((change, idx) => (
                          <div key={`${change.location}-${idx}`} className="flex items-start gap-2 rounded-lg bg-white p-2.5 text-xs">
                            {change.action === "add" && <Plus className="mt-0.5 h-4 w-4 text-green-600" />}
                            {change.action === "remove" && <Minus className="mt-0.5 h-4 w-4 text-red-600" />}
                            {change.action === "replace" && <ArrowLeftRight className="mt-0.5 h-4 w-4 text-purple-600" />}
                            {change.action === "transport" && <Navigation className="mt-0.5 h-4 w-4 text-blue-600" />}
                            {change.action === "regenerate" && <RefreshCw className="mt-0.5 h-4 w-4 text-indigo-600" />}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                Day {change.day ?? currentDay} -{" "}
                                {change.targetLocation ? `${change.targetLocation} → ${change.location}` : change.location}
                              </div>
                              <div className="mt-0.5 text-gray-600">{change.details}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {message.preview &&
                    message.preview.type === "recommendation" &&
                    message.preview.recommendations && (
                      <div className="mt-3 ml-11 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-gray-900">{message.preview.title}</h4>
                        <div className="space-y-2">
                          {message.preview.recommendations.map((restaurant, idx) => (
                            <button
                              key={`${restaurant.name}-${idx}`}
                              onClick={() => handleSelectRecommendation(restaurant, message.id)}
                              className="w-full rounded-lg border border-orange-200 bg-white p-3 text-left transition-colors hover:border-orange-400 hover:bg-orange-50"
                              disabled={isRequesting}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  {restaurant.isDemo && (
                                    <div className="mb-1 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-600">
                                      데모용 추천
                                    </div>
                                  )}
                                  <div className="font-medium text-gray-900">{restaurant.name}</div>
                                  <div className="mt-0.5 text-xs text-gray-600">
                                    {restaurant.address || restaurant.location}
                                    {restaurant.distanceMeters ? ` · 약 ${Math.round(restaurant.distanceMeters / 100) / 10}km` : ""}
                                  </div>
                                  {restaurant.anchorActivityName && (
                                    <div className="mt-1 text-[11px] text-orange-700">
                                      {restaurant.anchorActivityName} 인근 추천
                                    </div>
                                  )}
                                  {(restaurant.walkingMinutes || restaurant.drivingMinutes) && (
                                    <div className="mt-1 text-[11px] text-gray-600">
                                      {restaurant.walkingMinutes && `도보 ~${restaurant.walkingMinutes}분`}
                                      {restaurant.walkingMinutes && restaurant.drivingMinutes && " · "}
                                      {restaurant.drivingMinutes && `차량 ~${restaurant.drivingMinutes}분`}
                                    </div>
                                  )}
                                  {restaurant.cuisine && (
                                    <div className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                                      {restaurant.cuisine}
                                    </div>
                                  )}
                                </div>
                                {(restaurant.rating || restaurant.userRatingsTotal) && (
                                  <div className="ml-2 flex flex-col items-end gap-1 text-xs text-gray-600">
                                    {restaurant.rating && (
                                      <div className="flex items-center gap-1">
                                        <span className="font-semibold">★</span>
                                        <span>{restaurant.rating}</span>
                                      </div>
                                    )}
                                    {restaurant.userRatingsTotal && (
                                      <div className="text-[11px] text-gray-500">리뷰 {restaurant.userRatingsTotal}개</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>

                        {restaurantPrompt?.messageId === message.id && (
                          <button
                            onClick={handleSkipRecommendation}
                            className="mt-3 w-full rounded-lg border border-dashed border-orange-300 bg-white px-3 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50"
                            disabled={isRequesting}
                          >
                            선택 안함
                          </button>
                        )}
                      </div>
                    )}

                  {mealPrompt && message.id === mealPrompt.messageId && (
                    <div className="mt-3 ml-11 flex flex-wrap gap-2">
                      {(["아침 식사", "점심 식사", "저녁 식사"] as MealLabel[]).map((label) => (
                        <button
                          key={label}
                          onClick={() => void handleMealChoice(label)}
                          className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-50"
                          disabled={isRequesting}
                        >
                          {label}에 반영
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isRequesting && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="rounded-2xl bg-gray-100 px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {messages.length <= 1 && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
              <p className="mb-2 text-xs font-medium text-gray-600">추천 질문</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => setInputValue(question)}
                    className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="일정 수정 요청이나 질문을 입력하세요..."
                className="flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={1}
                style={{ minHeight: "44px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isRequesting}
                className="h-11 w-11 rounded-xl bg-blue-500 p-0 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
