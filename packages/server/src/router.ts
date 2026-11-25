import { Router } from "express";
import type { DataSource } from "typeorm";

/*
 * GUIA (semana 2)
 * --------------------------------------------------------------------------
 * Quem usa a lib faz: app.use(express.json()); app.use(createSyncRouter({...}))
 * e ganha as duas rotas abaixo.
 *
 * Tabela de dados no MySQL (v0.1, genérica, igual à do client):
 *   sync_rows(table_name, id, values_json JSON, clocks_json JSON,
 *             deleted BOOLEAN, _seq BIGINT, PRIMARY KEY(table_name, id), INDEX(_seq))
 *   Crie uma entidade SyncRow em entities/ para ela, no mesmo estilo das outras duas.
 *
 * POST /sync/push   (body: PushRequest, resposta: PushResponse)
 *   Tudo dentro de dataSource.transaction(async (manager) => { ... }):
 *   1. pegue um _seq novo (veja o comentário em entities/sync-counter.ts)
 *   2. para cada op do lote:
 *      a. op.table não está em opts.tables? -> rejected "unknown_table"
 *      b. algum HLC de op.clocks está mais de maxClockDriftMs à frente de
 *         Date.now()? -> rejected "clock_too_far_ahead"
 *      c. op.opId já está em sync_processed_ops? -> só coloque em acks
 *      d. senão: leia a linha atual, mergeRow(atual, op) (do core), salve
 *         com o _seq novo, grave o opId em sync_processed_ops, coloque em acks
 *   3. responda { acks, rejected, serverTime: Date.now() }
 *
 * GET /sync/pull?since=N&limit=500   (resposta: PullResponse)
 *   1. SELECT * FROM sync_rows WHERE _seq > since ORDER BY _seq LIMIT limit + 1
 *      (pedir 1 a mais é o truque para saber se hasMore)
 *   2. nextCursor = _seq da última linha devolvida (ou o próprio since se vazio)
 *
 * Teste com supertest em router.test.ts, contra um MySQL de teste (.env).
 */

export interface SyncRouterOptions {
  dataSource: DataSource;
  /** Tables clients are allowed to sync. */
  tables: string[];
  /** Max HLC drift ahead of the server clock before an op is rejected. Default 5 min. */
  maxClockDriftMs?: number;
  /** Your auth: return the client/user id or throw. */
  authenticate?: (req: unknown) => Promise<string>;
}

/**
 * POST /sync/push and GET /sync/pull.
 */
export function createSyncRouter(_opts: SyncRouterOptions): Router {
  const router = Router();
  router.post("/sync/push", (_req, res) => {
    res.status(501).json({ error: "not implemented" });
  });
  router.get("/sync/pull", (_req, res) => {
    res.status(501).json({ error: "not implemented" });
  });
  return router;
}
