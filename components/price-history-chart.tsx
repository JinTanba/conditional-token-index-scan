"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "@/components/ui/chart"
import { LineChart, Line } from "@/components/ui/chart"
import type { TradeRecord } from "polynance_sdk"
import { Skeleton } from "@/components/ui/skeleton"
import { Info, TrendingUp, DollarSign, User, Clock } from "lucide-react"

export function PriceHistoryChart({ priceHistory, candleData }: { priceHistory: TradeRecord[]; candleData: any[] }) {
  const [chartType, setChartType] = useState<"line" | "candle" | "volume" | "traders" | "realtime">("line")
  const [isLoading, setIsLoading] = useState(true)
  const [traderStats, setTraderStats] = useState<{ trader: string; volume: number; trades: number }[]>([])
  const [recentTrades, setRecentTrades] = useState<TradeRecord[]>([])
  const [priceHistoryState, setPriceHistory] = useState<TradeRecord[]>(priceHistory || [])

  // Process trader data and recent trades when price history changes
  useEffect(() => {
    setIsLoading(true)

    // Process trader statistics
    if (priceHistory && priceHistory.length > 0) {
      const traderMap = new Map<string, { volume: number; trades: number }>()

      priceHistory.forEach((trade) => {
        if (!trade.trader) return

        const trader = trade.trader.toLowerCase()
        const existing = traderMap.get(trader) || { volume: 0, trades: 0 }

        traderMap.set(trader, {
          volume: existing.volume + (trade.volumeBase || 0),
          trades: existing.trades + 1,
        })
      })

      // Convert to array and sort by volume
      const traders = Array.from(traderMap.entries()).map(([trader, stats]) => ({
        trader,
        volume: stats.volume,
        trades: stats.trades,
      }))

      traders.sort((a, b) => b.volume - a.volume)
      setTraderStats(traders.slice(0, 10)) // Top 10 traders

      // Get recent trades (last 20)
      const sortedTrades = [...priceHistory].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20)
      setRecentTrades(sortedTrades)
    } else {
      // If no price history, set empty arrays
      setTraderStats([])
      setRecentTrades([])

      // Generate mock data for visualization if needed
      if (chartType === "line" && (!priceHistory || priceHistory.length === 0)) {
        const mockData = generateMockPriceHistory(30)
        setPriceHistory(mockData)
      }
    }

    setIsLoading(false)
  }, [priceHistory, chartType])

  // Add this function to generate mock price history data when real data is unavailable
  const generateMockPriceHistory = (days: number) => {
    const now = Math.floor(Date.now() / 1000)
    const dayInSeconds = 86400
    let price = 0.75 + Math.random() * 0.2 // Start with a price between 0.75 and 0.95

    const mockData = []
    for (let i = days; i >= 0; i--) {
      // Add random price movement (-3% to +3%)
      const change = Math.random() * 0.06 - 0.03
      price = Math.max(0.5, Math.min(0.99, price + price * change))

      mockData.push({
        price,
        volumeBase: Math.random() * 10000,
        timestamp: now - i * dayInSeconds,
        trader: `0x${Math.random().toString(16).substring(2, 10)}`, // Random mock address
      })
    }

    return mockData
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Format price for tooltip
  const formatPrice = (price: number) => {
    return `$${price.toFixed(4)}`
  }

  // Format volume for tooltip
  const formatVolume = (volume: number) => {
    return volume > 1000000
      ? `$${(volume / 1000000).toFixed(2)}M`
      : volume > 1000
        ? `$${(volume / 1000).toFixed(2)}K`
        : `$${volume.toFixed(2)}`
  }

  // Format trader address
  const formatTraderAddress = (address: string) => {
    if (!address) return "Unknown"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Format time ago
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // Prepare data for line chart
  const lineChartData = priceHistory.map((record) => ({
    timestamp: record.timestamp,
    price: record.price,
    volume: record.volumeBase,
    trader: record.trader,
  }))

  // Prepare data for volume chart
  const volumeChartData = priceHistory.map((record) => ({
    timestamp: record.timestamp,
    volume: record.volumeBase,
    trader: record.trader,
  }))

  return (
    <Card className="bg-gray-800/20 border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-100 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2 text-blue-400" />
          Price History
        </CardTitle>
        <Tabs defaultValue="line" className="w-auto" onValueChange={(value) => setChartType(value as any)}>
          <TabsList className="h-8">
            <TabsTrigger value="line" className="text-xs px-3">
              Line
            </TabsTrigger>
            <TabsTrigger value="candle" className="text-xs px-3">
              Candle
            </TabsTrigger>
            <TabsTrigger value="volume" className="text-xs px-3">
              Volume
            </TabsTrigger>
            <TabsTrigger value="traders" className="text-xs px-3">
              Traders
            </TabsTrigger>
            <TabsTrigger value="realtime" className="text-xs px-3">
              Recent
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[400px] w-full flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <>
            {chartType !== "traders" && chartType !== "realtime" ? (
              <div className="h-[400px] w-full">
                {chartType === "line" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fill: "#a0a0a0", fontSize: 10 }}
                        tickFormatter={(value) => {
                          const date = new Date(value * 1000)
                          return date.toLocaleDateString()
                        }}
                        axisLine={{ stroke: "#2A3040" }}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fill: "#a0a0a0", fontSize: 10 }}
                        tickFormatter={(value) => `$${value.toFixed(2)}`}
                        axisLine={{ stroke: "#2A3040" }}
                      />
                      <Tooltip
                        formatter={(value: any, name: string, props: any) => {
                          if (name === "price") return [formatPrice(value), "Price"]
                          return [value, name]
                        }}
                        labelFormatter={(label) => formatTimestamp(label)}
                        contentStyle={{ backgroundColor: "#1e2433", borderColor: "#2A3040" }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
                                <p className="text-gray-400 text-xs mb-1">{formatTimestamp(label)}</p>
                                <p className="text-white font-medium">{formatPrice(data.price)}</p>
                                <div className="flex items-center mt-1 text-xs text-gray-400">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Volume: {formatVolume(data.volume)}
                                </div>
                                <div className="flex items-center mt-1 text-xs text-gray-400">
                                  <User className="h-3 w-3 mr-1" />
                                  Trader: {formatTraderAddress(data.trader)}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#4A7AFF"
                        dot={false}
                        strokeWidth={2}
                        activeDot={{ r: 6, stroke: "#4A7AFF", strokeWidth: 2, fill: "#1e2433" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {chartType === "candle" && candleData.length > 0 && (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={candleData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" />
                            <XAxis
                              dataKey="time"
                              tick={{ fill: "#a0a0a0", fontSize: 10 }}
                              tickFormatter={(value) => {
                                const date = new Date(value * 1000)
                                return date.toLocaleDateString()
                              }}
                              axisLine={{ stroke: "#2A3040" }}
                              angle={-45}
                              textAnchor="end"
                            />
                            <YAxis
                              domain={["auto", "auto"]}
                              tick={{ fill: "#a0a0a0", fontSize: 10 }}
                              tickFormatter={(value) => `$${value.toFixed(2)}`}
                              axisLine={{ stroke: "#2A3040" }}
                            />
                            <Tooltip
                              formatter={(value: any) => [formatPrice(value), "Price"]}
                              labelFormatter={(label) => formatTimestamp(label)}
                              contentStyle={{ backgroundColor: "#1e2433", borderColor: "#2A3040" }}
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload
                                  return (
                                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
                                      <p className="text-gray-400 text-xs mb-1">{formatTimestamp(label)}</p>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                                        <div className="text-xs text-gray-400">Open:</div>
                                        <div className="text-xs text-white">{formatPrice(data.open)}</div>
                                        <div className="text-xs text-gray-400">High:</div>
                                        <div className="text-xs text-green-400">{formatPrice(data.high)}</div>
                                        <div className="text-xs text-gray-400">Low:</div>
                                        <div className="text-xs text-red-400">{formatPrice(data.low)}</div>
                                        <div className="text-xs text-gray-400">Close:</div>
                                        <div className="text-xs text-white">{formatPrice(data.close)}</div>
                                        <div className="text-xs text-gray-400">Volume:</div>
                                        <div className="text-xs text-white">{formatVolume(data.volume)}</div>
                                      </div>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Bar dataKey="high" fill="#4CAF50" name="High" />
                            <Bar dataKey="low" fill="#F44336" name="Low" />
                            <Bar dataKey="close" fill="#4A7AFF" name="Close" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {chartType === "volume" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A3040" />
                      <XAxis
                        dataKey="timestamp"
                        tick={{ fill: "#a0a0a0", fontSize: 10 }}
                        tickFormatter={(value) => {
                          const date = new Date(value * 1000)
                          return date.toLocaleDateString()
                        }}
                        axisLine={{ stroke: "#2A3040" }}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fill: "#a0a0a0", fontSize: 10 }}
                        tickFormatter={(value) => formatVolume(value)}
                        axisLine={{ stroke: "#2A3040" }}
                      />
                      <Tooltip
                        formatter={(value: any) => [formatVolume(value), "Volume"]}
                        labelFormatter={(label) => formatTimestamp(label)}
                        contentStyle={{ backgroundColor: "#1e2433", borderColor: "#2A3040" }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
                                <p className="text-gray-400 text-xs mb-1">{formatTimestamp(label)}</p>
                                <p className="text-white font-medium">{formatVolume(data.volume)}</p>
                                <div className="flex items-center mt-1 text-xs text-gray-400">
                                  <User className="h-3 w-3 mr-1" />
                                  Trader: {formatTraderAddress(data.trader)}
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="volume" fill="#4A7AFF" name="Volume" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            ) : chartType === "traders" ? (
              <div className="h-[400px] overflow-y-auto">
                <div className="p-2 bg-gray-800/30 rounded-lg mb-4">
                  <div className="text-sm text-gray-300 mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-blue-400" />
                    Top traders by volume in this market
                  </div>
                </div>

                {traderStats.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No trader data available</div>
                ) : (
                  <div className="space-y-4">
                    {traderStats.map((trader, index) => (
                      <div key={trader.trader} className="bg-gray-800/30 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className="bg-blue-900/50 text-blue-300 h-8 w-8 rounded-full flex items-center justify-center mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm text-gray-200 font-mono">
                                {formatTraderAddress(trader.trader)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {trader.trades} trade{trader.trades !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-200 font-medium">{formatVolume(trader.volume)}</div>
                            <div className="text-xs text-gray-400">volume</div>
                          </div>
                        </div>

                        {/* Volume bar */}
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{
                              width: `${Math.min(100, (trader.volume / traderStats[0].volume) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Real-time trades view
              <div className="h-[400px] overflow-y-auto">
                <div className="p-2 bg-gray-800/30 rounded-lg mb-4">
                  <div className="text-sm text-gray-300 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-400" />
                    Recent trades
                  </div>
                </div>

                {recentTrades.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No recent trades available</div>
                ) : (
                  <div className="space-y-2">
                    {recentTrades.map((trade, index) => (
                      <div key={index} className="bg-gray-800/30 p-3 rounded-lg flex justify-between items-center">
                        <div className="flex items-center">
                          <div
                            className={`h-2 w-2 rounded-full mr-3 ${trade.price > (recentTrades[index + 1]?.price || trade.price) ? "bg-green-500" : "bg-red-500"}`}
                          ></div>
                          <div>
                            <div className="text-sm text-gray-200 font-medium">{formatPrice(trade.price)}</div>
                            <div className="text-xs text-gray-400 font-mono">{formatTraderAddress(trade.trader)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-200">{formatVolume(trade.volumeBase)}</div>
                          <div className="text-xs text-gray-400">{formatTimeAgo(trade.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
