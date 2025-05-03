import { NextResponse } from "next/server"

// Allowlist of domains for external requests
const ALLOWED_DOMAINS = [
  "api.wormhole.com",
  "bridge-api.wormhole.com",
  "attestation.wormhole.com",
  "api.etherscan.io",
  "api.polygonscan.com",
  "api.bscscan.com",
  "api.snowtrace.io",
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, vulnerable = false } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // If vulnerable mode is disabled, check if URL is in allowlist
    if (!vulnerable) {
      try {
        const parsedUrl = new URL(url)
        const isAllowed = ALLOWED_DOMAINS.some(
          (domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`),
        )

        if (!isAllowed) {
          return NextResponse.json(
            {
              error: "URL not in allowlist",
              message: "For security reasons, only approved domains can be accessed",
            },
            { status: 403 },
          )
        }
      } catch (urlError) {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
      }
    }

    // For demonstration purposes, we'll simulate a response instead of making an actual fetch
    // This avoids potential CORS issues or network problems in the demo environment
    console.log(`Would fetch from URL: ${url}`)

    // Check if the URL looks like it might be targeting an internal service
    if (url.includes("internal") || url.includes("localhost") || url.includes("127.0.0.1")) {
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
          bridgeConfig: {
            adminKeys: ["0x8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f"],
            thresholds: {
              ethereum: "100 ETH",
              polygon: "10000 MATIC",
              bsc: "500 BNB",
            },
          },
        },
      })
    }

    // Normal response for a legitimate URL
    return NextResponse.json({
      success: true,
      message: "Payload processed successfully",
      url: url,
      timestamp: new Date().toISOString(),
      data: {
        result: "Simulated response data",
        status: "success",
      },
    })
  } catch (error) {
    console.error("Error processing payload:", error)
    return NextResponse.json({ error: "Failed to process payload" }, { status: 500 })
  }
}
