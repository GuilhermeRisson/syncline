import type { Operation, SyncedRow } from "@syncline/core";

/*
 * GUIA: já está pronto. É o "contrato" do banco local.
 * Existem duas implementações:
 *   - better-sqlite.ts: roda no Node, usada nos testes (você faz esta)
 *   - expo-sqlite.ts:   roda no celular, usada no app de exemplo (semana 4)
 * As duas usam o MESMO SQL. Só muda a biblioteca que executa.
 */

/**
 * Everything the client needs from local storage.
 */
export interface Storage {
  getRow(table: string, id: string): Promise<SyncedRow | undefined>;
  putRow(table: string, row: SyncedRow): Promise<void>;

  enqueue(op: Operation): Promise<void>;
  /** Operations ready to send (respecting next_attempt_at). */
  pendingOps(limit: number, now: number): Promise<Operation[]>;
  ack(opIds: string[]): Promise<void>;
  scheduleRetry(opIds: string[], nextAttemptAt: number): Promise<void>;

  getMeta(key: string): Promise<string | undefined>;
  setMeta(key: string, value: string): Promise<void>;

  /** Run fn inside one local transaction. */
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}
