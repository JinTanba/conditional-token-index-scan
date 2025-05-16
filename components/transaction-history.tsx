"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react"
import { useWeb3 } from "./web3-provider"

interface Transaction {
  id: string
  type: "supply" | "withdraw"
  amount: string
  timestamp: number
  hash: string
  status: "confirmed" | "pending" | "failed"
}

export function TransactionHistory({ contractAddress }: { contractAddress: string }) {
  const { walletAddress, isWalletConnected } = useWeb3()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // In a real app, we would fetch transaction history from a backend or blockchain explorer API
  // For this demo, we'll use mock data
  useEffect(() => {
    if (!isWalletConnected || !walletAddress) {
      setTransactions([])
      return
    }

    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Generate mock transaction history
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          type: "supply",
          amount: "100.00",
          timestamp: Date.now() - 3600000, // 1 hour ago
          hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          status: "confirmed",
        },
        {
          id: "2",
          type: "withdraw",
          amount: "50.00",
          timestamp: Date.now() - 86400000, // 1 day ago
          hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          status: "confirmed",
        },
        {
          id: "3",
          type: "supply",
          amount: "200.00",
          timestamp: Date.now() - 172800000, // 2 days ago
          hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
          status: "confirmed",
        },
      ]

      setTransactions(mockTransactions)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [walletAddress, isWalletConnected, contractAddress])

  // Format timestamp to relative time
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // Get PolygonScan URL for transaction
  const getPolygonScanUrl = (hash: string) => {
    return `https://polygonscan.com/tx/${hash}`
  }

  if (!isWalletConnected) {
    return null
  }

  return (
    <Card className="luxury-bg-card border-0 luxury-shadow mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-100 flex items-center">
          <Clock className="h-4 w-4 mr-2 text-blue-400" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-gray-400 text-sm">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">No transactions found</div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all"
              >
                <div className="flex items-center">
                  {tx.type === "supply" ? (
                    <div className="h-8 w-8 rounded-full bg-green-900/30 flex items-center justify-center mr-3">
                      <ArrowUpRight className="h-4 w-4 text-green-400" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-900/30 flex items-center justify-center mr-3">
                      <ArrowDownLeft className="h-4 w-4 text-blue-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-200">
                      {tx.type === "supply" ? "Supply" : "Withdraw"}
                    </div>
                    <div className="text-xs text-gray-400">{formatTimeAgo(tx.timestamp)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-200">${tx.amount} USDC</div>
                  <a
                    href={getPolygonScanUrl(tx.hash)}
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
      </CardContent>
    </Card>
  )
}
