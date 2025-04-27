import { Empresa } from '../../entities/empresa.entity';

export interface ObtenerEmpresaUseCase {
  obtenerEmpresa(idEmpresa: number): Promise<Empresa | undefined>;
}