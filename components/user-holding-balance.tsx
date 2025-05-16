"use client"

import { useState, useEffect } from "react"
import { useWeb3 } from "./web3-provider"
import { Wallet, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CompositeTokenIcon } from "./composite-token-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { formatBigNumber, getIndexContract } from "@/lib/utils/indexInteractions"
import type { Index } from "@/lib/polynance-sdk"
import { useAllIndexes } from "@/hooks/use-index-data"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { ethers } from "ethers"

export function UserHoldingsDisplay() {
  const { isWalletConnected, walletAddress, connectWallet } = useWeb3()
  const [isExpanded, setIsExpanded] = useState(false)
  const { indexes } = useAllIndexes();
  const idxaddress = indexes.map((index) => index.contractAddress);
  const [userHoldings, setUserHoldings] = useState<
    {
      index: Index
      balance: string
      formattedBalance: string
      usdValue: string
    }[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [tokenBalances, setTokenBalances] = useState<{
    [contractAddress: string]: { indexBalance: string; formattedIndexBalance: string }
  }>({})
  

  // Fetch token balances using the hook
  // const fetchTokenBalance = useCallback(
  //   (contractAddress: string) => {
  //     const { indexBalance, formattedIndexBalance } = useTokenBalance(contractAddress);
  //     return { indexBalance, formattedIndexBalance };
  //   },
  //   []
  // );

  // Add this function at the top level of the component
  const fetchTokenBalance = async (contractAddress: string) => {
    const index = getIndexContract(contractAddress)
    const balance = await index.balanceOf(walletAddress)
    return ethers.utils.formatUnits(balance)
  }

  // Fetch balances for all indexes
  useEffect(() => {
    if (!isWalletConnected || !walletAddress || indexes.length === 0) {
      setUserHoldings([])
      return
    }

    const fetchAllBalances = async () => {
      setIsLoading(true)
      try {
        // Create a temporary object to store token balances
        const balances: {
          [contractAddress: string]: { indexBalance: string; formattedIndexBalance: string }
        } = {}

        // First, fetch all token balances and store them
        for (const index of indexes) {
          try {
            const userWalletAddress = walletAddress
            const formattedIndexBalance = await fetchTokenBalance(index.contractAddress)
            if(formattedIndexBalance){
                balances[index.contractAddress] = {indexBalance: formattedIndexBalance, formattedIndexBalance}
            }
          } catch (error) {
            console.error(`Error fetching balance for ${index.name}:`, error)
          }
        }

        // Then, process the holdings using the fetched balances
        const holdings = indexes.map((index) => {
          const balance = balances[index.contractAddress]

          // Calculate USD value (price * balance)
          const usdValue = balance?.indexBalance
            ? `$${(Number(balance.indexBalance) * index.avgPrice).toFixed(2)}`
            : "$0.00"

          return {
            index,
            balance: balance?.indexBalance ? (balance.indexBalance) : "0",
            formattedBalance: balance?.formattedIndexBalance || "0",
            usdValue,
          }
        })

        // Filter out zero balances
        const nonZeroHoldings = holdings.filter((h) => h.balance !== "0" && h.balance !== "0.0")
        setUserHoldings(nonZeroHoldings)
      } catch (error) {
        console.error("Error fetching balances:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllBalances()
  }, [isWalletConnected, walletAddress, indexes])

  // If not connected, show connect button
  if (!isWalletConnected) {
    return (
      <Button
        onClick={connectWallet}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 h-10 rounded-full transition-all duration-200 flex items-center"
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  // If connected but no holdings
  if (userHoldings.length === 0 && !isLoading) {
    return (
      <div className="flex items-center bg-gray-800/50 px-4 py-2 rounded-full text-sm text-gray-300">
        <Wallet className="h-4 w-4 mr-2 text-blue-400" />
        <span>No index tokens</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center bg-gray-800/50 px-4 py-2 rounded-full text-sm text-gray-300 hover:bg-gray-800/80 transition-all ${isExpanded ? "ring-2 ring-blue-500" : ""}`}
      >
        <Wallet className="h-4 w-4 mr-2 text-blue-400" />
        <span className="mr-1">My Indices</span>
        {isLoading ? (
          <Skeleton className="h-4 w-8 ml-1" />
        ) : (
          <span className="font-medium text-white">{userHoldings.length}</span>
        )}
        {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
      </Button>

      {isExpanded && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-700 overflow-hidden">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-200">Your Index Holdings</h3>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setIsExpanded(false)}>
              <ChevronUp className="h-4 w-4 text-gray-400" />
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : userHoldings.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <p>You don't have any index tokens yet.</p>
                <p className="text-sm mt-2">Supply USDC to mint index tokens.</p>
              </div>
            ) : (
              <div className="p-2">
                {userHoldings.map((holding) => (
                  <div
                    key={holding.index.id}
                    className="p-3 hover:bg-gray-700/30 rounded-lg flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        <CompositeTokenIcon icons={holding.index.icons} size={40} name={holding.index.name} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-200">{holding.index.name.split(" ")[0]}</div>
                        <div className="text-xs text-gray-400">{holding.formattedBalance} tokens</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-200">{holding.usdValue}</div>
                      <a
                        href={`https://polygonscan.com/token/${holding.index.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-end"
                      >
                        View <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-700 bg-gray-800/50">
            <a
              href={`https://polygonscan.com/address/${walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center"
            >
              View all on PolygonScan <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
