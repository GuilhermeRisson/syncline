import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

/** One row per operation already applied: makes push idempotent. */
@Entity("sync_processed_ops")
export class SyncProcessedOp {
  @PrimaryColumn({ type: "char", length: 36 })
  opId!: string;

  @Column({ type: "varchar", length: 64 })
  clientId!: string;

  @CreateDateColumn()
  processedAt!: Date;
}
