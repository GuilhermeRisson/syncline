import type { Storage } from "./storage/types.js";
import type { Transport } from "./transport.js";

/*
 * GUIA (semana 3, depois do backoff e do better-sqlite)
 * --------------------------------------------------------------------------
 * É a classe que o app usa. Ela junta tudo: hlc + merge (core), Storage e
 * Transport.
 *
 * Estado que ela guarda no sync_meta (via storage.getMeta/setMeta):
 *   "hlc"    -> o relógio deste aparelho, serializado
 *   "cursor" -> o _seq do último pull (começa em "0")
 *
 * write(table, id, patch):
 *   1. dentro de storage.transaction:
 *   2.   avance o relógio com tick() e salve no meta
 *   3.   monte a Operation: opId = crypto.randomUUID(), clocks = o mesmo
 *        HLC serializado para cada campo do patch
 *   4.   aplique localmente: mergeRow(linha atual, op) e storage.putRow
 *   5.   storage.enqueue(op)
 *   Isso é o padrão outbox: o dado e a mensagem salvos juntos.
 *
 * remove(table, id): igual ao write, mas a Operation tem delete: true.
 *
 * sync():
 *   PUSH
 *   1. ops = storage.pendingOps(100, now)
 *   2. se tiver ops: transport.push({ clientId, ops })
 *        - deu certo: storage.ack(res.acks); trate res.rejected (por ora,
 *          ack também, e registre um aviso)
 *        - deu erro (sem rede): storage.scheduleRetry(ids, now + backoffDelay(...))
 *          e PARE aqui (sem rede, não adianta tentar o pull)
 *   PULL
 *   3. cursor = meta "cursor"
 *   4. repita: res = transport.pull(cursor, 500)
 *        para cada change: mergeRow(linha local, change convertida em op) e putRow;
 *        atualize o relógio com receive()
 *        salve cursor = res.nextCursor
 *      até res.hasMore ser false
 *
 * `now` vem das opções (padrão Date.now) para os testes controlarem o tempo.
 */

export interface SyncClientOptions {
  clientId: string;
  storage: Storage;
  transport: Transport;
  /** Injected clock so tests control time. */
  now?: () => number;
}

/**
 * Public API of the client.
 */
export class SyncClient {
  constructor(private readonly opts: SyncClientOptions) {}

  async write(_table: string, _id: string, _patch: Record<string, unknown>): Promise<void> {
    throw new Error("not implemented");
  }

  async remove(_table: string, _id: string): Promise<void> {
    throw new Error("not implemented");
  }

  async sync(): Promise<void> {
    throw new Error("not implemented");
  }
}
