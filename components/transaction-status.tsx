"use client"

import { AlertCircle, CheckCircle, Loader2, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface TransactionStatusProps {
  status: "idle" | "approving" | "pending" | "success" | "error"
  error: string | null
  txHash: string | null
  onDismiss: () => void
}

export function TransactionStatus({ status, error, txHash, onDismiss }: TransactionStatusProps) {
  if (status === "idle") return null

  const getPolygonScanUrl = (hash: string) => {
    return `https://polygonscan.com/tx/${hash}`
  }

  return (
    <Alert
      className={`mt-4 ${
        status === "success"
          ? "bg-green-900/20 border-green-800"
          : status === "error"
            ? "bg-red-900/20 border-red-800"
            : "bg-blue-900/20 border-blue-800"
      }`}
    >
      {status === "approving" && (
        <>
          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          <AlertTitle className="text-blue-400">Approving Transaction</AlertTitle>
          <AlertDescription className="text-gray-300">
            Please confirm the approval transaction in your wallet...
          </AlertDescription>
        </>
      )}

      {status === "pending" && (
        <>
          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          <AlertTitle className="text-blue-400">Transaction Pending</AlertTitle>
          <AlertDescription className="text-gray-300">
            Your transaction is being processed on the blockchain...
          </AlertDescription>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertTitle className="text-green-400">Transaction Successful</AlertTitle>
          <AlertDescription className="text-gray-300 flex flex-col space-y-2">
            <span>Your transaction has been confirmed!</span>
            {txHash && (
              <a
                href={getPolygonScanUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
              >
                View on PolygonScan <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            )}
            <Button onClick={onDismiss} variant="outline" size="sm" className="mt-2 w-full">
              Dismiss
            </Button>
          </AlertDescription>
        </>
      )}

      {status === "error" && (
        <>
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Transaction Failed</AlertTitle>
          <AlertDescription className="text-gray-300 flex flex-col space-y-2">
            <span>{error || "There was an error processing your transaction."}</span>
            <Button onClick={onDismiss} variant="outline" size="sm" className="mt-2 w-full">
              Dismiss
            </Button>
          </AlertDescription>
        </>
      )}
    </Alert>
  )
}
