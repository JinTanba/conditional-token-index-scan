"use client"

import { Button } from "@/components/ui/button"
import { useWeb3 } from "./web3-provider"
import { Wallet, BarChart2 } from "lucide-react"
import { UserHoldingsDisplay } from "./user-holding-balance"

export function Header() {
  const { isWalletConnected, connectWallet, walletAddress } = useWeb3()

  return (
    <header className="border-b border-gray-800 py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg font-medium text-gray-100 flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
            <BarChart2 className="h-4 w-4 text-white" />
          </div>
          Conditional Token Index
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://polymarket.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
          >
            Polymarket
          </a>
          {isWalletConnected ? (
            <div className="flex items-center space-x-4">
              <UserHoldingsDisplay />
              <div className="flex items-center bg-gray-800/50 px-4 py-2 rounded-full text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Connected: {walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)}
              </div>
            </div>
          ) : (
            <Button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 h-10 rounded-full transition-all duration-200 flex items-center"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
