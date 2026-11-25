import type { Operation, SyncedRow } from "@syncline/core";
import type { Storage } from "./types.js";

/*
 * GUIA (semana 3)
 * --------------------------------------------------------------------------
 * Implementação do Storage com better-sqlite3 (SQLite no Node).
 * Nos testes, use new Database(":memory:") para ter um banco novo e vazio
 * em cada teste.
 *
 * Passo 1: no construtor, crie as tabelas de controle (CREATE TABLE IF NOT EXISTS):
 *
 *   sync_outbox(
 *     op_id TEXT PRIMARY KEY,
 *     table_name TEXT NOT NULL,
 *     row_id TEXT NOT NULL,
 *     payload TEXT NOT NULL,          -- a Operation inteira em JSON
 *     attempts INTEGER NOT NULL DEFAULT 0,
 *     next_attempt_at INTEGER NOT NULL DEFAULT 0,
 *     created_at INTEGER NOT NULL
 *   )
 *   sync_meta(key TEXT PRIMARY KEY, value TEXT NOT NULL)
 *
 * Passo 2: as tabelas de dados (ex.: tasks). Para a v0.1, guarde cada linha
 *   numa tabela genérica, mais simples:
 *     sync_rows(table_name TEXT, id TEXT, values_json TEXT, clocks_json TEXT,
 *               deleted INTEGER, PRIMARY KEY (table_name, id))
 *   (Tabelas com colunas de verdade ficam para a v0.2. Anote isso num ADR.)
 *
 * Passo 3: implemente cada método do Storage com um SELECT/INSERT/UPDATE.
 *   - putRow: INSERT ... ON CONFLICT(table_name, id) DO UPDATE ...
 *   - pendingOps: WHERE next_attempt_at <= ? ORDER BY created_at LIMIT ?
 *   - ack: DELETE FROM sync_outbox WHERE op_id IN (...)
 *   - transaction: better-sqlite3 tem db.transaction(), mas ele é síncrono.
 *     Para a v0.1, faça BEGIN, await fn(), COMMIT (ou ROLLBACK no catch).
 *
 * Para usar a lib: import Database from "better-sqlite3";
 * Teste: crie storage/better-sqlite.test.ts e teste cada método.
 */
export class BetterSqliteStorage implements Storage {
  async getRow(_table: string, _id: string): Promise<SyncedRow | undefined> {
    throw new Error("not implemented");
  }
  async putRow(_table: string, _row: SyncedRow): Promise<void> {
    throw new Error("not implemented");
  }
  async enqueue(_op: Operation): Promise<void> {
    throw new Error("not implemented");
  }
  async pendingOps(_limit: number, _now: number): Promise<Operation[]> {
    throw new Error("not implemented");
  }
  async ack(_opIds: string[]): Promise<void> {
    throw new Error("not implemented");
  }
  async scheduleRetry(_opIds: string[], _nextAttemptAt: number): Promise<void> {
    throw new Error("not implemented");
  }
  async getMeta(_key: string): Promise<string | undefined> {
    throw new Error("not implemented");
  }
  async setMeta(_key: string, _value: string): Promise<void> {
    throw new Error("not implemented");
  }
  async transaction<T>(_fn: () => Promise<T>): Promise<T> {
    throw new Error("not implemented");
  }
}
