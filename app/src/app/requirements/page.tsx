import Link from "next/link";

export default function RequirementsPage() {
  return (
    <section className="py-8">
      <h1 className="text-center text-5xl font-black md:text-6xl">
        SUBMISSION <span className="text-[rgb(var(--accent))]">CHECKLIST</span>
      </h1>

      <div className="mx-auto mt-8 grid max-w-4xl gap-4">
        <article className="arcade-outline rounded-2xl bg-[rgb(var(--panel-soft))] p-5">
          <h2 className="text-xl font-bold">Functional Solana project integrated with Arcium</h2>
          <ul className="arcade-mono mt-3 space-y-2 text-sm text-text-muted">
            <li>Wallet-based Solana flow implemented in frontend.</li>
            <li>Arcium integration in `app/src/lib/arcium.ts` and `app/src/lib/encryption.ts`.</li>
            <li>Encrypted instructions and program scaffolding in `encrypted-ixs/` and `programs/`.</li>
          </ul>
        </article>

        <article className="arcade-outline rounded-2xl bg-[rgb(var(--panel-soft))] p-5">
          <h2 className="text-xl font-bold">How Arcium is used + privacy benefits</h2>
          <ul className="arcade-mono mt-3 space-y-2 text-sm text-text-muted">
            <li>Borrow input payloads are encrypted before private computation.</li>
            <li>LTV/health/liquidation logic executes in encrypted state.</li>
            <li>Sensitive borrower risk factors are not publicly exposed onchain in plain form.</li>
          </ul>
        </article>

        <article className="arcade-outline rounded-2xl bg-[rgb(var(--panel-soft))] p-5">
          <h2 className="text-xl font-bold">How ArcLend uses Arcium in this site</h2>
          <ol className="arcade-mono mt-3 list-decimal space-y-2 pl-5 text-sm text-text-muted">
            <li>User submits borrow intent (collateral, debt, term) from the ArcLend UI.</li>
            <li>The payload is encrypted client-side before private risk processing.</li>
            <li>Arcium-integrated flow handles private risk semantics for LTV/health/liquidation checks.</li>
            <li>The UI shows borrower-facing outcomes without exposing raw collateral/health values publicly.</li>
          </ol>
          <p className="arcade-mono mt-3 text-sm text-text-muted">
            Integration references: <span className="font-bold">app/src/lib/arcium.ts</span>,{" "}
            <span className="font-bold">app/src/lib/encryption.ts</span>,{" "}
            <span className="font-bold">encrypted-ixs/</span>.
          </p>
        </article>

      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="arcade-btn arcade-btn-secondary">
          BACK TO HOME
        </Link>
      </div>
    </section>
  );
}
