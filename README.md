# Web2 Security Vulnerabilities in Web3 Lab

This project demonstrates how common web2 security vulnerabilities can impact web3 applications and how to properly secure against them.

## Overview

Many web3 projects focus heavily on smart contract security while overlooking traditional web security vulnerabilities in their supporting infrastructure. This lab demonstrates two critical web2 vulnerabilities that can have severe implications in web3 contexts:

1. **Server-Side Request Forgery (SSRF)** - Can allow attackers to access private blockchain nodes, key management systems, or internal services
2. **Race Conditions** - Can lead to double-spending, front-running attacks, or inconsistent state in off-chain components

## Lab Contents

This lab contains:

1. A vulnerable admin dashboard that demonstrates SSRF vulnerability
2. A secure admin dashboard that shows proper protection against SSRF
3. A vulnerable bridge relayer that demonstrates race condition vulnerability
4. A secure bridge relayer that shows proper protection against race conditions
5. Detailed explanations of the vulnerabilities and mitigation strategies

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone this repository
\`\`\`bash
git clone https://github.com/yourusername/web2-web3-security-lab.git
cd web2-web3-security-lab
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Start the development server
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Live Demo

A live demonstration of this project is available at:
[working demo](http://104.236.10.65:3000)

You can explore the vulnerable and secure implementations of various web2 security issues in web3 applications without having to set up the project locally. The live demo includes all the features described in this README.

## SSRF Vulnerability Demonstration

The vulnerable admin dashboard implementation directly uses user input to form URLs for server-side requests without proper validation or restrictions. An attacker could exploit this vulnerability by providing URLs that point to internal services.

For example, if the server making the request has access to internal services like:
- http://internal-key-manager:8080/keys - To access private keys
- http://metadata-service:9090/config - To access sensitive configuration
- http://169.254.169.254/latest/meta-data/ - To access cloud instance metadata (in AWS)

In a real-world bridge, this could allow attackers to:
- Steal private keys used for transaction signing
- Access sensitive configuration data
- Discover internal network topology
- Pivot to other internal services

## Race Condition Vulnerability Demonstration

The vulnerable bridge relayer implementation doesn't handle concurrent transfers properly, which can lead to race conditions. When multiple transfers are processed simultaneously, they can all read the same initial balance before any updates are written, leading to an incorrect final balance.

In a real-world bridge, this could allow an attacker to:
- Withdraw more funds than are actually available
- Process the same transfer multiple times
- Create inconsistent state between the source and destination chains

## Security Implementations

### SSRF Protection
- Allowlisting of approved domains and endpoints
- Input validation for transaction hash format
- Proxy architecture for routing external requests
- Network segmentation to prevent access to internal services

### Race Condition Protection
- Mutex locking to ensure only one transfer operation can modify the bridge balance at a time
- Atomic operations for the read-modify-write cycle
- Transaction isolation to process each transfer in isolation from others
- Idempotent operations to prevent duplicate processing

## Educational Resources

For more information on these vulnerabilities and their impact on web3 applications, check out:

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/data/definitions/1430.html)
- [Web3 Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

## Disclaimer

This project is for educational purposes only. The vulnerabilities demonstrated should never be implemented in production environments.

## License

MIT
