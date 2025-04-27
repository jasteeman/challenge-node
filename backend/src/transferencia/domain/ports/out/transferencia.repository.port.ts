import { Transferencia } from "src/transferencia/domain/entities/transferencia.entity";

export interface TransferenciaRepositoryPort {
  create(transferencia: Transferencia): Promise<Transferencia>;
  findById(id: number): Promise<Transferencia | undefined>;
  findAllByEmpresaId(idEmpresa: number): Promise<Transferencia[]>;
  update(id: number, transferencia: Transferencia): Promise<Transferencia>;
  delete(id: number): Promise<void>;
}