import { NextResponse } from "next/server"

// Simulated database for tracking transfers
const pendingTransfers = new Map()

export async function GET(request: Request) {
  const url = new URL(request.url)
  const txId = url.searchParams.get("txId")

  if (!txId) {
    return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
  }

  // Get transfer from "database"
  const transfer = pendingTransfers.get(txId)

  if (!transfer) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  }

  // In a real implementation, we would check the status of the transfer on the target chain
  // For this demo, we'll simulate a status update
  const now = Date.now()
  const transferTime = new Date(transfer.timestamp).getTime()
  const timeDiff = now - transferTime

  // Simulate status updates based on time elapsed
  let status = transfer.status
  if (timeDiff > 60000) {
    // After 1 minute, mark as completed
    status = "completed"
    transfer.status = status
    pendingTransfers.set(txId, transfer)
  }

  return NextResponse.json({
    txId,
    status,
    sourceChain: transfer.sourceChain,
    targetChain: transfer.targetChain,
    token: transfer.token,
    amount: transfer.amount,
    recipient: transfer.recipient,
    timestamp: transfer.timestamp,
  })
}
