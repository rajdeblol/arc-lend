import { AnchorProvider, Idl, Program } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID ?? "ArcLend1111111111111111111111111111111111");

const ARCLEND_IDL: Idl = {
  version: "0.1.0",
  name: "arclend",
  instructions: [],
};

export function getRpcConnection(): Connection {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (!endpoint) {
    throw new Error("Missing RPC endpoint configuration.");
  }
  return new Connection(endpoint, "confirmed");
}

export function getProgram(provider: AnchorProvider): Program {
  return new Program(ARCLEND_IDL, PROGRAM_ID, provider);
}

export function getReadOnlyProvider(): AnchorProvider {
  const signer = Keypair.generate();
  const wallet = {
    publicKey: signer.publicKey,
    signTransaction: async (tx: Transaction) => tx,
    signAllTransactions: async (txs: Transaction[]) => txs,
  };

  return new AnchorProvider(getRpcConnection(), wallet, {
    commitment: "confirmed",
  });
}
