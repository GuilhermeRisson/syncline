import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Single-row global counter behind `_seq`.
 * Incremented inside the push transaction with
 * UPDATE sync_counter SET value = LAST_INSERT_ID(value + 1)
 * so the row lock serializes pushes and `_seq` follows commit order.
 */
@Entity("sync_counter")
export class SyncCounter {
  @PrimaryColumn({ type: "tinyint" })
  id!: number;

  @Column({ type: "bigint" })
  value!: string;
}
