export interface PlannerFormData {
  country: string | null
  cities: string[]
  dateRange: { start: string; end: string } | null
  travelers: { adults: number; children: number; type: string }
  styles: string[]
  transportMode?: TransportMode
}

export interface PlannerData {
  country: string
  cities: string[]
  dateRange: { start: string; end: string }
  travelers: { adults: number; children: number; type: string }
  styles: string[]
  transportMode?: TransportMode
}

export interface Location {
  name: string
  time: string
  lat: number
  lng: number
}

export type TransportMode = "drive" | "walk" | "transit" | "bike"

export interface TransportLeg {
  fromActivityId: string
  toActivityId: string
  mode: TransportMode
  durationMinutes: number
  distanceMeters: number
  summary: string
}

export interface DayItinerary {
  day: number
  date: string
  title: string
  photo: string
  activities: string[]
  locations: Location[]
  transports: TransportLeg[]
}

export interface Activity {
  id: string
  name: string
  location: string
  lat?: number
  lng?: number
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

export interface Itinerary {
  id: string
  plannerData: PlannerData
  overview: DayItinerary[]
  activitiesByDay: Record<string, Activity[]>
  createdAt: string
  updatedAt: string
}

export type ChatSender = "user" | "assistant"

export interface ChatChange {
  action: "add" | "remove" | "modify" | "transport" | "regenerate" | "replace"
  day?: number
  location?: string
  targetLocation?: string
  details?: string
  mode?: TransportMode
  afterActivityName?: string
  fromLocation?: string
  toLocation?: string
  lat?: number
  lng?: number
  address?: string
}

export interface ChatRestaurantRecommendation {
  name: string
  location: string
  rating?: number
  cuisine?: string
  address?: string
  lat?: number
  lng?: number
  distanceMeters?: number
  anchorActivityName?: string
  userRatingsTotal?: number
  source?: string
  isDemo?: boolean
  walkingMinutes?: number
  drivingMinutes?: number
}

export interface ChatPreview {
  type: "change" | "recommendation"
  title: string
  changes?: ChatChange[]
  recommendations?: ChatRestaurantRecommendation[]
}

export interface ChatMessage {
  id: string
  text: string
  sender: ChatSender
  timestamp: string
  preview?: ChatPreview
  variant?: "system"
}

export interface ChatRequestContext {
  currentView: "overview" | "daily"
  currentDay?: number
  pendingAction?: "remove" | "add" | "transport" | "restaurant" | "replace" | null
}

export interface ChatRequestPayload {
  message: { text: string; timestamp: string }
  context: ChatRequestContext
}

export interface ChatResponse {
  reply: ChatMessage
  updatedItinerary?: Itinerary | null
}

export interface ApplyPreviewRequest {
  sourceMessageId: string
  changes: ChatChange[]
}

export interface ApplyPreviewResponse {
  updatedItinerary: Itinerary
  systemMessage?: string
}
