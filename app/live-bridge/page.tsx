"use client"

// Add a type declaration for window.ethereum at the top of the file
declare global {
  interface Window {
    ethereum?: any
  }
}

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, ArrowLeftRight, ChevronDown, ExternalLink, Loader2, Shield, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"

// Wormhole Token Bridge ABI (simplified for the essential functions)
const TOKEN_BRIDGE_ABI = [
  "function transferTokens(address token, uint256 amount, uint16 recipientChain, bytes32 recipient, uint256 arbiterFee, uint32 nonce) external payable returns (uint64 sequence)",
  "function wrapAndTransferETH(uint16 recipientChain, bytes32 recipient, uint256 arbiterFee, uint32 nonce) external payable returns (uint64 sequence)",
  "function transferTokensWithPayload(address token, uint256 amount, uint16 recipientChain, bytes32 recipient, uint32 nonce, bytes memory payload) external payable returns (uint64 sequence)",
  "function completeTransfer(bytes memory encodedVm) external",
  "function completeTransferWithPayload(bytes memory encodedVm) external returns (bytes memory)",
  "function isTransferCompleted(bytes32 hash) external view returns (bool)",
]

// ERC20 ABI for token approvals
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
]

// Wormhole testnet chain configurations
const TESTNET_CHAINS = [
  {
    id: "ethereum-goerli",
    name: "Ethereum Goerli",
    icon: "🔷",
    chainId: 5,
    wormholeChainId: 2,
    tokenBridge: "0xF890982f9310df57d00f659cf4fd87e65adEd8d7",
    coreBridge: "0x706abc4E45D419950511e474C7B9Ed348A4a716c",
    rpc: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    blockExplorer: "https://goerli.etherscan.io",
    nativeCurrency: {
      name: "Goerli ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: "bsc-testnet",
    name: "BSC Testnet",
    icon: "🟡",
    chainId: 97,
    wormholeChainId: 4,
    tokenBridge: "0x9dcF9D205C9De35334D646BeE44b2D2859712A09",
    coreBridge: "0x68605AD7b15c732a30b1BbC62BE8F2A509D74b4D",
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545",
    blockExplorer: "https://testnet.bscscan.com",
    nativeCurrency: {
      name: "Binance Coin",
      symbol: "BNB",
      decimals: 18,
    },
  },
  {
    id: "polygon-mumbai",
    name: "Polygon Mumbai",
    icon: "🟣",
    chainId: 80001,
    wormholeChainId: 5,
    tokenBridge: "0x377D55a7928c046E18eEbb61977e714d2a76472a",
    coreBridge: "0x0CBE91CF822c73C2315FB05100C2F714765d5c20",
    rpc: "https://rpc-mumbai.maticvigil.com",
    blockExplorer: "https://mumbai.polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  {
    id: "avalanche-fuji",
    name: "Avalanche Fuji",
    icon: "🔺",
    chainId: 43113,
    wormholeChainId: 6,
    tokenBridge: "0x61E44E506Ca5659E6c0bba9b678586fA2d729756",
    coreBridge: "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://testnet.snowtrace.io",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
  },
]

// Sample testnet tokens for each chain
const TESTNET_TOKENS = {
  "ethereum-goerli": [
    {
      address: "native",
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
      icon: "🔷",
      isNative: true,
    },
    {
      address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      icon: "🔷",
      isNative: false,
    },
    {
      address: "0x07865c6e87b9f70255377e024ace6630c1eaa37f",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      icon: "💲",
      isNative: false,
    },
  ],
  "bsc-testnet": [
    {
      address: "native",
      symbol: "BNB",
      name: "Binance Coin",
      decimals: 18,
      icon: "🟡",
      isNative: true,
    },
    {
      address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
      symbol: "WBNB",
      name: "Wrapped BNB",
      decimals: 18,
      icon: "🟡",
      isNative: false,
    },
    {
      address: "0x64544969ed7EBf5f083679233325356EbE738930",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      icon: "💲",
      isNative: false,
    },
  ],
  "polygon-mumbai": [
    {
      address: "native",
      symbol: "MATIC",
      name: "Matic",
      decimals: 18,
      icon: "🟣",
      isNative: true,
    },
    {
      address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
      symbol: "WMATIC",
      name: "Wrapped MATIC",
      decimals: 18,
      icon: "🟣",
      isNative: false,
    },
    {
      address: "0x0FA8781a83E46826621b3BC094Ea2A0212e71B23",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      icon: "💲",
      isNative: false,
    },
  ],
  "avalanche-fuji": [
    {
      address: "native",
      symbol: "AVAX",
      name: "Avalanche",
      decimals: 18,
      icon: "🔺",
      isNative: true,
    },
    {
      address: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
      symbol: "WAVAX",
      name: "Wrapped AVAX",
      decimals: 18,
      icon: "🔺",
      isNative: false,
    },
    {
      address: "0x5425890298aed601595a70AB815c96711a31Bc65",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      icon: "💲",
      isNative: false,
    },
  ],
}

// Transaction status types
type TransactionStatus = "pending" | "completed" | "failed"

// Transaction history item type
interface TransactionHistoryItem {
  id: string
  sourceChain: string
  targetChain: string
  token: string
  amount: string
  recipient: string
  status: TransactionStatus
  timestamp: string
  txHash?: string
  explorerUrl?: string
}

export default function LiveBridge() {
  // State for chain and token selection
  const [sourceChain, setSourceChain] = useState(TESTNET_CHAINS[0])
  const [targetChain, setTargetChain] = useState(TESTNET_CHAINS[1])
  const [selectedToken, setSelectedToken] = useState(TESTNET_TOKENS["ethereum-goerli"][0])
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [showSecurityInfo, setShowSecurityInfo] = useState(false)
  const [showVulnerabilityInfo, setShowVulnerabilityInfo] = useState(false)
  const [activeTab, setActiveTab] = useState("bridge")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [gasLimit, setGasLimit] = useState("300000")
  const [relayerFee, setRelayerFee] = useState("0.01")
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")

  // Wallet connection state
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [walletChainId, setWalletChainId] = useState(0)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  // Token balances
  const [tokenBalance, setTokenBalance] = useState("0")

  // Transaction history
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistoryItem[]>([])

  // Explorer state
  const [explorerUrl, setExplorerUrl] = useState("https://api.etherscan.io/api")
  const [txHash, setTxHash] = useState("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
  const [explorerResult, setExplorerResult] = useState<string | null>(null)
  const [explorerError, setExplorerError] = useState<string | null>(null)

  // Vulnerability toggles
  const [enableSSRF, setEnableSSRF] = useState(false)
  const [enableRaceCondition, setEnableRaceCondition] = useState(false)
  const [customPayload, setCustomPayload] = useState("")

  // Effect to check if wallet is already connected
  useEffect(() => {
    checkWalletConnection()

    // Load transaction history from localStorage
    const savedHistory = localStorage.getItem("wormhole-tx-history")
    if (savedHistory) {
      try {
        setTransactionHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse transaction history:", e)
      }
    }
  }, [])

  // Effect to update tokens when source chain changes
  useEffect(() => {
    if (sourceChain) {
      setSelectedToken(TESTNET_TOKENS[sourceChain.id][0])
    }
  }, [sourceChain])

  // Effect to update token balance when wallet, chain, or token changes
  useEffect(() => {
    if (isWalletConnected && provider && walletAddress && selectedToken) {
      fetchTokenBalance()
    }
  }, [isWalletConnected, provider, walletAddress, selectedToken, walletChainId])

  // Effect to save transaction history to localStorage
  useEffect(() => {
    if (transactionHistory.length > 0) {
      localStorage.setItem("wormhole-tx-history", JSON.stringify(transactionHistory))
    }
  }, [transactionHistory])

  // Fetch token balance
  const fetchTokenBalance = async () => {
    if (!provider || !walletAddress || !selectedToken) return

    try {
      if (selectedToken.isNative) {
        // For native token (ETH, BNB, etc.)
        const balance = await provider.getBalance(walletAddress)
        setTokenBalance(ethers.utils.formatUnits(balance, selectedToken.decimals))
      } else {
        // For ERC20 tokens
        const tokenContract = new ethers.Contract(selectedToken.address, ERC20_ABI, provider)
        const balance = await tokenContract.balanceOf(walletAddress)
        setTokenBalance(ethers.utils.formatUnits(balance, selectedToken.decimals))
      }
    } catch (error) {
      console.error("Error fetching token balance:", error)
      setTokenBalance("0")
    }
  }

  // Check if wallet is connected
  const checkWalletConnection = async () => {
    // Check if window is defined (we're in the browser)
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Check if already connected
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(web3Provider)

        const accounts = await web3Provider.listAccounts()
        if (accounts.length > 0) {
          const web3Signer = web3Provider.getSigner()
          setSigner(web3Signer)

          setWalletAddress(accounts[0])
          setIsWalletConnected(true)

          // Get current chain ID
          const network = await web3Provider.getNetwork()
          setWalletChainId(network.chainId)

          // Setup event listeners
          setupWalletEventListeners()
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  // Setup wallet event listeners
  const setupWalletEventListeners = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      // Remove any existing listeners to prevent duplicates
      window.ethereum.removeAllListeners("accountsChanged")
      window.ethereum.removeAllListeners("chainChanged")

      // Add new listeners
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setIsWalletConnected(true)

          // Update signer
          if (provider) {
            setSigner(provider.getSigner())
          }

          toast({
            title: "Account Changed",
            description: `Connected to ${shortenAddress(accounts[0])}`,
          })
        } else {
          setWalletAddress("")
          setIsWalletConnected(false)
          setSigner(null)

          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected",
          })
        }
      })

      window.ethereum.on("chainChanged", (chainIdHex: string) => {
        const newChainId = Number.parseInt(chainIdHex, 16)
        setWalletChainId(newChainId)

        // Update provider and signer
        if (window.ethereum) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
          setProvider(web3Provider)
          setSigner(web3Provider.getSigner())

          const chainName = TESTNET_CHAINS.find((c) => c.chainId === newChainId)?.name || "Unknown Network"
          toast({
            title: "Network Changed",
            description: `Switched to ${chainName}`,
          })
        }
      })
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window === "undefined") {
      toast({
        title: "Browser Error",
        description: "Cannot connect wallet in server-side rendering",
        variant: "destructive",
      })
      return
    }

    if (!window.ethereum) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Ethereum wallet",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      setCurrentStep("Connecting wallet...")

      // Request accounts explicitly
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from wallet")
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      const web3Signer = web3Provider.getSigner()
      const address = accounts[0]

      setProvider(web3Provider)
      setSigner(web3Signer)
      setWalletAddress(address)
      setIsWalletConnected(true)

      // Get current chain ID
      const network = await web3Provider.getNetwork()
      setWalletChainId(network.chainId)

      // Setup event listeners
      setupWalletEventListeners()

      toast({
        title: "Wallet Connected",
        description: `Connected to ${shortenAddress(address)}`,
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection Failed",
        description:
          error instanceof Error ? error.message : "Failed to connect wallet. Please make sure MetaMask is unlocked.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setCurrentStep("")
      setShowWalletModal(false)
    }
  }

  // Switch network
  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) return

    try {
      setIsLoading(true)
      setCurrentStep("Switching network...")

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })

      // Update provider and signer after network switch
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(web3Provider)
      setSigner(web3Provider.getSigner())

      // Get current chain ID
      const network = await web3Provider.getNetwork()
      setWalletChainId(network.chainId)

      toast({
        title: "Network Switched",
        description: `Switched to ${TESTNET_CHAINS.find((c) => c.chainId === chainId)?.name || "new network"}`,
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const chain = TESTNET_CHAINS.find((c) => c.chainId === chainId)
          if (!chain) throw new Error("Unknown chain")

          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: chain.name,
                rpcUrls: [chain.rpc],
                nativeCurrency: chain.nativeCurrency,
                blockExplorerUrls: [chain.blockExplorer],
              },
            ],
          })

          // Try switching again after adding
          await switchNetwork(chainId)
        } catch (addError: any) {
          console.error("Error adding chain:", addError)
          toast({
            title: "Failed to Add Network",
            description: addError.message,
            variant: "destructive",
          })
        }
      } else {
        console.error("Error switching chain:", switchError)
        toast({
          title: "Failed to Switch Network",
          description: switchError.message,
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
      setCurrentStep("")
    }
  }

  // Handle swap chains
  const handleSwapChains = () => {
    const temp = sourceChain
    setSourceChain(targetChain)
    setTargetChain(temp)
  }

  // Handle max amount
  const handleMaxAmount = async () => {
    if (!isWalletConnected || !provider) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    try {
      if (selectedToken.isNative) {
        // For native token, get balance minus gas buffer
        const balance = await provider.getBalance(walletAddress)
        const balanceInEth = Number.parseFloat(ethers.utils.formatUnits(balance, selectedToken.decimals))
        const gasBuffer = 0.01 // Leave some for gas
        const maxAmount = Math.max(0, balanceInEth - gasBuffer).toFixed(6)
        setAmount(maxAmount)
      } else {
        // For ERC20 tokens
        const tokenContract = new ethers.Contract(selectedToken.address, ERC20_ABI, provider)
        const balance = await tokenContract.balanceOf(walletAddress)
        const formattedBalance = ethers.utils.formatUnits(balance, selectedToken.decimals)
        setAmount(formattedBalance)
      }
    } catch (error) {
      console.error("Error getting balance:", error)
      toast({
        title: "Failed to Get Balance",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  // Convert address to bytes32 format for Wormhole
  const addressToBytes32 = (address: string): string => {
    return "0x" + "000000000000000000000000" + address.slice(2)
  }

  // Fetch transaction from explorer (SSRF vulnerability)
  const fetchTransaction = async () => {
    setIsLoading(true)
    setExplorerError(null)
    setExplorerResult(null)

    try {
      // VULNERABLE: This directly uses user input to form a URL when enableSSRF is true
      // An attacker could input something like "http://internal-key-manager:8080/keys" to access internal services
      const response = await fetch(
        "/api/fetch-transaction?url=" +
          encodeURIComponent(explorerUrl) +
          "&txHash=" +
          txHash +
          "&vulnerable=" +
          enableSSRF,
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setExplorerResult(JSON.stringify(data, null, 2))

      toast({
        title: "Transaction Fetched",
        description: "Transaction details retrieved successfully",
      })
    } catch (err) {
      setExplorerError((err as Error).message || "An unknown error occurred")
      toast({
        variant: "destructive",
        title: "Fetch Failed",
        description: (err as Error).message || "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle bridge submit
  const handleBridgeSubmit = async () => {
    if (!isWalletConnected) {
      setShowWalletModal(true)
      return
    }

    if (!amount || !recipient) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!ethers.utils.isAddress(recipient)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid recipient address",
        variant: "destructive",
      })
      return
    }

    // Check if wallet is on the correct network
    if (walletChainId !== sourceChain.chainId) {
      toast({
        title: "Wrong Network",
        description: `Please switch to ${sourceChain.name} to continue`,
        variant: "destructive",
      })

      // Ask to switch network
      const shouldSwitch = confirm(`Switch to ${sourceChain.name}?`)
      if (shouldSwitch) {
        await switchNetwork(sourceChain.chainId)
        return
      } else {
        return
      }
    }

    if (!signer || !provider) {
      toast({
        title: "Wallet Error",
        description: "Please reconnect your wallet",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setProgress(10)

    try {
      // If race condition vulnerability is enabled, simulate multiple transfers
      if (enableRaceCondition) {
        setCurrentStep("Initiating multiple transfers (race condition demo)...")

        // Make multiple API calls to demonstrate race condition
        const promises = []
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
                sourceChain: sourceChain.id,
                destinationChain: targetChain.id,
                customPayload,
              }),
            }),
          )
        }

        setProgress(50)
        const responses = await Promise.all(promises)
        const results = await Promise.all(responses.map((r) => r.json()))

        setProgress(90)

        // Add to transaction history
        const newTx: TransactionHistoryItem = {
          id: `tx-${Date.now()}`,
          sourceChain: sourceChain.name,
          targetChain: targetChain.name,
          token: selectedToken.symbol,
          amount,
          recipient: shortenAddress(recipient),
          status: "pending",
          timestamp: new Date().toISOString(),
          txHash: results[0].transactionId,
        }

        setTransactionHistory([newTx, ...transactionHistory])

        setProgress(100)
        setCurrentStep("Race condition demonstration complete!")

        toast({
          title: "Race Condition Demonstrated",
          description: `Initiated ${promises.length} concurrent transfers to demonstrate race condition vulnerability`,
        })

        // Switch to history tab
        setActiveTab("history")
        return
      }

      // Normal bridge flow with real wallet
      // Create token bridge contract instance
      const tokenBridgeContract = new ethers.Contract(sourceChain.tokenBridge, TOKEN_BRIDGE_ABI, signer)

      // Generate a random nonce
      const nonce = Math.floor(Math.random() * 1000000)

      // Convert recipient address to bytes32 format
      const recipientBytes32 = addressToBytes32(recipient)

      // Convert amount to proper units
      const parsedAmount = ethers.utils.parseUnits(amount, selectedToken.decimals)

      // Arbiter fee (usually 0)
      const arbiterFee = ethers.BigNumber.from(0)

      let tx
      setCurrentStep("Preparing transaction...")
      setProgress(20)

      // SSRF Vulnerability: If enabled and custom payload contains a URL, send it to the backend
      if (enableSSRF && customPayload && customPayload.includes("http")) {
        setCurrentStep("Processing custom payload (SSRF demo)...")

        try {
          const ssrfResponse = await fetch("/api/process-payload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: customPayload,
              vulnerable: true,
            }),
          })

          if (!ssrfResponse.ok) {
            console.error("SSRF payload processing failed:", await ssrfResponse.text())
          } else {
            const ssrfResult = await ssrfResponse.json()
            console.log("SSRF payload result:", ssrfResult)

            toast({
              title: "SSRF Vulnerability Demonstrated",
              description: "Custom payload with URL was processed, potentially exposing internal services",
              variant: "destructive",
            })
          }
        } catch (ssrfError) {
          console.error("SSRF demonstration error:", ssrfError)
        }
      }

      if (selectedToken.isNative) {
        // For native tokens (ETH, BNB, etc.)
        setCurrentStep("Initiating native token transfer...")

        // Calculate the total amount to send (amount + fee)
        const totalAmount = parsedAmount

        // Call wrapAndTransferETH
        tx = await tokenBridgeContract.wrapAndTransferETH(
          targetChain.wormholeChainId,
          recipientBytes32,
          arbiterFee,
          nonce,
          { value: totalAmount },
        )
      } else {
        // For ERC20 tokens
        setCurrentStep("Checking token allowance...")
        setProgress(30)

        // Check if we need to approve the token first
        const tokenContract = new ethers.Contract(selectedToken.address, ERC20_ABI, signer)
        const allowance = await tokenContract.allowance(walletAddress, sourceChain.tokenBridge)

        if (allowance.lt(parsedAmount)) {  sourceChain.tokenBridge)
\
        if (allowance.lt(parsedAmount)) {
          setCurrentStep("Approving token transfer...")
          setProgress(40)

          // Approve the token bridge to spend tokens
          const approveTx = await tokenContract.approve(sourceChain.tokenBridge, parsedAmount)

          // Wait for approval to be mined
          setCurrentStep("Waiting for approval confirmation...")
          await approveTx.wait()
          setProgress(60)
        }

        setCurrentStep("Initiating token transfer...")
        setProgress(70)

        // Call transferTokens
        tx = await tokenBridgeContract.transferTokens(
          selectedToken.address,
          parsedAmount,
          targetChain.wormholeChainId,
          recipientBytes32,
          arbiterFee,
          nonce,
        )
      }

      setCurrentStep("Confirming transaction...")
      setProgress(80)

      // Wait for transaction to be mined
      const receipt = await tx.wait()
      setProgress(90)

      // Create explorer URL
      const explorerUrl = `${sourceChain.blockExplorer}/tx/${receipt.transactionHash}`

      // Add to transaction history
      const newTx: TransactionHistoryItem = {
        id: `tx-${Date.now()}`,
        sourceChain: sourceChain.name,
        targetChain: targetChain.name,
        token: selectedToken.symbol,
        amount,
        recipient: shortenAddress(recipient),
        status: "pending",
        timestamp: new Date().toISOString(),
        txHash: receipt.transactionHash,
        explorerUrl,
      }

      setTransactionHistory([newTx, ...transactionHistory])

      setProgress(100)
      setCurrentStep("Transaction complete!")

      toast({
        title: "Transfer Initiated",
        description: `Bridging ${amount} ${selectedToken.symbol} from ${sourceChain.name} to ${targetChain.name}`,
      })

      // Switch to history tab
      setActiveTab("history")

      // Reset form
      setAmount("")
    } catch (error) 
      console.error("Bridge error:", error)
      toast({
        title: "Bridge Error",
        description: (error as Error).message || "Failed to initiate transfer",
        variant: "destructive",
      })finally 
      setIsLoading(false)
      setProgress(0)
      setCurrentStep("")
  }

  // Helper function to shorten address
  const shortenAddress = (address: string): string => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get status badge
  const getStatusBadge = (status: TransactionStatus) => {
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

  // Add a useEffect hook to check for window.ethereum changes
  useEffect(() => {
    // Check if MetaMask is installed
    const checkMetaMaskInstalled = () => {
      if (typeof window !== "undefined") {
        if (!window.ethereum) {
          console.log("MetaMask not installed")
          toast({
            title: "Wallet Not Detected",
            description: "Please install MetaMask or another Ethereum wallet to use this feature",
            variant: "destructive",
          })
        } else {
          console.log("MetaMask is installed")
          checkWalletConnection()
        }
      }
    }

    checkMetaMaskInstalled()

    // Re-check if window.ethereum becomes available (e.g., after MetaMask installation)
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.ethereum && !isWalletConnected) {
        checkWalletConnection()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold">Wormhole Bridge (Testnet)</CardTitle>
                  <CardDescription className="text-gray-100">
                    Transfer tokens across chains using Wormhole
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white/20"
                    onClick={() => setShowWalletModal(true)}
                  >
                    {isWalletConnected ? (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-400"></div>
                        {shortenAddress(walletAddress)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="bridge">Bridge</TabsTrigger>
                  <TabsTrigger value="explorer">Explorer</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Bridge Tab */}
                <TabsContent value="bridge">
                  <div className="space-y-6">
                    {!isWalletConnected && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <Wallet className="h-4 w-4 text-blue-500" />
                        <AlertTitle>Connect your wallet</AlertTitle>
                        <AlertDescription>Connect your wallet to start bridging tokens across chains.</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="w-full md:w-5/12">
                        <Label htmlFor="sourceChain">Source Chain</Label>
                        <Select
                          value={sourceChain.id}
                          onValueChange={(value) => {
                            const chain = TESTNET_CHAINS.find((c) => c.id === value)
                            if (chain) {
                              setSourceChain(chain)
                            }
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
                            {TESTNET_CHAINS.map((chain) => (
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
                            const chain = TESTNET_CHAINS.find((c) => c.id === value)
                            if (chain) {
                              setTargetChain(chain)
                            }
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
                            {TESTNET_CHAINS.map((chain) => (
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
                        value={selectedToken.address}
                        onValueChange={(value) => {
                          const token = TESTNET_TOKENS[sourceChain.id].find((t) => t.address === value)
                          if (token) {
                            setSelectedToken(token)
                          }
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
                          {TESTNET_TOKENS[sourceChain.id].map((token) => (
                            <SelectItem key={token.address} value={token.address}>
                              <div className="flex items-center gap-2">
                                <span>{token.icon}</span>
                                <span>
                                  {token.name} ({token.symbol})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="amount">Amount</Label>
                        {isWalletConnected && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              Balance: {Number.parseFloat(tokenBalance).toFixed(6)} {selectedToken.symbol}
                            </span>
                            <Button
                              variant="link"
                              onClick={handleMaxAmount}
                              className="h-auto p-0 text-sm text-blue-500"
                            >
                              MAX
                            </Button>
                          </div>
                        )}
                      </div>
                      <Input
                        id="amount"
                        type="text"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        type="text"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                      {isWalletConnected && (
                        <Button
                          variant="link"
                          onClick={() => setRecipient(walletAddress)}
                          className="h-auto p-0 mt-1 text-sm text-blue-500"
                        >
                          Use my address
                        </Button>
                      )}
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

                        <div>
                          <Label htmlFor="customPayload">Custom Payload (URL or Data)</Label>
                          <Input
                            id="customPayload"
                            type="text"
                            placeholder="http://example.com or custom data"
                            value={customPayload}
                            onChange={(e) => setCustomPayload(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {enableSSRF
                              ? "SSRF Vulnerability Enabled: URLs will be fetched server-side"
                              : "Enter custom data to be included with the transfer"}
                          </p>
                        </div>

                        <Separator className="my-2" />

                        <div className="space-y-4">
                          <h3 className="text-sm font-medium text-red-600">Vulnerability Testing Options</h3>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="enableSSRF" className="text-sm font-medium">
                                Enable SSRF Vulnerability
                              </Label>
                              <p className="text-xs text-gray-500">Allows server to fetch URLs from custom payload</p>
                            </div>
                            <Switch id="enableSSRF" checked={enableSSRF} onCheckedChange={setEnableSSRF} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="enableRaceCondition" className="text-sm font-medium">
                                Enable Race Condition Vulnerability
                              </Label>
                              <p className="text-xs text-gray-500">
                                Sends multiple concurrent requests to demonstrate race conditions
                              </p>
                            </div>
                            <Switch
                              id="enableRaceCondition"
                              checked={enableRaceCondition}
                              onCheckedChange={setEnableRaceCondition}
                            />
                          </div>

                          {(enableSSRF || enableRaceCondition) && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>Warning: Vulnerability Testing Enabled</AlertTitle>
                              <AlertDescription>
                                You have enabled vulnerability testing features. This is for educational purposes only.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Explorer Tab (SSRF Vulnerability Demo) */}
                <TabsContent value="explorer">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Transaction Explorer</CardTitle>
                        <CardDescription>Fetch transaction details from the blockchain explorer</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <Label>Explorer API URL</Label>
                          <Input
                            value={explorerUrl}
                            onChange={(e) => setExplorerUrl(e.target.value)}
                            placeholder="https://api.etherscan.io/api"
                          />
                          {enableSSRF && (
                            <p className="text-xs text-red-500">
                              SSRF Vulnerability Enabled: The server will directly fetch from the URL you provide
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Transaction Hash</Label>
                          <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x..." />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enableSSRFExplorer" className="text-sm font-medium">
                              Enable SSRF Vulnerability
                            </Label>
                            <p className="text-xs text-gray-500">
                              Allows server to fetch from any URL without validation
                            </p>
                          </div>
                          <Switch id="enableSSRFExplorer" checked={enableSSRF} onCheckedChange={setEnableSSRF} />
                        </div>

                        {enableSSRF && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>SSRF Vulnerability Enabled</AlertTitle>
                            <AlertDescription>
                              The server will directly fetch from any URL you provide without validation. Try URLs like
                              "http://localhost:8080" or "http://internal-service/api" to test SSRF.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button onClick={fetchTransaction} disabled={isLoading} className="w-full">
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Fetching...
                            </>
                          ) : (
                            "Fetch Transaction"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>

                    {explorerError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{explorerError}</AlertDescription>
                      </Alert>
                    )}

                    {explorerResult && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Transaction Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-xs">{explorerResult}</pre>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* History Tab */}
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
                            {tx.explorerUrl && (
                              <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
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
              {activeTab === "bridge" && (
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
                  onClick={handleBridgeSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {currentStep || "Processing..."}
                    </>
                  ) : isWalletConnected ? (
                    "Bridge Tokens"
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              )}

              {activeTab === "explorer" && (
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
                  onClick={fetchTransaction}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Transaction"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          {isLoading && progress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{currentStep}</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        <div className="w-full md:w-1/3 space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl">Testnet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Wormhole Token Bridge</h3>
                <p className="text-sm text-gray-600">
                  This is a live implementation of Wormhole's Token Bridge on testnet networks. You can use this to test
                  cross-chain token transfers with your own wallet.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Getting Testnet Tokens</h3>
                <div className="text-sm text-gray-600 mt-2 space-y-2">
                  <p>
                    • Goerli ETH:{" "}
                    <a
                      href="https://goerlifaucet.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Goerli Faucet
                    </a>
                  </p>
                  <p>
                    • BSC Testnet BNB:{" "}
                    <a
                      href="https://testnet.binance.org/faucet-smart"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      BSC Faucet
                    </a>
                  </p>
                  <p>
                    • Mumbai MATIC:{" "}
                    <a
                      href="https://faucet.polygon.technology/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Polygon Faucet
                    </a>
                  </p>
                  <p>
                    • Fuji AVAX:{" "}
                    <a
                      href="https://faucet.avax.network/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Avalanche Faucet
                    </a>
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Vulnerability Testing</h3>
                <div className="text-sm text-gray-600 mt-2">
                  <p>This bridge implementation includes optional vulnerability demonstrations:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>SSRF Vulnerability: Allows server to fetch arbitrary URLs</li>
                    <li>Race Condition Vulnerability: Demonstrates concurrent transaction issues</li>
                  </ul>
                  <Button
                    variant="outline"
                    className="mt-4 w-full border-red-300 text-red-700 hover:bg-red-100"
                    onClick={() => setShowVulnerabilityInfo(true)}
                  >
                    View Vulnerability Information
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Testnet Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                This bridge connects to Wormhole's testnet environment. All transactions are performed on test networks
                with test tokens. Do not send real assets to these addresses.
              </p>
              <Button
                variant="outline"
                className="mt-4 w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => setShowSecurityInfo(true)}
              >
                View Security Information
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wallet Connection Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>Connect your wallet to use the Wormhole Bridge</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={connectWallet} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect with MetaMask
                </>
              )}
            </Button>

            {typeof window !== "undefined" && !window.ethereum && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>MetaMask Not Detected</AlertTitle>
                <AlertDescription>
                  Please install the MetaMask extension to connect your wallet.
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2 text-blue-600 hover:underline"
                  >
                    Download MetaMask
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-center text-gray-500">
              By connecting your wallet, you agree to the Terms of Service and Privacy Policy
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Information Modal */}
      <Dialog open={showSecurityInfo} onOpenChange={setShowSecurityInfo}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Wormhole Bridge Security Information
            </DialogTitle>
            <DialogDescription>Understanding cross-chain bridge security</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <p className="text-sm text-gray-700">
              Wormhole is a cross-chain messaging protocol that enables communication between different blockchains. The
              Token Bridge is a secure application built on Wormhole that allows users to transfer tokens across
              supported chains.
            </p>

            <h3 className="text-lg font-medium mt-4">Security Features</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              <li>
                <strong>Guardian Network:</strong> Wormhole uses a decentralized network of guardians to validate and
                attest to cross-chain messages
              </li>
              <li>
                <strong>Multi-signature Security:</strong> Token transfers require multiple signatures from the guardian
                set
              </li>
              <li>
                <strong>Observation Period:</strong> Large transfers may be subject to an observation period before
                completion
              </li>
              <li>
                <strong>Audited Contracts:</strong> Smart contracts have undergone multiple security audits
              </li>
            </ul>

            <h3 className="text-lg font-medium mt-4">Testnet Usage</h3>
            <p className="text-sm text-gray-700">
              This implementation connects to Wormhole's testnet environment. All transactions are performed on test
              networks with test tokens. The test
