import { Empresa } from '../../entities/empresa.entity';

export interface ObtenerEmpresaConTransferenciaUseCase {
  obtenerEmpresaConTransferenciaUltimoMes(): Promise<Empresa[]>;
}