import { NextResponse } from "next/server";

/**
 * x402 Payment Protocol Integration
 * Pay-per-use for guardian monitoring and API access
 * 
 * Reference: https://github.com/celo-org/agent-skills/tree/main/skills/x402
 */

// Payment scheme configurations
const PAYMENT_SCHEMES = {
  usdc: {
    contract: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    network: "ethereum",
  },
  cusd: {
    contract: "0x765de816845861e75a25fCA122bb6898B8B1282a",
    decimals: 18,
    network: "celo",
  },
  eurc: {
    contract: "0x60a3E35Cc302bFa42Cbad73E5c58e5c3Fb497Ef8",
    decimals: 6,
    network: "base",
  },
  eure: {
    contract: "0x948028a3843b30d71487b8c4b2eb3e1a26f4b79c",
    decimals: 18,
    network: "base",
  },
};

// Pricing tiers (in USD equivalent)
const PRICING = {
  portfolio: { base: 0.001, unit: "USDC" },
  guardian: { base: 0.0001, unit: "USDC" },
  health: { base: 0.0005, unit: "USDC" },
  analysis: { base: 0.002, unit: "USDC" },
};

/**
 * GET /api/x402 - Get payment configuration and pricing
 */
export async function GET() {
  return NextResponse.json({
    version: "x402-v1",
    schemes: Object.keys(PAYMENT_SCHEMES),
    pricing: PRICING,
    networks: ["ethereum", "base", "celo"],
    terms: "Pay-per-use micropayments for DiversiFi API access",
  });
}

/**
 * POST /api/x402/pay - Validate payment and grant access
 * 
 * Headers:
 *   X-Payment: x402:<scheme>:<address>/<amount>
 *   X-Payment-Signature: <signature>
 */
export async function POST(request: Request) {
  try {
    const paymentHeader = request.headers.get("X-Payment");
    const signatureHeader = request.headers.get("X-Payment-Signature");

    if (!paymentHeader) {
      return NextResponse.json(
        { error: "Missing X-Payment header" },
        { status: 402 }
      );
    }

    // Parse payment header: x402:usdc://0x.../0.0001
    const payment = parsePaymentHeader(paymentHeader);
    
    if (!payment) {
      return NextResponse.json(
        { error: "Invalid X-Payment header format" },
        { status: 402 }
      );
    }

    // Validate scheme is supported
    if (!PAYMENT_SCHEMES[payment.scheme as keyof typeof PAYMENT_SCHEMES]) {
      return NextResponse.json(
        { error: `Unsupported payment scheme: ${payment.scheme}` },
        { status: 402 }
      );
    }

    // In production, verify the payment was made on-chain
    // For now, validate the header format and signature structure
    const isValid = await verifyPayment(payment, signatureHeader);

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 402 }
      );
    }

    // Generate access grant
    const accessGrant = {
      granted: true,
      scheme: payment.scheme,
      amount: payment.amount,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      quota: Math.floor(Number(payment.amount) / Number(PRICING.guardian.base)),
    };

    return NextResponse.json(accessGrant);
  } catch (error) {
    console.error("x402 payment error:", error);
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Parse x402 payment header
 * Format: x402:<scheme>://<address>/<amount>
 */
function parsePaymentHeader(header: string): {
  scheme: string;
  address: string;
  amount: string;
} | null {
  try {
    // Match: x402:usdc://0x123/0.0001
    const regex = /^x402:(\w+):\/\/(0x[a-fA-F0-9]+)\/([0-9.]+)$/;
    const match = header.match(regex);

    if (!match) {
      // Try alternate format: x402:<scheme>:<address>/<amount>
      const altRegex = /^x402:(\w+):(0x[a-fA-F0-9]+)\/([0-9.]+)$/;
      const altMatch = header.match(altRegex);
      
      if (altMatch) {
        return {
          scheme: altMatch[1],
          address: altMatch[2],
          amount: altMatch[3],
        };
      }
      return null;
    }

    return {
      scheme: match[1],
      address: match[2],
      amount: match[3],
    };
  } catch {
    return null;
  }
}

/**
 * Verify payment (stub - implement on-chain verification in production)
 */
async function verifyPayment(
  payment: { scheme: string; address: string; amount: string },
  signature: string | null
): Promise<boolean> {
  // In production:
  // 1. Verify signature if provided
  // 2. Check on-chain balance/allowance
  // 3. Verify payment hasn't been spent (UTXO-like tracking)
  
  // Development: just validate format
  if (!signature) {
    console.warn("No signature provided - dev mode");
    return true;
  }

  // Basic signature validation (ECDSA format check)
  const sigRegex = /^0x[a-fA-F0-9]{130}$/;
  return sigRegex.test(signature);
}
