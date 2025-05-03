import { NextResponse } from "next/server"

// Simulated database for tracking transfers
const pendingTransfers = new Map()
const processedNonces = new Set()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sourceChain, targetChain, token, amount, recipient, gasLimit = "300000", relayerFee = "0.01" } = body

    // Validate required fields
    if (!sourceChain || !targetChain || !token || !amount || !recipient) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate recipient address format
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({ error: "Invalid recipient address format" }, { status: 400 })
    }

    // Generate a nonce for this transfer
    const nonce = Math.floor(Math.random() * 1000000).toString()

    // Check if nonce is already used
    if (processedNonces.has(nonce)) {
      return NextResponse.json({ error: "Transaction already processed" }, { status: 400 })
    }

    // Add nonce to processed set
    processedNonces.add(nonce)

    // Simulate token bridge transfer
    const transferData = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceChain,
      targetChain,
      token,
      amount,
      recipient,
      nonce,
      gasLimit,
      relayerFee,
      status: "pending",
      timestamp: new Date().toISOString(),
    }

    // Store the transfer in our "database"
    pendingTransfers.set(transferData.id, transferData)

    // Simulate Wormhole message format
    const wormholeMessage = {
      version: 1,
      sourceDomain: getChainDomain(sourceChain),
      targetDomain: getChainDomain(targetChain),
      nonce,
      sender: "0x" + "1".repeat(40), // Dummy sender address
      recipient,
      token,
      amount,
    }

    return NextResponse.json({
      success: true,
      transferId: transferData.id,
      message: "Transfer initiated successfully",
      wormholeMessage,
    })
  } catch (error) {
    console.error("Bridge transfer error:", error)
    return NextResponse.json({ error: "Failed to process bridge transfer" }, { status: 500 })
  }
}

// Helper function to get chain domain ID
function getChainDomain(chainId: string): number {
  const chainDomains = {
    "ethereum-goerli": 2,
    "bsc-testnet": 4,
    "polygon-mumbai": 5,
    "avalanche-fuji": 6,
    // Add more chains as needed
  }

  return chainDomains[chainId] || 0
}
