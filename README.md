# 🤖 AgentPay - Autonomous Payments on Mantle

![Mantle Network](https://img.shields.io/badge/Network-Mantle_Sepolia-green) 
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Hackathon_MVP-orange)

**AgentPay** is a decentralized agentic payment platform built on the **Mantle Network**. It empowers users with AI-driven "agents" for autonomous payment handling, recurring scheduling, and seamless invoice management.

## 🚀 Key Features

- **🧾 Decentralized Invoicing**: Create, track, and pay on-chain invoices with full transparency.
- **🤖 Autonomous Agents**: configure "agents" to handle recurring payments (payroll, subscriptions) automatically.
- **⚡ Instant Payments**: Native support for **$MNT** and ERC20 tokens.
- **📊 Real-time Dashboard**: Track your spending, income, and active agents in one beautiful interface.
- **🕸️ Network Aware**: Automatically detects Mainnet/Testnet/Local environments.

## 🛠️ Tech Stack

- **Blockchain**: [Mantle Network](https://www.mantle.xyz/) (Sepolia Testnet)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Web3**: [Wagmi](https://wagmi.sh/) + [RainbowKit](https://www.rainbowkit.com/) + [Viem](https://viem.sh/)
- **Smart Contracts**: Solidity + Hardhat

## 📜 Smart Contract

Deployed on **Mantle Sepolia Testnet**:
```
0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3
```
[View on Explorer](https://sepolia.mantlescan.xyz/address/0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/barneybo18/MantleAgenticPayment.git
   cd MantleAgenticPayment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment**
   Create a `.env` file in the root directory:
   ```env
   PRIVATE_KEY=your_wallet_private_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🧪 Deployment

To deploy the smart contracts to Mantle Sepolia:

```bash
npx hardhat run scripts/deploy.js --network mantleSepolia
```

## 🔐 Security

- **Ownable**: Contract ownership for administrative control.
- **ReentrancyGuard**: Protected against reentrancy attacks.
- **Non-Custodial**: Users verify all transactions via their wallet.

---

Built with ❤️ for the **Mantle Hackathon**.
