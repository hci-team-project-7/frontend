"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Loader2, MapPin, Route, ScrollText, Sparkles, Timer } from "lucide-react"

const STAGES = [
  {
    title: "여행 맥락 정리",
    description: "선택한 도시, 날짜,同行자 정보를 정리해요.",
    icon: Sparkles,
  },
  {
    title: "동선 최적화",
    description: "이동 시간을 줄이는 루트를 계산 중이에요.",
    icon: Route,
  },
  {
    title: "하루 일정 채우기",
    description: "볼거리, 식사, 휴식 밸런스를 맞추고 있어요.",
    icon: ScrollText,
  },
  {
    title: "추천 다듬기",
    description: "현지 느낌의 스팟과 맛집으로 마무리해요.",
    icon: MapPin,
  },
]

const BLURBS = [
  "날씨·이동시간을 고려해 현실적인 하루 루트를 짜는 중입니다.",
  "로컬 분위기가 잘 드러나는 스팟과 맛집을 우선으로 구성해요.",
  "비슷한 일정에서 인기 높았던 코스를 중심으로 다듬고 있어요.",
]

const INITIAL_PROGRESS = 16
const EXPECTED_DURATION_MS = 3 * 60 * 1000
const PROGRESS_CAP = 97
const PROGRESS_TICK_MS = 2000

export default function GenerationProgress() {
  const [progress, setProgress] = useState(INITIAL_PROGRESS)
  const [activeStage, setActiveStage] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    setProgress(INITIAL_PROGRESS)
    setActiveStage(0)
    setTipIndex(0)

    const startTime = performance.now()
    const stageSpacing = EXPECTED_DURATION_MS / STAGES.length

    const stageTimers = STAGES.slice(1).map((_, index) =>
      setTimeout(() => setActiveStage(index + 1), stageSpacing * (index + 1)),
    )

    const progressTimer = setInterval(() => {
      const elapsed = performance.now() - startTime

      setProgress((prev) => {
        if (prev >= PROGRESS_CAP) return prev

        const normalized = Math.min(elapsed / EXPECTED_DURATION_MS, 1)
        const target = INITIAL_PROGRESS + normalized * (PROGRESS_CAP - INITIAL_PROGRESS)
        const jitter = Math.random() * 0.8
        const next = Math.max(prev, target + jitter)

        return Math.min(next, PROGRESS_CAP)
      })
    }, PROGRESS_TICK_MS)

    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % BLURBS.length)
    }, 2400)

    return () => {
      stageTimers.forEach(clearTimeout)
      clearInterval(progressTimer)
      clearInterval(tipTimer)
    }
  }, [])

  const currentBlurb = useMemo(() => BLURBS[tipIndex], [tipIndex])

  const stageStatus = (index: number): "done" | "active" | "pending" => {
    if (index < activeStage) return "done"
    if (index === activeStage) return "active"
    return "pending"
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-amber-100 p-10 shadow-2xl">
        <div className="pointer-events-none absolute -left-14 -top-14 h-56 w-56 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-60 w-60 rounded-full bg-amber-300/30 blur-3xl" />

        <div className="relative space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-500">Itinerary is cooking</p>
              <h2 className="text-3xl font-bold text-gray-900">여행 일정 생성 중...</h2>
              <p className="text-sm text-gray-600">곧 완성된 일정으로 자동 이동해요. 잠시만 기다려주세요.</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  AI 플래너가 취향을 반영하는 중
                </span>
                <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-sm">
                  <Timer className="h-4 w-4 text-amber-500" />
                  보통 약 3분 내외
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-5xl font-black text-orange-500 drop-shadow-sm">{Math.round(progress)}%</div>
              <p className="text-xs text-gray-500">진행도</p>
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-orange-100 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-400 transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {STAGES.map((stage, index) => {
              const status = stageStatus(index)
              const Icon = stage.icon
              const baseStyles =
                "flex items-start gap-3 rounded-xl border border-orange-100/70 bg-white/80 p-4 shadow-sm transition-all"
              const stateStyles =
                status === "active"
                  ? "shadow-lg ring-2 ring-orange-200"
                  : status === "done"
                    ? "border-emerald-100 bg-emerald-50/70"
                    : ""

              return (
                <div key={stage.title} className={`${baseStyles} ${stateStyles}`}>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      status === "done"
                        ? "bg-emerald-100 text-emerald-600"
                        : status === "active"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {status === "active" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : status === "done" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-900">{stage.title}</p>
                    <p className="text-xs text-gray-500">{stage.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-lg">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <p className="text-sm">{currentBlurb}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
