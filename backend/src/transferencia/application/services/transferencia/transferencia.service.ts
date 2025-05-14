import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { Transferencia } from 'src/transferencia/domain/entities/transferencia.entity';
import { EmpresaRepositoryPort } from 'src/transferencia/domain/ports/out/empresa.repository.port';
import { TransferenciaRepositoryPort } from 'src/transferencia/domain/ports/out/transferencia.repository.port';
import { CreateTransferenciaDto } from '../../dto/create-transferencia.dto';
import { UpdateTransferenciaDto } from '../../dto/update-transferencia.dto';

@Injectable()
export class TransferenciaService {
  constructor(
    @Inject('TransferenciaRepositoryPort')
    private readonly transferenciaRepository: TransferenciaRepositoryPort,
    @Inject('EmpresaRepositoryPort')
    private readonly empresaRepository: EmpresaRepositoryPort,
  ) {}

  async registrarTransferenciaEmpresa(createTransferenciaDto: CreateTransferenciaDto): Promise<Transferencia> {
    const empresa = await this.empresaRepository.findById(createTransferenciaDto.idEmpresa);
    if (!empresa) {
      throw new BadRequestException(`Empresa con ID "${createTransferenciaDto.idEmpresa}" no encontrada.`);
    }
    const transferencia = new Transferencia();
    transferencia.importe = createTransferenciaDto.importe;
    transferencia.cuentaDebito = createTransferenciaDto.cuentaDebito;
    transferencia.cuentaCredito = createTransferenciaDto.cuentaCredito;
    transferencia.fechaTransferencia = new Date();
    transferencia.empresa = empresa;
    return this.transferenciaRepository.create(transferencia);
  }

  async actualizarTransferenciaEmpresa(id: number, updateTransferenciaDto: UpdateTransferenciaDto): Promise<Transferencia | undefined> {
    const existingTransferencia = await this.transferenciaRepository.findById(id);
    if (!existingTransferencia) {
      return undefined;
    }
    return this.transferenciaRepository.update(id, { ...existingTransferencia, ...updateTransferenciaDto });
  }

  async eliminarTransferenciaEmpresa(id: number): Promise<void> {
    const existingTransferencia = await this.transferenciaRepository.findById(id);
    if (!existingTransferencia) {
      throw new NotFoundException(`Transferencia con ID "${id}" no encontrada.`);
    }
    return this.transferenciaRepository.delete(id);
  }

  async obtenerTransferenciasPorEmpresa(idEmpresa: number): Promise<Transferencia[]> {
    const empresa = await this.empresaRepository.findById(idEmpresa);
    if (!empresa) {
      throw new BadRequestException(`Empresa con ID "${idEmpresa}" no encontrada.`);
    }
    return this.transferenciaRepository.findAllByEmpresaId(idEmpresa);
  }
}