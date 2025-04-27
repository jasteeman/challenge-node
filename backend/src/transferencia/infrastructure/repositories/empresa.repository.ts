import { Injectable } from '@nestjs/common';
import { Between, FindOptionsWhere, In, Like, Repository } from 'typeorm';
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
  ) { }

  async findById(id: number): Promise<Empresa | undefined> {
    const empresa = await this.empresaRepository.findOne({ where: { id } });
    return empresa ?? undefined;
  }

  async findByCUIT(cuit: string): Promise<Empresa | undefined> {
    const empresa = await this.empresaRepository.findOne({ where: { cuit } });
    return empresa ?? undefined;
  }

  async create(empresa: Empresa): Promise<Empresa> {
    return this.empresaRepository.save(empresa);
  }

  async update(id: number, empresa: Empresa): Promise<Empresa> {
    const existingEmpresa = await this.empresaRepository.findOne({ where: { id } });
    if (!existingEmpresa) {
      throw new Error(`Empresa with id ${id} not found`);
    }
    await this.empresaRepository.update(id, empresa);
    const updatedEmpresa = await this.empresaRepository.findOne({ where: { id } });
    if (!updatedEmpresa) {
      throw new Error(`Failed to retrieve updated Empresa with id ${id}`);
    }
    return updatedEmpresa;
  }

  async delete(id: number): Promise<void> {
    await this.empresaRepository.delete(id);
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<Empresa>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;
    const q = options?.q ?? '';
    console.log(options)

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

  async findEmpresasConTransferenciasUltimoMes(): Promise<Empresa[]> {
    const ultimoMesInicio = new Date();
    ultimoMesInicio.setMonth(ultimoMesInicio.getMonth() - 1);
    ultimoMesInicio.setDate(1);
    ultimoMesInicio.setHours(0, 0, 0, 0);
  
    const ultimoMesFin = new Date();
    ultimoMesFin.setDate(0);
    ultimoMesFin.setHours(23, 59, 59, 999);
  
    // Obtener las transferencias dentro del rango de fechas del último mes
    const empresasConTransferencias = await this.transferenciaRepository
      .createQueryBuilder('transferencias')
      .select([
        'transferencias.idEmpresa AS empresaId', // ID de la empresa
        'SUM(transferencias.importe) AS importe', // Monto total transferido
        'MAX(transferencias.fechaTransferencia) AS ultimaTransferencia', // Fecha de la última transferencia
      ])
      .where('transferencias.fechaTransferencia BETWEEN :ultimoMesInicio AND :ultimoMesFin', { 
        ultimoMesInicio, 
        ultimoMesFin 
      })
      .groupBy('transferencias.idEmpresa')
      .getRawMany();
  
    const empresaIds = empresasConTransferencias.map(item => item.empresaId);
  
    if (empresaIds.length === 0) {
      return [];
    }
   
    const empresas = await this.empresaRepository.findBy({ id: In(empresaIds) });
   
    return empresas.map(empresa => {
      const transferencia = empresasConTransferencias.find(t => t.empresaId === empresa.id);
      
      return {
        ...empresa, // Detalles de la empresa
        importe: transferencia?.importe || 0, // Monto total transferido
        ultimaTransferencia: transferencia?.ultimaTransferencia || null, // Última fecha de transferencia
      };
    });
  }
  

  async findEmpresasAdheridasUltimoMes(): Promise<Empresa[]> {
    const count = await this.empresaRepository.count();
    if (count === 0) {
      return [];
    }

    const ultimoMesInicio = new Date();
    ultimoMesInicio.setMonth(ultimoMesInicio.getMonth() - 1);
    ultimoMesInicio.setDate(1);
    ultimoMesInicio.setHours(0, 0, 0, 0);

    const ultimoMesFin = new Date();
    ultimoMesFin.setDate(0);
    ultimoMesFin.setHours(23, 59, 59, 999);

    const empresas = await this.empresaRepository.find({
      where: {
        fechaAdhesion: Between(ultimoMesInicio, ultimoMesFin),
      },
    });
    return empresas;
  }
}