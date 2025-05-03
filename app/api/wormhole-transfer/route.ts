import { NextResponse } from "next/server"

// Simulated database for tracking transfers
const pendingTransfers = new Map()
const processedNonces = new Set()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      sourceChain,
      targetChain,
      token,
      amount,
      recipient,
      payload = "",
      gasLimit = "300000",
      relayerFee = "0.01",
    } = body

    // Validate required fields
    if (!sourceChain || !targetChain || !token || !amount || !recipient) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // VULNERABILITY 1: No validation of recipient address format
    // This could lead to tokens being sent to invalid addresses

    // VULNERABILITY 2: No rate limiting
    // This could allow an attacker to spam the bridge with requests

    // Generate a nonce for this transfer
    const nonce = Math.floor(Math.random() * 1000000).toString()

    // VULNERABILITY 3: Race condition vulnerability - no proper locking mechanism
    // If multiple requests come in with the same parameters, they might all be processed

    // VULNERABILITY 4: SSRF vulnerability - if payload contains URLs, they might be fetched
    // without proper validation
    let processedPayload = payload
    if (payload.includes("http")) {
      try {
        // This is intentionally vulnerable - in a real app, this would be a security risk
        const response = await fetch(payload)
        processedPayload = await response.text()
      } catch (error) {
        console.error("Error processing payload URL:", error)
      }
    }

    // Simulate token bridge transfer
    const transferData = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceChain,
      targetChain,
      token,
      amount,
      recipient,
      nonce,
      payload: processedPayload,
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
      payload: processedPayload,
    }

    // VULNERABILITY 5: No signature verification
    // In a real implementation, the message would be signed by the sender
    // and verified by the relayer

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
    ethereum: 1,
    solana: 2,
    avalanche: 3,
    polygon: 4,
    // Add more chains as needed
  }

  return chainDomains[chainId] || 0
}
