// ClaimMessage schema · S1-T2 ships shape · S2-T3 fills ed25519 signing

import { Schema as S } from "effect"
import { describe, expect, it } from "vitest"

import {
  buildClaimMessage,
  byteToElement,
  ClaimMessage,
  elementToByte,
} from "../src/claim-message.js"

describe("Element byte encoding (1=Wood..5=Water)", () => {
  it("roundtrips all 5 elements", () => {
    const elements = ["WOOD", "FIRE", "EARTH", "METAL", "WATER"] as const
    for (const e of elements) {
      expect(byteToElement(elementToByte(e))).toBe(e)
    }
  })

  it("rejects invalid byte", () => {
    expect(() => byteToElement(0)).toThrow()
    expect(() => byteToElement(6)).toThrow()
  })
})

describe("ClaimMessage · server-signed payload schema", () => {
  it("decodes well-formed claim", () => {
    const claim = {
      domain: "purupuru.awareness.genesis-stone",
      version: 1,
      cluster: 0 as const, // devnet
      programId: "ProgramId11111111111111111111111111111111",
      wallet: "Wallet1111111111111111111111111111111111111" as ClaimMessage["wallet"],
      element: 2, // FIRE
      weather: 5, // WATER
      quizStateHash: "a".repeat(64) as ClaimMessage["quizStateHash"],
      issuedAt: 1700000000,
      expiresAt: 1700000300,
      nonce: "b".repeat(32) as ClaimMessage["nonce"],
    }
    const decoded = S.decodeUnknownSync(ClaimMessage)(claim)
    expect(decoded.element).toBe(2)
  })

  it("rejects element out of range (must be 1-5 byte form)", () => {
    expect(() =>
      S.decodeUnknownSync(ClaimMessage)({
        domain: "purupuru.awareness.genesis-stone",
        version: 1,
        cluster: 0,
        programId: "x",
        wallet: "y",
        element: 0, // invalid
        weather: 1,
        quizStateHash: "a".repeat(64),
        issuedAt: 1,
        expiresAt: 2,
        nonce: "b".repeat(32),
      }),
    ).toThrow()
  })

  it("rejects cross-cluster (cluster must be 0 or 1)", () => {
    expect(() =>
      S.decodeUnknownSync(ClaimMessage)({
        domain: "purupuru.awareness.genesis-stone",
        version: 1,
        cluster: 2 as never, // invalid
        programId: "x",
        wallet: "y",
        element: 1,
        weather: 1,
        quizStateHash: "a".repeat(64),
        issuedAt: 1,
        expiresAt: 2,
        nonce: "b".repeat(32),
      }),
    ).toThrow()
  })

  it("rejects malformed quizStateHash (must be 64 hex chars)", () => {
    expect(() =>
      S.decodeUnknownSync(ClaimMessage)({
        domain: "purupuru.awareness.genesis-stone",
        version: 1,
        cluster: 0,
        programId: "x",
        wallet: "y",
        element: 1,
        weather: 1,
        quizStateHash: "tooshort", // wrong length
        issuedAt: 1,
        expiresAt: 2,
        nonce: "b".repeat(32),
      }),
    ).toThrow()
  })

  it("buildClaimMessage produces TTL-bounded claim", () => {
    const claim = buildClaimMessage({
      programId: "TestProgramId111111111111111111111111111",
      wallet: "TestWallet11111111111111111111111111111111" as ClaimMessage["wallet"],
      element: "FIRE",
      weather: "WATER",
      quizStateHash: "f".repeat(64) as ClaimMessage["quizStateHash"],
      cluster: 0,
      ttlSeconds: 300,
      nonce: "n".repeat(32) as ClaimMessage["nonce"],
    })
    expect(claim.element).toBe(2) // FIRE = 2
    expect(claim.weather).toBe(5) // WATER = 5
    expect(claim.expiresAt - claim.issuedAt).toBe(300)
    expect(claim.domain).toBe("purupuru.awareness.genesis-stone")
  })
})
