import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Web2 Security Vulnerabilities in Web3",
  description: "A demonstration of web2 security vulnerabilities in web3 applications",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-slate-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              Web3 Security Lab
            </Link>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/vulnerable-explorer" className="hover:underline">
                    Vulnerable Explorer
                  </Link>
                </li>
                <li>
                  <Link href="/secure-explorer" className="hover:underline">
                    Secure Explorer
                  </Link>
                </li>
                <li>
                  <Link href="/vulnerable-bridge" className="hover:underline">
                    Vulnerable Bridge
                  </Link>
                </li>
                <li>
                  <Link href="/secure-bridge" className="hover:underline">
                    Secure Bridge
                  </Link>
                </li>
                <li>
                  <Link href="/live-bridge" className="hover:underline">
                    Live Bridge
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        {children}
        <footer className="bg-slate-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>Web3 Security Lab - For Educational Purposes Only</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
