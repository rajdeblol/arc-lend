import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <div>
        <p className="arcade-chip mb-4 inline-flex">
          ARCLEND X ARCIUM ON TESTNET
        </p>
        <h1 className="text-4xl font-black leading-tight md:text-6xl">
          ARCLEND: PRIVATE CREDIT RAILS BUILT FOR ARCIUM.
        </h1>
        <p className="arcade-mono mt-5 max-w-2xl text-xl text-text-muted">
          ArcLend keeps collateral state, borrow balances, and health factors encrypted while Arcium MPC executes LTV,
          interest, and liquidation logic privately.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/borrow" className="arcade-btn arcade-btn-primary text-lg">
            OPEN PRIVATE LOAN
          </Link>
          <Link href="/loans" className="arcade-btn arcade-btn-secondary text-lg">
            MANAGE ACTIVE LOANS
          </Link>
        </div>
      </div>
      <div className="arcade-outline rounded-3xl bg-[rgb(var(--panel-soft))] p-8">
        <h2 className="text-3xl font-black">WHY THIS MATTERS</h2>
        <ul className="arcade-mono mt-4 space-y-3 text-base text-text-muted">
          <li>Collateral and borrow balances remain encrypted end-to-end</li>
          <li>LTV, interest updates, and liquidation checks run in encrypted state</li>
          <li>Only the borrower sees final settlement outputs from Arcium compute</li>
        </ul>
      </div>
      <div className="arcade-outline md:col-span-2 rounded-2xl bg-[rgb(var(--surface-subtle))] p-5 text-sm text-text-muted">
        <p>
          Disclaimer: ArcLend is currently for testing/demo use only and runs on testnet environments. Do not use real
          funds.
        </p>
        <p className="mt-2">
          Built by{" "}
          <a
            href="https://x.com/rajlol01"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[rgb(var(--accent))] underline"
          >
            Rajlol
          </a>
          .
        </p>
        <p className="mt-2">
          Requirement summary:{" "}
          <Link href="/requirements" className="font-bold text-[rgb(var(--accent))] underline">
            View submission checklist
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
