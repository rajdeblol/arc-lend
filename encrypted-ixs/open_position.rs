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
mod open_position_ix {
    use super::*;

    #[instruction]
    pub fn open_position(input: Enc<Shared, (u8, u64, u64, u8)>) -> Enc<Mxe, PositionState> {
        let (side, size_usd, entry_price, leverage) = input.to_arcis();

        let lev = if leverage < 1 { 1 } else if leverage > 100 { 100 } else { leverage };
        let mm_bps = 500_u16;
        let margin_ratio_bps = 10_000_u64 / lev as u64;
        let mm_ratio_bps = mm_bps as u64;

        let liquidation_price = if side == 0 {
            entry_price.saturating_sub(entry_price.saturating_mul(margin_ratio_bps.saturating_sub(mm_ratio_bps)) / 10_000)
        } else {
            entry_price.saturating_add(entry_price.saturating_mul(margin_ratio_bps.saturating_sub(mm_ratio_bps)) / 10_000)
        };

        let state = PositionState {
            side,
            size_usd,
            entry_price,
            leverage: lev,
            liquidation_price,
            maintenance_margin_bps: mm_bps,
        };

        Mxe::from_arcis(state)
    }
}
