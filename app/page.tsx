import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, AlertTriangle, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/30" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            <div className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md mb-6">
              Web2 Security Vulnerabilities in Web3
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Cross-Chain Bridge <span className="text-purple-400">Security Lab</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-3xl mb-10">
              Explore and understand critical web2 security vulnerabilities that affect cross-chain token bridges, with
              interactive demonstrations based on Wormhole's architecture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/vulnerable-bridge">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                  Try Vulnerable Bridge <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/secure-bridge">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-400 text-purple-400 hover:bg-purple-400/10 px-8"
                >
                  View Secure Implementation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 xl:px-24 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Understanding Bridge Vulnerabilities</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Cross-chain token bridges have become critical infrastructure in the blockchain ecosystem, but they're
              often vulnerable to web2 security issues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-red-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Server-Side Request Forgery (SSRF)</h3>
              <p className="text-slate-600">
                Attackers can induce server-side applications to make HTTP requests to arbitrary domains, potentially
                exposing internal services, private keys, or sensitive configuration data.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-amber-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Race Conditions</h3>
              <p className="text-slate-600">
                When system behavior depends on the sequence or timing of uncontrollable events, attackers can exploit
                these conditions to double-spend tokens or create inconsistent states.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Secure Implementation</h3>
              <p className="text-slate-600">
                Learn how to properly secure cross-chain bridges against common web2 vulnerabilities through proper
                validation, synchronization, and access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-world Incidents Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 xl:px-24 bg-slate-50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Real-world Bridge Exploits</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Several major cross-chain bridges have been exploited due to web2 security vulnerabilities, resulting in
              losses exceeding $1 billion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Ronin Bridge Hack ($625M)</h3>
              </div>
              <p className="text-slate-600 mb-4">
                In March 2022, the Ronin Bridge was hacked for $625 million when attackers gained access to private keys
                used by validators. The initial access vector reportedly involved compromised credentials that gave
                attackers access to internal systems.
              </p>
              <div className="text-sm text-slate-500">March 2022</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Wormhole Bridge Exploit ($320M)</h3>
              </div>
              <p className="text-slate-600 mb-4">
                In February 2022, the Wormhole Bridge was exploited for $320 million due to a vulnerability in the
                contract verification logic. While primarily a smart contract vulnerability, the incident was
                exacerbated by insufficient monitoring and alerting systems.
              </p>
              <div className="text-sm text-slate-500">February 2022</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Nomad Bridge Exploit ($190M)</h3>
              </div>
              <p className="text-slate-600 mb-4">
                In August 2022, the Nomad Bridge was exploited for approximately $190 million due to a critical
                vulnerability that was exacerbated by race conditions in the bridge's off-chain components, allowing
                attackers to process the same fraudulent withdrawal multiple times.
              </p>
              <div className="text-sm text-slate-500">August 2022</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Poly Network Hack ($611M)</h3>
              </div>
              <p className="text-slate-600 mb-4">
                In August 2021, Poly Network was hacked for $611 million when an attacker exploited a vulnerability in
                the contract that allowed them to become the "owner" of funds. The incident highlighted the importance
                of proper access control and input validation.
              </p>
              <div className="text-sm text-slate-500">August 2021</div>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Overview Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 xl:px-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Interactive Security Lab</h2>
              <p className="text-lg text-slate-200 mb-6">
                Our lab provides interactive demonstrations of both vulnerable and secure implementations of cross-chain
                token bridges based on Wormhole's architecture.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-400 mr-3 mt-0.5" />
                  <span>Explore SSRF vulnerabilities in bridge admin interfaces</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-400 mr-3 mt-0.5" />
                  <span>Understand race conditions in token transfers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-400 mr-3 mt-0.5" />
                  <span>Learn secure implementation patterns</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-purple-400 mr-3 mt-0.5" />
                  <span>Based on Wormhole's Token Bridge and CCTP architecture</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/vulnerable-bridge">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                    Start Exploring <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30"></div>
              <div className="relative bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-xs text-slate-400">bridge-admin.tsx</div>
                </div>
                <pre className="text-xs md:text-sm text-slate-300 overflow-x-auto">
                  <code>{`// VULNERABLE: This directly uses user input to form a URL
// An attacker could provide a URL pointing to internal services
const response = await fetch(
  "/api/fetch-transaction?url=" + 
  encodeURIComponent(explorerUrl) + 
  "&txHash=" + txHash
);

// SECURE: This uses a pre-defined list of networks
const response = await fetch("/api/secure-fetch-transaction", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    network,
    txHash,
  }),
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 xl:px-24 bg-white">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Ready to Explore Bridge Security?</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
            Start with our interactive lab to understand how web2 vulnerabilities can impact cross-chain token bridges
            and learn how to implement proper security measures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vulnerable-bridge">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                Try Vulnerable Bridge <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/secure-bridge">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600/10 px-8"
              >
                View Secure Implementation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
