import { NextRequest, NextResponse } from "next/server";

interface ReleaseRequest {
  score_account: string;
}

interface ReleaseResponse {
  payment_tx: string;
  paid: boolean;
}

/**
 * POST /api/blitz/release
 * 
 * Takes a score account, then:
 * 1. Calls releasePayment instruction on L1 Solana devnet
 * 2. Returns the payment transaction signature
 * 
 * Stub mode: Returns a realistic fake tx signature.
 * Live mode: Can be extended to call the real client functions.
 * 
 * This is called AFTER the TEE attestation flow completes.
 */
export async function POST(request: NextRequest): Promise<NextResponse<ReleaseResponse | { error: string }>> {
  try {
    const body: ReleaseRequest = await request.json();
    const { score_account } = body;

    if (!score_account) {
      return NextResponse.json(
        { error: "score_account is required" },
        { status: 400 }
      );
    }

    // Generate realistic-looking Solana transaction signature
    const generateFakeSig = () => {
      const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      let sig = "";
      for (let i = 0; i < 88; i++) {
        sig += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return sig;
    };

    console.log(`[release/stub] score_account=${score_account}`);

    return NextResponse.json({
      payment_tx: generateFakeSig(),
      paid: true,
    });
  } catch (error: any) {
    console.error("[release] error:", error);
    return NextResponse.json(
      { error: error.message || "Release failed" },
      { status: 500 }
    );
  }
}
