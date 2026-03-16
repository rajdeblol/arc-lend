use arcis::prelude::*;

#[derive(ArcisType, Clone, Copy)]
pub struct PositionState {
    pub side: u8,
    pub size_usd: u64,
    pub entry_price: u64,
    pub leverage: u8,
    pub liquidation_price: u64,
    pub maintenance_margin_bps: u16,
}

#[derive(ArcisType, Clone, Copy)]
pub struct PnlResult {
    pub realized_pnl: i64,
    pub is_profit: u8,
}

#[encrypted]
mod close_position_ix {
    use super::*;

    #[instruction]
    pub fn close_position(input: Enc<Shared, (Enc<Mxe, PositionState>, u64)>) -> Enc<Shared, PnlResult> {
        let (position_state, exit_price) = input.to_arcis();
        let state = position_state.to_arcis();

        let price_delta = if state.side == 0 {
            exit_price as i128 - state.entry_price as i128
        } else {
            state.entry_price as i128 - exit_price as i128
        };

        let notional = state.size_usd as i128;
        let pnl = (price_delta
            .saturating_mul(notional)
            .saturating_mul(state.leverage as i128))
            .saturating_div(state.entry_price as i128) as i64;

        let result = PnlResult {
            realized_pnl: pnl,
            is_profit: if pnl >= 0 { 1 } else { 0 },
        };

        input.owner.from_arcis(result)
    }
}
