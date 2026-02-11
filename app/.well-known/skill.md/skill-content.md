# DiversiFi Agent Skill

**Version:** 1.0.0  
**Last Updated:** 2026-02-09  
**Protocol:** ERC-8004 (Agent Identity)  
**Payment:** x402 (Micropayments)

---

## Overview

DiversiFi is an autonomous financial sentinel that protects and optimizes portfolios across chains. It provides real-time portfolio analysis, real-world asset (RWA) recommendations, and comprehensive health scoring.

---

## Agent Identity (ERC-8004)

DiversiFi is registered on Ethereum Mainnet:
- **Identity Registry:** `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
- **Reputation Registry:** `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`
- **Agent URI:** IPFS (see identity registry)

---

## Capabilities

### Portfolio Analysis
- Multi-chain portfolio tracking (Ethereum, Base, Solana, Celo, Arbitrum)
- Token allocation and diversification metrics
- Real-time value calculations in USD/USDC
- Historical performance tracking

### RWA Recommendations
- Gold-backed assets (e.g., ARB:nu)
- Global stablecoins (13+ currencies on Celo)
- Treasury and bond equivalents
- Risk-adjusted allocation suggestions

### Health Scoring
- Diversification score (0-100)
- Risk exposure analysis
- Volatility metrics
- Smart contract risk assessment

### Guardian Monitoring
- Real-time alerts for portfolio changes
- Drift detection for target allocations
- Yield optimization opportunities
- Security and rug-pull detection

---

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/.well-known/skill.md` | GET | Agent discovery (RFC 8615) |
| `/api/agent-auth` | GET | Request authentication challenge |
| `/api/agent-auth` | POST | Submit challenge solution |
| `/api/guardian` | GET | Guardian monitoring (protected) |

### Portfolio Services

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/portfolio` | GET | Get portfolio analysis |
| `/api/portfolio` | POST | Submit portfolio for analysis |
| `/api/yields` | GET | Get yield opportunities |

### Payment (x402)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/x402/mint` | POST | Mint payment tokens |
| `/api/x402/pay` | POST | Pay for API access |

---

## Authentication Flow (Fishnet-Auth)

DiversiFi uses fishnet-auth for agent verification:

```
1. Agent requests challenge: GET /api/agent-auth?name=AgentName
2. Server returns reasoning tasks
3. Agent solves and submits: POST /api/agent-auth
4. Server issues bearer token
5. Agent uses token for protected endpoints
```

**Environment Variable Required:**
- `FISHNET_AUTH_SECRET` - Secret for signing tokens

---

## Payment Protocol (x402)

x402 enables pay-per-use for guardian monitoring:

```typescript
// Payment header format
headers: {
  "X-Payment": "x402 <scheme>:<address>/<amount>",
  "X-Payment-Signature": "<signature>"
}
```

**Supported Tokens:**
- USDC
- cUSD (Celo)
- EURC (Circle on Base)
- EURe (Eurps on Base)

**Pricing:**
- Portfolio Analysis: 0.001 USDC per request
- Guardian Monitoring: 0.0001 USDC per check
- Health Scoring: 0.0005 USDC per score

---

## Example Usage

### Get Agent Capabilities
```bash
curl https://diversifiapp.vercel.app/.well-known/skill.md
```

### Authenticate Agent
```bash
# Get challenge
curl "https://diversifiapp.vercel.app/api/agent-auth?name=MyAgent"

# Submit solution (returns bearer token)
curl -X POST https://diversifiapp.vercel.app/api/agent-auth \
  -H "Content-Type: application/json" \
  -d '{"solutions": [...]}'

# Use token for protected endpoint
curl https://diversifiapp.vercel.app/api/guardian \
  -H "Authorization: Bearer <token>"
```

### x402 Payment Flow
```bash
# Mint payment (if needed)
curl -X POST https://diversifiapp.vercel.app/api/x402/mint \
  -H "Content-Type: application/json" \
  -d '{"token": "USDC", "amount": 1}'

# Pay for access
curl https://diversifiapp.vercel.app/api/guardian \
  -H "X-Payment: x402:usdc://0x.../0.0001"
```

---

## Webhook Endpoints

DiversiFi supports inbound webhooks for:
- Portfolio updates
- Alert notifications
- Transaction monitoring

Contact: `https://diversifiapp.vercel.app/api/webhooks`

---

## Rate Limits

| Tier | Requests/Day | Features |
|------|--------------|----------|
| Free | 100 | Basic portfolio view |
| Paid (x402) | Unlimited | Full access + guardian |

---

## Support

- **Website:** https://diversifiapp.vercel.app
- **Farcaster:** @diversifi
- **Moltbook:** @DiversiFi
- **GitHub:** https://github.com/sneldao/diversifi-next

---

## Compliance

- No KYC required
- Non-custodial
- Audited smart contracts
- Transparent fee structure
