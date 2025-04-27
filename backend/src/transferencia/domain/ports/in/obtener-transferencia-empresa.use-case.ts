import { Transferencia } from '../../entities/transferencia.entity';

export interface ObtenerTransferenciasEmpresaUseCase {
  obtenerTransferenciasPorEmpresa(idEmpresa: number): Promise<Transferencia[]>;
}