import type { Operation, SyncedRow } from "./protocol.js";

/*
 * GUIA (apague quando terminar o arquivo)
 * --------------------------------------------------------------------------
 * Faça este arquivo DEPOIS do hlc.ts. Este é o coração da biblioteca.
 *
 * mergeRow recebe:
 *   - current: a linha como está agora (no SQLite do celular ou no MySQL),
 *              ou undefined se ainda não existe
 *   - op:      uma mudança (Operation, veja protocol.ts), com os campos que
 *              mudaram em op.patch e o HLC de cada um em op.clocks
 * e devolve a linha NOVA, depois de aplicar a mudança.
 *
 * O mesmo código roda no celular (no pull) e no servidor (no push). Por isso
 * ele precisa ser puro e determinístico: mesma entrada, mesma saída, sempre.
 *
 * Passo 1: se current não existe, crie a linha a partir da op:
 *          { id: op.rowId, values: op.patch, clocks: op.clocks, deleted: !!op.delete }
 * Passo 2: se current.deleted é true, devolva current sem mudar nada.
 *          (Regra "delete vence", decidida no plano.)
 * Passo 3: se op.delete é true, devolva current com deleted: true.
 * Passo 4: para cada campo de op.patch:
 *          - pegue o HLC novo (op.clocks[campo]) e o atual (current.clocks[campo])
 *          - se não tem HLC atual, ou se o novo é MAIOR (use parse + compare
 *            do hlc.ts, ou compare as strings direto, já que o serialize foi
 *            feito para a ordem de texto bater), o campo novo vence:
 *            copie o valor e o HLC
 *          - senão, mantenha o que já está
 * Passo 5: devolva um objeto NOVO (não altere current).
 *
 * Teste mais importante (merge.test.ts): aplicar as mesmas ops em ordens
 * diferentes tem que dar o mesmo resultado.
 */

/**
 * Apply an operation to the current row (or undefined if the row does not exist yet).
 * Field-level last-write-wins by HLC; a tombstone is final ("delete wins").
 */
export function mergeRow(_current: SyncedRow | undefined, _op: Operation): SyncedRow {
  throw new Error("not implemented");
}
