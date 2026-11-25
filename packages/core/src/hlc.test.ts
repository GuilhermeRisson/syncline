import { describe, expect, it } from "vitest";
import { compare, createHlc, parse, receive, serialize, tick, type Hlc } from "./hlc.js";

const hlc = (wallTime: number, counter: number, nodeId = "A"): Hlc => ({ wallTime, counter, nodeId });

describe("createHlc", () => {
  it("começa com counter 0 no horário informado", () => {
    expect(createHlc("A", 1000)).toEqual(hlc(1000, 0));
  });
});

describe("tick", () => {
  it("relógio físico avançou: usa o now e zera o counter", () => {
    expect(tick(hlc(100, 5), 200)).toEqual(hlc(200, 0));
  });

  it("mesmo milissegundo: soma 1 no counter", () => {
    expect(tick(hlc(100, 5), 100)).toEqual(hlc(100, 6));
  });

  it("relógio físico voltou: mantém o wallTime e soma 1 no counter", () => {
    expect(tick(hlc(200, 5), 150)).toEqual(hlc(200, 6));
  });

  it("vários ticks no mesmo ms são sempre crescentes", () => {
    let clock = createHlc("A", 100);
    const stamps = [clock];
    for (let i = 0; i < 5; i++) {
      clock = tick(clock, 100);
      stamps.push(clock);
    }
    for (let i = 1; i < stamps.length; i++) {
      expect(compare(stamps[i - 1], stamps[i])).toBeLessThan(0);
    }
  });

  it("não altera o objeto recebido", () => {
    const clock = Object.freeze(hlc(100, 5));
    expect(() => tick(clock, 100)).not.toThrow();
    expect(clock).toEqual(hlc(100, 5));
  });
});

describe("receive", () => {
  it.each([
    { caso: "só o remoto ganhou", clock: hlc(100, 5), remote: hlc(200, 3, "B"), now: 150, esperado: hlc(200, 4) },
    { caso: "só o local ganhou", clock: hlc(200, 2), remote: hlc(100, 9, "B"), now: 150, esperado: hlc(200, 3) },
    { caso: "empate entre local e remoto", clock: hlc(200, 5), remote: hlc(200, 7, "B"), now: 150, esperado: hlc(200, 8) },
    { caso: "o now ganhou", clock: hlc(100, 5), remote: hlc(90, 1, "B"), now: 300, esperado: hlc(300, 0) },
    { caso: "now empata com os dois", clock: hlc(200, 5), remote: hlc(200, 7, "B"), now: 200, esperado: hlc(200, 8) },
    { caso: "now empata só com o remoto", clock: hlc(100, 5), remote: hlc(200, 3, "B"), now: 200, esperado: hlc(200, 4) },
  ])("$caso", ({ clock, remote, now, esperado }) => {
    expect(receive(clock, remote, now)).toEqual(esperado);
  });

  it("mantém sempre o nodeId local", () => {
    expect(receive(hlc(100, 0, "A"), hlc(200, 0, "B"), 150).nodeId).toBe("A");
  });

  it("o resultado fica depois do local e do remoto", () => {
    const clock = hlc(100, 5, "A");
    const remote = hlc(200, 3, "B");
    const result = receive(clock, remote, 150);
    expect(compare(result, clock)).toBeGreaterThan(0);
    expect(compare(result, remote)).toBeGreaterThan(0);
  });

  it("um tick depois do receive continua depois do remoto", () => {
    const remote = hlc(500, 9, "B");
    const after = tick(receive(hlc(100, 0, "A"), remote, 120), 130);
    expect(compare(after, remote)).toBeGreaterThan(0);
  });

  it("não altera os objetos recebidos", () => {
    const clock = Object.freeze(hlc(100, 5));
    const remote = Object.freeze(hlc(200, 3, "B"));
    expect(() => receive(clock, remote, 150)).not.toThrow();
  });
});

describe("compare", () => {
  it("wallTime decide primeiro", () => {
    expect(compare(hlc(100, 9, "Z"), hlc(200, 0, "A"))).toBeLessThan(0);
    expect(compare(hlc(200, 0, "A"), hlc(100, 9, "Z"))).toBeGreaterThan(0);
  });

  it("counter desempata o mesmo wallTime", () => {
    expect(compare(hlc(100, 1, "Z"), hlc(100, 2, "A"))).toBeLessThan(0);
  });

  it("nodeId desempata o resto", () => {
    expect(compare(hlc(100, 1, "A"), hlc(100, 1, "B"))).toBeLessThan(0);
    expect(compare(hlc(100, 1, "B"), hlc(100, 1, "A"))).toBeGreaterThan(0);
  });

  it("iguais retornam 0", () => {
    expect(compare(hlc(100, 1, "A"), hlc(100, 1, "A"))).toBe(0);
  });

  it("é antissimétrico", () => {
    const a = hlc(100, 1, "A");
    const b = hlc(100, 1, "B");
    expect(Math.sign(compare(a, b))).toBe(-Math.sign(compare(b, a)));
  });
});

describe("serialize", () => {
  it("preenche os números com zeros", () => {
    expect(serialize(hlc(1700000000000, 7, "node-1"))).toBe("001700000000000:00007:node-1");
  });

  it("a ordem das strings é a mesma do compare", () => {
    const clocks = [
      hlc(1700000000000, 0, "B"),
      hlc(999, 50, "A"),
      hlc(1700000000000, 10, "A"),
      hlc(1700000000000, 2, "A"),
      hlc(1700000000000, 2, "B"),
      hlc(5, 99999, "Z"),
    ];
    const byCompare = [...clocks].sort(compare).map(serialize);
    const byString = clocks.map(serialize).sort();
    expect(byString).toEqual(byCompare);
  });

  it("lança erro se o counter passar de 99999", () => {
    expect(() => serialize(hlc(100, 100000))).toThrow();
  });

  it("aceita o counter no limite", () => {
    expect(serialize(hlc(100, 99999))).toBe("000000000000100:99999:A");
  });
});

describe("parse", () => {
  it("é o inverso do serialize", () => {
    const clock = hlc(1700000000000, 42, "device-abc");
    expect(parse(serialize(clock))).toEqual(clock);
  });

  it("aceita ':' dentro do nodeId", () => {
    const clock = hlc(1, 2, "a:b:c");
    expect(parse(serialize(clock))).toEqual(clock);
  });

  it.each([
    ["string vazia", ""],
    ["sem separadores", "abc"],
    ["sem o segundo ':'", "001700000000000:00001"],
    ["sem nodeId", "001700000000000:00001:"],
    ["wallTime vazio", ":00001:A"],
    ["counter vazio", "001700000000000::A"],
    ["hexadecimal", "0x10:00001:A"],
    ["notação científica", "1e3:00001:A"],
    ["com espaços", " 01700000000000:00001:A"],
    ["número negativo", "-01700000000000:00001:A"],
    ["wallTime sem padding", "1700000000000:00001:A"],
    ["counter sem padding", "001700000000000:1:A"],
  ])("rejeita %s", (_caso, value) => {
    expect(() => parse(value)).toThrow();
  });
});
