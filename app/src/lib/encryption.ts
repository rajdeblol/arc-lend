import { RescueCipher } from "@arcium-hq/client";
import { Keypair } from "@solana/web3.js";
import { EncryptedPayload } from "@/types";

function toUint8Array(value: string | number[] | Uint8Array): Uint8Array {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (Array.isArray(value)) {
    return new Uint8Array(value);
  }
  return new Uint8Array(value.split(",").map((part) => Number(part.trim())));
}

function decryptToUint8Array(value: bigint[] | number[] | Uint8Array): Uint8Array {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "bigint") {
    return new Uint8Array((value as bigint[]).map((item) => Number(item)));
  }
  return new Uint8Array(value as number[]);
}

function toMatrix(value: Uint8Array): number[][] {
  return [Array.from(value)];
}

export interface EncryptionContext {
  keypair: Keypair;
  cipher: RescueCipher;
}

export function createEncryptionContext(sharedSecret: Uint8Array): EncryptionContext {
  const keypair = Keypair.generate();
  const cipher = new RescueCipher(sharedSecret);
  return { keypair, cipher };
}

export function encryptPayload(ctx: EncryptionContext, payload: Uint8Array): EncryptedPayload {
  const nonceSeed = Keypair.generate().publicKey.toBytes();
  const encryptFn = ctx.cipher.encrypt as unknown as (...args: unknown[]) => unknown;

  let encrypted: unknown;
  try {
    // Arcium SDK variants may require (payload, nonce).
    encrypted = encryptFn(payload, nonceSeed);
  } catch {
    // Older variants may accept only (payload).
    encrypted = encryptFn(payload);
  }

  const tuple = encrypted as [string | number[] | Uint8Array, string | number[] | Uint8Array];
  const [ciphertext, nonce] = tuple;
  return {
    ciphertext: toUint8Array(ciphertext),
    nonce: toUint8Array(nonce),
  };
}

export function decryptPayload(
  ctx: EncryptionContext,
  ciphertext: Uint8Array,
  nonce: Uint8Array,
): Uint8Array {
  const decryptFn = ctx.cipher.decrypt as unknown as (...args: unknown[]) => unknown;

  let decrypted: unknown;
  try {
    decrypted = decryptFn(ciphertext, nonce);
  } catch {
    // Fallback for SDK variants that expect matrix-like args.
    decrypted = decryptFn(toMatrix(ciphertext), toMatrix(nonce));
  }

  const normalized = decrypted as bigint[] | number[] | Uint8Array;
  if (Array.isArray(normalized) && Array.isArray(normalized[0])) {
    return new Uint8Array((normalized[0] as number[]).map((item) => Number(item)));
  }
  return decryptToUint8Array(normalized);
}
