import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Empresa } from './empresa.entity';
 
@Entity({ name: 'transferencias' })
export class Transferencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  importe: number;

  @ManyToOne(() => Empresa, empresa => empresa.id)
  @JoinColumn({ name: 'idEmpresa' })
  empresa: Empresa;

  @Column()
  idEmpresa: number;

  @Column()
  cuentaDebito: string;

  @Column()
  cuentaCredito: string;

  @Column({ type: 'datetime'})
  fechaTransferencia: Date;
}