"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, DollarSign, BarChart2, Calendar, Percent, Clock } from "lucide-react"
import { useEffect, useState } from "react"

export function MarketIndexDetails({ index, categoryColors }: { index: any; categoryColors: Record<string, string> }) {
  // Sort markets by proportion (descending)
  const sortedMarkets = [...index.markets].sort((a, b) => b.proportion - a.proportion)

  // Generate position values based on market type
  const getPositionValue = (market: any, index: number) => {
    const positions = ["Yes", "No", "Team A", "Team B", "Candidate X", "Candidate Y"]
    // Use market id to determine position type, but ensure it's consistent
    const positionIndex = (market.id + index) % positions.length
    return positions[positionIndex]
  }

  // Generate remaining time for each market
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format remaining time based on the conditions
  const formatRemainingTime = (market: any) => {
    if (index.expired) return "Expired"

    // Generate a random remaining time based on market id
    // In a real app, this would be calculated from actual expiration dates
    const hoursRemaining = market.id % 100 // Use market id to generate a consistent value

    if (hoursRemaining > 24) {
      const days = Math.floor(hoursRemaining / 24)
      return `${days} days`
    } else if (hoursRemaining > 1) {
      return `${hoursRemaining} hours`
    } else {
      // For markets with less than 1 hour, create a countdown
      // Use current time to calculate minutes and seconds
      const totalSeconds = (hoursRemaining * 3600) % 3600
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = Math.floor(totalSeconds % 60) - (currentTime.getSeconds() % 60)

      // Ensure seconds don't go negative
      const adjustedSeconds = seconds < 0 ? 60 + seconds : seconds
      const adjustedMinutes = seconds < 0 ? minutes - 1 : minutes

      return `${adjustedMinutes}m ${adjustedSeconds}s`
    }
  }

  // Adjust prices to be above 90%
  const getAdjustedPrice = (originalPrice: number) => {
    return 0.9 + originalPrice * 0.09 // Scale between 0.90 and 0.99
  }

  return (
    <Card className="luxury-bg-card luxury-shadow border-0">
      <CardContent className="space-y-6 pt-6">
        {/* Index Overview - 5 columns including Estimated Yield Range */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <DetailItem
            icon={<DollarSign className="h-5 w-5 text-blue-400" />}
            label="Average Price"
            value={`$${index.avgPrice.toFixed(2)}`}
          />
          {!index.expired && (
            <DetailItem
              icon={<TrendingUp className="h-5 w-5 text-blue-400" />}
              label="24h Change"
              value={
                <span className={index.priceChange24h.startsWith("+") ? "text-green-400" : "text-red-400"}>
                  {index.priceChange24h}
                </span>
              }
            />
          )}
          <DetailItem
            icon={<BarChart2 className="h-5 w-5 text-blue-400" />}
            label="Volume"
            value={`$${index.volume.toFixed(2)}M`}
          />
          <DetailItem
            icon={<Calendar className="h-5 w-5 text-blue-400" />}
            label="Status"
            value={
              index.expired ? (
                <span className="bg-green-500 text-black px-2 py-0.5 rounded-full text-xs font-bold">Expired</span>
              ) : (
                <span>{index.daysRemaining} days remaining</span>
              )
            }
          />
          <DetailItem
            icon={<Percent className="h-5 w-5 text-blue-400" />}
            label={index.expired ? "Confirmed Yield" : "Estimated Yield Range"}
            value={
              index.expired ? (
                <span className="text-green-400 font-bold text-2xl">{index.yieldRange}</span>
              ) : (
                <span>
                  <span className="text-red-400">{index.yieldLoss}</span>
                  <span className="text-gray-400"> ~ </span>
                  <span className="text-green-400 font-bold text-xl">{index.yieldRange}</span>
                </span>
              )
            }
          />
        </div>

        {/* Settlement Date */}
        <div className="flex items-center text-sm text-gray-400">
          <Calendar className="h-4 w-4 mr-2" />
          Settlement Date: {index.settlementDate}
        </div>

        {/* New Markets Table with requested columns and fixed widths */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-2 w-[220px]">Market</th>
                <th className="pb-2 w-[100px]">Position</th>
                <th className="pb-2 w-[120px]">Category</th>
                <th className="pb-2 w-[120px] text-right">Market Volume</th>
                <th className="pb-2 w-[80px] text-right">Weight</th>
                <th className="pb-2 w-[80px] text-right">Price</th>
                <th className="pb-2 w-[120px] text-right">Remaining Time</th>
                <th className="pb-2 w-[80px] text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedMarkets.map((market, idx) => {
                const adjustedPrice = getAdjustedPrice(market.price)
                return (
                  <tr key={market.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="py-2 text-gray-200 w-[220px]">
                      <div className="truncate max-w-[200px]">{market.name}</div>
                    </td>
                    <td className="py-2 text-gray-200 w-[100px]">{market.position}</td>
                    <td className="py-2 w-[120px]">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${categoryColors[market.category] || "bg-gray-600"} text-white`}
                      >
                        {market.category}
                      </span>
                    </td>
                    {/* Mock volume data */}
                    <td className="py-2 text-right text-gray-300 w-[120px]">
                      ${(adjustedPrice * market.proportion * 10).toFixed(2)}M
                    </td>
                    <td className="py-2 text-right text-gray-300 w-[80px]">{(market.proportion * 100).toFixed(0)}%</td>
                    <td className="py-2 text-right text-gray-200 w-[80px]">${adjustedPrice.toFixed(2)}</td>
                    <td className="py-2 text-right text-gray-200 w-[120px]">
                      <div className="flex items-center justify-end">
                        <Clock className="h-3 w-3 text-blue-400 mr-1" />
                        {formatRemainingTime(market)}
                      </div>
                    </td>
                    <td onClick={() => window.open(`https://polygonscan.com/address/${index.contractAddress}`, "_blank")} className="py-2 text-right w-[80px]">
                      <span className={index.expired ? "text-green-400" : "text-blue-400"}>
                        {index.expired ? "Settled" : "Active"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start">
      <div className="mr-3 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-sm text-gray-200">{value}</div>
      </div>
    </div>
  )
}
