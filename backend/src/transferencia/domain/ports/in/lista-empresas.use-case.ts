import { PaginatedResult, PaginationOptions } from "src/common/utils/paginations.utils";
import { Empresa } from "../../entities/empresa.entity";

export interface ListaEmpresasUseCase {
    getAllEmpresas(options: PaginationOptions): Promise<PaginatedResult<Empresa>>;
}