"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

export default function BridgeRelayer() {
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
      // Simulate multiple rapid transfers to demonstrate the race condition
      const promises = []

      // Make 3 rapid transfer requests to demonstrate the race condition
      for (let i = 0; i < 3; i++) {
        promises.push(
          fetch("/api/vulnerable-bridge-transfer", {
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
      <h1 className="text-3xl font-bold mb-6">Vulnerable Bridge Relayer</h1>

      <Alert variant="destructive" className="mb-6">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This page demonstrates a vulnerable implementation. Do not use this pattern in production.
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
                This will simulate 3 rapid transfers to demonstrate the race condition
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
          <ExclamationTriangleIcon className="h-4 w-4" />
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
        <h2 className="text-2xl font-bold mb-4">Vulnerability Explanation</h2>
        <p className="mb-4">
          This implementation is vulnerable to race conditions because it doesn't properly handle concurrent
          transactions. When multiple transfers are processed simultaneously, the following happens:
        </p>
        <ol className="list-decimal pl-5 mb-4">
          <li className="mb-2">Each request reads the current bridge balance</li>
          <li className="mb-2">Each request verifies if there's enough liquidity for the transfer</li>
          <li className="mb-2">Each request subtracts the transfer amount from that balance</li>
          <li className="mb-2">Each request writes the new balance back</li>
        </ol>
        <p className="mb-4">
          If these operations happen concurrently, they can all read the same initial balance before any updates are
          written, leading to an incorrect final balance. This is a classic race condition.
        </p>
        <p>In a real-world bridge, this could allow an attacker to:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Withdraw more funds than are actually available</li>
          <li>Process the same transfer multiple times</li>
          <li>Create inconsistent state between the source and destination chains</li>
        </ul>
      </div>
    </div>
  )
}
