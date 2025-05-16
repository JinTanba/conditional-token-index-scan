"use client"
import { useEffect, useState } from "react"
import { type Index, getIndexPriceHistory, getIndexOrderbook, generateCandleData } from "@/lib/polynance-sdk"
import { MarketIndexDetails } from "./market-index-details"
import { PriceHistoryChart } from "./price-history-chart"
import { OrderbookDisplay } from "./orderbook-display"
import { MarketTable } from "./market-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export function MarketDescription({ index, categoryColors }: { index: Index; categoryColors: Record<string, string> }) {
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [orderbook, setOrderbook] = useState<any>({})
  const [candleData, setCandleData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  // Process data when index changes
  useEffect(() => {
    const processData = () => {
      setLoading(true)
      try {
        // Get price history
        const history = getIndexPriceHistory(index)
        setPriceHistory(history)

        // Generate candle data
        const candles = generateCandleData(history)
        setCandleData(candles)

        // Get orderbook
        const book = getIndexOrderbook(index)
        setOrderbook(book)
      } catch (error) {
        console.error("Error processing index data:", error)
      } finally {
        setLoading(false)
      }
    }

    processData()
  }, [index])

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <>
          {/* Index Overview */}
          <MarketIndexDetails index={index} categoryColors={categoryColors} />

          {/* Tabs for different views */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="markets">Markets</TabsTrigger>
              <TabsTrigger value="price">Price History</TabsTrigger>
              <TabsTrigger value="orderbook">Orderbook</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PriceHistoryChart priceHistory={priceHistory} candleData={candleData} />
                <OrderbookDisplay orderbook={orderbook} />
              </div>
            </TabsContent>

            <TabsContent value="markets" className="mt-6">
              <MarketTable index={index} categoryColors={categoryColors} />
            </TabsContent>

            <TabsContent value="price" className="mt-6">
              <PriceHistoryChart priceHistory={priceHistory} candleData={candleData} />
            </TabsContent>

            <TabsContent value="orderbook" className="mt-6">
              <OrderbookDisplay orderbook={orderbook} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
