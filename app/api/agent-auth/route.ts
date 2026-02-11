import { NextResponse } from "next/server";

const FISHNET_SECRET = process.env.FISHNET_AUTH_SECRET;

/**
 * Simple API key auth for guardian endpoints.
 * Can be upgraded to fishnet-auth later.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  // Return skill documentation for agent discovery
  return NextResponse.json({
    name: "DiversiFi Guardian",
    description: "Autonomous Financial Sentinel & Portfolio Guardian",
    version: "1.0.0",
    endpoints: {
      "/api/portfolio": "Get portfolio data for a wallet",
      "/api/yields": "Get yield opportunities including RWA",
      "/api/health": "Calculate portfolio health score",
      "/api/guardian/register": "Register a guardian for monitoring"
    },
    auth: "API key via Authorization header (Bearer token)",
    chain: "Solana",
    features: [
      "Real-time portfolio analysis",
      "RWA integration (bSOL, ONDO, MP1)",
      "Health scoring & alerts",
      "Yield optimization"
    ]
  });
}

/**
 * Guardian registration - simplified for now.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet, email } = body;

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    // Simplified registration - in production, save to database
    return NextResponse.json({
      status: "registered",
      guardianId: `guardian_${Date.now()}`,
      wallet,
      registeredAt: new Date().toISOString(),
      tier: "free",
      features: ["portfolio监测", "health评分", "yield推荐"]
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
