"use client"

import { useState } from "react"
import { supply, withdraw } from "@/lib/utils/indexInteractions"

type TransactionStatus = "idle" | "approving" | "pending" | "success" | "error"

export function useContractTransaction() {
  const [status, setStatus] = useState<TransactionStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  // Supply function
  const supplyTokens = async (indexContractAddress: string, amount: number) => {
    if (!indexContractAddress || amount <= 0) {
      setError("Invalid parameters")
      return false
    }

    setStatus("approving")
    setError(null)
    setTxHash(null)

    try {
      const receipt = await supply(indexContractAddress, amount)
      setTxHash(receipt.transactionHash)
      setStatus("success")
      return true
    } catch (err: any) {
      console.error("Supply transaction failed:", err)

      // Extract user-friendly error message
      let errorMessage = "Transaction failed"
      if (err.message) {
        if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient USDC balance for this transaction"
        } else if (err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected in your wallet"
        } else if (err.message.includes("gas required exceeds")) {
          errorMessage = "Transaction requires more gas than available"
        }
      }

      setError(errorMessage)
      setStatus("error")
      return false
    }
  }

  // Withdraw function
  const withdrawTokens = async (indexContractAddress: string, amount: number) => {
    if (!indexContractAddress || amount <= 0) {
      setError("Invalid parameters")
      return false
    }

    setStatus("pending")
    setError(null)
    setTxHash(null)

    try {
      const receipt = await withdraw(indexContractAddress, amount)
      setTxHash(receipt.transactionHash)
      setStatus("success")
      return true
    } catch (err: any) {
      console.error("Withdraw transaction failed:", err)

      // Extract user-friendly error message
      let errorMessage = "Transaction failed"
      if (err.message) {
        if (err.message.includes("insufficient funds")) {
          errorMessage = "Insufficient index tokens for this transaction"
        } else if (err.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected in your wallet"
        } else if (err.message.includes("gas required exceeds")) {
          errorMessage = "Transaction requires more gas than available"
        }
      }

      setError(errorMessage)
      setStatus("error")
      return false
    }
  }

  // Reset transaction state
  const resetTransaction = () => {
    setStatus("idle")
    setError(null)
    setTxHash(null)
  }

  return {
    status,
    error,
    txHash,
    supplyTokens,
    withdrawTokens,
    resetTransaction,
    isProcessing: status === "approving" || status === "pending",
    isSuccess: status === "success",
    isError: status === "error",
  }
}
