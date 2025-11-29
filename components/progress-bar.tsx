interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100

  return (
    <div className="sticky top-0 z-10 bg-white px-4 py-4 shadow-sm">
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}
