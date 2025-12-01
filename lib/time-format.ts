"use client"

const pad2 = (value: number) => value.toString().padStart(2, "0")

const formatDurationMinutes = (minutes: number) => {
  const safeMinutes = Math.max(0, Math.round(minutes))
  const hours = Math.floor(safeMinutes / 60)
  const mins = safeMinutes % 60
  if (hours === 0) return `${mins}분`
  if (mins === 0) return `${hours}시간`
  return `${hours}시간 ${mins}분`
}

export const formatScheduleTime = (raw?: string | number | null) => {
  if (raw === null || raw === undefined) return "시간 정보 없음"

  const value = typeof raw === "number" ? String(raw) : raw.trim()
  if (!value) return "시간 정보 없음"

  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    return formatDurationMinutes(numeric)
  }

  const ampmMatch = value.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/i)
  if (ampmMatch) {
    let hour = Number(ampmMatch[1])
    const minute = Number(ampmMatch[2] ?? "0")
    if (minute >= 60) return formatDurationMinutes(hour * 60 + minute)
    const suffix = ampmMatch[3].toUpperCase()
    if (suffix === "PM" && hour !== 12) hour += 12
    if (suffix === "AM" && hour === 12) hour = 0
    return `${pad2(hour)}:${pad2(minute)}`
  }

  const colonMatch = value.match(/^(\d{1,3}):(\d{1,2})$/)
  if (colonMatch) {
    const hour = Number(colonMatch[1])
    const minute = Number(colonMatch[2])
    if (minute < 60 && hour < 24) {
      return `${pad2(hour)}:${pad2(minute)}`
    }
    if (minute < 60) {
      return formatDurationMinutes(hour + minute)
    }
  }

  return value
}
