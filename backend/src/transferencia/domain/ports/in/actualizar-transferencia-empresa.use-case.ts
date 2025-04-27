import { UpdateTransferenciaDto } from 'src/transferencia/application/dto/update-transferencia.dto';
import { Transferencia } from '../../entities/transferencia.entity';

export interface ActualizarTransferenciaEmpresaUseCase {
  actualizarTransferenciaEmpresa(id: number, transferencia: UpdateTransferenciaDto): Promise<Transferencia | undefined>;
}