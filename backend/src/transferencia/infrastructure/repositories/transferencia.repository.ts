import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transferencia } from '../../domain/entities/transferencia.entity';
import { TransferenciaRepositoryPort } from '../../domain/ports/out/transferencia.repository.port';

@Injectable()
export class TransferenciaRepository implements TransferenciaRepositoryPort {
  constructor(
    @InjectRepository(Transferencia)
    private readonly transferenciaRepository: Repository<Transferencia>,
  ) {}

  async create(transferencia: Transferencia): Promise<Transferencia> {
    return this.transferenciaRepository.save(transferencia);
  }

  async findById(id: number): Promise<Transferencia | undefined> {
    const transferencia = await this.transferenciaRepository.findOne({ where: { id }, relations: ['empresa'] });
    return transferencia ?? undefined;
  }

  async findAllByEmpresaId(idEmpresa: number): Promise<Transferencia[]> {
    return this.transferenciaRepository.find({ where: { idEmpresa } });
  }

  async update(id: number, transferencia: Transferencia): Promise<Transferencia> {
    await this.transferenciaRepository.update(id, transferencia);
    const updatedTransferencia = await this.transferenciaRepository.findOne({ where: { id }, relations: ['empresa'] });
    if (!updatedTransferencia) { 
      throw new Error('Transferencia not found');
    }
    return updatedTransferencia;
  }

  async delete(id: number): Promise<void> {
    await this.transferenciaRepository.delete(id);
  }
}