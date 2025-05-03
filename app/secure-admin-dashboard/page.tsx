"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircledIcon } from "@radix-ui/react-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SecureAdminDashboard() {
  const [network, setNetwork] = useState("ethereum")
  const [txHash, setTxHash] = useState("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTransaction = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // SECURE: This uses a pre-defined list of networks and validates the transaction hash
      const response = await fetch("/api/secure-fetch-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network,
          txHash,
        }),
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

  const updateBridgeConfig = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // SECURE: This uses a pre-defined list of networks rather than accepting arbitrary URLs
      const response = await fetch("/api/secure-update-bridge-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          network,
        }),
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
      <h1 className="text-3xl font-bold mb-6">Secure Bridge Admin Dashboard</h1>

      <Alert className="mb-6 border-green-500 bg-green-50 text-green-800">
        <CheckCircledIcon className="h-4 w-4" />
        <AlertTitle>Secure Implementation</AlertTitle>
        <AlertDescription>This page demonstrates a secure implementation that prevents SSRF attacks.</AlertDescription>
      </Alert>

      <Tabs defaultValue="explorer" className="mb-8">
        <TabsList>
          <TabsTrigger value="explorer">Transaction Explorer</TabsTrigger>
          <TabsTrigger value="config">Bridge Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="explorer">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Explorer</CardTitle>
              <CardDescription>Fetch transaction details from the blockchain explorer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Network</label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                      <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">Transaction Hash</label>
                  <Input
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="mb-4"
                  />
                </div>
                <Button onClick={fetchTransaction} disabled={loading}>
                  {loading ? "Loading..." : "Fetch Transaction"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Bridge Configuration</CardTitle>
              <CardDescription>Update bridge configuration settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Network</label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                      <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={updateBridgeConfig} disabled={loading} className="mt-4">
                  {loading ? "Updating..." : "Update Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
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
            <strong>Allowlisting Networks:</strong> Instead of accepting arbitrary URLs, the application uses a
            pre-defined list of supported networks
          </li>
          <li className="mb-2">
            <strong>Input Validation:</strong> Transaction hashes are validated to ensure they match the expected format
          </li>
          <li className="mb-2">
            <strong>Proxy Architecture:</strong> All external requests are routed through a dedicated proxy service that
            enforces security policies
          </li>
          <li className="mb-2">
            <strong>Network Segmentation:</strong> The server is configured to only access approved external services,
            not internal services
          </li>
        </ul>
      </div>
    </div>
  )
}
