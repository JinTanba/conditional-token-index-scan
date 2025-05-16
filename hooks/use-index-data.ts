"use client"

import { useState, useEffect } from "react"
import polynanceService, { type Index } from "@/lib/polynance-sdk"

/**
 * Hook to fetch and manage index data
 * @param indexId The ID of the index to fetch data for
 * @returns An object containing the index data, loading state, and error state
 */
export function useIndexData(indexId: string) {
  const [index, setIndex] = useState<Index | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIndexData() {
      setLoading(true)
      setError(null)

      try {
        const data = await polynanceService.getIndexWithData(indexId)
        setIndex(data)
      } catch (err) {
        console.error("Error fetching index data:", err)
        setError(`Failed to load index data: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchIndexData()
  }, [indexId])

  return { index, loading, error }
}

/**
 * Hook to fetch and manage all indexes with basic data
 * @returns An object containing the indexes data, loading state, and error state
 */
export function useAllIndexes() {
  const [indexes, setIndexes] = useState<Index[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIndexes() {
      setLoading(true)
      setError(null)

      try {
        const data = await polynanceService.getAllIndexesWithBasicData()
        setIndexes(data)
      } catch (err) {
        console.error("Error fetching indexes:", err)
        setError(`Failed to load indexes: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchIndexes()
  }, [])

  return { indexes, loading, error }
}
