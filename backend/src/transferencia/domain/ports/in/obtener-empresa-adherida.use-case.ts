import { Empresa } from '../../entities/empresa.entity';

export interface ObtenerEmpresaAdheridaUseCase {
    obtenerEmpresasAdheridasUltimoMes(): Promise<Empresa[]>;
}