import { NextResponse } from "next/server"

// Simulated database for tracking transfers
const pendingTransfers = new Map()
const processedNonces = new Set()
const transferLocks = new Map()

// Rate limiting
const rateLimits = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 5 // 5 requests per minute

// Allowlist of domains for external requests
const ALLOWED_DOMAINS = [
  "api.wormhole.com",
  "bridge-api.wormhole.com",
  "attestation.wormhole.com",
  "api.etherscan.io",
  "api.polygonscan.com",
  "api.bscscan.com",
  "api.snowtrace.io",
]

// Mutex lock implementation for concurrency control
class Mutex {
  private locked = false
  private queue: Array<() => void> = []

  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true
        resolve()
      } else {
        this.queue.push(resolve)
      }
    })
  }

  release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!
      next()
    } else {
      this.locked = false
    }
  }
}

// Create a mutex for bridge operations
const bridgeMutex = new Mutex()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, recipient, sourceChain, destinationChain, customPayload = "" } = body

    // Validate required fields
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 })
    }

    if (!sourceChain || !destinationChain) {
      return NextResponse.json({ error: "Source and destination chains are required" }, { status: 400 })
    }

    // Rate limiting
    const clientIp = "127.0.0.1" // In a real app, get the client IP
    const now = Date.now()
    const userRateData = rateLimits.get(clientIp) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW }

    // Reset rate limit if window has passed
    if (now > userRateData.resetTime) {
      userRateData.count = 0
      userRateData.resetTime = now + RATE_LIMIT_WINDOW
    }

    // Check if rate limit exceeded
    if (userRateData.count >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    // Increment rate limit counter
    userRateData.count++
    rateLimits.set(clientIp, userRateData)

    // Generate a unique transaction ID based on the input parameters
    const txId = `${sourceChain}-${destinationChain}-${recipient}-${amount}-${Date.now()}`

    // Check if this transaction has already been processed (idempotency check)
    if (processedNonces.has(txId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction already processed",
          transactionId: txId,
        },
        { status: 409 },
      )
    }

    // SECURE: Use a mutex to ensure atomic operations
    // 1. Acquire the lock
    await bridgeMutex.acquire()

    try {
      // 2. Process custom payload securely
      const processedPayload = customPayload
      if (customPayload && customPayload.includes("http")) {
        // Check if URL is in allowlist
        const url = new URL(customPayload)
        const isAllowed = ALLOWED_DOMAINS.some(
          (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`),
        )

        if (!isAllowed) {
          return NextResponse.json(
            {
              error: "URL not in allowlist",
              message: "For security reasons, only approved domains can be accessed",
            },
            { status: 403 },
          )
        }
      }

      // 3. Simulate bridge balance check
      const bridgeBalance = 10000 // Simulated balance

      // 4. Check if there are sufficient funds
      if (bridgeBalance < amount) {
        return NextResponse.json({ error: "Insufficient bridge liquidity" }, { status: 400 })
      }

      // 5. Calculate the new balance
      const newBalance = bridgeBalance - amount

      // 6. Mark this transaction as processed
      processedNonces.add(txId)

      // 7. Create transaction record
      const transferData = {
        id: txId,
        sourceChain,
        destinationChain,
        amount,
        recipient,
        status: "pending",
        timestamp: new Date().toISOString(),
      }

      // Store the transfer in our "database"
      pendingTransfers.set(transferData.id, transferData)

      // 8. Return the result
      return NextResponse.json({
        success: true,
        transactionId: txId,
        amount: amount,
        recipient: recipient,
        sourceChain: sourceChain,
        destinationChain: destinationChain,
        bridgeBalance: newBalance,
        timestamp: new Date().toISOString(),
      })
    } finally {
      // 9. Always release the lock, even if an error occurs
      bridgeMutex.release()
    }
  } catch (error) {
    console.error("Error processing bridge transfer:", error)
    return NextResponse.json({ error: "Failed to process bridge transfer" }, { status: 500 })
  }
}
