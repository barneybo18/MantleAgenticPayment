# 🎯 BOGENT - Hackathon Submission

## Short Description (under 200 characters)

> BOGENT enables autonomous payments on Mantle. Create self-funded agents for recurring payments, manage invoices on-chain, and automate subscriptions—all without intermediaries.

---

## 📸 Hero Image

> **[INSERT IMAGE: Dashboard Screenshot]**
> *Capture your dashboard showing active agents, stats cards, and the sidebar navigation.*

---

## Project Description

**BOGENT** is a decentralized autonomous payment platform built natively on Mantle Network. It bridges the gap between traditional payment automation and Web3 by enabling users to deploy self-funded "agents" that manage recurring payments, subscriptions, and invoices—all trustlessly executed on-chain.

With BOGENT, users can create autonomous agents that hold their own funds and execute payments at defined intervals without any manual intervention. Whether it's payroll, subscriptions, or recurring investments, BOGENT handles it all transparently on the blockchain.

---

## 🎯 Problem

In the Web2 world, payment automation relies heavily on centralized intermediaries like banks, payment processors, and subscription services. These systems:

- ❌ **Require trust** in third parties to execute payments correctly
- ❌ **Lack transparency** — users can't verify when or how payments are processed
- ❌ **Charge high fees** for recurring billing and payment automation
- ❌ **Not crypto-native** — incompatible with cryptocurrency assets
- ❌ **Single points of failure** — service outages can disrupt critical payments

---

## 💡 Solution

BOGENT introduces **autonomous, self-funded payment agents** on Mantle Network, eliminating intermediaries while providing full transparency and control.

### How It Works

1. **Create an Agent** — Deploy an autonomous agent specifying recipient, amount, token, and payment interval
2. **Fund the Agent** — Deposit MNT or ERC20 tokens directly into the agent's on-chain balance
3. **Set & Forget** — The agent automatically executes payments at the defined interval
4. **Full Control** — Pause, resume, edit, or terminate agents anytime with instant refunds

### Why Mantle?

- ⚡ **Ultra-low gas fees** make recurring payments economically viable
- 🚀 **Fast finality** ensures real-time payment execution
- 🔧 **EVM compatibility** allows familiar tooling and patterns
- 🌐 **Growing ecosystem** with native LSTs and DeFi primitives

---

## 📸 Feature Image

> **[INSERT IMAGE: Create Agent Modal]**
> *Show the agent creation flow with fields for recipient, amount, token selection, and interval.*

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧾 **On-Chain Invoicing** | Create, track, and pay invoices with full blockchain transparency |
| 🤖 **Autonomous Agents** | Self-executing payment bots for subscriptions, payroll, and more |
| 💰 **Multi-Token Support** | Native MNT, USDT, USDC, mETH, cmETH, WETH |
| ⏱️ **Scheduled Termination** | Set agents to auto-terminate at a specific date |
| 🔄 **Pause/Resume** | One-click control to pause and resume agents |
| ✏️ **Edit Paused Agents** | Update or delete agents even when paused or terminated |
| 🔮 **Transaction Simulation** | Pre-flight checks prevent failed transactions |
| 🌐 **Network Aware** | Auto-switches between Mainnet and Testnet |
| 📱 **Fully Responsive** | Mobile-first design that works on all devices |

---

## 📸 Agent Cards Image

> **[INSERT IMAGE: Agent Cards Grid]**
> *Show multiple agent cards with different statuses (active, paused) displaying balance, next execution, and action buttons.*

---

## 🛠️ Tech Stack

### Blockchain
- **Network**: Mantle (Mainnet & Sepolia Testnet)
- **Smart Contracts**: Solidity 0.8.27
- **Libraries**: OpenZeppelin (Ownable, ReentrancyGuard, IERC20)
- **Development**: Hardhat

### Frontend
- **Framework**: Next.js 16 (App Router + Turbopack)
- **React**: React 19
- **Styling**: Tailwind CSS 4 + Shadcn UI
- **Animations**: Framer Motion + Vanta.js

### Web3 Integration
- **Wallet**: RainbowKit 2
- **Hooks**: Wagmi 2
- **Client**: Viem 2
- **State**: TanStack Query

---

## 🎬 Use Cases

### 💼 Payroll Automation
Pay contractors and employees on a weekly or monthly basis without manual intervention.

### 📺 Subscription Billing
Decentralized subscription billing for Web3 services, DAOs, and creator platforms.

### 🏠 Rent Payments
Automated monthly rent payments in crypto — never miss a payment again.

### 💸 Dollar-Cost Averaging (DCA)
Set up recurring investments to automatically purchase tokens at regular intervals.

### 🤝 Revenue Sharing
Auto-distribute earnings to stakeholders, collaborators, or DAO members.

---

## 📸 Invoice Management Image

> **[INSERT IMAGE: Invoice Table with Detail Modal]**
> *Show the invoice table with pending/paid statuses and the invoice detail modal open.*

---

## 📜 Smart Contract

The `AgentPay.sol` smart contract (373 lines) provides:

| Function | Description |
|----------|-------------|
| `createInvoice()` | Create on-chain invoices with metadata and due dates |
| `payInvoice()` | Pay invoices using native MNT or ERC20 tokens |
| `cancelInvoice()` | Cancel unpaid invoices (creator only) |
| `createScheduledPayment()` | Deploy autonomous payment agents |
| `updateScheduledPayment()` | Update agent end dates (works on paused agents) |
| `executeScheduledPayment()` | Execute due payments (called by worker) |
| `cancelScheduledPayment()` | Terminate agent and refund balance |
| `toggleAgentStatus()` | Pause or resume an agent |
| `topUpAgent()` | Add more funds to an active agent |

### Security Features
- ✅ **Ownable** — Administrative control over contract
- ✅ **ReentrancyGuard** — Protection against reentrancy attacks
- ✅ **Non-Custodial** — Users control their funds via wallet
- ✅ **Self-Funded** — No approvals needed at execution time

---

## 🔗 Links

| Resource | Link |
|----------|------|
| 🌐 **Live Demo** | `[ADD YOUR DEPLOYED URL]` |
| 📜 **Mainnet Contract** | [0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3](https://mantlescan.xyz/address/0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3) |
| 📜 **Testnet Contract** | [0xc66bf8Cb3572d6dE4f47B4775997070606f32Fd8](https://sepolia.mantlescan.xyz/address/0xc66bf8Cb3572d6dE4f47B4775997070606f32Fd8) |
| 💻 **GitHub** | [github.com/barneybo18/MantleAgenticPayment](https://github.com/barneybo18/MantleAgenticPayment) |
| 🎥 **Demo Video** | `[ADD YOUR VIDEO LINK]` |

---

## 📸 Landing Page Image

> **[INSERT IMAGE: Landing Page]**
> *Show the hero section with the Vanta.js animated background and call-to-action.*

---

## 👥 Team

| Name | Role | Links |
|------|------|-------|
| `[Your Name]` | `[Your Role]` | `[GitHub/Twitter/LinkedIn]` |
| `[Team Member 2]` | `[Their Role]` | `[Links]` |

---

## 📸 Recommended Screenshots Checklist

Use this checklist to capture all the images you need:

- [ ] **Dashboard** — Stats cards, sidebar, overall layout
- [ ] **Create Agent Modal** — Form fields filled in with sample data
- [ ] **Agent Cards Grid** — Multiple agents with Active/Paused states
- [ ] **Edit Agent Modal** — Editing an existing agent
- [ ] **Invoice Table** — List of invoices with different statuses
- [ ] **Invoice Detail Modal** — Full invoice details with pay button
- [ ] **Landing Page** — Hero section with animated background
- [ ] **Mobile View** — Responsive design on mobile viewport
- [ ] **Wallet Connected** — RainbowKit wallet connection modal
- [ ] **Transaction Modal** — Transaction confirmation with Mantlescan link

---

## 🏆 What Makes BOGENT Special

1. **True Autonomy** — Agents hold their own funds and execute without human intervention
2. **Full Transparency** — Every payment is verifiable on-chain
3. **User Control** — Pause, edit, or terminate agents anytime
4. **Gas Efficient** — Built for Mantle's low-fee environment
5. **Production Ready** — Deployed on both Mainnet and Testnet

---

*Built with ❤️ for the Mantle Hackathon*
