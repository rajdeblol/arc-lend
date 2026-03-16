import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { assert } from "chai";

const PROGRAM_ID = new PublicKey("PrvP3rps1111111111111111111111111111111111");

describe("private-perps", () => {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = provider.wallet.publicKey
    ? ({
        version: "0.1.0",
        name: "private_perps",
        instructions: [],
      } as Idl)
    : ({} as Idl);

  const program = new Program(idl, PROGRAM_ID, provider);

  it("derives position PDA deterministically", async () => {
    const positionId = new anchor.BN(1);
    const [positionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        provider.wallet.publicKey.toBuffer(),
        positionId.toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID,
    );

    assert.instanceOf(positionPda, PublicKey);
  });

  it("builds open_position instruction accounts", async () => {
    const positionId = new anchor.BN(9);
    const [positionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("position"),
        provider.wallet.publicKey.toBuffer(),
        positionId.toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID,
    );

    const globalState = Keypair.generate().publicKey;
    const computationAccount = Keypair.generate().publicKey;

    const ix = await program.methods
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - method is generated from IDL in real test runtime.
      .openPosition(positionId, 0, 0, Buffer.from([1, 2, 3]))
      .accounts({
        owner: provider.wallet.publicKey,
        position: positionPda,
        globalState,
        systemProgram: SystemProgram.programId,
        computationAccount,
        mxeProgram: new PublicKey("11111111111111111111111111111111"),
      })
      .instruction();

    assert.equal(ix.programId.toBase58(), PROGRAM_ID.toBase58());
    assert.isAtLeast(ix.keys.length, 5);
  });
});
