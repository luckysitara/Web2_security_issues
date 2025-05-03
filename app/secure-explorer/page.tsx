"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircledIcon } from "@radix-ui/react-icons"

export default function SecureExplorer() {
  const [txHash, setTxHash] = useState("0x1234567890abcdef")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTransaction = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // SECURE: This uses a fixed base URL and validates the transaction hash format
      const response = await fetch("/api/secure-fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txHash }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Secure Blockchain Explorer</h1>

      <Alert className="mb-6 border-green-500 bg-green-50 text-green-800">
        <CheckCircledIcon className="h-4 w-4" />
        <AlertTitle>Secure Implementation</AlertTitle>
        <AlertDescription>This page demonstrates a secure implementation that prevents SSRF attacks.</AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction Lookup</CardTitle>
          <CardDescription>Enter a transaction hash to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Transaction Hash</label>
              <Input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Enter transaction hash"
                className="mb-4"
              />
            </div>
            <Button onClick={fetchTransaction} disabled={loading}>
              {loading ? "Loading..." : "Fetch Transaction"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto">{result}</pre>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Security Measures</h2>
        <p className="mb-4">This implementation prevents SSRF attacks through several security measures:</p>
        <ul className="list-disc pl-5 mb-4">
          <li className="mb-2">
            <strong>Fixed Base URL:</strong> The API endpoint uses a hardcoded base URL instead of accepting it from
            user input
          </li>
          <li className="mb-2">
            <strong>Input Validation:</strong> The transaction hash is validated to ensure it matches the expected
            format
          </li>
          <li className="mb-2">
            <strong>Allowlisting:</strong> Only specific, pre-approved blockchain nodes can be accessed
          </li>
          <li className="mb-2">
            <strong>Network Segmentation:</strong> The server is configured to only access public blockchain nodes, not
            internal services
          </li>
        </ul>
      </div>
    </div>
  )
}
