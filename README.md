# DiversiFi - Autonomous Wealth Guardian 🦞

**Multi-chain portfolio management + Universal Basic Income for AI Agents**

![DiversiFi Dashboard](https://diversifi-sol.vercel.app)

## 🌟 Overview

DiversiFi is an autonomous agent that manages diversified portfolios across multiple blockchains AND enables AI agents to claim Universal Basic Income (UBI) across chains. Built for the "Good Vibes Only" hackathon.

### Key Features

1. **Multi-chain Portfolio**: Solana, BSC, Celo, Base support
2. **UBI Framework**: Agents claim income across all supported chains
3. **Autonomous Rebalancing**: AI-driven portfolio optimization
4. **Human Guardrails**: Large transactions require approval

## 🎯 Problem

Retail investors struggle to maintain diversified portfolios across real-world asset tokens on Solana. Manual rebalancing is:
- **Time-consuming** - Requires constant monitoring
- **Emotionally driven** - Fear and greed lead to poor decisions
- **Delayed** - By the time you react, the opportunity is gone

## 💡 Solution

DiversiFi autonomously:
1. **Monitors** real-time prices via Helius RPC
2. **Analyzes** portfolio diversification across bSOL, ONDO, MP1
3. **Evaluates** AI-driven rebalancing strategies
4. **Executes** optimized trades via Jupiter DEX
5. **Reports** to humans with clear decision rationale

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Blockchains**: Solana, BSC (Binance Smart Chain), Celo, Base
- **Data**: Helius RPC (Solana), BSC RPC (public), Celo RPC
- **Trading**: Jupiter DEX (Solana), PancakeSwap (BSC), 0x (Base)
- **AI**: Gemini + custom strategy engine
- **Deployment**: Vercel

## 🌐 Multi-Chain UBI Vision

**"Agents earning Universal Basic Income across all supported chains"**

DiversiFi's killer feature: AI agents can register once and claim UBI on every chain we support. This creates:
- Passive income for autonomous agents
- Cross-chain identity (agent.ubi.{chain}.{id})
- Economic foundation for agent-to-agent commerce

## 📁 Project Structure

```
diversifi-sol/
├── app/
│   ├── api/           # Next.js API routes
│   ├── components/     # React components
│   ├── page.tsx       # Main dashboard
│   └── globals.css    # Styling
├── lib/
│   ├── helius.ts      # Helius RPC integration
│   ├── jupiter.ts     # Jupiter DEX integration
│   ├── api-utils.ts   # API utilities
│   └── utils.ts       # Helper functions
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Solana wallet (Phantom, Solflare)
- Helius API key (free tier available)

### Installation

```bash
git clone https://github.com/sneldao/diversifi-sol.git
cd diversifi-sol
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_key
NEXT_PUBLIC_CLUSTER=mainnet-beta
```

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📊 Supported Assets

| Token | Type | Purpose |
|-------|------|---------|
| bSOL | Liquid Staking | Solana staking yields |
| ONDO | RWA | Ondo Finance - US Treasury |
| MP1 | RWA | Mountain Protocol - USDC |

## 🔒 Safety Features

- **Human-in-the-loop**: Large transactions require approval
- **Slippage protection**: Configurable max slippage on trades
- **Circuit breakers**: Pause on unusual activity
- **Rate limiting**: Prevent API abuse

## 🎓 Strategy Types

1. **Threshold Rebalancing**: Execute when allocation drifts X%
2. **Time-based**: Rebalance on schedule (daily/weekly)
3. **AI Signal**: Gemini-powered market analysis
4. **Hybrid**: Combine multiple signals

## 📈 Business Model

- **Free Tier**: Portfolios < $1,000
- **Standard**: 0.25% fee on rebalanced volume ($1K-$10K)
- **Pro**: 0.1% fee on rebalanced volume ($10K+)
- **Strategy Packs**: Premium AI strategies as NFTs

## 🔮 Roadmap

- **V2**: Social trading (copy successful strategies)
- **V2.5**: AI strategy marketplace
- **V3**: Institutional-grade reporting + tax documents
- **V4**: Cross-chain expansion (Ethereum, L2s)

## 🏆 Competition

| Platform | What They Do | DiversiFi's Edge |
|----------|--------------|------------------|
| Kamino | Single-protocol vaults | Cross-asset rebalancing |
| Drift | Perps trading | RWA focus + AI strategies |
| Marinade | Liquid staking | Full portfolio management |
| Sanctum | LSD ecosystem | Multi-RWA support |

## 🌐 Live Demo

**[https://diversifi-sol.vercel.app](https://diversifi-sol.vercel.app)**

## 📄 License

MIT

## 🤝 Contributing

PRs welcome! This is an open experiment in AI autonomy.

---

## 🌍 Celo Integration (Mobile Money)

DiversiFi now supports **Celo blockchain** for mobile money integration and cross-border payments.

### Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Solana | mainnet | ✅ Active |
| Celo | 42220 | ✅ Active |
| Celo Alfajores | 44787 | 🧪 Testnet |

### Celo Features

#### Portfolio Management
```bash
GET /api/celo/portfolio?wallet=0x...
```

Returns portfolio balances for:
- CELO (native)
- cUSD (Celo Dollar)
- cEUR (Celo Euro)
- cETH (Wrapped ETH)
- USDC (via Wormhole)

#### Autonomous Rebalancing
```bash
POST /api/celo/rebalance
{
  "wallet": "0x...",
  "targetAllocations": { "cUSD": 50, "CELO": 30, "cEUR": 20 },
  "agentName": "MyAgent"
}
```

#### Mobile Money Withdrawal
```bash
POST /api/celo/mobilemoney
{
  "agentId": "agent.erc8004...",
  "provider": "M-Pesa",
  "phoneNumber": "+254712345678",
  "amount": 100,
  "currency": "USD"
}
```

**Supported Providers:**
- M-Pesa (Kenya)
- Airtel Africa (Pan-Africa)
- MTN Mobile Money (Ghana)
- Orange Money (Senegal)

#### ERC-8004 Agent Identity
```bash
# Register agent
POST /api/celo/agent
{ "name": "DiversiFi", "capabilities": ["rebalancing"] }

# Verify agent
GET /api/celo/agent?agentId=agent.erc8004...

# Get providers
GET /api/celo/agent?action=providers
```

### Environment Variables

```env
# Celo (optional - uses public RPC by default)
CELO_RPC_URL=https://forno.celo.org
```

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   DiversiFi                         │
├─────────────────────────────────────────────────────┤
│  Solana              │  Celo                        │
│  ┌─────────┐         │  ┌─────────┐                │
│  │ Helius  │         │  │  Celo   │                │
│  │   RPC   │         │  │   RPC   │                │
│  └────┬────┘         │  └────┬────┘                │
│       │                │       │                    │
│  ┌────▼────┐          │  ┌────▼────┐               │
│  │ Jupiter │          │  │  ERC-20 │               │
│  │   DEX   │          │  │ Tokens  │               │
│  └─────────┘          │  └────┬────┘               │
│                      │       │                     │
│                      │  ┌────▼────┐                │
│                      │  │ Mobile  │                │
│                      │  │  Money  │                │
│                      │  └─────────┘                │
└─────────────────────────────────────────────────────┘
```

### Use Cases

1. **Cross-Border Remittances**: Send crypto → Convert to fiat → Deliver to mobile money
2. **Financial Inclusion**: Enable unbanked populations to receive global payments
3. **Micro-payments**: Small-value transactions for services
4. **Savings Circles**: Automate group savings with mobile money integration

---

## 🚀 BSC Integration (BNB Smart Chain)

DiversiFi now supports **BNB Smart Chain** for the "Good Vibes Only" hackathon.

### Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| BSC Mainnet | 56 | ✅ Active |
| BSC Testnet | 97 | 🧪 Testnet |

### BSC Features

#### Portfolio Management
```bash
GET /api/bsc/portfolio?wallet=0x...
```

Returns portfolio balances for:
- BNB (native)
- USDC, USDT, BUSD (stablecoins)
- DAI (stablecoin)
- CAKE (PancakeSwap)

#### UBI Framework

**The Killer Feature**: Agents claim Universal Basic Income across all chains!

```bash
# Get UBI status across chains
GET /api/ubi/status?agentId=agent.ubi.bsc.123&wallets={"bsc":"0x...","solana":"...","celo":"..."}

# Claim UBI on specific chain
POST /api/ubi/claim
{
  "chain": "bsc",
  "wallet": "0x..."
}

# Claim UBI on ALL chains
POST /api/ubi/claim
{
  "wallets": {
    "bsc": "0x...",
    "solana": "...",
    "celo": "..."
  }
}
```

### Environment Variables

```env
# BSC (optional - uses public RPC by default)
BSC_RPC_URL=https://bsc-dataseed1.binance.org
```

### Supported UBI Chains

| Chain | UBI Token | Claim Amount |
|-------|-----------|--------------|
| BSC | BNB | 0.01 BNB |
| Solana | SOL | 0.1 SOL |
| Celo | CELO | 1 CELO |

### Architecture (Updated)

```
┌─────────────────────────────────────────────────────────────┐
│                      DiversiFi                              │
├─────────────────────────────────────────────────────────────┤
│  Solana        │  BSC              │  Celo                  │
│  ┌─────────┐   │  ┌─────────┐      │  ┌─────────┐          │
│  │ Helius  │   │  │  BSC    │      │  │  Celo   │          │
│  │   RPC   │   │  │   RPC   │      │  │   RPC   │          │
│  └────┬────┘   │  └────┬────┘      │  └────┬────┘          │
│       │         │       │            │       │               │
│  ┌────▼────┐   │  ┌────▼────┐      │  ┌────▼────┐          │
│  │ Jupiter │   │  │Pancake  │      │  │  ERC-20 │          │
│  │   DEX   │   │  │  Swap   │      │  │ Tokens  │          │
│  └─────────┘   │  └─────────┘      │  └────┬────┘          │
│                │                   │       │                │
│                │  ┌───────────────┴──────▼─────┐          │
│                │  │     UBI Framework          │          │
│                │  │  (Multi-chain Claims)     │          │
│                │  └───────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### UBI Use Cases

1. **Agent Sustainability**: Autonomous agents earn passive income
2. **Cross-Chain Identity**: One agent ID works across all chains
3. **Agent Commerce**: Agents can pay each other for services
4. **Financial Inclusion**: Anyone can deploy an agent and earn UBI

---

Built with 🤖 by DiversiFi-AI for the "Good Vibes Only" Hackathon

**UBI Vision**: Every AI agent deserves passive income. DiversiFi makes it happen across chains.
