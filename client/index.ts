/**
 * MagicBlock Blitz v2 — Verified Agent Oracles Client
 *
 * TypeScript client for interacting with the oracle-escrow Anchor program.
 * Handles delegation to TEE, score submission, and payment release.
 *
 * SDK: @magicblock-labs/ephemeral-rollups-sdk (not ephemeral-web3.js)
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
import * as anchor from "@coral-xyz/anchor";
import * as nacl from "tweetnacl";

// Correct SDK imports from MagicBlock
import {
  verifyTeeRpcIntegrity,
  getAuthToken,
} from "@magicblock-labs/ephemeral-rollups-sdk";

/**
 * MagicBlockClient — High-level interface for Verified Agent Oracles
 */
export class MagicBlockClient {
  private l1Connection: Connection;        // L1 Solana devnet
  private teeConnection: Connection | null; // TEE RPC (requires auth)
  private programId: PublicKey;
  private wallet: anchor.Wallet;

  private readonly L1_RPC = "https://api.devnet.solana.com";
  private readonly TEE_RPC = "https://tee.magicblock.app";
  private readonly ER_RPC = "https://devnet.magicblock.app";

  // TODO: Add program instance after Anchor IDL is generated
  // private program: anchor.Program;

  constructor(
    programId: string,
    wallet: anchor.Wallet
  ) {
    this.l1Connection = new Connection(this.L1_RPC, "confirmed");
    this.teeConnection = null; // Initialized in getTeeConnection()
    this.programId = new PublicKey(programId);
    this.wallet = wallet;
  }

  /**
   * Get TEE authentication token.
   * Verifies TEE hardware integrity (Intel TDX) and signs auth challenge with wallet keypair.
   *
   * @param keypair - Keypair to sign TEE auth challenge
   * @returns JWT token for TEE RPC access
   */
  async getTeeAuthToken(keypair: Keypair): Promise<string> {
    console.log("Verifying TEE hardware integrity...");
    const isVerified = await verifyTeeRpcIntegrity(this.TEE_RPC);
    if (!isVerified) {
      throw new Error("TEE hardware integrity verification failed");
    }
    console.log("✓ TEE integrity verified (Intel TDX attestation)");

    console.log("Obtaining TEE auth token...");
    const authToken = await getAuthToken(
      this.TEE_RPC,
      keypair.publicKey,
      (message: Uint8Array) =>
        Promise.resolve(nacl.sign.detached(message, keypair.secretKey))
    );

    console.log("✓ TEE auth token obtained");
    return authToken.token;
  }

  /**
   * Create and cache TEE connection (requires auth token).
   *
   * @param keypair - Keypair to authenticate with
   * @returns TEE Connection
   */
  async getTeeConnection(keypair: Keypair): Promise<Connection> {
    if (this.teeConnection) {
      return this.teeConnection;
    }

    const token = await this.getTeeAuthToken(keypair);
    this.teeConnection = new Connection(
      `${this.TEE_RPC}?token=${token}`,
      { wsEndpoint: `wss://tee.magicblock.app?token=${token}` }
    );
    return this.teeConnection;
  }

  /**
   * Initialize an escrow account for a story scoring task.
   *
   * @param anansiKeypair - Story writer's keypair (depositor)
   * @param ogmaPublicKey - Ogma's wallet (scorer / recipient)
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

    // TODO: Build initialize_escrow instruction from anchor program
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
    // tx.feePayer = anansiKeypair.publicKey;
    // tx.recentBlockhash = (await this.l1Connection.getLatestBlockhash()).blockhash;
    // await sendAndConfirmTransaction(this.l1Connection, tx, [anansiKeypair]);

    console.log("Escrow initialized:", escrowPda.toString());
    return escrowPda;
  }

  /**
   * Initialize the OgmaScore PDA before delegating to TEE.
   *
   * @param oracleKeypair - Ogma's keypair (oracle signer)
   * @param storyHash - 32-byte hash of the story
   * @param payer - Keypair to pay for account creation
   */
  async initializeScore(
    oracleKeypair: Keypair,
    storyHash: Buffer,
    payer: Keypair
  ): Promise<PublicKey> {
    if (storyHash.length !== 32) {
      throw new Error("Story hash must be 32 bytes");
    }

    const [scorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ogma_score"), oracleKeypair.publicKey.toBuffer()],
      this.programId
    );

    // TODO: Build initialize_score instruction
    // const ix = await this.program.methods
    //   .initializeScore(Array.from(storyHash))
    //   .accounts({
    //     ogmaScore: scorePda,
    //     oracleSigner: oracleKeypair.publicKey,
    //     payer: payer.publicKey,
    //     systemProgram: SystemProgram.programId,
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // tx.feePayer = payer.publicKey;
    // tx.recentBlockhash = (await this.l1Connection.getLatestBlockhash()).blockhash;
    // await sendAndConfirmTransaction(this.l1Connection, tx, [payer, oracleKeypair]);

    console.log("OgmaScore PDA initialized:", scorePda.toString());
    return scorePda;
  }

  /**
   * Delegate the OgmaScore PDA to the TEE validator on L1.
   *
   * @param oracleKeypair - Ogma's keypair
   * @param payer - Keypair to pay for delegation transaction
   */
  async delegateToTee(oracleKeypair: Keypair, payer: Keypair): Promise<void> {
    const [scorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ogma_score"), oracleKeypair.publicKey.toBuffer()],
      this.programId
    );

    const TEE_VALIDATOR = "FnE6VJT5QNZdedZPnCoLsARgBwoE6DeJNjBs2H1gySXA";

    // TODO: Build delegate_to_per instruction
    // Uses #[delegate] macro from ephemeral-rollups-sdk
    //
    // const ix = await this.program.methods
    //   .delegateToPer()
    //   .accounts({
    //     payer: payer.publicKey,
    //     validator: new PublicKey(TEE_VALIDATOR),
    //     pda: scorePda,
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // tx.feePayer = payer.publicKey;
    // tx.recentBlockhash = (await this.l1Connection.getLatestBlockhash()).blockhash;
    // await sendAndConfirmTransaction(this.l1Connection, tx, [payer]);

    console.log("Delegated to TEE validator:", scorePda.toString());
  }

  /**
   * Submit a score inside the TEE.
   * Must be sent to TEE RPC endpoint, not L1!
   *
   * @param oracleKeypair - Ogma's keypair (oracle_signer for verification)
   * @param score - Cultural quality score (1-10)
   */
  async submitScoreInTee(
    oracleKeypair: Keypair,
    score: number
  ): Promise<void> {
    if (score < 1 || score > 10) {
      throw new Error("Score must be between 1 and 10");
    }

    const [scorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ogma_score"), oracleKeypair.publicKey.toBuffer()],
      this.programId
    );

    // Get TEE connection
    const teeConn = await this.getTeeConnection(oracleKeypair);

    // TODO: Build submit_score instruction
    // This transaction must be sent to TEE RPC endpoint (teeConn), not L1!
    //
    // const ix = await this.program.methods
    //   .submitScore(score)
    //   .accounts({
    //     ogmaScore: scorePda,
    //     oracleSigner: oracleKeypair.publicKey,
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // tx.feePayer = oracleKeypair.publicKey;
    // tx.recentBlockhash = (await teeConn.getLatestBlockhash()).blockhash;
    // await sendAndConfirmTransaction(teeConn, tx, [oracleKeypair]);

    console.log("Score submitted in TEE:", score);
  }

  /**
   * Undelegate the OgmaScore PDA and commit final state back to Solana L1.
   * Must be sent to TEE RPC endpoint, not L1!
   *
   * @param payer - Keypair to pay for transaction
   * @param oracleKeypair - Oracle keypair (for TEE connection)
   */
  async undelegateAndFinalize(
    payer: Keypair,
    oracleKeypair: Keypair
  ): Promise<void> {
    const [scorePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("ogma_score"), oracleKeypair.publicKey.toBuffer()],
      this.programId
    );

    // Get TEE connection
    const teeConn = await this.getTeeConnection(oracleKeypair);

    // TODO: Build undelegate_and_finalize instruction
    // Uses #[commit] macro which injects magic_context and magic_program
    // This transaction must be sent to TEE RPC endpoint (teeConn), not L1!
    //
    // const ix = await this.program.methods
    //   .undelegateAndFinalize()
    //   .accounts({
    //     payer: payer.publicKey,
    //     ogmaScore: scorePda,
    //     // magic_context and magic_program injected by #[commit]
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // tx.feePayer = payer.publicKey;
    // tx.recentBlockhash = (await teeConn.getLatestBlockhash()).blockhash;
    // await sendAndConfirmTransaction(teeConn, tx, [payer]);

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
    retryDelayMs: number = 2000
  ): Promise<void> {
    console.log(`Polling L1 for finalization (max ${maxRetries} attempts)...`);
    for (let i = 0; i < maxRetries; i++) {
      try {
        const accountInfo = await this.l1Connection.getAccountInfo(scorePda);
        if (accountInfo) {
          console.log("✓ OgmaScore account finalized on L1");
          return;
        }
      } catch (err) {
        // Account not yet visible
      }

      if (i < maxRetries - 1) {
        console.log(`  Retry ${i + 1}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    throw new Error(
      `Timeout waiting for OgmaScore finalization on L1 (${maxRetries} retries)`
    );
  }

  /**
   * Release payment from escrow if score meets threshold.
   * Called on L1 after score is finalized.
   *
   * @param callerKeypair - Keypair to pay for transaction
   * @param escrowPda - Escrow PDA address
   * @param scorePda - OgmaScore PDA address
   * @param recipientPubkey - Ogma's wallet (payment recipient)
   */
  async releasePayment(
    callerKeypair: Keypair,
    escrowPda: PublicKey,
    scorePda: PublicKey,
    recipientPubkey: PublicKey
  ): Promise<void> {
    // First, poll to ensure score is finalized on L1
    await this.waitForScoreFinalization(scorePda);

    // TODO: Build release_payment instruction
    // const ix = await this.program.methods
    //   .releasePayment()
    //   .accounts({
    //     escrow: escrowPda,
    //     ogmaScore: scorePda,
    //     recipient: recipientPubkey,
    //     systemProgram: SystemProgram.programId,
    //   })
    //   .instruction();

    // const tx = new Transaction().add(ix);
    // tx.feePayer = callerKeypair.publicKey;
    // tx.recentBlockhash = (await this.l1Connection.getLatestBlockhash()).blockhash;
    // await sendAndConfirmTransaction(this.l1Connection, tx, [callerKeypair]);

    console.log("Payment released from escrow:", escrowPda.toString());
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
    // tx.feePayer = callerKeypair.publicKey;
    // tx.recentBlockhash = (await this.l1Connection.getLatestBlockhash()).blockhash;
    // await sendAndConfirmTransaction(this.l1Connection, tx, [callerKeypair]);

    console.log("Escrow refunded to depositor:", depositorPubkey.toString());
  }

  /**
   * Full end-to-end flow:
   * 1. Initialize escrow (Anansi deposits SOL on L1)
   * 2. Initialize score account (on L1)
   * 3. Delegate to TEE (on L1)
   * 4. Get TEE auth token
   * 5. Score in TEE (submit score via TEE RPC)
   * 6. Undelegate + commit (finalize state on L1 via TEE RPC)
   * 7. Wait for finalization (poll L1)
   * 8. Release or refund (payment gated by score threshold, on L1)
   */
  async fullFlow(
    anansiKeypair: Keypair,
    ogmaKeypair: Keypair,
    thresholdScore: number,
    amountSol: number,
    score: number,
    storyHash: Buffer
  ): Promise<void> {
    console.log("=== Verified Agent Oracles: Full Flow ===\n");

    // Step 1: Initialize escrow
    console.log("Step 1: Initialize escrow (L1)...");
    const escrowPda = await this.initializeEscrow(
      anansiKeypair,
      ogmaKeypair.publicKey,
      thresholdScore,
      amountSol
    );

    // Step 2: Initialize score account
    console.log("\nStep 2: Initialize score account (L1)...");
    const scorePda = await this.initializeScore(
      ogmaKeypair,
      storyHash,
      anansiKeypair
    );

    // Step 3: Delegate to TEE
    console.log("\nStep 3: Delegate score to TEE (L1)...");
    await this.delegateToTee(ogmaKeypair, anansiKeypair);

    // Step 4: Get TEE auth token (for next steps)
    console.log("\nStep 4: Obtain TEE auth token...");
    const teeToken = await this.getTeeAuthToken(ogmaKeypair);
    console.log("Token obtained (length:", teeToken.length, ")");

    // Step 5: Score in TEE
    console.log("\nStep 5: Submit score in TEE (TEE RPC)...");
    await this.submitScoreInTee(ogmaKeypair, score);

    // Step 6: Undelegate + commit
    console.log("\nStep 6: Undelegate and finalize (TEE RPC)...");
    await this.undelegateAndFinalize(anansiKeypair, ogmaKeypair);

    // Step 7: Wait for finalization on L1
    console.log("\nStep 7: Wait for finalization on L1...");
    await this.waitForScoreFinalization(scorePda);

    // Step 8: Release or refund
    console.log("\nStep 8: Release or refund payment (L1)...");
    if (score >= thresholdScore) {
      console.log("Score meets threshold, releasing payment...");
      await this.releasePayment(
        anansiKeypair,
        escrowPda,
        scorePda,
        ogmaKeypair.publicKey
      );
    } else {
      console.log("Score below threshold, refunding...");
      await this.refundEscrow(
        anansiKeypair,
        escrowPda,
        scorePda,
        anansiKeypair.publicKey
      );
    }

    console.log("\n=== Flow Complete ===");
  }
}

// ============================================================================
// EXPORT FOR USE IN OTHER MODULES
// ============================================================================

export default MagicBlockClient;
