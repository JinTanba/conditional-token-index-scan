"use client"

import { CardContent } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { MarketDescription } from "./market-description"
import { useWeb3 } from "./web3-provider"
import { useAllIndexes } from "@/hooks/use-index-data"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ChevronRight } from "lucide-react"
import { NetworkWarning } from "./network-warning"
import type { Index } from "@/lib/polynance-sdk"

// Category colors for the market segments
export const categoryColors: Record<string, string> = {
  Tech: "bg-blue-600",
  Crypto: "bg-purple-600",
  Finance: "bg-green-600",
  AI: "bg-indigo-600",
  Climate: "bg-teal-600",
  Entertainment: "bg-pink-600",
  Health: "bg-red-600",
  Space: "bg-cyan-600",
  Transport: "bg-amber-600",
  Geopolitics: "bg-orange-600",
  Energy: "bg-yellow-600",
  Sports: "bg-rose-600",
  Politics: "bg-violet-600",
  General: "bg-gray-600",
  Unknown: "bg-gray-500",
}

export function BlocksRow() {
  const [selectedIndex, setSelectedIndex] = useState<Index | null>(null)
  const { indexes, loading, error } = useAllIndexes()
  const { walletAddress } = useWeb3()

  const handleIndexClick = (index: Index) => {
    // Toggle selection if clicking the same index
    if (selectedIndex?.id === index.id) {
      setSelectedIndex(null)
    } else {
      setSelectedIndex(index)
    }
  }

  // Separate active and expired indexes
  const activeIndexes = indexes.filter((index) => !index.expired)
  const expiredIndexes = indexes.filter((index) => index.expired)

  return (
    <div className="space-y-8">
      {/* Main section title */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-100">Market Indices</h2>
        <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      <div className="scrollable-container pb-4 pt-6">
        {loading ? (
          // Loading skeleton with enhanced size
          <div className="flex space-x-6 pb-2 relative">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="block-card flex flex-col items-center justify-between p-4 rounded-lg luxury-gradient-mempool"
              >
                <Skeleton className="w-full h-5 mb-3" />
                <Skeleton className="w-3/4 h-10 mb-3" />
                <div className="w-full flex justify-between">
                  <Skeleton className="w-1/2 h-5" />
                  <Skeleton className="w-1/3 h-5" />
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          // Error message
          <div className="text-red-400 p-4 bg-red-900/20 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : (
          // Enhanced index blocks with increased spacing
          <div className="flex space-x-6 pb-2 relative">
            {/* Active Markets */}
            {activeIndexes.map((index, idx) => (
              <IndexBlock
                key={index.id}
                index={index}
                isSelected={selectedIndex?.id === index.id}
                onClick={() => handleIndexClick(index)}
                gradientIndex={(idx % 4) + 1}
              />
            ))}

            {/* Divider between active and expired */}
            {activeIndexes.length > 0 && expiredIndexes.length > 0 && (
              <div className="border-r border-dashed border-white/10 h-[150px] self-center mx-3"></div>
            )}

            {/* Expired Markets */}
            {expiredIndexes.map((index) => (
              <IndexBlock
                key={index.id}
                index={index}
                isSelected={selectedIndex?.id === index.id}
                onClick={() => handleIndexClick(index)}
                isExpired
              />
            ))}
          </div>
        )}
      </div>

      {/* Index Details Section with enhanced grid layout */}
      {selectedIndex && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-9">
            <MarketDescription index={selectedIndex} categoryColors={categoryColors} />
          </div>
          <div className="lg:col-span-3">
            <BuyWidget index={selectedIndex} />
          </div>
        </div>
      )}
    </div>
  )
}

function IndexBlock({
  index,
  isSelected,
  onClick,
  isExpired = false,
  gradientIndex = 1,
}: {
  index: Index
  isSelected: boolean
  onClick: () => void
  isExpired?: boolean
  gradientIndex?: number
}) {
  const gradientClass = isExpired ? "luxury-gradient-block" : `luxury-gradient-mempool-${gradientIndex}`

  // Determine if price change is positive or negative
  const isPriceChangePositive = index.priceChange24h?.startsWith("+")

  // Get shortened name for display
  const shortName = index.name.split(" ").slice(0, 2).join(" ")

  // Get market icons
  const marketIcons = index.markets?.slice(0, 4).map((m) => m.icon) || []

  return (
    <Card
      className={`block-card flex flex-col justify-between p-4 rounded-xl ${gradientClass} transition-all hover:scale-102 cursor-pointer ${isSelected ? "luxury-highlight ring-2 ring-blue-500" : ""} luxury-shadow group relative`}
      onClick={onClick}
    >
      {/* Settlement date tooltip on hover */}
      <div className="absolute top-0 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-10 text-center z-20">
        <div className="bg-gray-800 text-gray-200 text-xs py-2 px-3 rounded-lg inline-block shadow-lg">
          Settlement: {index.settlementDate}
        </div>
      </div>

      {/* Top section with status */}
      <div className="index-box-top">
        <div className="text-left">
          {isExpired ? (
            <div className="bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full inline-block shadow-sm">
              Expired
            </div>
          ) : (
            <div className="bg-blue-500/20 text-blue-300 text-xs font-medium px-3 py-1 rounded-full inline-block">
              {index.daysRemaining} days left
            </div>
          )}
        </div>
      </div>

      {/* Middle section with title and yield */}
      <div className="index-box-middle space-y-3">
        {/* Title section */}
        <h3 className="index-box-title text-gray-100" title={index.name}>
          {shortName}
        </h3>

        {/* Market icons */}
        <div className="flex -space-x-2 overflow-hidden mb-2">
          {index.markets &&
            index.markets.slice(0, 4).map((market, i) =>
              market.icon ? (
                <img
                  key={i}
                  src={market.icon || `/placeholder.svg?height=24&width=24&query=market`}
                  alt={`Market ${i + 1}`}
                  className="inline-block h-6 w-6 rounded-full ring-1 ring-gray-800 bg-gray-700"
                />
              ) : (
                <div
                  key={i}
                  className="inline-block h-6 w-6 rounded-full ring-1 ring-gray-800 bg-blue-900/30 flex items-center justify-center text-[8px] text-blue-300"
                >
                  {market.name?.substring(0, 2) || `M${i}`}
                </div>
              ),
            )}
        </div>

        {/* Yield section with enhanced typography */}
        <div className="w-full text-center bg-gray-800/30 py-2 px-2 rounded-lg">
          {isExpired ? (
            // For expired markets, show confirmed yield
            <div className="font-medium text-gray-200">
              <span className="text-green-400 yield-display">+{index.confilmYield}%</span>
            </div>
          ) : (
            // For active markets, show yield range
            <div className="font-medium text-gray-200">
              <span className="text-xs text-red-400">{index.yieldLoss}</span>
              <span className="text-xs text-gray-400"> ~ </span>
              <span className="text-green-400 yield-display">{index.yieldRange}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom stats section */}
      <div className="index-box-bottom flex justify-between items-end">
        <div className="text-left">
          <div className="text-xs text-gray-400">Price</div>
          <div className="index-box-value font-mono font-medium text-gray-200">${index.avgPrice.toFixed(2)}</div>
        </div>
        {!isExpired && (
          <div className="text-right">
            <div className="text-xs text-gray-400">24h</div>
            <div className={`index-box-value font-medium ${isPriceChangePositive ? "text-green-400" : "text-red-400"}`}>
              {index.priceChange24h}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// Import necessary components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardHeader } from "@/components/ui/card"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useContractTransaction } from "@/hooks/use-contract-transaction"
import { TokenBalanceDisplay } from "./token-balance-display"
import { TransactionStatus } from "./transaction-status"

// Buy Widget component
function BuyWidget({ index }: { index: Index }) {
  const [amount, setAmount] = useState("")
  const { isWalletConnected, connectWallet, isCorrectChain } = useWeb3()
  const [activeTab, setActiveTab] = useState("supply")

  // Get the contract address from the index
  const contractAddress = index.contractAddress

  // Use our custom hooks for token balances and transactions
  const { formattedIndexBalance, formattedUsdcBalance, refreshBalances } = useTokenBalance(contractAddress)
  const { status, error, txHash, supplyTokens, withdrawTokens, resetTransaction } = useContractTransaction()

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setAmount(value)
    }
  }

  const handleMaxClick = () => {
    // Set max based on the active tab
    if (activeTab === "supply") {
      setAmount(formattedUsdcBalance)
    } else {
      setAmount(formattedIndexBalance)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isWalletConnected) {
      connectWallet()
      return
    }

    if (!isCorrectChain) {
      return // Network warning will be shown
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      return
    }

    const amountValue = Number.parseFloat(amount)

    try {
      let success = false

      if (activeTab === "supply") {
        success = await supplyTokens(contractAddress, amountValue)
      } else {
        success = await withdrawTokens(contractAddress, amountValue)
      }

      if (success) {
        // Clear the input on success
        setAmount("")
        // Refresh balances after a short delay to allow the blockchain to update
        setTimeout(refreshBalances, 2000)
      }
    } catch (err) {
      console.error("Transaction error:", err)
    }
  }

  // Get index symbol for display
  const indexSymbol = index.name.split(" ")[0]

  return (
    <Card className="luxury-bg-card border-0 luxury-shadow overflow-hidden sticky top-6">
      <CardHeader className="pb-3 border-b border-gray-700/50">
        <CardTitle className="text-lg font-bold text-gray-100">Trade {indexSymbol}</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {/* Add NetworkWarning component here */}
        <NetworkWarning />

        {/* Display token balances if wallet is connected */}
        {isWalletConnected && (
          <TokenBalanceDisplay
            indexBalance={formattedIndexBalance}
            usdcBalance={formattedUsdcBalance}
            isLoading={false}
            onRefresh={refreshBalances}
            indexSymbol={indexSymbol}
          />
        )}

        <Tabs defaultValue="supply" className="w-full mt-4" onValueChange={setActiveTab}>
          <TabsList className="enhanced-tabs grid grid-cols-2 mb-6 w-full">
            <TabsTrigger value="supply" className="enhanced-tabs-trigger">
              Supply
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="enhanced-tabs-trigger">
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supply" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="amount" className="text-sm text-gray-300 font-medium">
                    Amount
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={status === "approving" || status === "pending"}
                  >
                    Max
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="pr-16 h-12 bg-gray-800/30 border-gray-700 focus:border-blue-500 transition-all text-lg"
                    disabled={status === "approving" || status === "pending"}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">USDC</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/20 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Expected Yield</span>
                  <span className="text-green-400 font-medium">{index.yieldRange || `+${index.confilmYield}%`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Settlement Date</span>
                  <span className="text-gray-300">{index.settlementDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Price</span>
                  <span className="text-gray-300">${index.avgPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm pt-1 border-t border-gray-700/30">
                  <span className="text-gray-300">You Will Receive</span>
                  <span className="text-blue-300 font-medium">
                    {amount && !isNaN(Number(amount))
                      ? `${(Number(amount) / index.avgPrice).toFixed(4)} ${indexSymbol}`
                      : `0.0000 ${indexSymbol}`}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20"
                disabled={status === "approving" || status === "pending"}
              >
                {!isWalletConnected
                  ? "Connect Wallet"
                  : status === "approving" || status === "pending"
                    ? "Processing..."
                    : !isCorrectChain
                      ? "Switch Network"
                      : "Supply USDC"}
              </Button>

              {/* Display transaction status */}
              <TransactionStatus status={status} error={error} txHash={txHash} onDismiss={resetTransaction} />
            </form>
          </TabsContent>

          <TabsContent value="withdraw" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="withdraw-amount" className="text-sm text-gray-300 font-medium">
                    Amount
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={status === "approving" || status === "pending"}
                  >
                    Max
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="withdraw-amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="pr-16 h-12 bg-gray-800/30 border-gray-700 focus:border-blue-500 transition-all text-lg"
                    disabled={status === "approving" || status === "pending"}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">{indexSymbol}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/20 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Position</span>
                  <span className="text-gray-300">
                    {formattedIndexBalance} {indexSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current PnL</span>
                  <span className="text-green-400 font-medium">+3.2%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Market Price</span>
                  <span className="text-gray-300">${index.avgPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm pt-1 border-t border-gray-700/30">
                  <span className="text-gray-300">You Will Receive</span>
                  <span className="text-blue-300 font-medium">
                    {amount && !isNaN(Number(amount))
                      ? `$${(Number(amount) * index.avgPrice).toFixed(2)} USDC`
                      : `$0.00 USDC`}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20"
                disabled={status === "approving" || status === "pending"}
              >
                {!isWalletConnected
                  ? "Connect Wallet"
                  : status === "approving" || status === "pending"
                    ? "Processing..."
                    : !isCorrectChain
                      ? "Switch Network"
                      : "Withdraw"}
              </Button>

              {/* Display transaction status */}
              <TransactionStatus status={status} error={error} txHash={txHash} onDismiss={resetTransaction} />
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
