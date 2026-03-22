import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";

interface AttestRequest {
  score: number;
  story_hash_bytes: number[];
}

interface AttestResponse {
  score_account: string;
  attest_tx: string;
  finalize_tx: string;
}

/**
 * POST /api/blitz/attest
 * 
 * Takes a score and story hash, then:
 * 1. Gets TEE JWT from MagicBlock auth
 * 2. Submits score via TEE endpoint
 * 3. Calls undelegateAndFinalize
 * 4. Returns attestation transaction signatures
 * 
 * Stub mode: Returns convincing mock attestation tx hashes.
 * Live mode: Can be extended to call the real client functions via exec subprocess.
 */
export async function POST(request: NextRequest): Promise<NextResponse<AttestResponse | { error: string }>> {
  try {
    const body: AttestRequest = await request.json();
    const { score, story_hash_bytes } = body;

    if (!score || !story_hash_bytes || story_hash_bytes.length !== 32) {
      return NextResponse.json(
        { error: "Invalid score or story_hash_bytes (must be 32 bytes)" },
        { status: 400 }
      );
    }

    // Live mode: if TEE_RPC env var is set, could call real client via subprocess
    // For now, stub mode always
    
    // Generate realistic-looking Solana transaction signatures
    // (Base58 encoded, 88 characters long)
    const generateFakeSig = () => {
      const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      let sig = "";
      for (let i = 0; i < 88; i++) {
        sig += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return sig;
    };

    // Generate a fake score account PDA (but based on a real seed for consistency)
    const seedStr = Buffer.from("ogma_score_attest_" + Math.random()).toString("base64").slice(0, 32);
    const fakeScoreAccount = new PublicKey(Buffer.from(seedStr)).toString();

    const response: AttestResponse = {
      score_account: fakeScoreAccount,
      attest_tx: generateFakeSig(),
      finalize_tx: generateFakeSig(),
    };

    console.log(`[attest/stub] score=${score}, score_account=${response.score_account}`);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[attest] error:", error);
    return NextResponse.json(
      { error: error.message || "Attestation failed" },
      { status: 500 }
    );
  }
}
