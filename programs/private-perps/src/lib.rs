use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

pub mod encrypted_ixs {
    pub const OPEN_POSITION: &str = "open_position";
    pub const CHECK_LIQUIDATION: &str = "check_liquidation";
    pub const CLOSE_POSITION: &str = "close_position";
}

declare_id!("PrvP3rps1111111111111111111111111111111111");

#[arcium_program]
pub mod private_perps {
    use super::*;

    pub fn init_open_position_comp_def(ctx: Context<InitCompDefIx>) -> Result<()> {
        init_comp_def(ctx.accounts, None, None)?;
        Ok(())
    }

    pub fn init_check_liquidation_comp_def(ctx: Context<InitCompDefIx>) -> Result<()> {
        init_comp_def(ctx.accounts, None, None)?;
        Ok(())
    }

    pub fn init_close_position_comp_def(ctx: Context<InitCompDefIx>) -> Result<()> {
        init_comp_def(ctx.accounts, None, None)?;
        Ok(())
    }

    pub fn open_position(
        ctx: Context<OpenPosition>,
        position_id: u64,
        asset: u8,
        side: u8,
        encrypted_payload: Vec<u8>,
    ) -> Result<()> {
        require!(!encrypted_payload.is_empty(), PrivatePerpsError::EmptyCiphertext);

        queue_computation(
            &ctx.accounts,
            encrypted_ixs::OPEN_POSITION,
            position_id,
            encrypted_payload,
            0,
            None,
            None,
        )?;

        let clock = Clock::get()?;
        let position = &mut ctx.accounts.position;
        position.owner = ctx.accounts.owner.key();
        position.created_at = clock.unix_timestamp;
        position.updated_at = clock.unix_timestamp;
        position.is_open = true;
        position.position_id = position_id;
        position.asset = asset;
        position.side = side;
        position.encrypted_position = Vec::new();
        position.computation_offset = clock.slot;

        emit!(PositionOpenedEvent {
            position_id,
            owner: ctx.accounts.owner.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    pub fn check_liquidation(
        ctx: Context<CheckLiquidation>,
        position_id: u64,
        encrypted_payload: Vec<u8>,
    ) -> Result<()> {
        require!(ctx.accounts.position.is_open, PrivatePerpsError::PositionAlreadyClosed);
        require!(!encrypted_payload.is_empty(), PrivatePerpsError::EmptyCiphertext);

        queue_computation(
            &ctx.accounts,
            encrypted_ixs::CHECK_LIQUIDATION,
            position_id,
            encrypted_payload,
            0,
            None,
            None,
        )?;

        emit!(LiquidationCheckEvent {
            position_id,
            is_liquidatable_ciphertext: Vec::new(),
        });

        Ok(())
    }

    pub fn close_position(
        ctx: Context<ClosePosition>,
        position_id: u64,
        encrypted_payload: Vec<u8>,
    ) -> Result<()> {
        require!(ctx.accounts.position.is_open, PrivatePerpsError::PositionAlreadyClosed);
        require!(!encrypted_payload.is_empty(), PrivatePerpsError::EmptyCiphertext);

        queue_computation(
            &ctx.accounts,
            encrypted_ixs::CLOSE_POSITION,
            position_id,
            encrypted_payload,
            0,
            None,
            None,
        )?;

        Ok(())
    }

    #[arcium_callback(encrypted_ix = "open_position")]
    pub fn open_position_callback(
        ctx: Context<OpenPositionCallback>,
        _computation_offset: u64,
        output: Vec<u8>,
    ) -> Result<()> {
        require!(!output.is_empty(), PrivatePerpsError::InvalidCallbackOutput);
        let clock = Clock::get()?;
        let position = &mut ctx.accounts.position;
        position.encrypted_position = output;
        position.updated_at = clock.unix_timestamp;
        Ok(())
    }

    #[arcium_callback(encrypted_ix = "check_liquidation")]
    pub fn check_liquidation_callback(
        ctx: Context<CheckLiquidationCallback>,
        computation_offset: u64,
        output: Vec<u8>,
    ) -> Result<()> {
        require!(!output.is_empty(), PrivatePerpsError::InvalidCallbackOutput);

        emit!(LiquidationCheckEvent {
            position_id: ctx.accounts.position.position_id,
            is_liquidatable_ciphertext: output,
        });

        ctx.accounts.position.computation_offset = computation_offset;
        Ok(())
    }

    #[arcium_callback(encrypted_ix = "close_position")]
    pub fn close_position_callback(
        ctx: Context<ClosePositionCallback>,
        _computation_offset: u64,
        output: Vec<u8>,
    ) -> Result<()> {
        require!(!output.is_empty(), PrivatePerpsError::InvalidCallbackOutput);
        let clock = Clock::get()?;

        ctx.accounts.position.is_open = false;
        ctx.accounts.position.updated_at = clock.unix_timestamp;

        emit!(PnlRevealEvent {
            position_id: ctx.accounts.position.position_id,
            pnl_ciphertext: output,
            nonce: clock.slot,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitCompDefIx<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: Arcium PDA validated by Arcium program.
    #[account(mut)]
    pub computation_definition_account: UncheckedAccount<'info>,
    /// CHECK: Arcium protocol account.
    pub mxe_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(position_id: u64)]
pub struct OpenPosition<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = PositionAccount::LEN,
        seeds = [b"position", owner.key().as_ref(), &position_id.to_le_bytes()],
        bump
    )]
    pub position: Account<'info, PositionAccount>,
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
    pub system_program: Program<'info, System>,
    /// CHECK: Arcium queue account.
    #[account(mut)]
    pub computation_account: UncheckedAccount<'info>,
    /// CHECK: Arcium protocol account.
    pub mxe_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CheckLiquidation<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, has_one = owner)]
    pub position: Account<'info, PositionAccount>,
    /// CHECK: Arcium queue account.
    #[account(mut)]
    pub computation_account: UncheckedAccount<'info>,
    /// CHECK: Arcium protocol account.
    pub mxe_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ClosePosition<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, has_one = owner)]
    pub position: Account<'info, PositionAccount>,
    /// CHECK: Arcium queue account.
    #[account(mut)]
    pub computation_account: UncheckedAccount<'info>,
    /// CHECK: Arcium protocol account.
    pub mxe_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct OpenPositionCallback<'info> {
    /// CHECK: Verified by Arcium callback signer constraints.
    pub arcium_callback_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub position: Account<'info, PositionAccount>,
}

#[derive(Accounts)]
pub struct CheckLiquidationCallback<'info> {
    /// CHECK: Verified by Arcium callback signer constraints.
    pub arcium_callback_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub position: Account<'info, PositionAccount>,
}

#[derive(Accounts)]
pub struct ClosePositionCallback<'info> {
    /// CHECK: Verified by Arcium callback signer constraints.
    pub arcium_callback_authority: UncheckedAccount<'info>,
    #[account(mut)]
    pub position: Account<'info, PositionAccount>,
}

#[account]
pub struct PositionAccount {
    pub owner: Pubkey,
    pub position_id: u64,
    pub asset: u8,
    pub side: u8,
    pub created_at: i64,
    pub updated_at: i64,
    pub is_open: bool,
    pub computation_offset: u64,
    pub encrypted_position: Vec<u8>,
}

impl PositionAccount {
    pub const MAX_CIPHERTEXT_LEN: usize = 256;
    pub const LEN: usize = 8 + 32 + 8 + 1 + 1 + 8 + 8 + 1 + 8 + 4 + Self::MAX_CIPHERTEXT_LEN;
}

#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub fee_vault: Pubkey,
    pub encrypted_total_volume: Vec<u8>,
}

#[event]
pub struct PositionOpenedEvent {
    pub position_id: u64,
    pub owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct LiquidationCheckEvent {
    pub position_id: u64,
    pub is_liquidatable_ciphertext: Vec<u8>,
}

#[event]
pub struct PnlRevealEvent {
    pub position_id: u64,
    pub pnl_ciphertext: Vec<u8>,
    pub nonce: u64,
}

#[error_code]
pub enum PrivatePerpsError {
    #[msg("Encrypted payload cannot be empty.")]
    EmptyCiphertext,
    #[msg("Position is already closed.")]
    PositionAlreadyClosed,
    #[msg("Callback output is invalid.")]
    InvalidCallbackOutput,
}
