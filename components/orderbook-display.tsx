"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ArrowDown, ArrowUp } from "lucide-react"
import type { OrderBookSummary } from "polynance_sdk"
import { Skeleton } from "@/components/ui/skeleton"

export function OrderbookDisplay({ orderbook }: { orderbook: Record<string, OrderBookSummary> }) {
  const [isLoading, setIsLoading] = useState(true)
  const [processedOrderbook, setProcessedOrderbook] = useState<{
    bids: { price: number; size: number; total: number }[]
    asks: { price: number; size: number; total: number }[]
    spread: { absolute: number; percentage: number }
  }>({
    bids: [],
    asks: [],
    spread: { absolute: 0, percentage: 0 },
  })

  // Process orderbook data
  useEffect(() => {
    setIsLoading(true)

    try {
      // Get the first orderbook if available
      const firstAssetId = Object.keys(orderbook)[0]
      const firstOrderbook = firstAssetId ? orderbook[firstAssetId] : null

      if (!firstOrderbook || !firstOrderbook.asks.length || !firstOrderbook.bids.length) {
        setProcessedOrderbook({
          bids: [],
          asks: [],
          spread: { absolute: 0, percentage: 0 },
        })
        setIsLoading(false)
        return
      }

      // Process bids
      let bidTotal = 0
      const processedBids = firstOrderbook.bids.slice(0, 15).map((bid) => {
        bidTotal += bid.size
        return {
          price: bid.price,
          size: bid.size,
          total: bidTotal,
        }
      })

      // Process asks
      let askTotal = 0
      const processedAsks = firstOrderbook.asks.slice(0, 15).map((ask) => {
        askTotal += ask.size
        return {
          price: ask.price,
          size: ask.size,
          total: askTotal,
        }
      })

      // Calculate spread
      const lowestAsk = firstOrderbook.asks[0].price
      const highestBid = firstOrderbook.bids[0].price
      const spread = lowestAsk - highestBid
      const percentage = (spread / lowestAsk) * 100

      setProcessedOrderbook({
        bids: processedBids,
        asks: processedAsks,
        spread: {
          absolute: spread,
          percentage: percentage,
        },
      })
    } catch (error) {
      console.error("Error processing orderbook:", error)
      setProcessedOrderbook({
        bids: [],
        asks: [],
        spread: { absolute: 0, percentage: 0 },
      })
    } finally {
      setIsLoading(false)
    }
  }, [orderbook])

  // Format price
  const formatPrice = (price: number) => {
    return `$${price.toFixed(4)}`
  }

  // Format size
  const formatSize = (size: number) => {
    return size > 1000000
      ? `${(size / 1000000).toFixed(2)}M`
      : size > 1000
        ? `${(size / 1000).toFixed(2)}K`
        : size.toFixed(2)
  }

  // Format total
  const formatTotal = (total: number) => {
    return total > 1000000
      ? `$${(total / 1000000).toFixed(2)}M`
      : total > 1000
        ? `$${(total / 1000).toFixed(2)}K`
        : `$${total.toFixed(2)}`
  }

  // Calculate max total for visualization
  const maxTotal = Math.max(
    processedOrderbook.bids.length > 0 ? processedOrderbook.bids[processedOrderbook.bids.length - 1].total : 0,
    processedOrderbook.asks.length > 0 ? processedOrderbook.asks[processedOrderbook.asks.length - 1].total : 0,
  )

  return (
    <Card className="bg-gray-800/20 border-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-100 flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
          Order Book
        </CardTitle>
        {!isLoading && processedOrderbook.spread.absolute > 0 && (
          <div className="text-xs bg-gray-800/50 px-3 py-1 rounded-full">
            Spread: {formatPrice(processedOrderbook.spread.absolute)} ({processedOrderbook.spread.percentage.toFixed(2)}
            %)
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        ) : processedOrderbook.bids.length === 0 && processedOrderbook.asks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No orderbook data available</div>
        ) : (
          <>
            {/* Price direction indicator */}
            <div className="flex justify-center items-center mb-4">
              <div className="bg-gray-800/50 px-4 py-2 rounded-full flex items-center">
                {processedOrderbook.bids.length > 0 && processedOrderbook.asks.length > 0 && (
                  <>
                    {processedOrderbook.bids[0].price > processedOrderbook.asks[0].price ? (
                      <ArrowUp className="h-4 w-4 text-green-400 mr-2" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-400 mr-2" />
                    )}
                    <span className="text-sm text-gray-300">
                      Market{" "}
                      {processedOrderbook.bids[0].price > processedOrderbook.asks[0].price ? "Bullish" : "Bearish"}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Bids (Buy Orders) */}
              <div>
                <div className="mb-2 text-sm font-medium text-green-400">Bids (Buy Orders)</div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700">
                      <th className="pb-2 font-medium">Price</th>
                      <th className="pb-2 font-medium text-right">Size</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedOrderbook.bids.map((bid, index) => (
                      <tr key={index} className="border-b border-gray-800/30 relative">
                        {/* Background bar for visualization */}
                        <td colSpan={3} className="absolute inset-0 z-0">
                          <div
                            className="h-full bg-green-900/20"
                            style={{
                              width: `${(bid.total / maxTotal) * 100}%`,
                              maxWidth: "100%",
                            }}
                          ></div>
                        </td>
                        <td className="py-1 text-green-400 relative z-10">{formatPrice(bid.price)}</td>
                        <td className="py-1 text-right text-gray-300 relative z-10">{formatSize(bid.size)}</td>
                        <td className="py-1 text-right text-gray-300 relative z-10">{formatTotal(bid.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Asks (Sell Orders) */}
              <div>
                <div className="mb-2 text-sm font-medium text-red-400">Asks (Sell Orders)</div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-gray-700">
                      <th className="pb-2 font-medium">Price</th>
                      <th className="pb-2 font-medium text-right">Size</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedOrderbook.asks.map((ask, index) => (
                      <tr key={index} className="border-b border-gray-800/30 relative">
                        {/* Background bar for visualization */}
                        <td colSpan={3} className="absolute inset-0 z-0">
                          <div
                            className="h-full bg-red-900/20"
                            style={{
                              width: `${(ask.total / maxTotal) * 100}%`,
                              maxWidth: "100%",
                            }}
                          ></div>
                        </td>
                        <td className="py-1 text-red-400 relative z-10">{formatPrice(ask.price)}</td>
                        <td className="py-1 text-right text-gray-300 relative z-10">{formatSize(ask.size)}</td>
                        <td className="py-1 text-right text-gray-300 relative z-10">{formatTotal(ask.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Depth Visualization */}
            <div className="mt-6">
              <div className="mb-2 text-sm font-medium text-gray-200">Market Depth</div>
              <div className="h-[200px] bg-gray-800/30 rounded-md p-4 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-400 text-sm">
                    {processedOrderbook.bids.length > 0 && processedOrderbook.asks.length > 0 ? (
                      <div className="flex flex-col items-center">
                        <div className="text-green-400 mb-1">
                          Highest Bid: {formatPrice(processedOrderbook.bids[0].price)}
                        </div>
                        <div className="text-gray-300 mb-1">
                          Spread: {formatPrice(processedOrderbook.spread.absolute)}
                        </div>
                        <div className="text-red-400">Lowest Ask: {formatPrice(processedOrderbook.asks[0].price)}</div>
                      </div>
                    ) : (
                      "Market depth visualization would be displayed here"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
