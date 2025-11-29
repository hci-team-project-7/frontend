"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Step3Props {
  data: any
  updateData: (key: string, value: any) => void
}

export default function Step3Dates({ data, updateData }: Step3Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)

    if (!startDate) {
      setStartDate(selectedDate)
    } else if (!endDate) {
      if (selectedDate > startDate) {
        setEndDate(selectedDate)
        updateData("dateRange", {
          start: startDate.toISOString().split("T")[0],
          end: selectedDate.toISOString().split("T")[0],
        })
      } else {
        setStartDate(selectedDate)
        setEndDate(null)
      }
    } else {
      setStartDate(selectedDate)
      setEndDate(null)
    }
  }

  const setQuickOption = (option: string) => {
    const today = new Date()
    let start: Date
    let end: Date

    if (option === "next-weekend") {
      const daysUntilFriday = (5 - today.getDay()) % 7 || 7
      start = new Date(today)
      start.setDate(today.getDate() + daysUntilFriday)
      end = new Date(start)
      end.setDate(start.getDate() + 2)
    } else if (option === "next-month") {
      start = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      end = new Date(today.getFullYear(), today.getMonth() + 2, 0)
    } else if (option === "summer") {
      start = new Date(today.getFullYear(), 5, 1)
      end = new Date(today.getFullYear(), 8, 31)
    }

    setStartDate(start)
    setEndDate(end)
    updateData("dateRange", {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    })
  }

  const calculateDuration = () => {
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return `${diffDays}일`
    }
    return ""
  }

  const monthName = currentMonth.toLocaleDateString("ko-KR", {
    month: "long",
    year: "numeric",
  })

  const days = []
  const firstDay = getFirstDayOfMonth(currentMonth)
  const daysInMonth = getDaysInMonth(currentMonth)

  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="mb-3 text-4xl font-bold text-gray-900">언제 여행을 떠나시나요?</h1>
        <p className="text-gray-600">여행 기간을 선택하세요. 날짜 범위를 지정하거나 빠른 옵션을 사용하세요.</p>
      </div>

      {/* Quick Select Options */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setQuickOption("next-weekend")}
          className="rounded-full border-2 border-orange-300 px-4 py-2 font-medium text-orange-600 transition-colors hover:bg-orange-50"
        >
          이번 주말
        </button>
        <button
          onClick={() => setQuickOption("next-month")}
          className="rounded-full border-2 border-orange-300 px-4 py-2 font-medium text-orange-600 transition-colors hover:bg-orange-50"
        >
          다음 달
        </button>
        <button
          onClick={() => setQuickOption("summer")}
          className="rounded-full border-2 border-orange-300 px-4 py-2 font-medium text-orange-600 transition-colors hover:bg-orange-50"
        >
          여름 2025
        </button>
      </div>

      {/* Calendar */}
      <div className="mx-auto max-w-md rounded-lg bg-gray-50 p-6">
        {/* Calendar Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="rounded-lg p-2 hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="font-semibold text-gray-900">{monthName}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="rounded-lg p-2 hover:bg-white"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="mb-4 grid grid-cols-7 gap-1">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const date = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null
            const isStartDate = date && startDate && date.toDateString() === startDate.toDateString()
            const isEndDate = date && endDate && date.toDateString() === endDate.toDateString()
            const isInRange = date && startDate && endDate && date > startDate && date < endDate

            return (
              <button
                key={idx}
                onClick={() => day && handleDateClick(day)}
                className={`aspect-square rounded-lg py-2 text-sm font-medium transition-colors ${
                  !day
                    ? "cursor-default"
                    : isStartDate || isEndDate
                      ? "bg-orange-400 text-white"
                      : isInRange
                        ? "bg-orange-100 text-gray-900"
                        : "text-gray-700 hover:bg-white"
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Dates Display */}
      {startDate && endDate && (
        <div className="rounded-lg bg-orange-50 p-4 text-center">
          <p className="mb-2 text-sm font-medium text-gray-600">선택된 기간</p>
          <p className="mb-1 text-lg font-bold text-gray-900">
            {startDate.toLocaleDateString("ko-KR")} ~ {endDate.toLocaleDateString("ko-KR")}
          </p>
          <p className="text-sm font-semibold text-orange-600">{calculateDuration()}</p>
        </div>
      )}
    </div>
  )
}
