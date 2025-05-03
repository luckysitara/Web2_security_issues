import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
  }

  try {
    // For demo purposes, we'll simulate a successful response instead of making an actual fetch
    // This avoids potential CORS issues or network problems in the demo environment
    console.log(`Would fetch from URL: ${url}`)

    // Extract the transaction hash from the URL for the simulated response
    const txHash = url.split("/").pop() || "unknown"

    // Return a simulated blockchain transaction response
    return NextResponse.json({
      hash: txHash,
      blockNumber: "14628961",
      from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      to: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      value: "0.5 ETH",
      gasUsed: "21000",
      timestamp: new Date().toISOString(),
      note: "This is a simulated response for demonstration purposes",
    })

    /* COMMENTED OUT: The actual fetch that was causing issues
    // VULNERABLE: This directly uses the URL provided in the request
    // An attacker could provide a URL pointing to internal services
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch data: ${response.status}` }, { status: response.status })
    }

    // For demo purposes, we'll simulate a successful response
    // In a real scenario, this would return the actual response from the URL
    return NextResponse.json({
      hash: url.split("/").pop(),
      blockNumber: "14628961",
      from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      to: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      value: "0.5 ETH",
      gasUsed: "21000",
      timestamp: new Date().toISOString(),
    })
    */
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Failed to fetch data from the provided URL" }, { status: 500 })
  }
}
