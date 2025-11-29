"use client"
import { ArrowRight } from "lucide-react"

interface HeroSectionProps {
  onStartPlanning: () => void
}

export default function HeroSection({ onStartPlanning }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-orange-200 via-orange-100 to-amber-200">
      {/* World Map Background - SVG pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1200" height="800" fill="url(#grid)" />
          {/* Decorative world map markers */}
          <circle cx="300" cy="200" r="8" fill="white" opacity="0.6" />
          <circle cx="600" cy="350" r="6" fill="white" opacity="0.5" />
          <circle cx="900" cy="250" r="7" fill="white" opacity="0.6" />
          <circle cx="200" cy="500" r="6" fill="white" opacity="0.5" />
          <circle cx="800" cy="500" r="8" fill="white" opacity="0.6" />
          <circle cx="400" cy="600" r="5" fill="white" opacity="0.4" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-orange-300/20" />

      {/* Center Content Card */}
      <div className="relative flex min-h-screen items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg animate-in fade-in duration-700">
          <div className="rounded-2xl bg-white p-8 shadow-2xl sm:p-12">
            <div className="mb-8 text-center">
              <h1 className="mb-3 bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                당신의 완벽한 여정을 계획하세요
              </h1>
              <p className="text-balance text-gray-600">
                세계에서 가장 아름다운 목적지들을 발견하고 잊을 수 없는 추억을 만드세요
              </p>
            </div>

            <button
              onClick={onStartPlanning}
              className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 px-6 py-4 font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-orange-400/50 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                여행 계획 시작하기
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements - Top Right */}
      <div className="pointer-events-none absolute right-10 top-20 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

      {/* Floating Elements - Bottom Left */}
      <div className="pointer-events-none absolute bottom-10 left-5 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
    </section>
  )
}
