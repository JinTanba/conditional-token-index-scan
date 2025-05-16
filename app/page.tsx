import { BlocksRow } from "@/components/blocks-row"
import { DifficultyAdjustmentCard } from "@/components/difficulty-adjustment-card"
import { Header } from "@/components/header"
import { LiveMempoolChart } from "@/components/live-mempool-chart"
import { Web3Provider } from "@/components/web3-provider"

export default function Home() {
  return (
    <Web3Provider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto max-w-[1680px] px-2 sm:px-4 py-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Prediction Market Indices in a single scrollable row */}
            <BlocksRow />

            {/* Market Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DifficultyAdjustmentCard />
              <LiveMempoolChart />
            </div>
          </div>
        </main>
      </div>
    </Web3Provider>
  )
}
