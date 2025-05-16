"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWeb3 } from "./web3-provider"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { useContractTransaction } from "@/hooks/use-contract-transaction"
import { TokenBalanceDisplay } from "./token-balance-display"
import { TransactionStatus } from "./transaction-status"
import { NetworkWarning } from "./network-warning"
import type { Index } from "@/lib/polynance-sdk"
import { Info, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function BuyWidget({ index }: { index: Index }) {
  const [amount, setAmount] = useState("")
  const { isWalletConnected, connectWallet, isCorrectChain } = useWeb3()
  const [activeTab, setActiveTab] = useState("supply")

  // Get the contract address from the index
  const contractAddress = index.contractAddress

  // Use our custom hooks
  const {
    formattedIndexBalance,
    formattedUsdcBalance,
    isLoading: balancesLoading,
    refreshBalances,
  } = useTokenBalance(contractAddress)

  const { status, error, txHash, supplyTokens, withdrawTokens, resetTransaction, isProcessing } =
    useContractTransaction()

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

  // Reset transaction status when changing tabs
  useEffect(() => {
    resetTransaction()
    setAmount("")
  }, [activeTab])

  // Get index symbol for display
  const indexSymbol = index.name.split(" ")[0]

  return (
    <Card className="luxury-bg-card border-0 luxury-shadow">
      <CardHeader className="pb-2 border-b border-gray-800">
        <CardTitle className="text-md font-medium text-gray-100 flex items-center justify-between">
          <span>Trade {indexSymbol}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Supply USDC to mint {indexSymbol} tokens or withdraw your {indexSymbol} tokens to redeem USDC.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Network Warning */}
        <NetworkWarning />

        {/* Balance Display - Show prominently at the top */}
        {isWalletConnected && (
          <TokenBalanceDisplay
            indexBalance={formattedIndexBalance}
            usdcBalance={formattedUsdcBalance}
            isLoading={balancesLoading}
            onRefresh={refreshBalances}
            indexSymbol={indexSymbol}
          />
        )}

        <Tabs defaultValue="supply" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4 rounded-full h-10 p-1 bg-gray-800/50 w-full">
            <TabsTrigger
              value="supply"
              className="rounded-full text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
            >
              Supply
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              className="rounded-full text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
            >
              Withdraw
            </TabsTrigger>
          </TabsList>

          <TabsContent value="supply" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="amount" className="text-xs text-gray-400 flex items-center">
                    USDC Amount
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 ml-1 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the amount of USDC you want to supply</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={isProcessing || !isWalletConnected || !isCorrectChain}
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
                    className="pr-16 h-12 bg-gray-800/30 border-gray-700 focus:border-blue-500 transition-all"
                    disabled={isProcessing || !isWalletConnected || !isCorrectChain}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">USDC</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-800/20 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Expected Yield</span>
                  <span className="text-green-400 font-medium">{index.yieldRange || `+${index.confilmYield}%`}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Settlement Date</span>
                  <span className="text-gray-300">{index.settlementDate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current Price</span>
                  <span className="text-gray-300">${index.avgPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">You Will Receive</span>
                  <span className="text-blue-300">
                    {amount && !isNaN(Number(amount))
                      ? `${(Number(amount) / index.avgPrice).toFixed(4)} ${indexSymbol}`
                      : `0 ${indexSymbol}`}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20"
                disabled={isProcessing || (!amount && isWalletConnected) || (isWalletConnected && !isCorrectChain)}
              >
                {!isWalletConnected
                  ? "Connect Wallet"
                  : isProcessing
                    ? "Processing..."
                    : !isCorrectChain
                      ? "Switch Network"
                      : "Supply USDC"}
              </Button>

              <TransactionStatus status={status} error={error} txHash={txHash} onDismiss={resetTransaction} />
            </form>
          </TabsContent>

          <TabsContent value="withdraw" className="mt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="withdraw-amount" className="text-xs text-gray-400 flex items-center">
                    {indexSymbol} Amount
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 ml-1 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the amount of {indexSymbol} tokens you want to withdraw</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    disabled={isProcessing || !isWalletConnected || !isCorrectChain}
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
                    className="pr-16 h-12 bg-gray-800/30 border-gray-700 focus:border-blue-500 transition-all"
                    disabled={isProcessing || !isWalletConnected || !isCorrectChain}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400 text-sm">{indexSymbol}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-800/20 rounded-lg space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current Position</span>
                  <span className="text-gray-300">
                    {formattedIndexBalance} {indexSymbol}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Current PnL</span>
                  <span className="text-green-400 font-medium">+3.2%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Market Price</span>
                  <span className="text-gray-300">${index.avgPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">You Will Receive</span>
                  <span className="text-blue-300">
                    {amount && !isNaN(Number(amount))
                      ? `$${(Number(amount) * index.avgPrice).toFixed(2)} USDC`
                      : `$0.00 USDC`}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20"
                disabled={isProcessing || (!amount && isWalletConnected) || (isWalletConnected && !isCorrectChain)}
              >
                {!isWalletConnected
                  ? "Connect Wallet"
                  : isProcessing
                    ? "Processing..."
                    : !isCorrectChain
                      ? "Switch Network"
                      : "Withdraw"}
              </Button>

              <TransactionStatus status={status} error={error} txHash={txHash} onDismiss={resetTransaction} />
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
