import type { HlcString } from "./protocol.js";

/*
 * GUIA (apague quando terminar o arquivo)
 * --------------------------------------------------------------------------
 * Este arquivo é o relógio lógico híbrido (HLC). Ele responde UMA pergunta:
 * "entre duas escritas, qual aconteceu depois?". O merge (merge.ts) usa
 * essa resposta para decidir qual valor vence em cada campo.
 *
 * Regras do arquivo:
 * - Funções puras: recebem um Hlc e devolvem um Hlc NOVO. Nunca altere o
 *   objeto recebido (nada de `clock.counter++`).
 * - Nunca chame Date.now() aqui dentro. O tempo chega pelo parâmetro `now`.
 *   Assim, nos testes, você escolhe o horário que quiser.
 *
 * Ordem para implementar: compare -> tick -> receive -> serialize -> parse.
 * Para cada uma: escreva o teste em hlc.test.ts primeiro, veja falhar, implemente.
 */

export interface Hlc {
  /** Physical time in ms. */
  wallTime: number;
  /** Logical counter for events in the same ms. */
  counter: number;
  /** Unique id of this node, breaks ties. */
  nodeId: string;
}

/** Create the clock for a node. */
export function createHlc(nodeId: string, now: number): Hlc {
  // Esta já está pronta, serve de exemplo de função pura.
  return { wallTime: now, counter: 0, nodeId };
}

/** Advance the clock for a local event and return the new timestamp. */
export function tick(clock: Hlc, now: number): Hlc {

  const wallTime = Math.max(clock.wallTime,now)
  const counter = wallTime === clock.wallTime ? clock.counter +1 : 0;
  
  return {wallTime, counter, nodeId: clock.nodeId};
}

/** Merge a timestamp received from another node (on pull or push response). */
export function receive(clock: Hlc, remote: Hlc, now: number): Hlc {

  const wallTime = Math.max(clock.wallTime, remote.wallTime, now);

  let counter: number;
  if (wallTime === clock.wallTime && wallTime === remote.wallTime) {
    counter = Math.max(clock.counter, remote.counter) + 1;
  } else if (wallTime === clock.wallTime) {
    counter = clock.counter + 1; 
  } else if (wallTime === remote.wallTime) {
    counter = remote.counter + 1;
  } else {
    counter = 0; 
  }

  return { wallTime, counter, nodeId: clock.nodeId };
}

/** Total order: negative if a < b, positive if a > b, 0 if equal. */
export function compare(a: Hlc, b: Hlc): number {
  if (a.wallTime !== b.wallTime) {
    return a.wallTime < b.wallTime ? -1 : 1;
  }

  if (a.counter !== b.counter) {
    return a.counter < b.counter ? -1 : 1;
  }

  if (a.nodeId === b.nodeId) {
    return 0;
  }

  return a.nodeId < b.nodeId ? -1 : 1;
}

/** Serialize so that string order matches `compare` (pad the numbers). */
export function serialize(clock: Hlc): HlcString {
  if (clock.counter > 99999) {
    throw new Error("HLC counter overflow");
  }
  return `${String(clock.wallTime).padStart(15, "0")}:${String(clock.counter).padStart(5, "0")}:${clock.nodeId}`;
}

export function parse(value: HlcString): Hlc {
  const match = /^(\d{15}):(\d{5}):(.+)$/.exec(value);
  if (!match) {
    throw new Error(`Formato HLC inválido: "${value}"`);
  }
  return { wallTime: Number(match[1]), counter: Number(match[2]), nodeId: match[3] };
}
