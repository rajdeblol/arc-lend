"use client";

import { motion } from "framer-motion";
import { MpcStep } from "@/types";

const STEP_LABEL: Record<MpcStep, string> = {
  IDLE: "Ready",
  ENCRYPTING: "Encrypting payload...",
  SUBMITTING: "Submitting to Arcium...",
  COMPUTING: "Running encrypted risk logic...",
  DECRYPTING: "Decrypting borrower output...",
  DONE: "Complete",
  ERROR: "We could not finish this action right now.",
};

export function MpcStatus({ step }: { step: MpcStep }) {
  return (
    <div className="arcade-outline rounded-xl bg-[rgb(var(--surface))] p-4">
      <div className="flex items-center justify-between text-sm text-text">
        <span className="font-semibold">Privacy engine</span>
        <span className="arcade-mono text-xs">{STEP_LABEL[step]}</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-black bg-white">
        <motion.div
          className="h-full bg-[rgb(var(--accent))]"
          initial={{ width: "0%" }}
          animate={{
            width:
              step === "IDLE"
                ? "0%"
                : step === "ENCRYPTING"
                  ? "20%"
                  : step === "SUBMITTING"
                    ? "45%"
                    : step === "COMPUTING"
                      ? "75%"
                      : "100%",
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
