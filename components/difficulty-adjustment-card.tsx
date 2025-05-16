import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

export function DifficultyAdjustmentCard() {
  // Mock data
  const progressPercent = 68
  const marketVolume = "+12.34"
  const daysRemaining = 7
  const totalLiquidity = "542M"

  return (
    <Card className="luxury-bg-card border-0 luxury-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 mobile-card-header">
        <CardTitle className="text-sm sm:text-md font-medium text-gray-100">Market Trends</CardTitle>
        <Info size={16} className="text-gray-400" />
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 mobile-card-padding">
        {/* Progress bar */}
        <div className="space-y-1 sm:space-y-2">
          <div className="flex justify-between text-xs sm:text-sm text-gray-300">
            <span>Market Confidence</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="text-[10px] sm:text-xs text-gray-400 mobile-small-text">Weekly Volume Change</div>
            <div
              className={`text-base sm:text-lg font-semibold ${marketVolume.startsWith("+") ? "text-blue-400" : "text-red-400"}`}
            >
              {marketVolume}%
            </div>
          </div>

          <div>
            <div className="text-[10px] sm:text-xs text-gray-400 mobile-small-text">Avg. Resolution Time</div>
            <div className="text-base sm:text-lg font-semibold text-gray-200">~{daysRemaining} days</div>
          </div>

          <div className="col-span-2">
            <div className="text-[10px] sm:text-xs text-gray-400 mobile-small-text">Total Market Liquidity</div>
            <div className="text-base sm:text-lg font-semibold text-gray-200">${totalLiquidity}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
