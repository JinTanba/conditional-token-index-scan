"use client"

import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "./web3-provider"

export function NetworkWarning() {
  const { isWalletConnected, chainId, isCorrectChain, switchToPolygon } = useWeb3()

  if (!isWalletConnected || isCorrectChain) {
    return null
  }

  return (
    <Alert className="bg-yellow-900/20 border-yellow-800 mb-4">
      <AlertTriangle className="h-4 w-4 text-yellow-400" />
      <AlertTitle className="text-yellow-400">Wrong Network</AlertTitle>
      <AlertDescription className="text-gray-300">
        <div className="flex flex-col space-y-2">
          <span>
            Please switch to the Polygon network to interact with prediction markets.
            {chainId && <span className="text-xs"> (Current: {getNetworkName(chainId)})</span>}
          </span>
          <Button onClick={switchToPolygon} variant="outline" size="sm" className="mt-2 w-full">
            Switch to Polygon
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: "Ethereum Mainnet",
    137: "Polygon",
    56: "BSC",
    42161: "Arbitrum",
    10: "Optimism",
    43114: "Avalanche",
    250: "Fantom",
    // Add more networks as needed
  }

  return networks[chainId] || `Chain ID ${chainId}`
}
