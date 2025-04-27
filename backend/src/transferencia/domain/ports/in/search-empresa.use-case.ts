import { Empresa } from '../../entities/empresa.entity';

export interface SearchEmpresaUseCase {
    search(q: string): Promise<Empresa[]>;
}