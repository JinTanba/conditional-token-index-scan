"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Create a context for Web3 state
type Web3ContextType = {
  isWalletConnected: boolean
  connectWallet: () => Promise<void>
  walletAddress: string | null
  chainId: number | null
  isCorrectChain: boolean
  switchToPolygon: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType>({
  isWalletConnected: false,
  connectWallet: async () => {},
  walletAddress: null,
  chainId: null,
  isCorrectChain: false,
  switchToPolygon: async () => {},
})

// Polygon chain ID
const POLYGON_CHAIN_ID = 137

export function Web3Provider({ children }: { children: ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  // Safely check for ethereum
  const getEthereum = () => {
    if (typeof window !== "undefined") {
      // Return the ethereum object without modifying it
      return typeof (window as any).ethereum !== "undefined" ? (window as any).ethereum : null
    }
    return null
  }

  // Connect wallet function
  const connectWallet = async () => {
    const ethereum = getEthereum()
    if (!ethereum) {
      console.log("Please install MetaMask or another Web3 wallet")
      return
    }

    try {
      // Request account access with error handling
      const accounts = await ethereum.request({ method: "eth_requestAccounts" }).catch((error: any) => {
        console.error("User denied account access", error)
        return []
      })

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setIsWalletConnected(true)

        // Get current chain ID
        const chainIdHex = await ethereum.request({ method: "eth_chainId" })
        setChainId(Number.parseInt(chainIdHex, 16))
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error)
    }
  }

  // Function to switch to Polygon network
  const switchToPolygon = async () => {
    const ethereum = getEthereum()
    if (!ethereum) return

    try {
      // Try to switch to Polygon
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${POLYGON_CHAIN_ID.toString(16)}` }],
      })
    } catch (switchError: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${POLYGON_CHAIN_ID.toString(16)}`,
                chainName: "Polygon Mainnet",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://polygon-rpc.com/"],
                blockExplorerUrls: ["https://polygonscan.com/"],
              },
            ],
          })
        } catch (addError) {
          console.error("Error adding Polygon network:", addError)
        }
      } else {
        console.error("Error switching to Polygon network:", switchError)
      }
    }
  }

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = getEthereum()
      if (!ethereum) return

      try {
        // Use a try-catch block to safely request accounts
        const accounts = await ethereum.request({ method: "eth_accounts" }).catch(() => [])
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)

          // Get current chain ID
          const chainIdHex = await ethereum.request({ method: "eth_chainId" })
          setChainId(Number.parseInt(chainIdHex, 16))
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }

    checkConnection()
  }, [])

  // Set up event listeners for account and chain changes
  useEffect(() => {
    const ethereum = getEthereum()
    if (!ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        setIsWalletConnected(false)
        setWalletAddress(null)
      } else {
        // Account changed
        setWalletAddress(accounts[0])
        setIsWalletConnected(true)
      }
    }

    const handleChainChanged = (chainIdHex: string) => {
      // Chain changed, reload the page as recommended by MetaMask
      setChainId(Number.parseInt(chainIdHex, 16))
      window.location.reload()
    }

    // Add event listeners
    ethereum.on("accountsChanged", handleAccountsChanged)
    ethereum.on("chainChanged", handleChainChanged)

    // Clean up event listeners
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged)
      ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [])

  // Check if on the correct chain (Polygon)
  const isCorrectChain = chainId === POLYGON_CHAIN_ID

  return (
    <Web3Context.Provider
      value={{
        isWalletConnected,
        connectWallet,
        walletAddress,
        chainId,
        isCorrectChain,
        switchToPolygon,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

// Hook to use the Web3 context
export const useWeb3 = () => useContext(Web3Context)
