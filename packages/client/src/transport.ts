import type { PullResponse, PushRequest, PushResponse } from "@syncline/core";

/*
 * GUIA: já está pronto. É o "contrato" da parte de rede.
 * O SyncClient não sabe se fala com HTTP de verdade (http-transport.ts) ou
 * com um servidor falso dos testes (tests/e2e/fake-transport.ts). Isso é o
 * que permite testar tudo sem celular e sem internet.
 */

/** Network layer. The e2e tests use a fake one that can go "offline". */
export interface Transport {
  push(req: PushRequest): Promise<PushResponse>;
  pull(since: number, limit: number): Promise<PullResponse>;
}
