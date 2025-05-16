"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Info, ExternalLink } from "lucide-react"
import type { Index } from "@/lib/polynance-sdk"

export function MarketIconsDisplay({ index }: { index: Index }) {
  const [marketIcons, setMarketIcons] = useState<{ id: string; name: string; icon: string }[]>([])

  useEffect(() => {
    if (index.markets && index.markets.length > 0) {
      // Extract market icons and names
      const icons = index.markets.map((market) => ({
        id: market.id,
        name: market.name,
        icon: market.icon || `/placeholder.svg?height=40&width=40&query=market icon for ${market.name}`,
      }))
      setMarketIcons(icons)
    }
  }, [index])

  // Open market details on Polymarket
  const openMarketDetails = (marketId: string) => {
    window.open(`https://polymarket.com/market/${marketId}`, "_blank", "noopener,noreferrer")
  }

  return (
    <Card className="bg-gray-800/20 border-0 luxury-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-100">Markets in this Index</CardTitle>
        <Info size={16} className="text-gray-400" />
      </CardHeader>
      <CardContent>
        {marketIcons.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No market icons available</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketIcons.map((market) => (
              <div
                key={market.id}
                className="flex flex-col items-center p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all cursor-pointer group"
                onClick={() => openMarketDetails(market.id)}
              >
                <div className="relative">
                  <Avatar className="h-16 w-16 mb-2 border-2 border-transparent group-hover:border-blue-500 transition-all">
                    <AvatarImage src={market.icon || "/placeholder.svg"} alt={market.name} />
                    <AvatarFallback className="bg-blue-900/30 text-blue-300">
                      {market.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={12} className="text-white" />
                  </div>
                </div>
                <div className="text-xs text-center text-gray-300 line-clamp-2 h-10 overflow-hidden">{market.name}</div>
                <div className="text-[10px] text-blue-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View on Polymarket
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
