import * as ArciumClient from "@arcium-hq/client";
import { Connection } from "@solana/web3.js";
import { createEncryptionContext, decryptPayload, encryptPayload } from "@/lib/encryption";
import { PnlResult } from "@/types";

const DEVNET_CLUSTER_OFFSET = 456;
const FALLBACK_SECRET_SIZE = 32;
const ENABLE_ARCIUM_SDK = process.env.NEXT_PUBLIC_ENABLE_ARCIUM === "true";

type ArciumModule = Record<string, unknown>;
type MaybeMxeResponse =
  | Uint8Array
  | { mxePublicKey?: Uint8Array; publicKey?: Uint8Array; key?: Uint8Array }
  | undefined;

function getFallbackSecret(): Uint8Array {
  const bytes = new Uint8Array(FALLBACK_SECRET_SIZE);
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(bytes);
  }
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

function normalizeMxeKey(value: MaybeMxeResponse): Uint8Array | null {
  if (!value) {
    return null;
  }
  if (value instanceof Uint8Array) {
    return value;
  }
  if (value.mxePublicKey instanceof Uint8Array) {
    return value.mxePublicKey;
  }
  if (value.publicKey instanceof Uint8Array) {
    return value.publicKey;
  }
  if (value.key instanceof Uint8Array) {
    return value.key;
  }
  return null;
}

async function resolveMxePublicKey(): Promise<Uint8Array> {
  if (!ENABLE_ARCIUM_SDK) {
    return getFallbackSecret();
  }
  const client = ArciumClient as unknown as ArciumModule;

  const withRetry = client.getMXEPublicKeyWithRetry as
    | ((args: { clusterOffset: number; maxRetries: number }) => Promise<MaybeMxeResponse>)
    | undefined;
  if (typeof withRetry === "function") {
    const result = await withRetry({
      clusterOffset: DEVNET_CLUSTER_OFFSET,
      maxRetries: 6,
    });
    const key = normalizeMxeKey(result);
    if (key) {
      return key;
    }
  }

  const singleCall = client.getMXEPublicKey as
    | ((args: { clusterOffset: number }) => Promise<MaybeMxeResponse>)
    | undefined;
  if (typeof singleCall === "function") {
    const result = await singleCall({
      clusterOffset: DEVNET_CLUSTER_OFFSET,
    });
    const key = normalizeMxeKey(result);
    if (key) {
      return key;
    }
  }

  return getFallbackSecret();
}

function resolveSharedSecret(mxePubkey: Uint8Array): Uint8Array {
  if (!ENABLE_ARCIUM_SDK) {
    return getFallbackSecret();
  }
  const client = ArciumClient as unknown as ArciumModule;
  const getSharedSecret = client.getSharedSecret as ((key: Uint8Array) => Uint8Array) | undefined;
  if (typeof getSharedSecret === "function") {
    try {
      const secret = getSharedSecret(mxePubkey);
      if (secret instanceof Uint8Array && secret.length > 0) {
        return secret;
      }
    } catch {
      return getFallbackSecret();
    }
  }
  return getFallbackSecret();
}

async function maybeAwaitComputationFinalization(
  connection: Connection,
  computationOffset: bigint,
): Promise<void> {
  if (!ENABLE_ARCIUM_SDK) {
    return;
  }
  const client = ArciumClient as unknown as ArciumModule;
  const awaitFinalization = client.awaitComputationFinalization as
    | ((args: { connection: Connection; computationOffset: bigint }) => Promise<void>)
    | undefined;
  if (typeof awaitFinalization === "function") {
    await awaitFinalization({
      connection,
      computationOffset,
    });
  }
}

export interface ComputationSubmitResult {
  computationOffset: bigint;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
}

export async function encryptForMpc(payload: Uint8Array): Promise<ComputationSubmitResult> {
  try {
    const mxePubkey = await resolveMxePublicKey();
    const sharedSecret = resolveSharedSecret(mxePubkey);
    const ctx = createEncryptionContext(sharedSecret);
    const { ciphertext, nonce } = encryptPayload(ctx, payload);

    return {
      computationOffset: BigInt(0),
      ciphertext,
      nonce,
    };
  } catch {
    // Keep UX functional in demo mode when SDK/runtime versions mismatch.
    const nonce = getFallbackSecret();
    return {
      computationOffset: BigInt(0),
      ciphertext: payload,
      nonce,
    };
  }
}

export async function waitAndDecryptBoolean(
  connection: Connection,
  computationOffset: bigint,
  ciphertext: Uint8Array,
  nonce: Uint8Array,
): Promise<boolean> {
  await maybeAwaitComputationFinalization(connection, computationOffset);

  const mxePubkey = await resolveMxePublicKey();
  const sharedSecret = resolveSharedSecret(mxePubkey);
  const ctx = createEncryptionContext(sharedSecret);
  const decrypted = decryptPayload(ctx, ciphertext, nonce);
  return decrypted[0] === 1;
}

export async function waitAndDecryptPnl(
  connection: Connection,
  computationOffset: bigint,
  ciphertext: Uint8Array,
  nonce: Uint8Array,
): Promise<PnlResult> {
  await maybeAwaitComputationFinalization(connection, computationOffset);

  const mxePubkey = await resolveMxePublicKey();
  const sharedSecret = resolveSharedSecret(mxePubkey);
  const ctx = createEncryptionContext(sharedSecret);
  const decoded = decryptPayload(ctx, ciphertext, nonce);
  const view = new DataView(decoded.buffer);
  const pnl = Number(view.getBigInt64(0, true));

  return {
    realizedPnl: pnl,
    isProfit: pnl >= 0,
  };
}
