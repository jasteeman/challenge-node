import { Controller, Post, Body, Get, Param, Put, Delete, UsePipes, ValidationPipe, Inject, Query } from '@nestjs/common';
import { Empresa } from '../../domain/entities/empresa.entity';
import { CreateEmpresaDto } from '../../application/dto/create-empresa.dto';
import { UpdateEmpresaDto } from '../../application/dto/update-empresa.dto';
import { RegistrarEmpresaUseCase } from '../../domain/ports/in/registrar-empresa.use-case';
import { ActualizarEmpresaUseCase } from '../../domain/ports/in/actualizar-empresa.use-case';
import { EliminarEmpresaUseCase } from '../../domain/ports/in/eliminar-empresa.use-case';
import { ObtenerEmpresaUseCase } from '../../domain/ports/in/obtener-empresa.use-case';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { ListaEmpresasUseCase } from 'src/transferencia/domain/ports/in/lista-empresas.use-case';
import { ObtenerEmpresaConTransferenciaUseCase } from 'src/transferencia/domain/ports/in/obtener-empresa-con-transferencia.use-case';
import { ObtenerEmpresaAdheridaUseCase } from 'src/transferencia/domain/ports/in/obtener-empresa-adherida.use-case';
import { SearchEmpresaUseCase } from 'src/transferencia/domain/ports/in/search-empresa.use-case';

@Controller('empresas')
@UsePipes(new ValidationPipe())
export class EmpresaController {
  constructor(
    @Inject('RegistrarEmpresaUseCase')
    private readonly registrarEmpresaUseCase: RegistrarEmpresaUseCase,
    @Inject('ObtenerEmpresaUseCase')
    private readonly obtenerEmpresaUseCase: ObtenerEmpresaUseCase,
    @Inject('ActualizarEmpresaUseCase')
    private readonly actualizarEmpresaUseCase: ActualizarEmpresaUseCase,
    @Inject('EliminarEmpresaUseCase')
    private readonly eliminarEmpresaUseCase: EliminarEmpresaUseCase,
    @Inject('ListaEmpresasUseCase')
    private readonly listaEmpresasUseCase: ListaEmpresasUseCase,
    @Inject('ObtenerEmpresaConTransferenciaUseCase')
    private readonly obtenerEmpresaConTransferenciaUseCase: ObtenerEmpresaConTransferenciaUseCase,
    @Inject('ObtenerEmpresaAdheridaUseCase')
    private readonly obtenerEmpresaAdheridaUseCase: ObtenerEmpresaAdheridaUseCase,

  ) { }

  @Post()
  async registrar(@Body() createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const empresa = await this.registrarEmpresaUseCase.registrarEmpresa(createEmpresaDto);
    if (!empresa) {
      throw new Error('Failed to register Empresa');
    }
    return empresa;
  }

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptions): Promise<PaginatedResult<Empresa>> {
    return this.listaEmpresasUseCase.getAllEmpresas(paginationOptions);
  }

  @Get('transferencias-ultimo-mes')
  async getEmpresasConTransferenciasUltimoMes(): Promise<Empresa[]> {
    return this.obtenerEmpresaConTransferenciaUseCase.obtenerEmpresaConTransferenciaUltimoMes();
  }

  @Get('adheridas-ultimo-mes')
  async getEmpresasAdheridasUltimoMes(): Promise<Empresa[]> {
    return this.obtenerEmpresaAdheridaUseCase.obtenerEmpresasAdheridasUltimoMes();
  }

  @Get(':id')
  async obtenerEmpresa(@Param('id') id: string): Promise<Empresa | undefined> {
    const empresa = await this.obtenerEmpresaUseCase.obtenerEmpresa(+id);
    if (!empresa) {
      throw new Error('Failed to register Empresa');
    }
    return empresa;
  }
 
  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<Empresa | undefined> {
    return this.actualizarEmpresaUseCase.actualizarEmpresa(+id, updateEmpresaDto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string): Promise<void> {
    return this.eliminarEmpresaUseCase.eliminarEmpresa(+id);
  }
}