"use client"

import { useState, useEffect } from "react"
import type { BigNumber } from "ethers"
import { balanceOf, usdcBalance, formatBigNumber } from "@/lib/utils/indexInteractions"
import { useWeb3 } from "@/components/web3-provider"

export function useTokenBalance(indexContractAddress: string) {
  const { walletAddress, isWalletConnected } = useWeb3()
  const [indexBalance, setIndexBalance] = useState<BigNumber | null>(null)
  const [usdcBalanceValue, setUsdcBalanceValue] = useState<BigNumber | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch balances when wallet is connected or address changes
  useEffect(() => {
    async function fetchBalances() {
      if (!isWalletConnected || !walletAddress || !indexContractAddress) {
        setIndexBalance(null)
        setUsdcBalanceValue(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch both balances in parallel
        const [indexBal, usdcBal] = await Promise.all([
          balanceOf(indexContractAddress, walletAddress),
          usdcBalance(walletAddress),
        ])

        setIndexBalance(indexBal)
        setUsdcBalanceValue(usdcBal)
      } catch (err) {
        console.error("Error fetching token balances:", err)
        setError("Failed to load balances. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()

    // Set up polling for balance updates (every 15 seconds)
    const intervalId = setInterval(fetchBalances, 15000)
    return () => clearInterval(intervalId)
  }, [walletAddress, isWalletConnected, indexContractAddress])

  // Format balances for display
  const formattedIndexBalance = indexBalance ? formatBigNumber(indexBalance, 18, 4) : "0"
  const formattedUsdcBalance = usdcBalanceValue ? formatBigNumber(usdcBalanceValue, 6, 2) : "0"

  // Function to manually refresh balances
  const refreshBalances = async () => {
    if (!isWalletConnected || !walletAddress) return

    setIsLoading(true)
    setError(null)

    try {
      console.log(`Refreshing balances for wallet ${walletAddress} and index ${indexContractAddress}...`)

      const [indexBal, usdcBal] = await Promise.all([
        balanceOf(indexContractAddress, walletAddress),
        usdcBalance(walletAddress),
      ])

      console.log(`Retrieved index balance: ${indexBal.toString()} (18 decimals)`)
      console.log(`Retrieved USDC balance: ${usdcBal.toString()} (6 decimals)`)

      setIndexBalance(indexBal)
      setUsdcBalanceValue(usdcBal)
    } catch (err) {
      console.error("Error refreshing balances:", err)
      setError("Failed to refresh balances")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    indexBalance,
    usdcBalanceValue,
    formattedIndexBalance,
    formattedUsdcBalance,
    isLoading,
    error,
    refreshBalances,
  }
}
