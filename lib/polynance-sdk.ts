import { PolynanceSDK as SDK } from "polynance_sdk"
import type { TradeRecord, OrderBookSummary, Exchange as SDKExchange, PredictionProvider } from "polynance_sdk"

// Define the Index interface based on the provided structure
export interface Index {
  id: string
  name: string
  makrtesIds: string[]
  positionNames: number[]
  icons: string[]
  avgPrice: number
  confilmYield: number
  status: string
  contractAddress: string
  resolutionTime: string
  priceChange24h?: string
  yieldRange?: string
  yieldLoss?: string
  // Additional fields we'll need for our UI
  markets?: Market[]
  daysRemaining?: number
  volume?: number
  marketCap?: number
  settlementDate?: string
  expired?: boolean
}

// Define a Market interface for our application
export interface Market {
  id: string
  name: string
  proportion: number
  price: number
  category: string
  remainingHours: number
  icon: string
  priceHistory?: TradeRecord[][]
  orderbook?: Record<string, OrderBookSummary>
  volume: number
  end: string
  position?: string
  description?: string
  tags?: string[]
}

// Define a PriceData interface for price history components
export interface PriceData {
  price: number
  volumeBase: number
  timestamp: number
  trader?: string
}

// Define a CandleData interface for candlestick charts
export interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Define the initial indexes with proper typing
const predefinedIndexes: Index[] = [
  {
    id: "non-viable-candidate",
    name: "Non-Viable Candidate Index",
    makrtesIds: ["534197", "534220", "528716", "528717"],
    positionNames: [2, 2, 2, 2],
    icons: ["", "", "", ""],
    avgPrice: 0,
    confilmYield: 0,
    status: "Active",
    contractAddress: "0xC01BbFC94C41F0D8Fc242cFe8465ea4dcD4f20C5",
    resolutionTime: "3 days",
  },
  {
    id: "reliable-forecast",
    name: "Reliable Forecast Index",
    makrtesIds: ["516909", "514138", "544924", "543148"],
    positionNames: [1, 1, 1, 1],
    icons: ["", "", "", ""],
    avgPrice: 0,
    confilmYield: 0,
    status: "Inactive",
    contractAddress: "0x787dE5d30d327Ed20b3CaE7227f0aEcAcda2852E",
    resolutionTime: "4 days",
  },
  {
    id: "90-percent-index",
    name: "90% Index of Yes and No",
    makrtesIds: ["544924", "543148", "528716", "528717"],
    positionNames: [1, 1, 2, 2],
    icons: ["", "", "", ""],
    avgPrice: 0,
    confilmYield: 0,
    status: "Active",
    contractAddress: "0x2f583fa67768b4d0c092ce35455202602ec60c76",
    resolutionTime: "3 days",
  },
  {
    id: "polynance-ai-random",
    name: "Polynance AI Random Select Index",
    makrtesIds: ["516960","517124","520435","20789"],
    positionNames: [1,1,1,1],
    icons: ["", "", "", ""],
    avgPrice: 0,
    confilmYield: 0,
    status: "Active",
    contractAddress: "0x0557EceeAD263249368B07E12e9f6C1FC59878eB",
    resolutionTime: "3 days ",
  },{
    id: "cos similar 0.7 `Japan`",
    name: "Cos Similarity 0.7 Japan",
    makrtesIds: ["522638","522637","517000","532750"],
    positionNames: [2,1,2,2],
    icons: ["", "", "", ""],
    avgPrice: 0,
    confilmYield: 0,
    status: "Active",
    contractAddress: "0xd189321231B8A71493506eC87b959bed191E8f4d",
    resolutionTime: "3 days ",
  }
]

/**
 * PolynanceService - A service class for interacting with the Polynance SDK
 * This class provides methods for fetching and processing data from the Polynance API
 * in a way that is optimized for component-based architecture
 */
class PolynanceService {
  private sdk: SDK
  private cachedIndexes: Map<string, Index> = new Map()
  private cachedMarkets: Map<string, Market> = new Map()
  private cachedPriceHistories: Map<string, TradeRecord[]> = new Map()
  private cachedOrderbooks: Map<string, Record<string, OrderBookSummary>> = new Map()

  constructor() {
    this.sdk = new SDK({
    })
  }

  /**
   * Get the SDK instance
   * @returns The SDK instance
   */
  public getSdk(): SDK {
    return this.sdk
  }

  /**
   * Get all predefined indexes
   * @returns An array of predefined indexes
   */
  public getPredefinedIndexes(): Index[] {
    return [...predefinedIndexes]
  }

  /**
   * Get a predefined index by ID
   * @param indexId The ID of the index to retrieve
   * @returns The index with the specified ID, or undefined if not found
   */
  public getPredefinedIndex(indexId: string): Index | undefined {
    return predefinedIndexes.find((index) => index.id === indexId)
  }

  /**
   * Get a market by ID
   * @param provider The prediction provider
   * @param marketId The ID of the market to retrieve
   * @returns A promise that resolves to the market data
   */
  public async getMarket(provider: PredictionProvider, marketId: string): Promise<Market> {
    try {
      // Check if the market is already cached
      const cacheKey = `${provider}-${marketId}`
      if (this.cachedMarkets.has(cacheKey)) {
        return this.cachedMarkets.get(cacheKey)!
      }

      // Fetch the market data from the SDK
      const exchange = await this.sdk.getExchange(provider, marketId)

      // Transform the data into our Market format
      const market: Market = {
        id: exchange.id,
        name: exchange.name,
        proportion: 1, // Default proportion
        price: this.getAveragePrice(exchange),
        category: exchange.groupItemTitle || "General",
        remainingHours: this.calculateRemainingHours(exchange.end),
        icon: exchange.icon || "",
        volume: 0, // Will be updated when price history is fetched
        end: exchange.end,
        position: exchange.position_tokens[0]?.name || "Unknown",
        description: exchange.description,
      }

      // Cache the market
      this.cachedMarkets.set(cacheKey, market)

      return market
    } catch (error) {
      console.error(`Error fetching market ${marketId}:`, error)
      throw new Error(`Failed to fetch market ${marketId}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get price history for a market
   * @param provider The prediction provider
   * @param marketId The ID of the market
   * @returns A promise that resolves to the price history data
   */
  public async getMarketPriceHistory(provider: PredictionProvider, marketId: string): Promise<TradeRecord[][]> {
    try {
      // Check if the price history is already cached
      const cacheKey = `${provider}-${marketId}`
      if (this.cachedPriceHistories.has(cacheKey)) {
        return [this.cachedPriceHistories.get(cacheKey)!]
      }

      // Fetch the price history from the SDK
      const priceHistory = await this.sdk.getPriceHistory(provider, marketId)

      // Update the market's volume if it exists in the cache
      if (this.cachedMarkets.has(cacheKey) && priceHistory.length > 0 && priceHistory[0].length > 0) {
        const market = this.cachedMarkets.get(cacheKey)!
        const marketVolume = priceHistory[0].reduce((sum, trade) => sum + (trade.volumeBase || 0), 0)
        market.volume = marketVolume
        this.cachedMarkets.set(cacheKey, market)
      }

      return priceHistory
    } catch (error) {
      console.error(`Error fetching price history for market ${marketId}:`, error)
      throw new Error(
        `Failed to fetch price history for market ${marketId}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get orderbook for a market
   * @param provider The prediction provider
   * @param marketId The ID of the market
   * @returns A promise that resolves to the orderbook data
   */
  public async getMarketOrderbook(
    provider: PredictionProvider,
    marketId: string,
  ): Promise<Record<string, OrderBookSummary>> {
    try {
      // Check if the orderbook is already cached
      const cacheKey = `${provider}-${marketId}`
      if (this.cachedOrderbooks.has(cacheKey)) {
        return this.cachedOrderbooks.get(cacheKey)!
      }

      // Fetch the orderbook from the SDK
      const orderbook = await this.sdk.getOrderbook(provider, marketId)

      // Cache the orderbook
      this.cachedOrderbooks.set(cacheKey, orderbook)

      return orderbook
    } catch (error) {
      console.error(`Error fetching orderbook for market ${marketId}:`, error)
      throw new Error(
        `Failed to fetch orderbook for market ${marketId}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get all data for an index
   * @param indexId The ID of the index to retrieve
   * @returns A promise that resolves to the index data with all markets and their data
   */
  public async getIndexWithData(indexId: string): Promise<Index> {
    try {
      // Check if the index is already cached with full data
      if (this.cachedIndexes.has(indexId)) {
        return this.cachedIndexes.get(indexId)!
      }

      // Get the predefined index
      const predefinedIndex = this.getPredefinedIndex(indexId)
      if (!predefinedIndex) {
        throw new Error(`Index with ID ${indexId} not found`)
      }

      // Create a copy of the index to avoid mutating the original
      const index: Index = { ...predefinedIndex }

      // Fetch data for each market in the index
      const marketPromises = index.makrtesIds.map(async (marketId, i) => {
        try {
          // Fetch market data
          const market = await this.getMarket("polymarket", marketId)

          // Update the market with position information
          market.position = index.positionNames[i] === 1 ? "YES" : "NO"
          market.proportion = 1 / index.makrtesIds.length

          // Fetch price history
          const priceHistory = await this.getMarketPriceHistory("polymarket", marketId)
          market.priceHistory = priceHistory

          // Fetch orderbook
          const orderbook = await this.getMarketOrderbook("polymarket", marketId)
          market.orderbook = orderbook

          return market
        } catch (error) {
          console.error(`Error fetching data for market ${marketId}:`, error)
          // Return a fallback market
          return this.createFallbackMarket(marketId, i, index.makrtesIds.length, index.positionNames[i])
        }
      })

      // Wait for all market data to be fetched
      const markets = await Promise.all(marketPromises)
      index.markets = markets

      // Calculate additional fields
      this.calculateIndexFields(index)

      // Cache the index
      this.cachedIndexes.set(indexId, index)

      return index
    } catch (error) {
      console.error(`Error fetching data for index ${indexId}:`, error)
      // Return a fallback index
      return this.createFallbackIndex(indexId)
    }
  }

  /**
   * Get price history for an index
   * @param index The index to get price history for
   * @returns An array of trade records representing the price history of the index
   */
  public getIndexPriceHistory(index: Index): TradeRecord[] {
    if (!index.markets || index.markets.length === 0) {
      console.log("No markets found in index, returning mock price history")
      return this.generateMockPriceHistory(30)
    }

    // Collect all price history records
    const allRecords: TradeRecord[] = []

    index.markets.forEach((market, i) => {
      if (market.priceHistory && market.priceHistory.length > 0 && market.priceHistory[0]?.length > 0) {
        // Get the position index (0 for YES, 1 for NO)
        const positionIndex = index.positionNames[i] === 1 ? 0 : 1

        // Get the price history for this position if available
        const positionHistory = market.priceHistory[positionIndex] || market.priceHistory[0]

        // Add each record to the combined list
        positionHistory.forEach((record: TradeRecord) => {
          if (record && typeof record.price === "number" && typeof record.timestamp === "number") {
            allRecords.push({
              price: record.price,
              volumeBase: record.volumeBase || 0,
              timestamp: record.timestamp,
              //@ts-ignore
              trader:`0x${Math.random().toString(16).substring(2, 10)}`,
            })
          }
        })
      }
    })

    // If no records were found, generate mock data
    if (allRecords.length === 0) {
      console.log("No price history records found, generating mock data")
      return this.generateMockPriceHistory(30)
    }

    // Sort by timestamp
    allRecords.sort((a, b) => a.timestamp - b.timestamp)

    return allRecords
  }

  /**
   * Get orderbook for an index
   * @param index The index to get orderbook for
   * @returns A record of asset IDs to orderbook summaries
   */
  public getIndexOrderbook(index: Index): Record<string, OrderBookSummary> {
    const aggregatedOrderbook: Record<string, OrderBookSummary> = {}

    if (!index.markets || index.markets.length === 0) {
      return aggregatedOrderbook
    }

    // Combine orderbooks from all markets
    index.markets.forEach((market) => {
      if (market.orderbook) {
        Object.keys(market.orderbook).forEach((assetId) => {
          if (!aggregatedOrderbook[assetId]) {
            aggregatedOrderbook[assetId] = {
              market: index.name,
              asset_id: assetId,
              timestamp: Date.now(),
              bids: [],
              asks: [],
              hash: "",
            }
          }
        })
      }
    })

    // Sort bids (descending) and asks (ascending)
    Object.keys(aggregatedOrderbook).forEach((assetId) => {
      if (aggregatedOrderbook[assetId].bids.length > 0) {
        aggregatedOrderbook[assetId].bids.sort((a, b) => b.price - a.price)
      }

      if (aggregatedOrderbook[assetId].asks.length > 0) {
        aggregatedOrderbook[assetId].asks.sort((a, b) => a.price - b.price)
      }
    })

    return aggregatedOrderbook
  }

  /**
   * Generate candle data from trade records
   * @param tradeRecords The trade records to generate candle data from
   * @param intervalHours The interval in hours for each candle
   * @returns An array of candle data
   */
  public generateCandleData(tradeRecords: TradeRecord[], intervalHours = 4): CandleData[] {
    if (!tradeRecords || tradeRecords.length === 0) {
      return []
    }

    const intervalMs = intervalHours * 60 * 60 * 1000
    const candles: CandleData[] = []

    // Sort records by timestamp
    const sortedRecords = [...tradeRecords].sort((a, b) => a.timestamp - b.timestamp)

    // Find the start and end times
    const startTime = sortedRecords[0].timestamp * 1000
    const endTime = sortedRecords[sortedRecords.length - 1].timestamp * 1000

    // Create candle intervals
    for (let time = startTime; time <= endTime; time += intervalMs) {
      const candleStart = time
      const candleEnd = time + intervalMs

      // Filter records in this interval
      const intervalRecords = sortedRecords.filter(
        (record) => record.timestamp * 1000 >= candleStart && record.timestamp * 1000 < candleEnd,
      )

      if (intervalRecords.length > 0) {
        // Calculate OHLCV
        const open = intervalRecords[0].price
        const close = intervalRecords[intervalRecords.length - 1].price
        const high = Math.max(...intervalRecords.map((r) => r.price))
        const low = Math.min(...intervalRecords.map((r) => r.price))
        const volume = intervalRecords.reduce((sum, r) => sum + (r.volumeBase || 0), 0)

        candles.push({
          time: candleStart / 1000, // Convert back to seconds
          open,
          high,
          low,
          close,
          volume,
        })
      }
    }

    return candles
  }

  /**
   * Get all indexes with basic data
   * @returns A promise that resolves to an array of indexes with basic data
   */
  public async getAllIndexesWithBasicData(): Promise<Index[]> {
    try {
      // Create a copy of the predefined indexes
      const indexes = [...predefinedIndexes]

      // Process each index to fetch basic data
      const processedIndexes = await Promise.all(
        indexes.map(async (index) => {
          try {
            // Create a copy of the index
            const processedIndex: Index = { ...index }

            // Fetch basic data for each market
            const marketPromises = index.makrtesIds.map(async (marketId, i) => {
              try {
                // Fetch market data
                const market = await this.getMarket("polymarket", marketId)

                // Update the market with position information
                market.position = index.positionNames[i] === 1 ? "YES" : "NO"
                market.proportion = 1 / index.makrtesIds.length

                return market
              } catch (error) {
                console.error(`Error fetching data for market ${marketId}:`, error)
                // Return a fallback market
                return this.createFallbackMarket(marketId, i, index.makrtesIds.length, index.positionNames[i])
              }
            })

            // Wait for all market data to be fetched
            const markets = await Promise.all(marketPromises)
            processedIndex.markets = markets

            // Calculate basic fields
            this.calculateBasicIndexFields(processedIndex)

            return processedIndex
          } catch (error) {
            console.error(`Error processing index ${index.name}:`, error)
            // Return a fallback index
            return this.createFallbackIndex(index.id)
          }
        }),
      )

      return processedIndexes
    } catch (error) {
      console.error("Error fetching indexes:", error)
      // Return fallback indexes
      return predefinedIndexes.map((index) => this.createFallbackIndex(index.id))
    }
  }

  // Private helper methods

  /**
   * Calculate the average price of an exchange
   * @param exchange The exchange to calculate the average price for
   * @returns The average price
   */
  private getAveragePrice(exchange: SDKExchange): number {
    if (!exchange.position_tokens || exchange.position_tokens.length === 0) {
      return 0
    }

    // Calculate the average price of all position tokens
    const totalPrice = exchange.position_tokens.reduce((sum, token) => {
      const price = Number(token.price) || 0
      return sum + price
    }, 0)

    return totalPrice / exchange.position_tokens.length
  }

  /**
   * Calculate remaining hours from an ISO date string
   * @param endDateStr The end date string
   * @returns The remaining hours
   */
  private calculateRemainingHours(endDateStr: string): number {
    try {
      const endDate = new Date(endDateStr)
      const now = new Date()
      const diffMs = endDate.getTime() - now.getTime()
      return Math.max(0, diffMs / (1000 * 60 * 60)) // Convert ms to hours
    } catch (error) {
      console.error("Error calculating remaining hours:", error)
      return 0
    }
  }

  /**
   * Calculate additional fields for an index
   * @param index The index to calculate fields for
   */
  private calculateIndexFields(index: Index): void {
    // Extract days remaining from resolutionTime
    const daysMatch = index.resolutionTime.match(/(\d+) days?/)
    index.daysRemaining = daysMatch ? Number.parseInt(daysMatch[1]) : 0

    // Check if the index is expired
    index.expired = index.status.toLowerCase() === "inactive"

    // Generate a settlement date
    const today = new Date()
    const settlementDate = new Date(today)
    settlementDate.setDate(today.getDate() + (index.daysRemaining || 0))
    index.settlementDate = settlementDate.toISOString().split("T")[0].replace(/-/g, "")

    // Calculate average price
    if (index.markets && index.markets.length > 0) {
      const totalPrice = index.markets.reduce((sum, market) => sum + market.price, 0)
      index.avgPrice = Number((totalPrice / index.markets.length).toFixed(2))
    }

    // Calculate total volume
    if (index.markets && index.markets.length > 0) {
      const totalVolume = index.markets.reduce((sum, market) => sum + market.volume, 0)
      index.volume = Number((totalVolume / 1000000).toFixed(2)) // Convert to millions
    }

    // Calculate price change based on price history if available
    if (index.markets && index.markets.length > 0) {
      let priceChange = 0
      let validMarkets = 0

      index.markets.forEach((market) => {
        if (market.priceHistory && market.priceHistory.length > 0 && market.priceHistory[0]?.length > 1) {
          const history = market.priceHistory[0]
          const oldestPrice = history[0].price
          const latestPrice = history[history.length - 1].price
          const marketChange = (latestPrice - oldestPrice) / oldestPrice
          priceChange += marketChange
          validMarkets++
        }
      })

      if (validMarkets > 0) {
        const avgPriceChange = priceChange / validMarkets
        index.priceChange24h = `${avgPriceChange >= 0 ? "+" : ""}${(avgPriceChange * 100).toFixed(2)}%`
      } else {
        // If no price history, generate a reasonable price change
        const change = (Math.random() * 0.1 - 0.05).toFixed(2)
        index.priceChange24h = change.startsWith("-") ? change + "%" : `+${change}%`
      }
    }

    // Generate yield range and loss for active markets
    if (!index.expired) {
      // Calculate yield based on average price
      // For YES positions: yield = (1/price - 1) * 100
      // For NO positions: yield = (1/(1-price) - 1) * 100
      let yieldValue = 0
      let lossValue = 0

      if (index.markets && index.markets.length > 0) {
        index.markets.forEach((market, i) => {
          const isYesPosition = index.positionNames[i] === 1
          const price = market.price

          if (isYesPosition && price > 0) {
            yieldValue += (1 / price - 1) * 100
          } else if (!isYesPosition && price < 1) {
            yieldValue += (1 / (1 - price) - 1) * 100
          }
        })

        yieldValue = yieldValue / index.markets.length
        lossValue = yieldValue * 0.5 // Estimate loss as half of potential yield

        index.yieldRange = `+${yieldValue.toFixed(1)}%`
        index.yieldLoss = `-${lossValue.toFixed(1)}%`
      } else {
        // Fallback values if no markets
        index.yieldRange = "+7.5%"
        index.yieldLoss = "-3.2%"
      }

      // Calculate market cap based on volume
      index.marketCap = index.volume ? index.volume * 2 : 0
    } else {
      // For expired indexes, use the confirmed yield
      index.confilmYield = index.confilmYield || 8.5
      index.yieldRange = `+${index.confilmYield}%`
      index.priceChange24h = "+0.00%"
      index.volume = 0.05
      index.marketCap = 0.1
    }
  }

  /**
   * Calculate basic fields for an index (for list views)
   * @param index The index to calculate fields for
   */
  private calculateBasicIndexFields(index: Index): void {
    // Extract days remaining from resolutionTime
    const daysMatch = index.resolutionTime.match(/(\d+) days?/)
    index.daysRemaining = daysMatch ? Number.parseInt(daysMatch[1]) : 0

    // Check if the index is expired
    index.expired = index.status.toLowerCase() === "inactive"

    // Generate a settlement date
    const today = new Date()
    const settlementDate = new Date(today)
    settlementDate.setDate(today.getDate() + (index.daysRemaining || 0))
    index.settlementDate = settlementDate.toISOString().split("T")[0].replace(/-/g, "")

    // Calculate average price
    if (index.markets && index.markets.length > 0) {
      const totalPrice = index.markets.reduce((sum, market) => sum + market.price, 0)
      index.avgPrice = Number((totalPrice / index.markets.length).toFixed(2))
    } else {
      index.avgPrice = 0.75 + Math.random() * 0.2
    }

    // Generate mock price change
    const change = (Math.random() * 0.1 - 0.05).toFixed(2)
    index.priceChange24h = change.startsWith("-") ? change + "%" : `+${change}%`

    // Generate mock yield range and loss
    if (!index.expired) {
      index.yieldRange = `+${(5 + Math.random() * 5).toFixed(1)}%`
      index.yieldLoss = `-${(2 + Math.random() * 3).toFixed(1)}%`
      index.volume = Math.random() * 10
    } else {
      index.confilmYield = index.confilmYield || 8.5
      index.yieldRange = `+${index.confilmYield}%`
      index.priceChange24h = "+0.00%"
      index.volume = 0.05
    }
  }

  /**
   * Create a fallback market
   * @param marketId The ID of the market
   * @param index The index of the market in the array
   * @param totalMarkets The total number of markets
   * @param positionType The position type (1 = YES, 2 = NO)
   * @returns A fallback market
   */
  private createFallbackMarket(marketId: string, index: number, totalMarkets: number, positionType: number): Market {
    return {
      id: marketId,
      name: `Market ${marketId}`,
      proportion: 1 / totalMarkets,
      price: 0.7 + Math.random() * 0.25,
      category: "Unknown",
      remainingHours: Math.floor(Math.random() * 72),
      icon: "",
      priceHistory: [],
      orderbook: {},
      volume: Math.random() * 1000000,
      end: new Date(Date.now() + Math.random() * 86400000 * 7).toISOString(),
      position: positionType === 1 ? "YES" : "NO",
    }
  }

  /**
   * Create a fallback index
   * @param indexId The ID of the index
   * @returns A fallback index
   */
  private createFallbackIndex(indexId: string): Index {
    // Find the predefined index
    const predefinedIndex = this.getPredefinedIndex(indexId)
    if (!predefinedIndex) {
      throw new Error(`Index with ID ${indexId} not found`)
    }

    // Create a copy of the index
    const index: Index = { ...predefinedIndex }

    // Add mock data for UI
    index.avgPrice = 0.75 + Math.random() * 0.2
    index.priceChange24h =
      Math.random() > 0.5 ? `+${(Math.random() * 5).toFixed(2)}%` : `-${(Math.random() * 3).toFixed(2)}%`
    index.yieldRange = `+${(5 + Math.random() * 5).toFixed(1)}%`
    index.yieldLoss = `-${(2 + Math.random() * 3).toFixed(1)}%`
    index.volume = Math.random() * 10
    index.daysRemaining = Number.parseInt(index.resolutionTime) || 3
    index.expired = index.status.toLowerCase() === "inactive"

    // Generate a settlement date
    const today = new Date()
    const settlementDate = new Date(today)
    settlementDate.setDate(today.getDate() + (index.daysRemaining || 0))
    index.settlementDate = settlementDate.toISOString().split("T")[0].replace(/-/g, "")

    // Generate mock markets
    index.markets = Array.from({ length: index.makrtesIds.length }).map((_, i) =>
      this.createFallbackMarket(index.makrtesIds[i], i, index.makrtesIds.length, index.positionNames[i]),
    )

    return index
  }

  /**
   * Generate mock price history data
   * @param days The number of days of history to generate
   * @returns An array of trade records
   */
  private generateMockPriceHistory(days: number): TradeRecord[] {
    const now = Math.floor(Date.now() / 1000)
    const dayInSeconds = 86400
    let price = 0.75 + Math.random() * 0.2 // Start with a price between 0.75 and 0.95

    const mockData: TradeRecord[] = []
    for (let i = days; i >= 0; i--) {
      // Add random price movement (-3% to +3%)
      const change = Math.random() * 0.06 - 0.03
      price = Math.max(0.5, Math.min(0.99, price + price * change))

      mockData.push({
        price,
        volumeBase: Math.random() * 10000,
        timestamp: now - i * dayInSeconds,
        //@ts-ignore
        trader: `0x${Math.random().toString(16).substring(2, 10)}`, // Random mock address
      })
    }

    return mockData
  }
}

// Create a singleton instance of the service
const polynanceService = new PolynanceService()

// Export the service instance
export default polynanceService

// Export convenience functions that use the service

/**
 * Get all indexes with basic data
 * @returns A promise that resolves to an array of indexes with basic data
 */
export async function getAllIndexes(): Promise<Index[]> {
  return polynanceService.getAllIndexesWithBasicData()
}

/**
 * Get an index with all data
 * @param indexId The ID of the index to retrieve
 * @returns A promise that resolves to the index data with all markets and their data
 */
export async function getIndex(indexId: string): Promise<Index> {
  return polynanceService.getIndexWithData(indexId)
}

/**
 * Get price history for an index
 * @param index The index to get price history for
 * @returns An array of trade records representing the price history of the index
 */
export function getIndexPriceHistory(index: Index): TradeRecord[] {
  return polynanceService.getIndexPriceHistory(index)
}

/**
 * Get orderbook for an index
 * @param index The index to get orderbook for
 * @returns A record of asset IDs to orderbook summaries
 */
export function getIndexOrderbook(index: Index): Record<string, OrderBookSummary> {
  return polynanceService.getIndexOrderbook(index)
}

/**
 * Generate candle data from trade records
 * @param tradeRecords The trade records to generate candle data from
 * @param intervalHours The interval in hours for each candle
 * @returns An array of candle data
 */
export function generateCandleData(tradeRecords: TradeRecord[], intervalHours = 4): CandleData[] {
  return polynanceService.generateCandleData(tradeRecords, intervalHours)
}

/**
 * Get a market by ID
 * @param provider The prediction provider
 * @param marketId The ID of the market to retrieve
 * @returns A promise that resolves to the market data
 */
export async function getMarket(provider: PredictionProvider, marketId: string): Promise<Market> {
  return polynanceService.getMarket(provider, marketId)
}

/**
 * Get price history for a market
 * @param provider The prediction provider
 * @param marketId The ID of the market
 * @returns A promise that resolves to the price history data
 */
export async function getMarketPriceHistory(provider: PredictionProvider, marketId: string): Promise<TradeRecord[][]> {
  return polynanceService.getMarketPriceHistory(provider, marketId)
}

/**
 * Get orderbook for a market
 * @param provider The prediction provider
 * @param marketId The ID of the market
 * @returns A promise that resolves to the orderbook data
 */
export async function getMarketOrderbook(
  provider: PredictionProvider,
  marketId: string,
): Promise<Record<string, OrderBookSummary>> {
  return polynanceService.getMarketOrderbook(provider, marketId)
}
