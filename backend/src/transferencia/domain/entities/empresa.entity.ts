import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'empresas' })
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  cuit: string;

  @Column()
  razonSocial: string;

  @CreateDateColumn()
  fechaAdhesion: Date;
}