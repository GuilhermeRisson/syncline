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
export function tick(_clock: Hlc, _now: number): Hlc {

  const wallTime = Math.max(_clock.wallTime,_now)
  const counter = wallTime === _clock.wallTime ? _clock.counter +1 : 0;
  
  return {wallTime, counter, nodeId: _clock.nodeId};
}

/** Merge a timestamp received from another node (on pull or push response). */
export function receive(_clock: Hlc, _remote: Hlc, _now: number): Hlc {
  /*
   * GUIA: chamada quando chega um timestamp de OUTRO aparelho (no pull).
   * Garante que tudo que este aparelho fizer depois fique "depois" do que
   * ele acabou de receber.
   *
   * Passo 1: o novo wallTime é o MAIOR entre três valores:
   *          clock.wallTime, remote.wallTime e now.
   * Passo 2: o novo counter depende de quem "ganhou" o passo 1:
   *          - empate entre o local e o remoto: maior dos dois counters + 1
   *          - só o local: clock.counter + 1
   *          - só o remoto: remote.counter + 1
   *          - nenhum dos dois (o `now` foi maior): 0
   * Passo 3: o nodeId continua sendo o deste aparelho (clock.nodeId),
   *          nunca o do remoto.
   *
   * Releia a parte de "recv" no post do Jared Forsyth se travar.
   */
  throw new Error("not implemented");
}

/** Total order: negative if a < b, positive if a > b, 0 if equal. */
export function compare(_a: Hlc, _b: Hlc): number {
  if (_a.wallTime !== _b.wallTime) {
    return _a.wallTime < _b.wallTime ? -1 : 1;
  }

  if (_a.counter !== _b.counter) {
    return _a.counter < _b.counter ? -1 : 1;
  }

  if (_a.nodeId === _b.nodeId) {
    return 0;
  }

  return _a.nodeId < _b.nodeId ? -1 : 1;
}

/** Serialize so that string order matches `compare` (pad the numbers). */
export function serialize(_clock: Hlc): HlcString {
  return `${String(_clock.wallTime).padStart(15, "0")}:${String(_clock.counter).padStart(5, "0")}:${_clock.nodeId}`;
}

export function parse(_value: HlcString): Hlc {


  const wallTimePoint  = _value.indexOf(":");

  if (wallTimePoint === -1) {
    throw new Error(`Formato HLC inválido: "${_value}"`);
  }

  const counterPoint = _value.indexOf(":", wallTimePoint + 1);
  const wallTimeText =  _value.slice(0, wallTimePoint);
  const wallTime =  Number(_value.slice(0, wallTimePoint));
  const counterText = _value.slice(wallTimePoint + 1, counterPoint);


  if (wallTimeText === "" ) {
    throw new Error(`WallTime foi encontrado como vazio ou nulo "${wallTimeText}"`);
  }

  if(counterText === "" || counterPoint === -1){
    throw new Error(`Counter foi encontrado como vazio ou nulo ${counterText}`);
  }

  const counter = Number(_value.slice(wallTimePoint + 1, counterPoint));

  const nodeId = _value.slice(counterPoint + 1);

  if(nodeId.length === 0){
    throw new Error("nodeId vazio");
  }

  if(wallTime < 0 || counter < 0){
    throw new Error("WallTime ou Counter retornaram valores a baixo de 0");
  }

  if(!Number.isInteger(wallTime) || !Number.isInteger(counter)){
    throw new Error("Algo de errado com os valores recebidos");
  }

  return {wallTime, counter, nodeId: nodeId};
}
