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

/**
 * Hybrid logical clock state for one node (a device or the server).
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

  /*
   * GUIA: chamada toda vez que ESTE aparelho faz uma escrita.
   *
   * Passo 1: o novo wallTime é o MAIOR entre clock.wallTime e now.
   *          (Se o relógio do celular voltou no tempo, `now` é menor e a
   *          gente ignora ele. É isso que impede o tempo de "andar para trás".)
   * Passo 2: o novo counter:
   *          - se o wallTime NÃO mudou (mesmo ms, ou relógio voltou):
   *            counter anterior + 1
   *          - se o wallTime mudou (o tempo andou): volta para 0
   * Passo 3: devolva um objeto novo com o mesmo nodeId.
   *
   * Teste que prova que funcionou: tick com now=1000, depois tick com now=900.
   * O segundo resultado tem que ser MAIOR que o primeiro no compare().
   */

  throw new Error("not implemented");
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
  /*
   * GUIA: comece por esta. É a mais fácil e as outras dependem dela.
   * Mesmo contrato do Array.sort: negativo se a vem antes, positivo se
   * vem depois, 0 se são iguais.
   *
   * Passo 1: wallTime diferente? Quem tem o maior é o mais recente.
   * Passo 2: wallTime igual? Desempata pelo counter.
   * Passo 3: os dois iguais? Desempata pelo nodeId (comparação de string,
   *          a.nodeId < b.nodeId). Isso garante que dois aparelhos NUNCA
   *          empatam, então o merge sempre tem um vencedor.
   */
  throw new Error("not implemented");
}

/** Serialize so that string order matches `compare` (pad the numbers). */
export function serialize(_clock: Hlc): HlcString {
  /*
   * GUIA: transforma o Hlc em texto para salvar no banco (coluna _clocks).
   * Formato: "<wallTime>:<counter>:<nodeId>"
   *
   * O detalhe importante: ordenar as STRINGS tem que dar a mesma ordem que
   * o compare(). Como "9" > "10" em ordem de texto, você precisa completar
   * com zeros à esquerda (String.prototype.padStart):
   *   - wallTime com 15 dígitos (cabe até o ano 33658)
   *   - counter com 5 dígitos
   * Exemplo: { wallTime: 1732545000000, counter: 3, nodeId: "A" }
   *       -> "001732545000000:00003:A"
   */
  throw new Error("not implemented");
}

export function parse(_value: HlcString): Hlc {
  /*
   * GUIA: o caminho de volta do serialize.
   * Passo 1: separe pelo ":" (cuidado: use só os 2 primeiros ":", porque o
   *          nodeId pode conter ":" no futuro).
   * Passo 2: converta wallTime e counter com Number().
   * Passo 3: se algo vier inválido (NaN, partes faltando), lance um Error
   *          com mensagem clara. Escreva um teste para isso também.
   */
  throw new Error("not implemented");
}
