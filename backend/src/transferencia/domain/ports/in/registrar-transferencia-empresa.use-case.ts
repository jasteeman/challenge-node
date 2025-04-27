import { CreateTransferenciaDto } from 'src/transferencia/application/dto/create-transferencia.dto';
import { Transferencia } from '../../entities/transferencia.entity';

export interface RegistrarTransferenciaEmpresaUseCase {
  registrarTransferenciaEmpresa(transferencia:CreateTransferenciaDto): Promise<Transferencia>;
}