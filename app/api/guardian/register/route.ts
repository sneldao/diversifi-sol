import { NextRequest, NextResponse } from 'next/server';

// In-memory store for demo purposes
// In production, this would be a database
const guardians = new Map<string, {
  walletAddress: string;
  guardianId: string;
  deployedAt: string;
  status: 'active' | 'paused' | 'error';
  monitoringConfig: {
    refreshInterval: number;
    alertChannels: string[];
    healthCheckEnabled: boolean;
    yieldOptimizationEnabled: boolean;
    rebalanceEnabled: boolean;
  };
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate Solana wallet address (base58, 32-44 chars)
    if (walletAddress.length < 32 || walletAddress.length > 44) {
      return NextResponse.json(
        { error: 'Invalid Solana wallet address' },
        { status: 400 }
      );
    }

    // Check if guardian already exists for this wallet
    const existingGuardian = guardians.get(walletAddress);
    if (existingGuardian) {
      // Return existing guardian info
      return NextResponse.json({
        message: 'Guardian already deployed',
        guardianId: existingGuardian.guardianId,
        deployedAt: existingGuardian.deployedAt,
        status: existingGuardian.status,
        monitoringConfig: existingGuardian.monitoringConfig,
        isExisting: true,
      });
    }

    // Generate unique guardian ID
    const guardianId = `GRD-${walletAddress.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const deployedAt = new Date().toISOString();

    // Create new guardian record
    const guardian = {
      walletAddress,
      guardianId,
      deployedAt,
      status: 'active' as const,
      monitoringConfig: {
        refreshInterval: 30, // seconds
        alertChannels: ['push', 'email'],
        healthCheckEnabled: true,
        yieldOptimizationEnabled: true,
        rebalanceEnabled: false,
      },
    };

    // Store guardian
    guardians.set(walletAddress, guardian);

    // Log deployment (in production, this would go to a database/logging service)
    console.log(`[Guardian Registry] New guardian deployed: ${guardianId} for wallet ${walletAddress}`);

    // Return guardian info
    return NextResponse.json({
      message: 'Guardian deployed successfully',
      guardianId,
      deployedAt,
      status: 'active',
      monitoringConfig: guardian.monitoringConfig,
      isExisting: false,
    });
  } catch (error) {
    console.error('[Guardian Registry] Error:', error);
    return NextResponse.json(
      { error: 'Failed to deploy guardian' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  const guardianId = searchParams.get('id');

  try {
    // Get by wallet address
    if (wallet) {
      const guardian = guardians.get(wallet);
      if (!guardian) {
        return NextResponse.json(
          { error: 'Guardian not found for this wallet' },
          { status: 404 }
        );
      }
      return NextResponse.json(guardian);
    }

    // Get by guardian ID (search through all)
    if (guardianId) {
      const found = Array.from(guardians.values()).find(
        g => g.guardianId === guardianId
      );
      if (found) {
        return NextResponse.json(found);
      }
      return NextResponse.json(
        { error: 'Guardian not found' },
        { status: 404 }
      );
    }

    // List all guardians (for admin/debugging)
    return NextResponse.json({
      total: guardians.size,
      guardians: Array.from(guardians.values()).map(g => ({
        guardianId: g.guardianId,
        walletAddress: `${g.walletAddress.slice(0, 4)}...${g.walletAddress.slice(-4)}`,
        status: g.status,
        deployedAt: g.deployedAt,
      })),
    });
  } catch (error) {
    console.error('[Guardian Registry] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve guardian info' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, monitoringConfig } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const guardian = guardians.get(walletAddress);
    if (!guardian) {
      return NextResponse.json(
        { error: 'Guardian not found' },
        { status: 404 }
      );
    }

    // Update monitoring configuration
    if (monitoringConfig) {
      guardian.monitoringConfig = {
        ...guardian.monitoringConfig,
        ...monitoringConfig,
      };
      guardians.set(walletAddress, guardian);
    }

    return NextResponse.json({
      message: 'Guardian updated successfully',
      guardianId: guardian.guardianId,
      monitoringConfig: guardian.monitoringConfig,
    });
  } catch (error) {
    console.error('[Guardian Registry] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update guardian' },
      { status: 500 }
    );
  }
}
