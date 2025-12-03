const DAY_IMAGE_POOL = [
  "/city-arrival.jpg",
  "/downtown-evening-walk.jpg",
  "/beach-relaxation.png",
  "/nature-hiking.jpg",
  "/vibrant-local-market.png",
  "/traditional-restaurant-dinner.jpg",
  "/santorini-greece.png",
  "/tokyo-skyline.png",
]

const ACTIVITY_IMAGE_POOL = [
  "/granada-alhambra.jpg",
  "/colosseum-rome.png",
  "/kyoto-temples.png",
  "/paris-eiffel-tower.png",
  "/valencia-spain.jpg",
  "/madrid-spain.jpg",
  "/venice-italy-canals.jpg",
  "/capri-italy-island.jpg",
]

export const DEFAULT_PLACE_IMAGE = "/placeholder.jpg"

const hashSeed = (seed: string | number | undefined | null) => {
  if (typeof seed === "number" && Number.isFinite(seed)) {
    return Math.abs(Math.floor(seed))
  }
  if (typeof seed === "string") {
    return Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  }
  return 0
}

const pickFromPool = (seed: string | number | undefined | null, pool: string[]) => {
  if (!pool.length) return DEFAULT_PLACE_IMAGE
  const hashed = hashSeed(seed)
  return pool[hashed % pool.length]
}

export const getDayImage = (day: number | null | undefined) => {
  if (!day || Number.isNaN(Number(day))) return DAY_IMAGE_POOL[0]
  return pickFromPool(day - 1, DAY_IMAGE_POOL)
}

export const getActivityImage = (seed: string | number | undefined) => {
  return pickFromPool(seed, ACTIVITY_IMAGE_POOL)
}
