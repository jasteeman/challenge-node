import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { EmpresaRepositoryPort } from 'src/transferencia/domain/ports/out/empresa.repository.port';
import { CreateEmpresaDto } from '../../dto/create-empresa.dto';
import { Empresa } from 'src/transferencia/domain/entities/empresa.entity';
import { UpdateEmpresaDto } from '../../dto/update-empresa.dto';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';

@Injectable()
export class EmpresaService {
  constructor(
    @Inject('EmpresaRepositoryPort')
    private readonly empresaRepository: EmpresaRepositoryPort,
  ) { }

  async getAllEmpresas(options: PaginationOptions): Promise<PaginatedResult<Empresa>> {
    return this.empresaRepository.findAll(options);
  }

  async registrarEmpresa(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    if (!createEmpresaDto.cuit || !/^\d{2}-\d{8}-\d{1}$/.test(createEmpresaDto.cuit)) {
      throw new BadRequestException('El CUIT tiene un formato inválido.');
    }
    if (!createEmpresaDto.razonSocial || createEmpresaDto.razonSocial.trim() === '') {
      throw new BadRequestException('La razón social es requerida.');
    }

    const existingEmpresa = await this.empresaRepository.findByCUIT(createEmpresaDto.cuit);
    if (existingEmpresa) {
      throw new BadRequestException(`La empresa con CUIT "${createEmpresaDto.cuit}" ya existe.`);
    }

    const nuevaEmpresa = new Empresa();
    nuevaEmpresa.cuit = createEmpresaDto.cuit;
    nuevaEmpresa.razonSocial = createEmpresaDto.razonSocial;
    nuevaEmpresa.fechaAdhesion = new Date(createEmpresaDto.fechaAdhesion);
    return this.empresaRepository.create(nuevaEmpresa);
  }

  async obtenerEmpresa(id: number): Promise<Empresa | undefined> {
    return this.empresaRepository.findById(id);
  } 

  async actualizarEmpresa(id: number, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa | undefined> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El ID de empresa debe ser un entero positivo.');
    }
    const existingEmpresa = await this.empresaRepository.findById(id);
    if (!existingEmpresa) {
      return undefined;
    }

    const empresaActualizada: Partial<Empresa> = {};
    if (updateEmpresaDto.cuit) {
      if (!/^\d{2}-\d{8}-\d{1}$/.test(updateEmpresaDto.cuit)) {
        throw new BadRequestException('El CUIT tiene un formato inválido.');
      }
      const existingCUIT = await this.empresaRepository.findByCUIT(updateEmpresaDto.cuit);
      if (existingCUIT && existingCUIT.id !== id) {
        throw new BadRequestException(`El CUIT "${updateEmpresaDto.cuit}" ya existe.`);
      }
      empresaActualizada.cuit = updateEmpresaDto.cuit;
    }
    if (updateEmpresaDto.razonSocial) {
      if (updateEmpresaDto.razonSocial.trim() === '') {
        throw new BadRequestException('La razón social no puede estar vacía.');
      }
      empresaActualizada.razonSocial = updateEmpresaDto.razonSocial;
    }

    return this.empresaRepository.update(id, { ...existingEmpresa, ...empresaActualizada });
  }

  async eliminarEmpresa(id: number): Promise<void> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El ID de empresa debe ser un entero positivo.');
    }
    const existingEmpresa = await this.empresaRepository.findById(id);
    if (!existingEmpresa) {
      throw new NotFoundException(`Empresa con ID "${id}" no encontrada.`);
    }
    return this.empresaRepository.delete(id);
  }


  async obtenerEmpresaConTransferenciaUltimoMes(): Promise<Empresa[]> {
    return this.empresaRepository.findEmpresasConTransferenciasUltimoMes();
  }

  async obtenerEmpresasAdheridasUltimoMes(): Promise<Empresa[]> {
    return this.empresaRepository.findEmpresasAdheridasUltimoMes();
  }
}