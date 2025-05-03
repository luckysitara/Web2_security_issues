"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeftRight, ArrowRight, ChevronDown, RefreshCw, Shield, ShieldAlert } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Simulated token data
const tokens = [
  { id: "eth", name: "Ethereum", symbol: "ETH", balance: "1.45", icon: "🔷" },
  { id: "usdc", name: "USD Coin", symbol: "USDC", balance: "2500.00", icon: "💲" },
  { id: "sol", name: "Solana", symbol: "SOL", balance: "35.75", icon: "🟣" },
  { id: "avax", name: "Avalanche", symbol: "AVAX", balance: "78.32", icon: "🔺" },
]

// Simulated chain data
const chains = [
  { id: "ethereum", name: "Ethereum", icon: "🔷", domain: 1 },
  { id: "solana", name: "Solana", icon: "🟣", domain: 2 },
  { id: "avalanche", name: "Avalanche", icon: "🔺", domain: 3 },
  { id: "polygon", name: "Polygon", icon: "🟪", domain: 4 },
]

export default function WormholeBridge() {
  const [sourceChain, setSourceChain] = useState(chains[0])
  const [targetChain, setTargetChain] = useState(chains[1])
  const [selectedToken, setSelectedToken] = useState(tokens[0])
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showVulnerabilityInfo, setShowVulnerabilityInfo] = useState(false)
  const [transactionHistory, setTransactionHistory] = useState([])
  const [activeTab, setActiveTab] = useState("bridge")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customPayload, setCustomPayload] = useState("")
  const [gasLimit, setGasLimit] = useState("300000")
  const [relayerFee, setRelayerFee] = useState("0.01")

  // Simulate fetching transaction history
  useEffect(() => {
    const mockHistory = [
      {
        id: "tx1",
        sourceChain: "Ethereum",
        targetChain: "Solana",
        token: "USDC",
        amount: "500",
        status: "completed",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "tx2",
        sourceChain: "Avalanche",
        targetChain: "Ethereum",
        token: "AVAX",
        amount: "10.5",
        status: "pending",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "tx3",
        sourceChain: "Solana",
        targetChain: "Polygon",
        token: "SOL",
        amount: "15",
        status: "failed",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
    ]
    setTransactionHistory(mockHistory)
  }, [])

  const handleSwapChains = () => {
    const temp = sourceChain
    setSourceChain(targetChain)
    setTargetChain(temp)
  }

  const handleMaxAmount = () => {
    const token = tokens.find((t) => t.id === selectedToken.id)
    setAmount(token.balance)
  }

  const handleBridgeSubmit = async () => {
    if (!amount || !recipient) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call with vulnerability
      const response = await fetch("/api/wormhole-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceChain: sourceChain.id,
          targetChain: targetChain.id,
          token: selectedToken.id,
          amount,
          recipient,
          payload: customPayload,
          gasLimit,
          relayerFee,
        }),
      })

      if (!response.ok) {
        throw new Error("Bridge transfer failed")
      }

      const data = await response.json()

      // Add to transaction history
      setTransactionHistory([
        {
          id: `tx${Math.random().toString(36).substring(7)}`,
          sourceChain: sourceChain.name,
          targetChain: targetChain.name,
          token: selectedToken.symbol,
          amount,
          status: "pending",
          timestamp: new Date().toISOString(),
        },
        ...transactionHistory,
      ])

      toast({
        title: "Transfer Initiated",
        description: `Bridging ${amount} ${selectedToken.symbol} from ${sourceChain.name} to ${targetChain.name}`,
      })
    } catch (error) {
      console.error("Bridge error:", error)
      toast({
        title: "Bridge Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold">Wormhole Bridge</CardTitle>
                  <CardDescription className="text-gray-100">Transfer tokens across chains securely</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={() => setShowVulnerabilityInfo(true)}
                      >
                        <ShieldAlert className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View vulnerability information</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="bridge">Bridge</TabsTrigger>
                  <TabsTrigger value="history">Transaction History</TabsTrigger>
                </TabsList>
                <TabsContent value="bridge">
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-full md:w-5/12">
                        <Label htmlFor="sourceChain">Source Chain</Label>
                        <Select
                          value={sourceChain.id}
                          onValueChange={(value) => {
                            const chain = chains.find((c) => c.id === value)
                            setSourceChain(chain)
                          }}
                        >
                          <SelectTrigger id="sourceChain" className="w-full">
                            <SelectValue placeholder="Select source chain">
                              <div className="flex items-center gap-2">
                                <span>{sourceChain.icon}</span>
                                <span>{sourceChain.name}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {chains.map((chain) => (
                              <SelectItem key={chain.id} value={chain.id}>
                                <div className="flex items-center gap-2">
                                  <span>{chain.icon}</span>
                                  <span>{chain.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSwapChains}
                          className="rounded-full bg-gray-100 hover:bg-gray-200 h-10 w-10"
                        >
                          <ArrowLeftRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="w-full md:w-5/12">
                        <Label htmlFor="targetChain">Target Chain</Label>
                        <Select
                          value={targetChain.id}
                          onValueChange={(value) => {
                            const chain = chains.find((c) => c.id === value)
                            setTargetChain(chain)
                          }}
                        >
                          <SelectTrigger id="targetChain" className="w-full">
                            <SelectValue placeholder="Select target chain">
                              <div className="flex items-center gap-2">
                                <span>{targetChain.icon}</span>
                                <span>{targetChain.name}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {chains.map((chain) => (
                              <SelectItem key={chain.id} value={chain.id}>
                                <div className="flex items-center gap-2">
                                  <span>{chain.icon}</span>
                                  <span>{chain.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="token">Token</Label>
                      <Select
                        value={selectedToken.id}
                        onValueChange={(value) => {
                          const token = tokens.find((t) => t.id === value)
                          setSelectedToken(token)
                        }}
                      >
                        <SelectTrigger id="token" className="w-full">
                          <SelectValue placeholder="Select token">
                            <div className="flex items-center gap-2">
                              <span>{selectedToken.icon}</span>
                              <span>
                                {selectedToken.name} ({selectedToken.symbol})
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {tokens.map((token) => (
                            <SelectItem key={token.id} value={token.id}>
                              <div className="flex items-center gap-2">
                                <span>{token.icon}</span>
                                <span>
                                  {token.name} ({token.symbol})
                                </span>
                                <span className="ml-auto text-gray-500">Balance: {token.balance}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="amount">Amount</Label>
                        <div className="text-sm text-gray-500">
                          Balance: {selectedToken.balance} {selectedToken.symbol}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          id="amount"
                          type="text"
                          placeholder="0.0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" onClick={handleMaxAmount} className="whitespace-nowrap">
                          MAX
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        type="text"
                        placeholder="Enter recipient address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1"
                      >
                        Advanced Options
                        <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                      </Button>

                      <div className="text-sm text-gray-500">Estimated Fee: {relayerFee} ETH</div>
                    </div>

                    {showAdvanced && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="customPayload">Custom Payload (Hex)</Label>
                          <Input
                            id="customPayload"
                            type="text"
                            placeholder="0x..."
                            value={customPayload}
                            onChange={(e) => setCustomPayload(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Optional: Add custom data to be sent with the transfer
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="gasLimit">Gas Limit</Label>
                          <Input
                            id="gasLimit"
                            type="text"
                            value={gasLimit}
                            onChange={(e) => setGasLimit(e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor="relayerFee">Relayer Fee (ETH)</Label>
                          <Input
                            id="relayerFee"
                            type="text"
                            value={relayerFee}
                            onChange={(e) => setRelayerFee(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="space-y-4">
                    {transactionHistory.length > 0 ? (
                      transactionHistory.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                          <div>
                            <div className="font-medium">
                              {tx.amount} {tx.token}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tx.sourceChain} → {tx.targetChain}
                            </div>
                            <div className="text-xs text-gray-400">{formatDate(tx.timestamp)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(tx.status)}
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No transaction history found</div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
                onClick={handleBridgeSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Bridge Tokens"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="w-full md:w-1/3 space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl">Bridge Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Wormhole Token Bridge</h3>
                <p className="text-sm text-gray-600">
                  Wormhole's Token Bridge enables seamless cross-chain token transfers using a lock-and-mint mechanism.
                  The bridge locks tokens on the source chain and mints them as wrapped assets on the destination chain.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Supported Chains</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {chains.map((chain) => (
                    <div key={chain.id} className="flex items-center gap-2 text-sm">
                      <span>{chain.icon}</span>
                      <span>{chain.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Transfer Times</h3>
                <div className="text-sm text-gray-600 mt-2">
                  <p>• Ethereum: ~15 minutes</p>
                  <p>• Solana: ~2 minutes</p>
                  <p>• Avalanche: ~5 minutes</p>
                  <p>• Polygon: ~7 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                This is a demonstration environment showcasing potential vulnerabilities in cross-chain bridges. Do not
                use real funds or sensitive information.
              </p>
              <Button
                variant="outline"
                className="mt-4 w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                onClick={() => setShowVulnerabilityInfo(true)}
              >
                View Vulnerability Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showVulnerabilityInfo} onOpenChange={setShowVulnerabilityInfo}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              Web2 Security Vulnerabilities in Cross-Chain Bridges
            </DialogTitle>
            <DialogDescription>Understanding common vulnerabilities in token bridge implementations</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <h3 className="text-lg font-medium">Server-Side Request Forgery (SSRF)</h3>
              <p className="mt-2 text-gray-700">
                In the context of cross-chain token bridges, SSRF vulnerabilities can allow attackers to manipulate
                bridge relayers or oracles to make unauthorized internal requests. This can lead to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Unauthorized access to internal APIs that verify transaction signatures</li>
                <li>Manipulation of token price feeds used for determining exchange rates</li>
                <li>Access to private bridge configuration data including validator keys</li>
                <li>Bypassing security controls by routing requests through trusted internal services</li>
              </ul>
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  <strong>Vulnerability in this demo:</strong> The bridge relayer accepts unvalidated URLs in the
                  payload that are used to fetch transaction data, allowing attackers to target internal services.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Race Conditions</h3>
              <p className="mt-2 text-gray-700">
                Race conditions in token bridges can occur when multiple transactions are processed concurrently without
                proper synchronization, leading to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Double-spending attacks where tokens are minted multiple times on the destination chain</li>
                <li>Inconsistent state between chains when multiple transfers are processed out of order</li>
                <li>Replay attacks where the same transaction is submitted multiple times</li>
                <li>Exploitation of time gaps between verification and execution of cross-chain messages</li>
              </ul>
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  <strong>Vulnerability in this demo:</strong> The bridge implementation doesn't properly lock or
                  synchronize the processing of messages with the same nonce, allowing multiple redemptions of the same
                  transfer.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Input Validation Vulnerabilities</h3>
              <p className="mt-2 text-gray-700">
                Improper input validation in bridge interfaces can lead to various attacks:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Injection attacks in custom payloads that can manipulate bridge logic</li>
                <li>Parameter manipulation to bypass security checks or fee calculations</li>
                <li>Malformed addresses that can cause tokens to be locked permanently</li>
                <li>Integer overflow/underflow in amount calculations leading to unauthorized minting</li>
              </ul>
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  <strong>Vulnerability in this demo:</strong> The bridge accepts arbitrary payload data without proper
                  validation, allowing injection of malicious data that can be executed when the payload is processed.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium">Mitigation Strategies</h3>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>
                  <strong>For SSRF:</strong> Implement strict URL validation, allowlists for external services, and use
                  dedicated proxies for external requests
                </li>
                <li>
                  <strong>For Race Conditions:</strong> Implement proper locking mechanisms, use atomic transactions,
                  and maintain a global state of processed message IDs
                </li>
                <li>
                  <strong>For Input Validation:</strong> Implement comprehensive validation for all user inputs, use
                  strong typing, and sanitize all data before processing
                </li>
                <li>
                  <strong>General Security:</strong> Regular security audits, rate limiting, monitoring for unusual
                  patterns, and implementing circuit breakers
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowVulnerabilityInfo(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
