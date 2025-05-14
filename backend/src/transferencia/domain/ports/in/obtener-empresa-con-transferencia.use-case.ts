import { Empresa } from '../../entities/empresa.entity';

export interface ObtenerEmpresaConTransferenciaUseCase {
  obtenerEmpresaConTransferenciaUltimoMes(fechaInicio: Date, fechaFin: Date): Promise<Empresa[]>;
}