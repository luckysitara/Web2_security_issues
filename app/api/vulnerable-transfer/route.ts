import { type NextRequest, NextResponse } from "next/server"

// Simulated database state
let balance = 1000

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

    // VULNERABLE: This implementation doesn't handle concurrent transfers properly
    // 1. Read the current balance
    const currentBalance = balance

    // Simulate some processing delay that would occur in a real system
    // This makes the race condition more likely to occur
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500))

    // 2. Check if there are sufficient funds
    if (currentBalance < amount) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
    }

    // 3. Calculate the new balance
    const newBalance = currentBalance - amount

    // 4. Update the balance
    balance = newBalance

    // 5. Return the result
    return NextResponse.json({
      success: true,
      transferredAmount: amount,
      recipient,
      newBalance,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    })
  } catch (error) {
    console.error("Error processing transfer:", error)
    return NextResponse.json({ error: "Failed to process transfer" }, { status: 500 })
  }
}
