/**
 * MagicBlock Blitz v2 — Verified Agent Oracles Client
 *
 * TypeScript client for interacting with the oracle-escrow Anchor program.
 * Handles delegation to TEE, score submission, and payment release.
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// TODO: Import anchor_lang Program after Anchor.toml setup
// import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";

/**
 * MagicBlockClient — High-level interface for Verified Agent Oracles
 */
export class MagicBlockClient {
  private connection: Connection;
  private teeConnection: Connection; // TEE RPC endpoint
  private programId: PublicKey;

  // TODO: Add program instance after SDK integration
  // private program: Program;

  constructor(
    solanaRpcUrl: string,
    teeRpcUrl: string,
    programId: string
  ) {
    this.connection = new Connection(solanaRpcUrl, "confirmed");
    this.teeConnection = new Connection(teeRpcUrl, "confirmed");
    this.programId = new PublicKey(programId);
  }

  /**
   * Initialize an escrow account for a story scoring task.
   *
   * @param anansiKeypair - Story writer's keypair (depositor)
   * @param ogmaPublicKey - Ogma's wallet (scorer)
   * @param thresholdScore - Minimum score (1-10) for payment release
   * @param amountSol - SOL amount to lock in escrow
   * @returns Escrow PDA public key
   */
  async initializeEscrow(
    anansiKeypair: Keypair,
    ogmaPublicKey: PublicKey,
    thresholdScore: number,
    amountSol: number
  ): Promise<PublicKey> {
    if (thresholdScore < 1 || thresholdScore > 10) {
      throw new Error("Threshold must be between 1 and 10");
    }

    const amountLamports = amountSol * LAMPORTS_PER_SOL;

    // Derive PDA for escrow account
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), anansiKeypair.publicKey.toBuffer()],
      this.programId
    );

    // TODO: Build initialize_escrow instruction
    // const ix = await this.program.methods
    //   .initializeEscrow(thresholdScore, amountLamports)
    //   .accounts({
    //     escrow: escrowPda,
    //     depositor: anansiKeypair.publicKey,
    //     recipient: ogmaPublicKey,
    //     systemProgram: SystemProgram.programId,
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // await sendAndConfirmTransaction(this.connection, tx, [anansiKeypair]);

    console.log("Escrow initialized:", escrowPda.toString());
    return escrowPda;
  }

  /**
   * Delegate the OgmaScore PDA to the TEE validator.
   * Prepares the account for scoring inside the PER.
   *
   * @param ogmaKeypair - Ogma's keypair
   * @param payer - Keypair to pay for delegation transaction
   */
  async delegateToTee(ogmaKeypair: Keypair, payer: Keypair): Promise<void> {
    const [scorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ogma_score"), ogmaKeypair.publicKey.toBuffer()],
      this.programId
    );

    // TODO: Build delegate_to_tee instruction
    // This will call the ephemeral-rollups-sdk delegation CPI
    //
    // const ix = await this.program.methods
    //   .delegateToTee()
    //   .accounts({
    //     ogmaScore: scorePda,
    //     payer: payer.publicKey,
    //     systemProgram: SystemProgram.programId,
    //     // ... TEE delegation context accounts from SDK
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // await sendAndConfirmTransaction(this.connection, tx, [payer, ogmaKeypair]);

    console.log("Delegated to TEE:", scorePda.toString());
  }

  /**
   * Get TEE authentication token.
   * Signs a message with Ogma's keypair to prove ownership,
   * then queries the TEE RPC for a JWT.
   *
   * @param ogmaKeypair - Ogma's keypair
   * @returns JWT token for TEE RPC access
   */
  async getTeeAuthToken(ogmaKeypair: Keypair): Promise<string> {
    // TODO: Implement TEE auth flow
    // 1. Sign a message (e.g., "ogma-auth-<timestamp>") with Ogma's keypair
    // 2. POST to TEE RPC with signature
    // 3. Receive JWT
    // 4. Use JWT in TEE_RPC_URL query string: https://tee.magicblock.app?token=<JWT>

    const mockToken = "mock_jwt_token_" + ogmaKeypair.publicKey.toString();
    console.log("TEE auth token obtained (mock):", mockToken);
    return mockToken;
  }

  /**
   * Submit a score from within the TEE PER.
   * This is called on the TEE RPC endpoint, not the regular Solana RPC.
   *
   * @param ogmaKeypair - Ogma's keypair
   * @param score - Cultural quality score (1-10)
   * @param storyHash - 32-byte hash of the story that was scored
   */
  async submitScoreInTee(
    ogmaKeypair: Keypair,
    score: number,
    storyHash: Buffer
  ): Promise<void> {
    if (score < 1 || score > 10) {
      throw new Error("Score must be between 1 and 10");
    }

    if (storyHash.length !== 32) {
      throw new Error("Story hash must be 32 bytes");
    }

    const [scorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ogma_score"), ogmaKeypair.publicKey.toBuffer()],
      this.programId
    );

    // TODO: Build submit_score instruction
    // Execute on TEE RPC endpoint (this.teeConnection)
    //
    // const ix = await this.program.methods
    //   .submitScore(score, Array.from(storyHash))
    //   .accounts({
    //     ogmaScore: scorePda,
    //     scorer: ogmaKeypair.publicKey,
    //     // ... commit context accounts from SDK
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // await sendAndConfirmTransaction(this.teeConnection, tx, [ogmaKeypair]);

    console.log("Score submitted in TEE:", score);
  }

  /**
   * Undelegate the OgmaScore PDA and commit final state back to Solana L1.
   * Waits for finalization before returning.
   *
   * @param payer - Keypair to pay for transaction
   */
  async undelegateAndFinalize(payer: Keypair): Promise<void> {
    // TODO: Build undelegate_and_finalize instruction
    // This triggers the commit back to Solana L1

    // const ix = await this.program.methods
    //   .undelegateAndFinalize()
    //   .accounts({
    //     // ...
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // await sendAndConfirmTransaction(this.connection, tx, [payer]);

    console.log("Undelegated from TEE, state committed to L1");
  }

  /**
   * Poll Solana L1 to confirm OgmaScore has been finalized.
   * Used after undelegation to ensure the score is on-chain before release_payment.
   *
   * @param scorePda - OgmaScore PDA address
   * @param maxRetries - Max polling attempts
   * @param retryDelayMs - Delay between retries
   */
  async waitForScoreFinalization(
    scorePda: PublicKey,
    maxRetries: number = 30,
    retryDelayMs: number = 1000
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const accountInfo = await this.connection.getAccountInfo(scorePda);
        if (accountInfo) {
          console.log("OgmaScore account finalized on L1");
          return;
        }
      } catch (err) {
        // Account not yet visible
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    throw new Error(
      "Timeout waiting for OgmaScore finalization on L1 (30 retries)"
    );
  }

  /**
   * Release payment from escrow if score meets threshold.
   *
   * @param callerKeypair - Keypair to pay for transaction
   * @param escrowPda - Escrow PDA address
   * @param scorePda - OgmaScore PDA address
   */
  async releasePayment(
    callerKeypair: Keypair,
    escrowPda: PublicKey,
    scorePda: PublicKey
  ): Promise<void> {
    // First, poll to ensure score is finalized on L1
    await this.waitForScoreFinalization(scorePda);

    // TODO: Build release_payment instruction
    // const ix = await this.program.methods
    //   .releasePayment()
    //   .accounts({
    //     escrow: escrowPda,
    //     ogmaScore: scorePda,
    //     recipient: /* ogma wallet */,
    //     systemProgram: SystemProgram.programId,
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // await sendAndConfirmTransaction(this.connection, tx, [callerKeypair]);

    console.log("Payment released:", escrowPda.toString());
  }

  /**
   * Refund escrow if score does not meet threshold.
   *
   * @param callerKeypair - Keypair to pay for transaction
   * @param escrowPda - Escrow PDA address
   * @param scorePda - OgmaScore PDA address
   * @param depositorPubkey - Anansi's wallet (refund recipient)
   */
  async refundEscrow(
    callerKeypair: Keypair,
    escrowPda: PublicKey,
    scorePda: PublicKey,
    depositorPubkey: PublicKey
  ): Promise<void> {
    // First, poll to ensure score is finalized on L1
    await this.waitForScoreFinalization(scorePda);

    // TODO: Build refund_escrow instruction
    // const ix = await this.program.methods
    //   .refundEscrow()
    //   .accounts({
    //     escrow: escrowPda,
    //     ogmaScore: scorePda,
    //     depositor: depositorPubkey,
    //     systemProgram: SystemProgram.programId,
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // await sendAndConfirmTransaction(this.connection, tx, [callerKeypair]);

    console.log("Escrow refunded to depositor:", depositorPubkey.toString());
  }

  /**
   * Full end-to-end flow:
   * 1. Initialize escrow (Anansi deposits SOL)
   * 2. Delegate to TEE (Ogma prepares score account)
   * 3. Get TEE auth token
   * 4. Score in TEE (Ogma submits score inside PER)
   * 5. Undelegate + commit (Score finalized on L1)
   * 6. Release or refund (Payment gated by score + attestation)
   *
   * @param anansiKeypair - Story writer's keypair
   * @param ogmaKeypair - Scorer's keypair
   * @param thresholdScore - Minimum score for payment
   * @param amountSol - SOL to lock in escrow
   * @param score - Computed cultural score
   * @param storyHash - 32-byte hash of story
   */
  async fullFlow(
    anansiKeypair: Keypair,
    ogmaKeypair: Keypair,
    thresholdScore: number,
    amountSol: number,
    score: number,
    storyHash: Buffer
  ): Promise<void> {
    console.log("=== Verified Agent Oracles: Full Flow ===");

    // Step 1: Initialize escrow
    console.log("Step 1: Initialize escrow...");
    const escrowPda = await this.initializeEscrow(
      anansiKeypair,
      ogmaKeypair.publicKey,
      thresholdScore,
      amountSol
    );

    // Step 2: Delegate to TEE
    console.log("Step 2: Delegate to TEE...");
    await this.delegateToTee(ogmaKeypair, anansiKeypair);

    // Step 3: Get TEE auth token
    console.log("Step 3: Get TEE auth token...");
    const teeToken = await this.getTeeAuthToken(ogmaKeypair);

    // Step 4: Score in TEE
    console.log("Step 4: Submit score in TEE...");
    await this.submitScoreInTee(ogmaKeypair, score, storyHash);

    // Step 5: Undelegate + commit
    console.log("Step 5: Undelegate and finalize...");
    await this.undelegateAndFinalize(anansiKeypair);

    // Step 6: Release or refund
    const [scorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ogma_score"), ogmaKeypair.publicKey.toBuffer()],
      this.programId
    );

    if (score >= thresholdScore) {
      console.log("Step 6: Release payment...");
      await this.releasePayment(anansiKeypair, escrowPda, scorePda);
    } else {
      console.log("Step 6: Refund escrow (score below threshold)...");
      await this.refundEscrow(
        anansiKeypair,
        escrowPda,
        scorePda,
        anansiKeypair.publicKey
      );
    }

    console.log("=== Flow Complete ===");
  }
}

// ============================================================================
// EXPORT FOR USE IN OTHER MODULES
// ============================================================================

export default MagicBlockClient;
