import type { PullResponse, PushRequest, PushResponse } from "@syncline/core";
import type { Transport } from "./transport.js";

/*
 * GUIA (semana 3, depois do sync-client)
 * --------------------------------------------------------------------------
 * A implementação de verdade do Transport, usando fetch().
 *
 * push: POST `${baseUrl}/sync/push` com o PushRequest em JSON no body.
 * pull: GET  `${baseUrl}/sync/pull?since=${since}&limit=${limit}`.
 *
 * Se a resposta não for 2xx (res.ok === false), lance um Error. O SyncClient
 * trata o erro como "sem rede" e agenda o retry com backoff.
 * `headers` existe para quem usa a lib mandar o token de autenticação.
 */
export class HttpTransport implements Transport {
  constructor(
    private readonly baseUrl: string,
    private readonly headers: Record<string, string> = {},
  ) {}

  async push(_req: PushRequest): Promise<PushResponse> {
    void this.baseUrl;
    void this.headers;
    throw new Error("not implemented");
  }

  async pull(_since: number, _limit: number): Promise<PullResponse> {
    throw new Error("not implemented");
  }
}
