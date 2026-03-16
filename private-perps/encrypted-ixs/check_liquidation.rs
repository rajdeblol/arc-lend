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

#[encrypted]
mod check_liquidation_ix {
    use super::*;

    #[instruction]
    pub fn check_liquidation(input: Enc<Shared, (Enc<Mxe, PositionState>, u64)>) -> Enc<Shared, u8> {
        let (position_state, current_price) = input.to_arcis();
        let state = position_state.to_arcis();

        let is_liquidatable = if state.side == 0 {
            current_price <= state.liquidation_price
        } else {
            current_price >= state.liquidation_price
        };

        input.owner.from_arcis(if is_liquidatable { 1_u8 } else { 0_u8 })
    }
}
