import { UpdateEmpresaDto } from 'src/transferencia/application/dto/update-empresa.dto';
import { Empresa } from '../../entities/empresa.entity';

export interface ActualizarEmpresaUseCase {
  actualizarEmpresa(id: number, empresa: UpdateEmpresaDto): Promise<Empresa | undefined>;
}