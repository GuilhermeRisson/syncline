/*
 * GUIA (semana 3, é o aquecimento: faça antes do resto do client)
 * --------------------------------------------------------------------------
 * Quando o envio falha (sem internet, servidor fora), o client espera um
 * tempo antes de tentar de novo. Esse tempo cresce a cada falha, para não
 * martelar um servidor que já está com problema.
 *
 * Fórmula "full jitter" (leia o artigo da AWS no guia):
 *   teto  = min(maxMs, baseMs * 2 ** attempt)
 *   atraso = random() * teto
 *
 * `random` vem por parâmetro (padrão Math.random) para o teste conseguir
 * passar um valor fixo, tipo () => 0.5, e saber o resultado exato.
 */

/**
 * Delay before retry number `attempt` (0-based): exponential with full jitter.
 */
export function backoffDelay(
  _attempt: number,
  _opts: { baseMs: number; maxMs: number; random?: () => number },
): number {
  throw new Error("not implemented");
}
