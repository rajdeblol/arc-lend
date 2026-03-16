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
  const [ciphertext, nonce] = ctx.cipher.encrypt(payload) as [
    string | number[] | Uint8Array,
    string | number[] | Uint8Array,
  ];
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
  return ctx.cipher.decrypt(ciphertext, nonce);
}
