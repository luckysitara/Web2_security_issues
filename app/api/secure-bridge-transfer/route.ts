import { type NextRequest, NextResponse } from "next/server"

// Simulated bridge state
let bridgeBalance = 10000

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

// Track processed transactions to prevent duplicates
const processedTransactions = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, recipient, sourceChain, destinationChain } = body

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 })
    }

    if (!sourceChain || !destinationChain) {
      return NextResponse.json({ error: "Source and destination chains are required" }, { status: 400 })
    }

    // Generate a unique transaction ID based on the input parameters
    // In a real system, this would be derived from the source chain transaction
    const txId = `${sourceChain}-${destinationChain}-${recipient}-${amount}-${Date.now()}`

    // Check if this transaction has already been processed (idempotency check)
    if (processedTransactions.has(txId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Transaction already processed",
          transactionId: txId,
          bridgeBalance: bridgeBalance,
        },
        { status: 409 },
      )
    }

    // SECURE: Use a mutex to ensure atomic operations
    // 1. Acquire the lock
    await bridgeMutex.acquire()

    try {
      // 2. Read the current bridge balance (while holding the lock)
      const currentBalance = bridgeBalance

      // Simulate some processing delay that would occur in a real system
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500))

      // 3. Check if there are sufficient funds
      if (currentBalance < amount) {
        return NextResponse.json({ error: "Insufficient bridge liquidity" }, { status: 400 })
      }

      // 4. Calculate the new balance
      const newBalance = currentBalance - amount

      // 5. Update the balance
      bridgeBalance = newBalance

      // 6. Mark this transaction as processed
      processedTransactions.add(txId)

      // 7. Return the result
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
      // 8. Always release the lock, even if an error occurs
      bridgeMutex.release()
    }
  } catch (error) {
    console.error("Error processing bridge transfer:", error)
    return NextResponse.json({ error: "Failed to process bridge transfer" }, { status: 500 })
  }
}
