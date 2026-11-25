import type { PullResponse, PushRequest, PushResponse } from "@syncline/core";
import type { Transport } from "@syncline/client";

/*
 * GUIA (semana 4)
 * --------------------------------------------------------------------------
 * Um Transport que finge ser a rede, para o teste de dois clientes.
 * Ele repassa as chamadas para um Transport de verdade (ligado ao servidor
 * de teste) e tem um "interruptor":
 *
 *   const rede = new FakeTransport(transportReal);
 *   rede.offline = true;   // celular sem internet: push/pull lançam erro
 *   rede.offline = false;  // voltou a internet
 *
 * Para o cenário 5 ("resposta perdida"), adicione uma opção que deixa o
 * push chegar ao servidor mas lança erro ANTES de devolver a resposta.
 */
export class FakeTransport implements Transport {
  offline = false;

  constructor(private readonly inner: Transport) {}

  async push(req: PushRequest): Promise<PushResponse> {
    if (this.offline) throw new Error("offline");
    return this.inner.push(req);
  }

  async pull(since: number, limit: number): Promise<PullResponse> {
    if (this.offline) throw new Error("offline");
    return this.inner.pull(since, limit);
  }
}
