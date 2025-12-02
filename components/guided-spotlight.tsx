"use client"

import { RefObject, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

type SpotlightStep = {
  id: string
  title: string
  description: string
  targetRef?: RefObject<HTMLElement>
}

interface GuidedSpotlightProps {
  steps: SpotlightStep[]
  open: boolean
  activeIndex: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function GuidedSpotlight({ steps, open, activeIndex, onNext, onPrev, onClose }: GuidedSpotlightProps) {
  const step = steps[activeIndex]
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!open || !step?.targetRef?.current) {
      setRect(null)
      return
    }
    const update = () => {
      const el = step.targetRef?.current
      if (!el) {
        setRect(null)
        return
      }
      const nextRect = el.getBoundingClientRect()
      setRect(nextRect)
    }
    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [step, open])

  const padding = 12
  const spotlightBox = useMemo(() => {
    if (!rect) return null
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 360
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800
    const top = clamp(rect.top - padding, 0, viewportHeight)
    const left = clamp(rect.left - padding, 0, viewportWidth)
    const width = Math.min(rect.width + padding * 2, viewportWidth)
    const height = Math.min(rect.height + padding * 2, viewportHeight)
    const right = clamp(viewportWidth - (left + width), 0, viewportWidth)
    const bottom = clamp(viewportHeight - (top + height), 0, viewportHeight)
    return { top, left, width, height, right, bottom }
  }, [rect])

  const bubblePosition = useMemo(() => {
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 360
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800
    const width = Math.min(360, viewportWidth - 32)
    if (!rect || !spotlightBox) {
      return { top: 24, left: 24, width }
    }
    const top = clamp(spotlightBox.top + spotlightBox.height + 16, 16, viewportHeight - 240)
    const left = clamp(spotlightBox.left + spotlightBox.width / 2 - width / 2, 16, viewportWidth - width - 16)
    return { top, left, width }
  }, [rect, spotlightBox])

  if (!open || !step) return null

  const isLast = activeIndex === steps.length - 1

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Dimmed overlay split into four pieces to create a clean rectangular hole */}
      {spotlightBox ? (
        <>
          <div
            className="absolute inset-x-0 top-0 bg-slate-950/65 backdrop-blur-sm"
            style={{ height: spotlightBox.top }}
          />
          <div
            className="absolute left-0 bg-slate-950/65 backdrop-blur-sm"
            style={{ top: spotlightBox.top, width: spotlightBox.left, height: spotlightBox.height }}
          />
          <div
            className="absolute right-0 bg-slate-950/65 backdrop-blur-sm"
            style={{ top: spotlightBox.top, width: spotlightBox.right, height: spotlightBox.height }}
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-slate-950/65 backdrop-blur-sm"
            style={{ height: spotlightBox.bottom }}
          />

          {/* Highlight ring */}
          <div
            className="absolute rounded-2xl pointer-events-none transition-all duration-200 shadow-[0_15px_70px_rgba(0,0,0,0.35)]"
            style={{
              top: spotlightBox.top,
              left: spotlightBox.left,
              width: spotlightBox.width,
              height: spotlightBox.height,
              boxShadow:
                "0 0 0 2px rgba(255,255,255,0.85), 0 0 0 10px rgba(255,255,255,0.08), 0 15px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div className="absolute inset-0 rounded-2xl border border-white/50 animate-pulse" />
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" />
      )}

      {/* Content bubble */}
      <div
        className="pointer-events-auto absolute"
        style={{ top: bubblePosition.top, left: bubblePosition.left, width: bubblePosition.width }}
      >
        <div className="rounded-2xl bg-white/95 p-4 shadow-2xl ring-1 ring-slate-200">
          <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-slate-500">
            <span className="font-semibold">가이드</span>
            <span>
              {activeIndex + 1} / {steps.length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.description}</p>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 underline-offset-4 hover:underline"
            >
              건너뛰기
            </button>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={activeIndex === 0}
                onClick={onPrev}
                className="h-8"
              >
                이전
              </Button>
              <Button size="sm" onClick={isLast ? onClose : onNext} className="h-8">
                {isLast ? "완료" : "다음"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
