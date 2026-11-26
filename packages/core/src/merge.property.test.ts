import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { serialize } from "./hlc.js";
import { mergeRow } from "./merge.js";
import type { Operation, SyncedRow } from "./protocol.js";

const FIELDS = ["title", "done", "notes"] as const;
const NODES = ["A", "B", "C"] as const;


const updateArb = fc.record({
  wallTime: fc.integer({ min: 1, max: 20 }),
  nodeId: fc.constantFrom(...NODES),
  patch: fc.dictionary(fc.constantFrom(...FIELDS), fc.oneof(fc.string(), fc.boolean()), { minKeys: 1 }),
});

type GeneratedUpdate = { wallTime: number; nodeId: string; patch: Record<string, unknown> };

function toOps(updates: GeneratedUpdate[]): Operation[] {
  return updates.map((u, i) => {
    const clock = serialize({ wallTime: u.wallTime, counter: i, nodeId: u.nodeId });
    const clocks = Object.fromEntries(Object.keys(u.patch).map((campo) => [campo, clock]));
    return { rowId: "t1", patch: u.patch, clocks } as Operation;
  });
}

const deleteOp = (): Operation =>
  ({ rowId: "t1", patch: {}, clocks: {}, delete: true }) as Operation;

const applyAll = (ops: Operation[]) =>
  ops.reduce<SyncedRow | undefined>((row, op) => mergeRow(row, op), undefined);

const opsAndShuffle = fc
  .array(updateArb, { minLength: 1, maxLength: 12 })
  .map(toOps)
  .chain((ops) =>
    fc.tuple(fc.constant(ops), fc.shuffledSubarray(ops, { minLength: ops.length, maxLength: ops.length })),
  );

describe("mergeRow: propriedades", () => {
  it("converge: qualquer ordem de aplicação dá o mesmo resultado", () => {
    fc.assert(
      fc.property(opsAndShuffle, ([ops, shuffled]) => {
        expect(applyAll(shuffled)).toEqual(applyAll(ops));
      }),
      { numRuns: 500 },
    );
  });

  it("é idempotente: aplicar tudo de novo não muda nada (retry)", () => {
    fc.assert(
      fc.property(opsAndShuffle, ([ops, shuffled]) => {
        expect(applyAll([...ops, ...shuffled])).toEqual(applyAll(ops));
      }),
      { numRuns: 500 },
    );
  });

  it("cada campo termina com o valor da op de maior HLC que o tocou", () => {
    fc.assert(
      fc.property(opsAndShuffle, ([ops, shuffled]) => {
        const row = applyAll(shuffled)!;
        for (const campo of FIELDS) {
          const touching = ops.filter((op) => campo in op.patch);
          if (touching.length === 0) {
            expect(row.values).not.toHaveProperty(campo);
            continue;
          }
          const winner = touching.reduce((a, b) => (b.clocks[campo]! > a.clocks[campo]! ? b : a));
          expect(row.values[campo]).toEqual(winner.patch[campo]);
        }
      }),
      { numRuns: 500 },
    );
  });

  it("delete vence: com um delete em qualquer posição, a linha termina apagada", () => {
    fc.assert(
      fc.property(opsAndShuffle, fc.nat(), ([ops], position) => {
        const withDelete = [...ops];
        withDelete.splice(position % (ops.length + 1), 0, deleteOp());
        expect(applyAll(withDelete)?.deleted).toBe(true);
      }),
      { numRuns: 500 },
    );
  });
});
