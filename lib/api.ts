import {
  ApplyPreviewRequest,
  ApplyPreviewResponse,
  ChatRequestPayload,
  ChatResponse,
  Itinerary,
  PlannerData,
} from "@/lib/api-types"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api/v1"
).replace(/\/$/, "")

async function apiFetch<T>(path: string, options: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  })

  const rawText = await response.text()
  let data: unknown = null

  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = rawText
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : (data as { error?: { message?: string } })?.error?.message || "요청을 처리하지 못했습니다."
    throw new Error(message)
  }

  return data as T
}

export async function createItinerary(plannerData: PlannerData): Promise<Itinerary> {
  return apiFetch<Itinerary>("/itineraries", {
    method: "POST",
    body: JSON.stringify({ plannerData }),
  })
}

export async function fetchItinerary(itineraryId: string): Promise<Itinerary> {
  return apiFetch<Itinerary>(`/itineraries/${itineraryId}`, {
    method: "GET",
  })
}

export async function sendChatMessage(
  itineraryId: string,
  payload: ChatRequestPayload,
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>(`/itineraries/${itineraryId}/chat`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function applyPreview(
  itineraryId: string,
  payload: ApplyPreviewRequest,
): Promise<ApplyPreviewResponse> {
  return apiFetch<ApplyPreviewResponse>(`/itineraries/${itineraryId}/apply-preview`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
