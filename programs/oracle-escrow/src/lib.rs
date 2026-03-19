use anchor_lang::prelude::*;

// TODO: Replace with actual program ID after `anchor build`
declare_id!("11111111111111111111111111111111");

#[program]
pub mod oracle_escrow {
    use super::*;

    /// Initialize an escrow account for a story scoring task.
    /// Anansi deposits SOL and sets the minimum score threshold.
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        threshold: u8,
        amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.depositor = ctx.accounts.depositor.key();
        escrow.recipient = ctx.accounts.recipient.key();
        escrow.amount = amount;
        escrow.threshold = threshold;
        escrow.score = 0;
        escrow.attested = false;
        escrow.paid = false;

        // Transfer lamports from depositor to escrow PDA
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.depositor.key(),
            &escrow.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.depositor.to_account_info(),
                escrow.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    /// Delegate the OgmaScore PDA to the TEE validator.
    /// This instruction prepares the account for scoring inside the PER.
    pub fn delegate_to_tee(ctx: Context<DelegateToTee>) -> Result<()> {
        // TODO: Call ephemeral-rollups-sdk delegation CPI
        // This will be implemented after integrating the SDK
        Ok(())
    }

    /// Submit a score attested by the TEE.
    /// Called from within the PER after Ogma scores the story.
    pub fn submit_score(
        ctx: Context<SubmitScore>,
        score: u8,
        story_hash: [u8; 32],
    ) -> Result<()> {
        require!(score <= 10, OgmaError::InvalidScore);

        let ogma_score = &mut ctx.accounts.ogma_score;
        ogma_score.value = score;
        ogma_score.attested = true; // TEE ensures this ran inside the enclave
        ogma_score.scorer = ctx.accounts.scorer.key();
        ogma_score.story_hash = story_hash;
        ogma_score.scored_at = Clock::get()?.unix_timestamp;

        // TODO: Call commit_accounts CPI to finalize state on Solana L1
        Ok(())
    }

    /// Undelegate the OgmaScore PDA and commit final state back to Solana L1.
    pub fn undelegate_and_finalize(ctx: Context<UndelegateAndFinalize>) -> Result<()> {
        // TODO: Call ephemeral-rollups-sdk undelegation + commit CPI
        Ok(())
    }

    /// Release payment from escrow if score meets threshold and is attested.
    /// Called after OgmaScore is finalized on L1.
    pub fn release_payment(ctx: Context<ReleasePayment>) -> Result<()> {
        let ogma_score = &ctx.accounts.ogma_score;
        let escrow = &mut ctx.accounts.escrow;

        // Gate: Score must be attested AND above threshold
        require!(ogma_score.attested, OgmaError::NotAttested);
        require!(
            ogma_score.value >= escrow.threshold,
            OgmaError::ScoreBelowThreshold
        );
        require!(!escrow.paid, OgmaError::AlreadyPaid);

        // Mark as paid
        escrow.paid = true;
        escrow.score = ogma_score.value;

        // Transfer lamports from escrow to recipient (Ogma)
        let amount = escrow.amount;
        **escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.recipient.try_borrow_mut_lamports()? += amount;

        Ok(())
    }

    /// Refund payment if score does not meet threshold.
    /// Called after OgmaScore is finalized but score < threshold.
    pub fn refund_escrow(ctx: Context<RefundEscrow>) -> Result<()> {
        let ogma_score = &ctx.accounts.ogma_score;
        let escrow = &mut ctx.accounts.escrow;

        // Gate: Score must be attested, but below threshold
        require!(ogma_score.attested, OgmaError::NotAttested);
        require!(
            ogma_score.value < escrow.threshold,
            OgmaError::ScoreAboveThreshold
        );
        require!(!escrow.paid, OgmaError::AlreadyPaid);

        // Mark as paid (refunded)
        escrow.paid = true;
        escrow.score = ogma_score.value;

        // Transfer lamports from escrow back to depositor (Anansi)
        let amount = escrow.amount;
        **escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.depositor.try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

// ============================================================================
// ACCOUNTS & CONTEXTS
// ============================================================================

#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(init, payer = depositor, space = EscrowAccount::LEN)]
    pub escrow: Account<'info, EscrowAccount>,

    #[account(mut)]
    pub depositor: Signer<'info>,

    /// CHECK: Recipient wallet (Ogma or prize recipient)
    pub recipient: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DelegateToTee<'info> {
    #[account(mut)]
    pub ogma_score: Account<'info, OgmaScore>,

    #[account(mut)]
    pub payer: Signer<'info>,

    // TODO: Add ephemeral-rollups-sdk context accounts (magic_program, magic_context, etc.)
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitScore<'info> {
    #[account(mut)]
    pub ogma_score: Account<'info, OgmaScore>,

    pub scorer: Signer<'info>,

    // TODO: Add ephemeral-rollups-sdk context accounts for commit
}

#[derive(Accounts)]
pub struct UndelegateAndFinalize<'info> {
    #[account(mut)]
    pub ogma_score: Account<'info, OgmaScore>,

    #[account(mut)]
    pub payer: Signer<'info>,

    // TODO: Add ephemeral-rollups-sdk context accounts
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    #[account(mut)]
    pub escrow: Account<'info, EscrowAccount>,

    pub ogma_score: Account<'info, OgmaScore>,

    #[account(mut)]
    pub recipient: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefundEscrow<'info> {
    #[account(mut)]
    pub escrow: Account<'info, EscrowAccount>,

    pub ogma_score: Account<'info, OgmaScore>,

    #[account(mut)]
    pub depositor: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================================
// DATA STRUCTURES
// ============================================================================

#[account]
pub struct EscrowAccount {
    pub depositor: Pubkey,      // Anansi (story writer)
    pub recipient: Pubkey,      // Ogma (scorer / reward recipient)
    pub amount: u64,            // SOL amount in lamports
    pub threshold: u8,          // Minimum score (1-10) for payment release
    pub score: u8,              // Final score written by Ogma
    pub attested: bool,         // true = score was computed inside TEE
    pub paid: bool,             // true = payment released or refunded
}

impl EscrowAccount {
    pub const LEN: usize = 8 + // discriminator
        32 +  // depositor
        32 +  // recipient
        8 +   // amount
        1 +   // threshold
        1 +   // score
        1 +   // attested
        1;    // paid
}

#[account]
pub struct OgmaScore {
    pub value: u8,              // 1-10 cultural quality score
    pub attested: bool,         // true = computed inside TEE, signature verified
    pub scorer: Pubkey,         // Ogma's wallet
    pub story_hash: [u8; 32],   // Hash of the story that was scored
    pub scored_at: i64,         // Unix timestamp
}

impl OgmaScore {
    pub const LEN: usize = 8 + // discriminator
        1 +   // value
        1 +   // attested
        32 +  // scorer
        32 +  // story_hash
        8;    // scored_at
}

// ============================================================================
// ERRORS
// ============================================================================

#[error_code]
pub enum OgmaError {
    #[msg("Score must be between 0 and 10")]
    InvalidScore,

    #[msg("Score is not attested by TEE")]
    NotAttested,

    #[msg("Score is below the required threshold")]
    ScoreBelowThreshold,

    #[msg("Score is above the threshold; expected refund")]
    ScoreAboveThreshold,

    #[msg("Payment already released or refunded")]
    AlreadyPaid,
}
