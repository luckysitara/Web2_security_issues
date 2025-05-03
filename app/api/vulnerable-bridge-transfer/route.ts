import { type NextRequest, NextResponse } from "next/server"

// Simulated bridge state
let bridgeBalance = 10000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, recipient, sourceChain, destinationChain, customPayload } = body

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return NextResponse.json({ error: "Invalid recipient address" }, { status: 400 })
    }

    if (!sourceChain || !destinationChain) {
      return NextResponse.json({ error: "Source and destination chains are required" }, { status: 400 })
    }

    // VULNERABLE: This implementation doesn't handle concurrent transfers properly
    // 1. Read the current bridge balance
    const currentBalance = bridgeBalance

    // Simulate some processing delay that would occur in a real system
    // This makes the race condition more likely to occur
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 500))

    // VULNERABLE: If customPayload contains a URL, fetch it without validation
    let processedPayload = customPayload
    if (customPayload && customPayload.includes("http")) {
      try {
        // This is intentionally vulnerable - in a real app, this would be a security risk
        console.log(`Would fetch from URL in payload: ${customPayload}`)
        processedPayload = `Processed: ${customPayload}`
      } catch (error) {
        console.error("Error processing payload URL:", error)
      }
    }

    // 2. Check if there are sufficient funds
    if (currentBalance < amount) {
      return NextResponse.json({ error: "Insufficient bridge liquidity" }, { status: 400 })
    }

    // 3. Calculate the new balance
    const newBalance = currentBalance - amount

    // 4. Update the balance
    bridgeBalance = newBalance

    // Generate a unique transaction ID
    const txId = `0x${Math.random().toString(16).substr(2, 64)}`

    // 5. Return the result
    return NextResponse.json({
      success: true,
      transactionId: txId,
      amount: amount,
      recipient: recipient,
      sourceChain: sourceChain,
      destinationChain: destinationChain,
      bridgeBalance: newBalance,
      timestamp: new Date().toISOString(),
      processedPayload: processedPayload,
    })
  } catch (error) {
    console.error("Error processing bridge transfer:", error)
    return NextResponse.json({ error: "Failed to process bridge transfer" }, { status: 500 })
  }
}
