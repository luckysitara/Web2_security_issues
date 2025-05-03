import { type NextRequest, NextResponse } from "next/server"

// Allowlist of approved blockchain explorer APIs
const APPROVED_EXPLORERS = {
  ethereum: "https://api.etherscan.io/api",
  polygon: "https://api.polygonscan.com/api",
  bsc: "https://api.bscscan.com/api",
  arbitrum: "https://api.arbiscan.io/api",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { network, txHash } = body

    // Validate network
    if (!network || !APPROVED_EXPLORERS[network]) {
      return NextResponse.json({ error: "Invalid or unsupported network" }, { status: 400 })
    }

    // Validate transaction hash format
    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return NextResponse.json({ error: "Invalid transaction hash format" }, { status: 400 })
    }

    // Use the pre-approved explorer URL for the selected network
    const explorerUrl = APPROVED_EXPLORERS[network]

    console.log(`Would fetch transaction ${txHash} from ${explorerUrl}`)

    // For demo purposes, we'll simulate a successful response
    // In a real scenario, this would make an actual HTTP request to the approved explorer
    return NextResponse.json({
      hash: txHash,
      network: network,
      blockNumber: "14628961",
      from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      to: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      value: "0.5 ETH",
      gasUsed: "21000",
      timestamp: new Date().toISOString(),
      status: "success",
    })
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Failed to fetch transaction data" }, { status: 500 })
  }
}
