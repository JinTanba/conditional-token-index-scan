"use client"

import { Info } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LiveMempoolChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Mock data
  const activeMarkets = 23487
  const marketActivity = 68 // percentage

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = dimensions.width
    canvas.height = dimensions.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw chart background
    ctx.fillStyle = "#1A2030"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Generate mock data points
    const dataPoints = 48 // 24 hours, 30 min intervals
    const priceData = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 15) + 50)
    const volumeData = Array.from({ length: dataPoints }, () => Math.floor(Math.random() * 50))

    // Draw grid lines
    ctx.strokeStyle = "#2A3040"
    ctx.lineWidth = 0.5

    // Horizontal grid lines
    const gridLines = 5
    for (let i = 1; i < gridLines; i++) {
      const y = (dimensions.height / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(dimensions.width, y)
      ctx.stroke()
    }

    // Vertical grid lines
    const verticalLines = 6
    for (let i = 1; i < verticalLines; i++) {
      const x = (dimensions.width / verticalLines) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, dimensions.height)
      ctx.stroke()
    }

    // Draw price line (blue)
    ctx.strokeStyle = "#4A7AFF"
    ctx.lineWidth = 2
    ctx.beginPath()
    priceData.forEach((value, index) => {
      const x = (dimensions.width / (dataPoints - 1)) * index
      const y = dimensions.height - (value / 100) * dimensions.height
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw volume bars (blue)
    volumeData.forEach((value, index) => {
      const x = (dimensions.width / (dataPoints - 1)) * index
      const height = (value / 50) * (dimensions.height * 0.3)

      ctx.fillStyle = "rgba(74, 122, 255, 0.3)"
      ctx.fillRect(x - 2, dimensions.height - height, 4, height)
    })
  }, [dimensions])

  return (
    <Card className="luxury-bg-card border-0 luxury-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 mobile-card-header">
        <CardTitle className="text-sm sm:text-md font-medium text-gray-100">Market Activity</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="text-xs sm:text-sm font-medium text-gray-300">
            {activeMarkets.toLocaleString()} active markets
          </div>
          <Info size={16} className="text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 mobile-card-padding">
        {/* Market activity bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mobile-small-text">
            <span>Trading Activity</span>
            <span>{marketActivity}%</span>
          </div>
          <div className="h-1 sm:h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${marketActivity}%` }}></div>
          </div>
        </div>

        {/* Chart */}
        <div ref={containerRef} className="chart-container">
          <canvas ref={canvasRef} />

          {/* Y-axis labels */}
          <div className="absolute left-1 sm:left-2 top-0 text-[10px] sm:text-xs text-gray-400 mobile-small-text">
            $1.00
          </div>
          <div className="absolute left-1 sm:left-2 bottom-0 text-[10px] sm:text-xs text-gray-400 mobile-small-text">
            $0.00
          </div>

          {/* X-axis labels */}
          <div className="absolute left-0 bottom-[-16px] sm:bottom-[-20px] text-[10px] sm:text-xs text-gray-400 mobile-small-text">
            24h ago
          </div>
          <div className="absolute right-0 bottom-[-16px] sm:bottom-[-20px] text-[10px] sm:text-xs text-gray-400 mobile-small-text">
            now
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
