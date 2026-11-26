import { describe, expect, it } from "vitest";
import { serialize } from "./hlc.js";
import { mergeRow } from "./merge.js";
import type { Operation, SyncedRow } from "./protocol.js";

/** HLC em string: h(500, 0, "B") -> "000000000000500:00000:B" */
const h = (wallTime: number, counter = 0, nodeId = "A") => serialize({ wallTime, counter, nodeId });

/** Monta uma op com o mesmo HLC para todos os campos do patch. */
function op(patch: Record<string, unknown>, clock: string, extra: Partial<Operation> = {}): Operation {
  const clocks = Object.fromEntries(Object.keys(patch).map((campo) => [campo, clock]));
  return { rowId: "t1", patch, clocks, ...extra } as Operation;
}

const deleteOp = (clock: string) => op({}, clock, { delete: true });

/** Aplica as ops em sequência, começando de uma linha inexistente. */
const applyAll = (ops: Operation[], start?: SyncedRow) =>
  ops.reduce<SyncedRow | undefined>((row, o) => mergeRow(row, o), start);

/** Todas as ordens possíveis de uma lista. */
function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
  );
}

const baseRow = (): SyncedRow => ({
  id: "t1",
  values: { title: "Comprar pão", done: false },
  clocks: { title: h(100), done: h(100) },
  deleted: false,
});

describe("mergeRow: linha nova (Passo 1)", () => {
  it("cria a linha a partir da op", () => {
    expect(mergeRow(undefined, op({ title: "Oi" }, h(100)))).toEqual({
      id: "t1",
      values: { title: "Oi" },
      clocks: { title: h(100) },
      deleted: false,
    });
  });

  it("cria já apagada se a op for um delete", () => {
    expect(mergeRow(undefined, deleteOp(h(100))).deleted).toBe(true);
  });

  it("não reaproveita os objetos da op", () => {
    const o = op({ title: "Oi" }, h(100));
    const row = mergeRow(undefined, o);
    expect(row.values).not.toBe(o.patch);
    expect(row.clocks).not.toBe(o.clocks);
  });
});

describe("mergeRow: last-write-wins por campo (Passo 4)", () => {
  it("HLC maior vence", () => {
    const row = mergeRow(baseRow(), op({ done: true }, h(500, 0, "B")));
    expect(row.values.done).toBe(true);
    expect(row.clocks.done).toBe(h(500, 0, "B"));
  });

  it("HLC menor perde", () => {
    const current = { ...baseRow(), clocks: { title: h(900), done: h(900) } };
    const row = mergeRow(current, op({ done: true }, h(500)));
    expect(row.values.done).toBe(false);
    expect(row.clocks.done).toBe(h(900));
  });

  it("no mesmo wallTime, o counter desempata", () => {
    const row = mergeRow(baseRow(), op({ done: true }, h(100, 1)));
    expect(row.values.done).toBe(true);
  });

  it("no mesmo wallTime e counter, o nodeId desempata", () => {
    expect(mergeRow(baseRow(), op({ done: true }, h(100, 0, "B"))).values.done).toBe(true);
    const fromZ = { ...baseRow(), clocks: { title: h(100, 0, "Z"), done: h(100, 0, "Z") } };
    expect(mergeRow(fromZ, op({ done: true }, h(100, 0, "B"))).values.done).toBe(false);
  });

  it("HLC igual mantém o atual (a mesma escrita chegando de novo)", () => {
    const row = mergeRow(baseRow(), op({ done: true }, h(100)));
    expect(row.values.done).toBe(false);
  });

  it("campos fora do patch não mudam", () => {
    const row = mergeRow(baseRow(), op({ done: true }, h(500)));
    expect(row.values.title).toBe("Comprar pão");
    expect(row.clocks.title).toBe(h(100));
  });

  it("campo que ainda não existe na linha é adicionado", () => {
    const row = mergeRow(baseRow(), op({ notes: "integral" }, h(50)));
    expect(row.values.notes).toBe("integral");
    expect(row.clocks.notes).toBe(h(50));
  });

  it("decide cada campo separado dentro da mesma op", () => {
    const current = { ...baseRow(), clocks: { title: h(100), done: h(900) } };
    const o: Operation = { rowId: "t1", patch: { title: "Novo", done: true }, clocks: { title: h(500), done: h(500) } } as Operation;
    const row = mergeRow(current, o);
    expect(row.values).toEqual({ title: "Novo", done: false });
  });

  it("lança erro se um campo do patch não tem HLC", () => {
    const o = { rowId: "t1", patch: { done: true }, clocks: {} } as Operation;
    expect(() => mergeRow(baseRow(), o)).toThrow();
  });
});

describe("mergeRow: delete vence (Passos 2 e 3)", () => {
  it("delete marca a linha como apagada", () => {
    expect(mergeRow(baseRow(), deleteOp(h(500))).deleted).toBe(true);
  });

  it("delete vence mesmo com HLC menor que os campos", () => {
    expect(mergeRow(baseRow(), deleteOp(h(1))).deleted).toBe(true);
  });

  it("linha apagada ignora updates, mesmo mais novos", () => {
    const deleted = { ...baseRow(), deleted: true };
    const row = mergeRow(deleted, op({ done: true }, h(999)));
    expect(row.deleted).toBe(true);
    expect(row.values.done).toBe(false);
  });
});

describe("mergeRow: pureza (Passo 5)", () => {
  it.each([
    ["update", op({ done: true }, h(500))],
    ["update perdedor", op({ done: true }, h(1))],
    ["delete", deleteOp(h(500))],
  ])("não altera o current nem a op (%s)", (_caso, o) => {
    const current = baseRow();
    const snapshot = structuredClone(current);
    const opSnapshot = structuredClone(o);
    deepFreeze(current);
    deepFreeze(o);
    expect(() => mergeRow(current, o)).not.toThrow();
    expect(current).toEqual(snapshot);
    expect(o).toEqual(opSnapshot);
  });
});

describe("mergeRow: convergência (o teste mais importante)", () => {
  const ops = [
    op({ title: "Comprar pão", done: false }, h(100, 0, "A")),
    op({ done: true }, h(200, 0, "B")),
    op({ title: "Comprar pão integral" }, h(150, 0, "A")),
    op({ title: "Comprar leite" }, h(150, 0, "B")),
    op({ done: false, notes: "urgente" }, h(200, 0, "A")),
  ];

  it("todas as ordens dão o mesmo resultado", () => {
    const expected = applyAll(ops);
    const all = permutations(ops);
    expect(all).toHaveLength(120);
    for (const order of all) {
      expect(applyAll(order)).toEqual(expected);
    }
  });

  it("o resultado é o vencedor de cada campo", () => {
    expect(applyAll(ops)?.values).toEqual({
      title: "Comprar leite", // 150:B vence 150:A pelo nodeId
      done: true, // 200:B vence 200:A pelo nodeId
      notes: "urgente",
    });
  });

  it("aplicar a mesma op duas vezes dá o mesmo que uma (idempotência, retry)", () => {
    const once = applyAll(ops);
    const twice = applyAll([...ops, ...ops]);
    expect(twice).toEqual(once);
  });

  it("com um delete no meio, a linha termina apagada em qualquer ordem", () => {
    const withDelete = [...ops.slice(0, 3), deleteOp(h(175, 0, "B"))];
    for (const order of permutations(withDelete)) {
      expect(applyAll(order)?.deleted).toBe(true);
    }
  });
});

function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object") {
    Object.values(obj).forEach(deepFreeze);
    Object.freeze(obj);
  }
  return obj;
}
