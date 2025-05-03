import { type NextRequest, NextResponse } from "next/server"

// Simulated database state
let balance = 1000

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

// Create a mutex for balance operations
const balanceMutex = new Mutex()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, recipient } = body

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 })
    }

    // SECURE: Use a mutex to ensure atomic operations
    // 1. Acquire the lock
    await balanceMutex.acquire()

    try {
      // 2. Read the current balance (while holding the lock)
      const currentBalance = balance

      // Simulate some processing delay that would occur in a real system
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500))

      // 3. Check if there are sufficient funds
      if (currentBalance < amount) {
        return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
      }

      // 4. Calculate the new balance
      const newBalance = currentBalance - amount

      // 5. Update the balance
      balance = newBalance

      // 6. Return the result
      return NextResponse.json({
        success: true,
        transferredAmount: amount,
        recipient,
        newBalance,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      })
    } finally {
      // 7. Always release the lock, even if an error occurs
      balanceMutex.release()
    }
  } catch (error) {
    console.error("Error processing transfer:", error)
    return NextResponse.json({ error: "Failed to process transfer" }, { status: 500 })
  }
}
