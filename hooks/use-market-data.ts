"use client"

import { useState, useEffect } from "react"
import polynanceService, { type Market, type TradeRecord, type OrderBookSummary } from "@/lib/polynance-sdk"
import type { PredictionProvider } from "polynance_sdk"

/**
 * Hook to fetch and manage market data
 * @param provider The prediction provider
 * @param marketId The ID of the market to fetch data for
 * @returns An object containing the market data, loading state, and error state
 */
export function useMarketData(provider: PredictionProvider, marketId: string) {
  const [market, setMarket] = useState<Market | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMarketData() {
      setLoading(true)
      setError(null)

      try {
        const data = await polynanceService.getMarket(provider, marketId)
        setMarket(data)
      } catch (err) {
        console.error("Error fetching market data:", err)
        setError(`Failed to load market data: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
  }, [provider, marketId])

  return { market, loading, error }
}

/**
 * Hook to fetch and manage market price history
 * @param provider The prediction provider
 * @param marketId The ID of the market to fetch price history for
 * @returns An object containing the price history data, loading state, and error state
 */
export function useMarketPriceHistory(provider: PredictionProvider, marketId: string) {
  const [priceHistory, setPriceHistory] = useState<TradeRecord[][] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPriceHistory() {
      setLoading(true)
      setError(null)

      try {
        const data = await polynanceService.getMarketPriceHistory(provider, marketId)
        setPriceHistory(data)
      } catch (err) {
        console.error("Error fetching price history:", err)
        setError(`Failed to load price history: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchPriceHistory()
  }, [provider, marketId])

  return { priceHistory, loading, error }
}

/**
 * Hook to fetch and manage market orderbook
 * @param provider The prediction provider
 * @param marketId The ID of the market to fetch orderbook for
 * @returns An object containing the orderbook data, loading state, and error state
 */
export function useMarketOrderbook(provider: PredictionProvider, marketId: string) {
  const [orderbook, setOrderbook] = useState<Record<string, OrderBookSummary> | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrderbook() {
      setLoading(true)
      setError(null)

      try {
        const data = await polynanceService.getMarketOrderbook(provider, marketId)
        setOrderbook(data)
      } catch (err) {
        console.error("Error fetching orderbook:", err)
        setError(`Failed to load orderbook: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderbook()
  }, [provider, marketId])

  return { orderbook, loading, error }
}
