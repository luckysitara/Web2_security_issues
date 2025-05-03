import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  const txHash = request.nextUrl.searchParams.get("txHash")
  const vulnerable = request.nextUrl.searchParams.get("vulnerable") === "true"

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  if (!txHash) {
    return NextResponse.json({ error: "Transaction hash parameter is required" }, { status: 400 })
  }

  try {
    // For demo purposes, we'll simulate a successful response instead of making an actual fetch
    // This avoids potential CORS issues or network problems in the demo environment
    console.log(`Would fetch from URL: ${url}`)

    // If vulnerable mode is enabled, check if the URL looks like it might be targeting an internal service
    if (vulnerable && (url.includes("internal") || url.includes("localhost") || url.includes("127.0.0.1"))) {
      // Simulate finding sensitive data
      return NextResponse.json({
        warning: "SECURITY BREACH DETECTED",
        message: "This would expose internal services in a real application",
        sensitiveData: {
          privateKeys: [
            "0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f",
            "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7",
          ],
          apiKeys: {
            infura: "a1b2c3d4e5f6g7h8i9j0",
            alchemy: "z9y8x7w6v5u4t3s2r1q0",
          },
          adminCredentials: {
            username: "bridge_admin",
            password: "super_secure_password123!",
          },
        },
      })
    }

    // Normal response for a legitimate blockchain explorer API
    return NextResponse.json({
      hash: txHash,
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
