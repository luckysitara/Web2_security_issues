"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircledIcon } from "@radix-ui/react-icons"

export default function SecureBridgeRelayer() {
  const [amount, setAmount] = useState("100")
  const [recipient, setRecipient] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
  const [sourceChain, setSourceChain] = useState("Ethereum")
  const [destinationChain, setDestinationChain] = useState("Polygon")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bridgeBalance, setBridgeBalance] = useState("10000")

  const processTransfer = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Simulate multiple rapid transfers to demonstrate the secure handling
      const promises = []

      // Make 3 rapid transfer requests
      for (let i = 0; i < 3; i++) {
        promises.push(
          fetch("/api/secure-bridge-transfer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: Number.parseFloat(amount),
              recipient,
              sourceChain,
              destinationChain,
            }),
          }),
        )
      }

      const responses = await Promise.all(promises)
      const results = await Promise.all(responses.map((r) => r.json()))

      // Update the bridge balance based on the last response
      setBridgeBalance(results[results.length - 1].bridgeBalance.toString())

      // Show the results
      setResult(JSON.stringify(results, null, 2))
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Secure Bridge Relayer</h1>

      <Alert className="mb-6 border-green-500 bg-green-50 text-green-800">
        <CheckCircledIcon className="h-4 w-4" />
        <AlertTitle>Secure Implementation</AlertTitle>
        <AlertDescription>
          This page demonstrates a secure implementation that prevents race conditions.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Cross-Chain Transfer</CardTitle>
            <CardDescription>Transfer tokens across chains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Source Chain</label>
                  <Input value={sourceChain} onChange={(e) => setSourceChain(e.target.value)} className="mb-4" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Destination Chain</label>
                  <Input
                    value={destinationChain}
                    onChange={(e) => setDestinationChain(e.target.value)}
                    className="mb-4"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mb-4" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Recipient Address</label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="0x..."
                  className="mb-4"
                />
              </div>
              <Button onClick={processTransfer} disabled={loading}>
                {loading ? "Processing..." : "Process Transfer (3x)"}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                This will simulate 3 rapid transfers with proper concurrency control
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bridge Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bridgeBalance} TOKENS</div>
            <p className="text-sm text-muted-foreground mt-2">Available liquidity on destination chain</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto">{result}</pre>
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Security Measures</h2>
        <p className="mb-4">This implementation prevents race conditions through several security measures:</p>
        <ul className="list-disc pl-5 mb-4">
          <li className="mb-2">
            <strong>Mutex Locking:</strong> A mutex lock ensures that only one transfer operation can modify the bridge
            balance at a time
          </li>
          <li className="mb-2">
            <strong>Atomic Operations:</strong> The read-modify-write cycle is performed as an atomic operation
          </li>
          <li className="mb-2">
            <strong>Transaction Isolation:</strong> Each transfer is processed in isolation from others
          </li>
          <li className="mb-2">
            <strong>Idempotent Operations:</strong> Transfer operations are designed to be idempotent, ensuring that
            duplicate requests don't result in duplicate transfers
          </li>
        </ul>
        <p className="mb-4">In a real-world bridge, these principles would be implemented using:</p>
        <ul className="list-disc pl-5">
          <li>Database transactions with proper isolation levels</li>
          <li>Distributed locks for cross-server consistency</li>
          <li>Unique transaction identifiers to prevent duplicate processing</li>
          <li>Queue-based processing for sequential operations</li>
        </ul>
      </div>
    </div>
  )
}
