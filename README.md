# 🤖 AgentPay - Autonomous Payments on Mantle

![Mantle Network](https://img.shields.io/badge/Network-Mantle-green) 
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Hackathon_MVP-orange)

**AgentPay** is a decentralized agentic payment platform built on the **Mantle Network**. It empowers users with AI-driven "agents" for autonomous payment handling, recurring scheduling, and seamless invoice management.

## 🚀 Key Features

- **🧾 Decentralized Invoicing**: Create, track, and pay on-chain invoices with full transparency.
- **🤖 Autonomous Agents**: Configure "agents" to handle recurring payments (payroll, subscriptions) automatically.
- **💰 Funded Agents**: Agents hold funds directly (MNT or ERC20 tokens) for trustless execution.
- **⚡ Multi-Token Support**: Native **$MNT**, **USDT**, **USDC**, **mETH**, **WETH**, and more.
- **📊 Real-time Dashboard**: Track your spending, income, and active agents in one beautiful interface.
- **🔄 Pause/Resume**: Full control over your agents with one-click pause and resume.
- **🕸️ Network Aware**: Automatically detects Mainnet/Testnet and uses the correct contract.

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Blockchain | [Mantle Network](https://www.mantle.xyz/) |
| Framework | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) |
| Web3 | [Wagmi](https://wagmi.sh/) + [RainbowKit](https://www.rainbowkit.com/) + [Viem](https://viem.sh/) |
| Smart Contracts | Solidity 0.8.27 + Hardhat |

## 📜 Smart Contracts

| Network | Address | Explorer |
|---------|---------|----------|
| **Mantle Mainnet** | `0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3` | [View](https://mantlescan.xyz/address/0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3) |
| **Mantle Sepolia** | `0xc66bf8Cb3572d6dE4f47B4775997070606f32Fd8` | [View](https://sepolia.mantlescan.xyz/address/0xc66bf8Cb3572d6dE4f47B4775997070606f32Fd8) |

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

## 🤖 Running the Agent Worker

The worker script executes due payments automatically:

```bash
# For Mainnet
npx hardhat run scripts/worker.js --network mantle

# For Testnet
npx hardhat run scripts/worker.js --network mantleSepolia
```

## 🧪 Deployment

To deploy the smart contracts:

```bash
# Deploy to Mainnet
npx hardhat run scripts/deploy.js --network mantle

# Deploy to Sepolia Testnet
npx hardhat run scripts/deploy.js --network mantleSepolia
```

## 🔐 Security

- **Ownable**: Contract ownership for administrative control.
- **ReentrancyGuard**: Protected against reentrancy attacks.
- **Non-Custodial**: Users verify all transactions via their wallet.
- **Funded Agents**: Agents hold their own funds - no approvals needed at execution time.

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   └── (app)/              # Main application routes
│       ├── agents/         # Agent management
│       ├── invoices/       # Invoice management
│       └── dashboard/      # User dashboard
├── components/             # React components
├── contracts/              # Solidity smart contracts
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and contract config
└── scripts/                # Deployment and automation scripts
```

---

Built with ❤️ for the **Mantle Hackathon**.
