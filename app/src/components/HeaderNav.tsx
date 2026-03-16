"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function buttonClass(active: boolean): string {
  return active ? "arcade-btn arcade-btn-primary" : "arcade-btn arcade-btn-secondary";
}

export function HeaderNav() {
  const pathname = usePathname();

  const borrowActive = pathname === "/borrow" || pathname === "/trade";
  const loansActive = pathname === "/loans" || pathname === "/positions";
  const historyActive = pathname === "/history";
  const requirementsActive = pathname === "/requirements";

  return (
    <nav className="order-3 flex w-full items-center justify-center gap-2 text-base md:order-none md:w-auto">
      <Link href="/borrow" className={buttonClass(borrowActive)}>
        BORROW
      </Link>
      <Link href="/loans" className={buttonClass(loansActive)}>
        LOANS
      </Link>
      <Link href="/history" className={buttonClass(historyActive)}>
        HISTORY
      </Link>
      <Link href="/requirements" className={buttonClass(requirementsActive)}>
        REQUIREMENTS
      </Link>
      <a
        href="https://faucet.solana.com/"
        target="_blank"
        rel="noreferrer"
        className="arcade-btn arcade-btn-secondary"
      >
        FAUCET
      </a>
    </nav>
  );
}
