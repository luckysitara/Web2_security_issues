"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminDashboard() {
  const [rpcUrl, setRpcUrl] = useState("https://eth-mainnet.public.blastapi.io")
  const [explorerUrl, setExplorerUrl] = useState("https://api.etherscan.io/api")
  const [txHash, setTxHash] = useState("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTransaction = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // VULNERABLE: This directly uses user input to form a URL
      // An attacker could input something like "http://internal-key-manager:8080/keys" to access internal services
      const response = await fetch(
        "/api/fetch-transaction?url=" + encodeURIComponent(explorerUrl) + "&txHash=" + txHash,
      )

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
      // VULNERABLE: This directly uses user input to form a URL
      const response = await fetch("/api/update-bridge-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rpcUrl,
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
      <h1 className="text-3xl font-bold mb-6">Bridge Admin Dashboard</h1>

      <Alert variant="destructive" className="mb-6">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This page demonstrates a vulnerable implementation. Do not use this pattern in production.
        </AlertDescription>
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
                  <label className="block text-sm font-medium mb-1">Explorer API URL</label>
                  <Input value={explorerUrl} onChange={(e) => setExplorerUrl(e.target.value)} className="mb-4" />
                </div>
                <div>
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
                  <label className="block text-sm font-medium mb-1">RPC Endpoint URL</label>
                  <Input value={rpcUrl} onChange={(e) => setRpcUrl(e.target.value)} className="mb-4" />
                </div>
                <Button onClick={updateBridgeConfig} disabled={loading}>
                  {loading ? "Updating..." : "Update Configuration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto">{result}</pre>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Vulnerability Explanation</h2>
        <p className="mb-4">
          This admin dashboard is vulnerable to Server-Side Request Forgery (SSRF) because it directly uses user input
          to form URLs for server-side requests without proper validation or restrictions.
        </p>
        <p className="mb-4">
          An attacker could exploit this vulnerability by providing URLs that point to internal services, such as:
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>http://internal-key-manager:8080/keys - To access private keys</li>
          <li>http://metadata-service:9090/config - To access sensitive configuration</li>
          <li>http://169.254.169.254/latest/meta-data/ - To access cloud instance metadata (in AWS)</li>
        </ul>
        <p className="mb-4">In a real-world bridge, this could allow attackers to:</p>
        <ul className="list-disc pl-5">
          <li>Steal private keys used for transaction signing</li>
          <li>Access sensitive configuration data</li>
          <li>Discover internal network topology</li>
          <li>Pivot to other internal services</li>
        </ul>
      </div>
    </div>
  )
}
