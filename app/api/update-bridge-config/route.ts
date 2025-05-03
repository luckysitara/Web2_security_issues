import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rpcUrl } = body

    if (!rpcUrl) {
      return NextResponse.json({ error: "RPC URL is required" }, { status: 400 })
    }

    // VULNERABLE: This directly uses the RPC URL provided in the request
    // An attacker could provide a URL pointing to internal services
    console.log(`Would update bridge configuration with RPC URL: ${rpcUrl}`)

    // Check if the URL looks like it might be targeting an internal service
    if (rpcUrl.includes("internal") || rpcUrl.includes("localhost") || rpcUrl.includes("127.0.0.1")) {
      // Simulate finding sensitive data
      return NextResponse.json({
        warning: "SECURITY BREACH DETECTED",
        message: "This would expose internal services in a real application",
        sensitiveData: {
          bridgeConfig: {
            adminKeys: ["0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f"],
            thresholds: {
              ethereum: "100 ETH",
              polygon: "10000 MATIC",
              bsc: "500 BNB",
            },
            relayers: ["0x742d35Cc6634C0532925a3b844Bc454e4438f44e", "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"],
          },
        },
      })
    }

    // Normal response for a legitimate RPC URL update
    return NextResponse.json({
      success: true,
      message: "Bridge configuration updated successfully",
      config: {
        rpcUrl: rpcUrl,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error updating bridge configuration:", error)
    return NextResponse.json({ error: "Failed to update bridge configuration" }, { status: 500 })
  }
}
