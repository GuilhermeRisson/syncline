import { describe, expect, it } from "vitest";
import { compare, createHlc, parse, serialize, tick, type Hlc } from "./hlc.js";
/*
 * GUIA
 * --------------------------------------------------------------------------
 * O primeiro teste abaixo está pronto como MODELO. Ele vai falhar até você
 * implementar compare() em hlc.ts. Rode `pnpm test` e veja o vermelho.
 *
 * Depois, transforme cada `it.todo("...")` em `it("...", () => { ... })`,
 * seguindo o mesmo formato: monte os dados, chame a função, use expect().
 *
 * Funções úteis do expect:
 *   expect(x).toBe(y)              valores iguais (números, strings)
 *   expect(obj).toEqual(outro)     objetos com o mesmo conteúdo
 *   expect(n).toBeGreaterThan(0)   números
 *   expect(() => fn()).toThrow()   a função lança erro
 */

// Helper para montar relógios nos testes sem repetir código.
const hlc = (wallTime: number, counter: number, nodeId: string): Hlc => ({
  wallTime,
  counter,
  nodeId,
});

describe("hlc", () => {
  describe("compare", () => {
    it("orders by wallTime first", () => {
      const earlier = hlc(1000, 5, "B");
      const later = hlc(2000, 0, "A");

      expect(compare(earlier, later)).toBeLessThan(0);
      expect(compare(later, earlier)).toBeGreaterThan(0);
    });

    it("uses the counter when wallTime is equal", () => {
      const lower = hlc(1000, 1, "A");
      const higher = hlc(1000, 2, "A");

      expect(compare(lower, higher)).toBeLessThan(0);
      expect(compare(higher, lower)).toBeGreaterThan(0);
    });

    it("returns 0 for identical clocks", () => {
      const lower = hlc(1000, 2, "A");
      const higher = hlc(1000, 2, "A");

      expect(compare(lower, higher)).toBe(0);
    });
  });

  describe("tick", () => {
    it("follows the wall clock and resets the counter when time moves forward", () => {
      const start = hlc(1000, 3, "A");

      const next = tick(start, 2000);

      expect(next).toEqual(hlc(2000, 0, "A"));
    });

    it("increments the counter for events in the same ms", () => {
      const start = createHlc("A", 1000);

      const first = tick(start, 1000);
      const second = tick(first, 1000);

      expect(first).toEqual(hlc(1000, 1, "A"));
      expect(second).toEqual(hlc(1000, 2, "A"));
    });

    it("moves forward even when the wall clock goes backwards", () => {
      const start = createHlc("A", 1000);

      const next = tick(start, 900); // relógio do celular voltou 100 ms

      expect(next.wallTime).toBe(1000); // ignora o 900
      expect(compare(next, start)).toBeGreaterThan(0); // mesmo assim, é "depois"
    });

    it("does not mutate the clock it receives", () => {
      const start = hlc(1000, 0, "A");

      tick(start, 2000);

      expect(start).toEqual(hlc(1000, 0, "A")); // continua igual
    });
  });

  describe("receive", () => {
    it.todo("never returns a clock lower than the local or the remote one");
    it.todo("keeps the local nodeId");
  });

  describe("serialize / parse", () => {
    it("serialize pads the numbers", () => {
      expect(serialize(hlc(1732545000000, 3, "A"))).toBe("001732545000000:00003:A");
    });

    it("parse(serialize(x)) returns x", () => {
      const original = hlc(1732545000000, 3, "A");

      expect(parse(serialize(original))).toEqual(original);
    });

    it("works with counter 0", () => {
      const original = hlc(1000, 0, "A");

      expect(parse(serialize(original))).toEqual(original);
    });

    it("keeps ':' inside the nodeId", () => {
      const original = hlc(1000, 1, "device:42");

      expect(parse(serialize(original))).toEqual(original);
    });

    it("keeps string order equal to compare() order", () => {
      const older = hlc(9, 0, "A");   // 9 ms
      const newer = hlc(10, 0, "A");  // 10 ms

      // sem zeros à esquerda, "9" > "10" em ordem de texto
      expect(compare(older, newer)).toBeLessThan(0);
      expect(serialize(older) < serialize(newer)).toBe(true);
    });

    it("parse() throws on invalid input", () => {
      const invalid = ["lixo", ":0:A", "123::A", "123:0:", "123:0A", "abc:0:A", "-5:0:A"];

      for (const value of invalid) {
        expect(() => parse(value)).toThrow();
      }
    });
  });
});

// Evita aviso de import não usado enquanto os testes de tick ainda são todo.
void createHlc;
