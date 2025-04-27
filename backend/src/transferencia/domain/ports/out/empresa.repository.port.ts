import { PaginatedResult, PaginationOptions } from "src/common/utils/paginations.utils";
import { Empresa } from "src/transferencia/domain/entities/empresa.entity"; 

export interface EmpresaRepositoryPort {
  findById(id: number): Promise<Empresa | undefined>;
  findByCUIT(cuit: string): Promise<Empresa | undefined>;
  create(empresa: Empresa): Promise<Empresa>; 
  findAll(options: PaginationOptions): Promise<PaginatedResult<Empresa>>;
  update(id: number, empresa: Empresa): Promise<Empresa>;
  delete(id: number): Promise<void>;
  findEmpresasConTransferenciasUltimoMes(): Promise<Empresa[]>;
  findEmpresasAdheridasUltimoMes(): Promise<Empresa[]>;
}