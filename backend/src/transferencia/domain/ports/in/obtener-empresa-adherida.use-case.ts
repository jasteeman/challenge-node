import { Empresa } from '../../entities/empresa.entity';

export interface ObtenerEmpresaAdheridaUseCase {
    obtenerEmpresasAdheridasUltimoMes(fechaInicio: Date, fechaFin: Date): Promise<Empresa[]>;
}