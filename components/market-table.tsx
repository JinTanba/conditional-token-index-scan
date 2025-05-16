"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Clock, ExternalLink, ArrowUp, ArrowDown, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { PolynanceSDK } from "polynance_sdk"
import type { Index } from "@/lib/polynance-sdk"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MarketTableProps {
  index: Index
  categoryColors: Record<string, string>
}

export function MarketTable({ index, categoryColors }: MarketTableProps) {
  const [markets, setMarkets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch market data directly using SDK
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true)
      try {
        const sdk = new PolynanceSDK()

        // Fetch detailed data for each market in the index
        const marketPromises = index.makrtesIds.map(async (marketId, i) => {
          try {
            // Get market details
            const market = await sdk.getExchange("polymarket", marketId)

            // Get price history
            const priceHistory = await sdk.getPriceHistory("polymarket", marketId)

            // Get orderbook
            const orderbook = await sdk.getOrderbook("polymarket", marketId)

            // Determine position name based on the index definition
            const positionName = index.positionNames[i] === 1 ? "YES" : "NO"

            // Find the position token with the matching name
            const position = market.position_tokens.find((pos) => pos.name.toLowerCase() === positionName.toLowerCase())

            // Calculate price and volume
            const price = Number(position?.price) || 0

            // Calculate market volume from price history
            let marketVolume = 0
            if (priceHistory && priceHistory.length > 0 && priceHistory[0].length > 0) {
              marketVolume = priceHistory[0].reduce((sum, trade) => sum + trade.volumeBase, 0)
            }

            // Calculate remaining hours
            const remainingHours = calculateRemainingHours(market.end)

            // Get recent trades
            const recentTrades = priceHistory && priceHistory.length > 0 ? priceHistory[0].slice(-10).reverse() : []

            return {
              id: marketId,
              name: market.name,
              proportion: 1 / index.makrtesIds.length,
              price: price,
              // Adjust displayed price to be slightly lower than actual price (for avg calculation)
              displayPrice: price * 0.98,
              category: market.groupItemTitle || "General",
              remainingHours,
              icon: market.icon,
              priceHistory,
              orderbook,
              volume: marketVolume,
              end: market.end,
              position: positionName,
              recentTrades,
              description: market.description || "",
              groupName: market.groupItemTitle || "",
              tags:  [],
            }
          } catch (error) {
            console.error(`Error fetching market ${marketId}:`, error)
            return {
              id: marketId,
              name: `Market ${marketId}`,
              proportion: 1 / index.makrtesIds.length,
              price: 0,
              displayPrice: 0,
              category: "Unknown",
              remainingHours: 0,
              icon: "",
              priceHistory: [],
              orderbook: {},
              volume: 0,
              end: new Date().toISOString(),
              position: index.positionNames[i] === 1 ? "YES" : "NO",
              recentTrades: [],
            }
          }
        })

        const marketData = await Promise.all(marketPromises)

        // First sort by proportion
        const initialSorted = [...marketData].sort((a, b) => b.proportion - a.proportion)
        setMarkets(initialSorted)
      } catch (error) {
        console.error("Error fetching market data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (index && index.makrtesIds.length > 0) {
      fetchMarketData()
    } else {
      setLoading(false)
    }
  }, [index])

  // Format remaining time
  const formatRemainingTime = (hours: number) => {
    if (index.expired) return "Expired"

    if (hours === 0) return "Expired"

    if (hours < 1) {
      // For less than 1 hour, calculate minutes and seconds
      const totalSeconds = hours * 3600
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = Math.floor(totalSeconds % 60) - (currentTime.getSeconds() % 60)

      // Adjust for negative seconds
      const adjustedSeconds = seconds < 0 ? 60 + seconds : seconds
      const adjustedMinutes = seconds < 0 ? minutes - 1 : minutes

      return `${adjustedMinutes}m ${adjustedSeconds}s`
    } else if (hours < 24) {
      // For less than 24 hours, show hours
      return `${Math.floor(hours)} hours`
    } else {
      // For 24+ hours, show days
      return `${Math.floor(hours / 24)} days`
    }
  }

  // Open external link
  const openExternalLink = (marketId: string) => {
    window.open(`https://polymarket.com/market/${marketId}`, "_blank", "noopener,noreferrer")
  }

  // Format volume
  const formatVolume = (volume: number) => {
    return volume > 1000000
      ? `$${(volume / 1000000).toFixed(2)}M`
      : volume > 1000
        ? `$${(volume / 1000).toFixed(2)}K`
        : `$${volume.toFixed(2)}`
  }

  // Handle sort
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Sort markets
  const sortedMarkets = React.useMemo(() => {
    let sortableMarkets = [...markets]
    if (searchTerm) {
      sortableMarkets = sortableMarkets.filter(
        (market) =>
          market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          market.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (sortConfig !== null) {
      sortableMarkets.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }
    return sortableMarkets
  }, [markets, sortConfig, searchTerm])

  // Render sort indicator
  const SortIndicator = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig?.key !== columnKey) {
      return null
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUp className="h-3 w-3 ml-1 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 inline" />
    )
  }

  return (
    <div className="market-table-container">
      {/* Enhanced table header with search */}
      <div className="market-table-header">
        <h3 className="text-lg font-medium text-gray-100">Markets in This Index</h3>
        <div className="flex items-center">
          <div className="relative">
            <Input
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-9 bg-gray-800/50 border-gray-700"
            />
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          // Loading skeleton
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <table className="market-table w-full">
            <thead>
              <tr>
                <th onClick={() => requestSort("name")} className="cursor-pointer hover:bg-gray-800/50">
                  Market <SortIndicator columnKey="name" />
                </th>
                <th onClick={() => requestSort("position")} className="cursor-pointer hover:bg-gray-800/50">
                  Position <SortIndicator columnKey="position" />
                </th>
                <th onClick={() => requestSort("category")} className="cursor-pointer hover:bg-gray-800/50">
                  Category <SortIndicator columnKey="category" />
                </th>
                <th onClick={() => requestSort("volume")} className="text-right cursor-pointer hover:bg-gray-800/50">
                  Volume <SortIndicator columnKey="volume" />
                </th>
                <th
                  onClick={() => requestSort("proportion")}
                  className="text-right cursor-pointer hover:bg-gray-800/50"
                >
                  Weight <SortIndicator columnKey="proportion" />
                </th>
                <th
                  onClick={() => requestSort("displayPrice")}
                  className="text-right cursor-pointer hover:bg-gray-800/50"
                >
                  Price <SortIndicator columnKey="displayPrice" />
                </th>
                <th
                  onClick={() => requestSort("remainingHours")}
                  className="text-right cursor-pointer hover:bg-gray-800/50"
                >
                  Time <SortIndicator columnKey="remainingHours" />
                </th>
                <th className="text-right">Status</th>
                <th className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {sortedMarkets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-gray-400">
                    {searchTerm ? "No markets match your search" : "No markets available"}
                  </td>
                </tr>
              ) : (
                sortedMarkets.map((market: any) => (
                  <tr key={market.id} className="hover:bg-gray-800/30">
                    <td className="max-w-[250px]">
                      <div className="truncate font-medium" title={market.name}>
                        {market.name}
                      </div>
                    </td>
                    <td className="font-medium">{market.position}</td>
                    <td>
                      <span className={`category-tag ${categoryColors[market.category] || "bg-gray-600"}`}>
                        {market.category}
                      </span>
                    </td>
                    <td className="text-right font-mono">
                      {formatVolume(market.volume || market.price * market.proportion * 10)}
                    </td>
                    <td className="text-right font-mono font-medium">{(market.proportion * 100).toFixed(0)}%</td>
                    <td className="text-right font-mono font-medium">${market.displayPrice.toFixed(2)}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end">
                        <Clock className="h-3 w-3 text-blue-400 mr-1" />
                        <span className="font-mono">{formatRemainingTime(market.remainingHours || 0)}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          index.expired ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {index.expired ? "Settled" : "Active"}
                      </span>
                    </td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openExternalLink(market.id)}
                        className="h-8 w-8 p-0"
                        title="View on Polymarket"
                      >
                        <ExternalLink size={16} className="text-gray-400 hover:text-blue-400" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// Calculate remaining hours from an ISO date string
function calculateRemainingHours(endDateStr: string): number {
  try {
    const endDate = new Date(endDateStr)
    const now = new Date()
    const diffMs = endDate.getTime() - now.getTime()
    return Math.max(0, diffMs / (1000 * 60 * 60)) // Convert ms to hours
  } catch (error) {
    console.error("Error calculating remaining hours:", error)
    return 0
  }
}
