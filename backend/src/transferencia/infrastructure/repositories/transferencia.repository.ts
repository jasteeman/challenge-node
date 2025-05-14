import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
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
    try {
      return await this.transferenciaRepository.save(transferencia);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create transferencia', error);
    }
  }

  async findById(id: number): Promise<Transferencia | undefined> {
    try {
      const transferencia = await this.transferenciaRepository.findOne({
        where: { id },
        relations: ['empresa'],
      });
      return transferencia ?? undefined;
    } catch (error) {
      throw new InternalServerErrorException('Failed to find transferencia by id', error);
    }
  }

  async findAllByEmpresaId(idEmpresa: number): Promise<Transferencia[]> {
    try {
      return await this.transferenciaRepository.find({ where: { idEmpresa } });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find transferencias by empresa id',
        error,
      );
    }
  }

  async update(id: number, transferencia: Transferencia): Promise<Transferencia> {
    try {
      const updateResult: UpdateResult = await this.transferenciaRepository.update(
        id,
        transferencia,
      );
      if (updateResult.affected === 0) {
        throw new NotFoundException(`Transferencia with id ${id} not found`);
      }
      const updatedTransferencia = await this.transferenciaRepository.findOne({
        where: { id },
        relations: ['empresa'],
      });
      return updatedTransferencia!;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update transferencia', error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const deleteResult = await this.transferenciaRepository.delete(id);
      if (deleteResult.affected === 0) {
        throw new NotFoundException(`Transferencia with id ${id} not found`);
      }
    } catch (error) {
       if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete transferencia', error);
    }
  }
}
