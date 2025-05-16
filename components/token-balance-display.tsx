"use client"

import { RefreshCw, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface TokenBalanceDisplayProps {
  indexBalance: string
  usdcBalance: string
  isLoading: boolean
  onRefresh: () => void
  indexSymbol?: string
}

export function TokenBalanceDisplay({
  indexBalance,
  usdcBalance,
  isLoading,
  onRefresh,
  indexSymbol = "INDEX",
}: TokenBalanceDisplayProps) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-3 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs text-gray-400 flex items-center">
          <Wallet className="h-3 w-3 mr-1" />
          Your Balances
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh balances"
        >
          <RefreshCw className={`h-3 w-3 text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-[10px] text-gray-400">USDC Balance</div>
          {isLoading ? (
            <Skeleton className="h-5 w-20 mt-1" />
          ) : (
            <div className="text-sm font-medium text-gray-200">${usdcBalance}</div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded p-2">
          <div className="text-[10px] text-gray-400">{indexSymbol} Balance</div>
          {isLoading ? (
            <Skeleton className="h-5 w-20 mt-1" />
          ) : (
            <div className="text-sm font-medium text-blue-300">{indexBalance}</div>
          )}
        </div>
      </div>
    </div>
  )
}
