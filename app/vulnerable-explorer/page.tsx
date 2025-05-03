"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export default function VulnerableExplorer() {
  const [url, setUrl] = useState("https://api.blockchain.example/tx/")
  const [txHash, setTxHash] = useState("0x1234567890abcdef")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTransaction = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // VULNERABLE: This directly concatenates user input to form a URL
      // An attacker could input something like "../../internal-api/keys" to access internal endpoints
      // Fix: Ensure there's a proper separator between the URL and txHash
      const fullUrl = url.endsWith("/") ? url + txHash : url + "/" + txHash
      const response = await fetch("/api/vulnerable-fetch?url=" + encodeURIComponent(fullUrl))

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
      <h1 className="text-3xl font-bold mb-6">Vulnerable Blockchain Explorer</h1>

      <Alert variant="destructive" className="mb-6">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This page demonstrates a vulnerable implementation. Do not use this pattern in production.
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transaction Lookup</CardTitle>
          <CardDescription>Enter a transaction hash to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">API Endpoint</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} className="mb-4" />
            </div>
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
          <ExclamationTriangleIcon className="h-4 w-4" />
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
        <h2 className="text-2xl font-bold mb-4">Vulnerability Explanation</h2>
        <p className="mb-4">
          This implementation is vulnerable to SSRF because it directly concatenates user input to form the URL that
          will be fetched server-side. An attacker could modify the input to access internal services that should not be
          publicly accessible.
        </p>
        <p className="mb-4">For example, if the server making the request has access to internal services like:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>http://internal-node.blockchain:8545 - Private blockchain node</li>
          <li>http://key-management:7070/keys - Key management service</li>
          <li>http://metadata-service:9090/config - Internal configuration service</li>
        </ul>
        <p>
          An attacker could potentially access these by manipulating the input to something like:
          <code className="block bg-muted p-2 mt-2 rounded-md">http://internal-node.blockchain:8545/</code>
        </p>
      </div>
    </div>
  )
}
