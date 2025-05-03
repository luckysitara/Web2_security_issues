import { type NextRequest, NextResponse } from "next/server"

// Allowlist of approved blockchain nodes
const APPROVED_NODES = [
  "https://api.etherscan.io",
  "https://api.blockchain.example",
  "https://eth-mainnet.g.alchemy.com",
]

// Base URL for the blockchain API
const BASE_URL = "https://api.blockchain.example"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { txHash } = body

    // Validate transaction hash format
    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ error: "Invalid transaction hash format" }, { status: 400 })
    }

    // Use a fixed base URL instead of accepting it from user input
    const url = `${BASE_URL}/tx/${txHash}`

    // Verify the URL is in our allowlist
    const isAllowed = APPROVED_NODES.some((node) => url.startsWith(node))

    if (!isAllowed) {
      return NextResponse.json({ error: "Requested URL is not allowed" }, { status: 403 })
    }

    // For demo purposes, we'll simulate a successful response
    // In a real scenario, this would make the actual API call
    return NextResponse.json({
      hash: txHash,
      blockNumber: "14628961",
      from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      to: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      value: "0.5 ETH",
      gasUsed: "21000",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
