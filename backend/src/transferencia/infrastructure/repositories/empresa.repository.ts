import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Between, In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Empresa } from '../../domain/entities/empresa.entity';
import { EmpresaRepositoryPort } from '../../domain/ports/out/empresa.repository.port';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { Transferencia } from 'src/transferencia/domain/entities/transferencia.entity';

@Injectable()
export class EmpresaRepository implements EmpresaRepositoryPort {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Transferencia)
    private readonly transferenciaRepository: Repository<Transferencia>,
  ) {}

  async findById(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepository.findOne({ where: { id } });
    if (!empresa) {
      throw new NotFoundException(`Empresa with id ${id} not found`);
    }
    return empresa;
  }

  async findByCUIT(cuit: string): Promise<Empresa | undefined> {
    const empresa = await this.empresaRepository.findOne({ where: { cuit } });
    return empresa ?? undefined;
  }

  async create(empresa: Empresa): Promise<Empresa> {
    try {
      return await this.empresaRepository.save(empresa);
    } catch (error) {
      throw new BadRequestException(`Error creating empresa: ${error.message}`);
    }
  }

  async update(id: number, empresa: Empresa): Promise<Empresa> {
    const existingEmpresa = await this.empresaRepository.findOne({ where: { id } });
    if (!existingEmpresa) {
      throw new NotFoundException(`Empresa with id ${id} not found`);
    }
    try {
      await this.empresaRepository.update(id, empresa);
      const updatedEmpresa = await this.empresaRepository.findOne({ where: { id } });
      if (!updatedEmpresa) {
        throw new NotFoundException(`Updated Empresa with id ${id} not found`);
      }
      return updatedEmpresa;
    } catch (error) {
      throw new BadRequestException(`Error updating empresa: ${error.message}`);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.empresaRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Empresa with id ${id} not found`);
      }
    } catch (error) {
      throw new BadRequestException(`Error deleting empresa: ${error.message}`);
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<Empresa>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;
    const q = options?.q ?? '';

    const where: any = {};
    if (q) {
      where.cuit = Like(`%${q}%`);
      where.razonSocial = Like(`%${q}%`);
    }

    const [empresas, total] = await this.empresaRepository.findAndCount({
      skip,
      take: limit,
      where,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: empresas,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findEmpresasConTransferenciasUltimoMes(
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Empresa[]> {
    try {

      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(23, 59, 59, 999);
      // Obtener las transferencias dentro del rango de fechas dado
      const empresasConTransferencias = await this.transferenciaRepository
        .createQueryBuilder('transferencias')
        .select([
          'transferencias.idEmpresa AS empresaId',
          'SUM(transferencias.importe) AS importe',
          'MAX(transferencias.fechaTransferencia) AS ultimaTransferencia',
        ])
        .where('transferencias.fechaTransferencia BETWEEN :fechaInicio AND :fechaFin', {
          fechaInicio,
          fechaFin,
        })
        .groupBy('transferencias.idEmpresa')
        .getRawMany();

      const empresaIds = empresasConTransferencias.map((item) => item.empresaId);

      if (empresaIds.length === 0) {
        return [];
      }

      const empresas = await this.empresaRepository.findBy({ id: In(empresaIds) });

      return empresas.map((empresa) => {
        const transferencia = empresasConTransferencias.find((t) => t.empresaId === empresa.id);

        return {
          ...empresa,
          importe: transferencia?.importe || 0,
          ultimaTransferencia: transferencia?.ultimaTransferencia || null,
        };
      });
    } catch (error) {
      throw new BadRequestException(
        `Error finding empresas con transferencias en el rango de fechas: ${error.message}`,
      );
    }
  }

  async findEmpresasAdheridasUltimoMes(
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<Empresa[]> {
    try {
      
      fechaInicio.setHours(0, 0, 0, 0);
      fechaFin.setHours(23, 59, 59, 999);

      const empresas = await this.empresaRepository.find({
        where: {
          fechaAdhesion: Between(fechaInicio, fechaFin),
        },
      });
      return empresas;
    } catch (error) {
      throw new BadRequestException(
        `Error finding empresas adheridas en el rango de fechas: ${error.message}`,
      );
    }
  }
}