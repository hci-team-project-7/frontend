"use client"
import { useState, useRef, useEffect } from "react"
import { X, Send, Bot, MapPin, Calendar, Users, RefreshCw, Plus, Minus, Navigation, UtensilsCrossed, Check, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PlannerData {
  country: string | null
  cities: string[]
  dateRange: { start: string; end: string } | null
  travelers: { adults: number; children: number; type: string }
  styles: string[]
}

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
  preview?: {
    type: "change" | "recommendation"
    title: string
    changes?: {
      action: "add" | "remove" | "modify" | "transport"
      day?: number
      location?: string
      details?: string
    }[]
    recommendations?: {
      name: string
      location: string
      rating?: number
      cuisine?: string
    }[]
  }
}

interface ItineraryChatProps {
  isOpen: boolean
  onClose: () => void
  currentView: "overview" | "daily"
  currentDay: number
  itineraryData: PlannerData
}

export default function ItineraryChat({
  isOpen,
  onClose,
  currentView,
  currentDay,
  itineraryData,
}: ItineraryChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "안녕하세요! 여행 일정을 수정하거나 질문이 있으시면 말씀해 주세요. 예를 들어 '2일차에 박물관 추가해줘' 또는 '식당 추천해줘' 같은 요청을 자유롭게 하실 수 있습니다.",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [pendingAction, setPendingAction] = useState<"remove" | "add" | "transport" | "restaurant" | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleQuickAction = (actionType: "remove" | "add" | "transport" | "restaurant") => {
    setPendingAction(actionType)
    
    let questionText = ""
    switch (actionType) {
      case "remove":
        questionText = "어떤 장소를 뺄까요?"
        break
      case "add":
        questionText = "어떤 장소를 추가할까요?"
        break
      case "transport":
        questionText = "어떤 장소와 장소 사이의 대중교통을 변경하고 싶으신가요?"
        break
      case "restaurant":
        questionText = "어떤 장소 근처의 맛집을 추천해드릴까요?"
        break
    }

    // 즉시 챗봇이 질문을 보냄
    setIsTyping(true)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        text: questionText,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
      inputRef.current?.focus()
    }, 500)
  }

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentText = inputValue.trim()
    setInputValue("")
    setIsTyping(true)

    // pendingAction에 따라 적절한 응답 생성
    setTimeout(() => {
      let assistantMessage: Message

      if (pendingAction === "restaurant") {
        // 맛집 추천 응답
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          text: `${currentText} 근처 맛집을 찾아드렸습니다. 원하시는 맛집을 선택하시면 일정에 추가해드리겠습니다.`,
          sender: "assistant",
          timestamp: new Date(),
          preview: {
            type: "recommendation",
            title: "추천 맛집",
            recommendations: [
              { name: "전통 파스타 레스토랑", location: `${currentText}에서 도보 5분`, rating: 4.5, cuisine: "이탈리안" },
              { name: "로컬 맛집 카페", location: `${currentText}에서 도보 3분`, rating: 4.8, cuisine: "퓨전" },
              { name: "시장 음식 스탠드", location: `${currentText}에서 도보 10분`, rating: 4.2, cuisine: "스트리트푸드" },
            ],
          },
        }
        setPendingAction(null)
      } else if (pendingAction === "transport") {
        // 교통 수단 변경 응답
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          text: `${currentText} 사이의 교통 수단을 변경했습니다. 아래 변경사항을 확인하고 적용해주세요.`,
          sender: "assistant",
          timestamp: new Date(),
          preview: {
            type: "change",
            title: "교통 수단 변경",
            changes: [
              {
                action: "transport",
                day: currentDay,
                location: currentText || "장소 A → 장소 B",
                details: "도보 → 택시로 변경",
              },
            ],
          },
        }
        setPendingAction(null)
      } else if (pendingAction === "remove") {
        // 장소 제거 응답
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          text: `${currentText}을(를) 일정에서 제거했습니다. 아래 변경사항을 확인하고 적용해주세요.`,
          sender: "assistant",
          timestamp: new Date(),
          preview: {
            type: "change",
            title: "장소 제거",
            changes: [
              {
                action: "remove",
                day: currentDay,
                location: currentText,
                details: "일정에서 제거됨",
              },
            ],
          },
        }
        setPendingAction(null)
      } else if (pendingAction === "add") {
        // 장소 추가 응답
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          text: `${currentText}을(를) 일정에 추가했습니다. 아래 변경사항을 확인하고 적용해주세요.`,
          sender: "assistant",
          timestamp: new Date(),
          preview: {
            type: "change",
            title: "장소 추가",
            changes: [
              {
                action: "add",
                day: currentDay,
                location: currentText,
                details: "일정에 추가됨",
              },
            ],
          },
        }
        setPendingAction(null)
      } else {
        // 일반 메시지 처리 (기존 로직)
        // 맛집 추천 요청 감지
        if (currentText.includes("맛집") || currentText.includes("식당") || currentText.includes("레스토랑")) {
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            text: "근처 맛집을 찾아드렸습니다. 원하시는 맛집을 선택하시면 일정에 추가해드리겠습니다.",
            sender: "assistant",
            timestamp: new Date(),
            preview: {
              type: "recommendation",
              title: "추천 맛집",
              recommendations: [
                { name: "전통 파스타 레스토랑", location: "박물관에서 도보 5분", rating: 4.5, cuisine: "이탈리안" },
                { name: "로컬 맛집 카페", location: "박물관에서 도보 3분", rating: 4.8, cuisine: "퓨전" },
                { name: "시장 음식 스탠드", location: "박물관에서 도보 10분", rating: 4.2, cuisine: "스트리트푸드" },
              ],
            },
          }
        }
        // 교통 수단 변경 요청 감지
        else if (currentText.includes("걸어") || currentText.includes("도보") || currentText.includes("택시") || currentText.includes("대중교통")) {
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            text: "교통 수단을 변경했습니다. 아래 변경사항을 확인하고 적용해주세요.",
            sender: "assistant",
            timestamp: new Date(),
            preview: {
              type: "change",
              title: "교통 수단 변경",
              changes: [
                {
                  action: "transport",
                  day: currentDay,
                  location: "박물관 → 공원",
                  details: "도보 → 택시로 변경",
                },
                {
                  action: "transport",
                  day: currentDay,
                  location: "공원 → 전망대",
                  details: "도보 → 택시로 변경",
                },
              ],
            },
          }
        }
        // 장소 제거/추가 요청 감지
        else if (currentText.includes("빼") || currentText.includes("제거") || currentText.includes("삭제") || currentText.includes("넣어") || currentText.includes("추가")) {
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            text: "일정을 수정했습니다. 아래 변경사항을 확인하고 적용해주세요.",
            sender: "assistant",
            timestamp: new Date(),
            preview: {
              type: "change",
              title: "일정 변경",
              changes: [
                {
                  action: currentText.includes("빼") || currentText.includes("제거") ? "remove" : "add",
                  day: currentDay,
                  location: currentText.includes("빼") || currentText.includes("제거") ? "전망대" : "새로운 명소",
                  details: currentText.includes("빼") || currentText.includes("제거") ? "제거됨" : "추가됨",
                },
              ],
            },
          }
        }
        // 기본 응답
        else {
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            text: "요청을 확인했습니다. 일정을 검토하고 수정 사항을 반영하겠습니다.",
            sender: "assistant",
            timestamp: new Date(),
          }
        }
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleApplyChanges = (messageId: string) => {
    // 변경사항 적용 (UI만 - 실제 로직은 나중에)
    const updatedMessages = messages.map((msg) => {
      if (msg.id === messageId && msg.preview) {
        return {
          ...msg,
          preview: {
            ...msg.preview,
            changes: msg.preview.changes?.map((change) => ({
              ...change,
              details: `${change.details} ✓ 적용됨`,
            })),
          },
        }
      }
      return msg
    })
    setMessages(updatedMessages)
  }

  const handleSelectRestaurant = (restaurantName: string, locationName: string, messageId: string) => {
    // 맛집 선택 시 바로 일정에 추가
    setIsTyping(true)
    
    // 자동 응답 (바로 일정 추가 완료)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `${locationName} 방문 후 ${restaurantName}을 방문하도록 일정에 추가했습니다.`,
        sender: "assistant",
        timestamp: new Date(),
        preview: {
          type: "change",
          title: "맛집 추가 완료",
          changes: [
            {
              action: "add",
              day: currentDay,
              location: restaurantName,
              details: `${locationName} 방문 후 추가됨`,
            },
          ],
        },
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  const quickActions = [
    {
      icon: Minus,
      label: "장소 제거",
      actionType: "remove" as const,
      color: "text-red-600",
      bgColor: "bg-red-50 hover:bg-red-100",
    },
    {
      icon: Plus,
      label: "장소 추가",
      actionType: "add" as const,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
    },
    {
      icon: Navigation,
      label: "교통 변경",
      actionType: "transport" as const,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
    },
    {
      icon: UtensilsCrossed,
      label: "맛집 추천",
      actionType: "restaurant" as const,
      color: "text-orange-600",
      bgColor: "bg-orange-50 hover:bg-orange-100",
    },
  ]

  const suggestedQuestions = [
    "2일차 일정을 더 알차게 만들어줘",
    `${currentDay}일차에 맛집 추천해줘`,
    "쇼핑 시간을 늘려줘",
    "휴식 시간을 추가해줘",
  ]

  // 현재 컨텍스트 정보
  const contextInfo = currentView === "daily" ? `Day ${currentDay} 상세 일정` : "전체 일정 개요"

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">여행 일정 어시스턴트</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar className="h-3 w-3 text-gray-500" />
                <p className="text-xs text-gray-500">{contextInfo}</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Current Context Bar */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{itineraryData.cities.join(", ") || "여행지"}</span>
            </div>
            {itineraryData.dateRange && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(itineraryData.dateRange.start).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(itineraryData.dateRange.end).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>{itineraryData.travelers.adults}명</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-b border-gray-200 bg-white px-6 py-3">
          <p className="mb-2 text-xs font-medium text-gray-600">빠른 액션</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.actionType)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium transition-colors",
                  action.bgColor,
                  action.color
                )}
              >
                <action.icon className="h-4 w-4" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex h-[calc(100vh-350px)] flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={cn(
                      "flex gap-3",
                      message.sender === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
                      <p
                        className={cn(
                          "mt-1 text-xs",
                          message.sender === "user" ? "text-blue-100" : "text-gray-500"
                        )}
                      >
                        {message.timestamp.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <span className="text-xs font-semibold text-gray-600">나</span>
                      </div>
                    )}
                  </div>

                  {/* Preview Card - 변경사항 */}
                  {message.preview && message.preview.type === "change" && message.preview.changes && (
                    <div className="mt-3 ml-11 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900">{message.preview.title}</h4>
                        <Button
                          size="sm"
                          onClick={() => handleApplyChanges(message.id)}
                          className="h-7 rounded-lg bg-blue-500 px-3 text-xs text-white hover:bg-blue-600"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          적용
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {message.preview.changes.map((change, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 rounded-lg bg-white p-2.5 text-xs"
                          >
                            {change.action === "add" && <Plus className="mt-0.5 h-4 w-4 text-green-600" />}
                            {change.action === "remove" && (
                              <Minus className="mt-0.5 h-4 w-4 text-red-600" />
                            )}
                            {change.action === "transport" && (
                              <Navigation className="mt-0.5 h-4 w-4 text-blue-600" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                Day {change.day} - {change.location}
                              </div>
                              <div className="mt-0.5 text-gray-600">{change.details}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview Card - 맛집 추천 */}
                  {message.preview &&
                    message.preview.type === "recommendation" &&
                    message.preview.recommendations && (
                      <div className="mt-3 ml-11 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                        <h4 className="mb-3 text-sm font-semibold text-gray-900">
                          {message.preview.title}
                        </h4>
                        <div className="space-y-2">
                          {message.preview.recommendations.map((restaurant, idx) => {
                            // 맛집 추천 질문에 대한 사용자 답변 찾기 (이전 메시지)
                            const messageIndex = messages.findIndex(m => m.id === message.id)
                            const userResponse = messageIndex > 0 ? messages[messageIndex - 1] : null
                            const locationContext = userResponse?.text || "해당 장소"
                            return (
                            <button
                              key={idx}
                              onClick={() => handleSelectRestaurant(restaurant.name, locationContext, message.id)}
                              className="w-full rounded-lg border border-orange-200 bg-white p-3 text-left transition-colors hover:border-orange-400 hover:bg-orange-50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{restaurant.name}</div>
                                  <div className="mt-0.5 text-xs text-gray-600">{restaurant.location}</div>
                                  {restaurant.cuisine && (
                                    <div className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                                      {restaurant.cuisine}
                                    </div>
                                  )}
                                </div>
                                {restaurant.rating && (
                                  <div className="ml-2 flex items-center gap-1 text-xs text-gray-600">
                                    <span className="font-semibold">★</span>
                                    <span>{restaurant.rating}</span>
                                  </div>
                                )}
                              </div>
                            </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="rounded-2xl bg-gray-100 px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
              <p className="mb-2 text-xs font-medium text-gray-600">추천 질문</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputValue(question)}
                    className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
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
                style={{
                  minHeight: "44px",
                  maxHeight: "120px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
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
