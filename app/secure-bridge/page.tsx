"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useMobile } from "@/hooks/use-mobile"

export default function SecureBridge() {
  const { toast } = useToast()
  const isMobile = useMobile()
  const [activeTab, setActiveTab] = useState("transfer")
  const [sourceChain, setSourceChain] = useState("ethereum")
  const [destinationChain, setDestinationChain] = useState("polygon")
  const [amount, setAmount] = useState("100")
  const [recipient, setRecipient] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
  const [loading, setLoading] = useState(false)
  const [network, setNetwork] = useState("ethereum")
  const [txHash, setTxHash] = useState("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bridgeBalance, setBridgeBalance] = useState({
    ethereum: "10000",
    polygon: "5000",
    arbitrum: "3000",
    optimism: "2000",
  })
  const [progress, setProgress] = useState(0)

  // Simulate progress bar during loading
  useEffect(() => {
    if (loading) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 95) {
            clearInterval(timer)
            return prevProgress
          }
          return prevProgress + 5
        })
      }, 200)

      return () => {
        clearInterval(timer)
        setProgress(0)
      }
    }
  }, [loading])

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
      const newBalances = { ...bridgeBalance }
      newBalances[destinationChain] = results[results.length - 1].bridgeBalance.toString()
      setBridgeBalance(newBalances)

      // Show the results
      setResult(JSON.stringify(results, null, 2))

      toast({
        title: "Transfer Processed",
        description: `${amount} tokens transferred from ${sourceChain} to ${destinationChain}`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

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

      toast({
        title: "Transaction Fetched",
        description: "Transaction details retrieved successfully",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const chainIcons = {
    ethereum: "🔷",
    polygon: "🟣",
    arbitrum: "🔵",
    optimism: "🔴",
  }

  const chainNames = {
    ethereum: "Ethereum",
    polygon: "Polygon",
    arbitrum: "Arbitrum",
    optimism: "Optimism",
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Wormhole Bridge</h1>
              <p className="text-slate-600 mt-1">Transfer tokens across chains</p>
            </div>
            <Alert className="md:w-auto border-green-500 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Secure Implementation</AlertTitle>
              <AlertDescription>This page demonstrates security best practices.</AlertDescription>
            </Alert>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full md:w-[400px] mb-6">
            <TabsTrigger value="transfer">Transfer Tokens</TabsTrigger>
            <TabsTrigger value="explorer">Transaction Explorer</TabsTrigger>
          </TabsList>

          <TabsContent value="transfer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Cross-Chain Transfer</CardTitle>
                  <CardDescription>Send tokens from one chain to another</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Source Chain</Label>
                      <Select value={sourceChain} onValueChange={setSourceChain}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethereum">
                            <div className="flex items-center">
                              <span className="mr-2">{chainIcons.ethereum}</span> Ethereum
                            </div>
                          </SelectItem>
                          <SelectItem value="polygon">
                            <div className="flex items-center">
                              <span className="mr-2">{chainIcons.polygon}</span> Polygon
                            </div>
                          </SelectItem>
                          <SelectItem value="arbitrum">
                            <div className="flex items-center">
                              <span className="mr-2">{chainIcons.arbitrum}</span> Arbitrum
                            </div>
                          </SelectItem>
                          <SelectItem value="optimism">
                            <div className="flex items-center">
                              <span className="mr-2">{chainIcons.optimism}</span> Optimism
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Destination Chain</Label>
                      <Select value={destinationChain} onValueChange={setDestinationChain}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethereum">
                            <div className="flex items-center">
                              <span className="mr-2">{chainIcons.ethereum}</span> Ethereum
                            </div>
                          </SelectItem>
                          <SelectItem value="polygon">
                            <div className="flex items-center">
                              <span className="mr-2">{chainIcons.polygon}</span> Polygon
                            </div>
                          </SelectItem>
                          <SelectItem value="arbitrum">
                            <div className="flex items-center">
                              <span className="mr-2">{chainIcons.arbitrum}</span> Arbitrum
                            </div>
                          </SelectItem>
                          <SelectItem value="optimism">
                            <div className="flex items-center">
                              <span className="mr-2">{chainIcons.optimism}</span> Optimism
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pr-16"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-sm text-slate-500">USDC</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Recipient Address</Label>
                    <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-slate-500">
                      Bridge Fee: <span className="font-medium">0.1%</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      Estimated Time: <span className="font-medium">2-5 minutes</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    onClick={processTransfer}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        Transfer Tokens <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <div className="text-xs text-slate-500 text-center">
                    This will simulate 3 rapid transfers with proper concurrency control
                  </div>
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bridge Balances</CardTitle>
                    <CardDescription>Available liquidity on each chain</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(bridgeBalance).map(([chain, balance]) => (
                      <div key={chain} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">{chainIcons[chain as keyof typeof chainIcons]}</span>
                          <span>{chainNames[chain as keyof typeof chainNames]}</span>
                        </div>
                        <div className="font-medium">{balance} USDC</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transfer Details</CardTitle>
                    <CardDescription>Summary of your transaction</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sourceChain && destinationChain && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">{chainIcons[sourceChain as keyof typeof chainIcons]}</span>
                          <span>{chainNames[sourceChain as keyof typeof chainNames]}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                        <div className="flex items-center">
                          <span className="mr-2">{chainIcons[destinationChain as keyof typeof chainIcons]}</span>
                          <span>{chainNames[destinationChain as keyof typeof chainNames]}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Amount</span>
                      <span className="font-medium">{amount} USDC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Fee</span>
                      <span className="font-medium">{(Number(amount) * 0.001).toFixed(2)} USDC</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total</span>
                      <span className="font-medium">{(Number(amount) * 1.001).toFixed(2)} USDC</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {loading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processing transfer...</span>
                      <span className="text-sm text-slate-500">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
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
                  <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-xs">{result}</pre>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Security Measures</CardTitle>
                <CardDescription>Race condition prevention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>This implementation prevents race conditions through several security measures:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      <strong>Mutex Locking:</strong> A mutex lock ensures that only one transfer operation can modify
                      the bridge balance at a time
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      <strong>Atomic Operations:</strong> The read-modify-write cycle is performed as an atomic
                      operation
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      <strong>Transaction Isolation:</strong> Each transfer is processed in isolation from others
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                    <span>
                      <strong>Idempotent Operations:</strong> Transfer operations are designed to be idempotent,
                      ensuring that duplicate requests don't result in duplicate transfers
                    </span>
                  </li>
                </ul>
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-4">
                  <h4 className="font-medium text-green-800 mb-2">
                    In a real-world bridge, these principles would be implemented using:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-green-700">
                    <li>Database transactions with proper isolation levels</li>
                    <li>Distributed locks for cross-server consistency</li>
                    <li>Unique transaction identifiers to prevent duplicate processing</li>
                    <li>Queue-based processing for sequential operations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="explorer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Explorer</CardTitle>
                <CardDescription>Fetch transaction details from the blockchain explorer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Network</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">
                        <div className="flex items-center">
                          <span className="mr-2">{chainIcons.ethereum}</span> Ethereum
                        </div>
                      </SelectItem>
                      <SelectItem value="polygon">
                        <div className="flex items-center">
                          <span className="mr-2">{chainIcons.polygon}</span> Polygon
                        </div>
                      </SelectItem>
                      <SelectItem value="arbitrum">
                        <div className="flex items-center">
                          <span className="mr-2">{chainIcons.arbitrum}</span> Arbitrum
                        </div>
                      </SelectItem>
                      <SelectItem value="optimism">
                        <div className="flex items-center">
                          <span className="mr-2">{chainIcons.optimism}</span> Optimism
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Transaction Hash</Label>
                  <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x..." />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  onClick={fetchTransaction}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                    </>
                  ) : (
                    <>
                      Fetch Transaction <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {loading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Fetching transaction...</span>
                      <span className="text-sm text-slate-500">{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
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
                  <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-xs">{result}</pre>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Security Measures</CardTitle>
                <CardDescription>SSRF prevention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>This implementation prevents SSRF attacks through several security measures:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" />
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
