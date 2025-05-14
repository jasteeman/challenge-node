import { Controller, Post, Body, Get, Param, Put, Delete, UsePipes, ValidationPipe, Inject, Query, UseGuards, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';

@ApiTags('Empresas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('empresas')
@UsePipes(new ValidationPipe({ transform: true }))
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
  @ApiOperation({ summary: 'Registrar nueva empresa' })
  @ApiResponse({ status: 201, description: 'Empresa registrada exitosamente', type: Empresa })
  @ApiResponse({ status: 400, description: 'Error en la solicitud' })
  async registrar(@Body() createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    try {
      const empresa = await this.registrarEmpresaUseCase.registrarEmpresa(createEmpresaDto);
      if (!empresa) {
        throw new HttpException('Failed to register empresa', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return empresa;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las empresas con paginación' })
  @ApiQuery({ name: 'page', type: 'number', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: 'Límite de resultados por página' })
  @ApiResponse({ status: 200, description: 'Lista paginada de empresas', type: Object })
  async findAll(@Query() paginationOptions: PaginationOptions): Promise<PaginatedResult<Empresa>> {
    return this.listaEmpresasUseCase.getAllEmpresas(paginationOptions);
  }

  @Get('transferencias-ultimo-mes')
  @ApiOperation({
    summary: 'Obtiene las empresas con transferencias en el último mes',
    description:
      'Retorna un listado de empresas que han realizado transferencias en el último mes, junto con el importe total de las mismas y la fecha de la última transferencia.',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: true,
    type: 'string',
    format: 'date',
    description: 'Fecha de inicio del rango de búsqueda (YYYY-MM-DD).',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: true,
    type: 'string',
    format: 'date',
    description: 'Fecha de fin del rango de búsqueda (YYYY-MM-DD).',
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas con transferencias.' })
  @ApiResponse({ status: 400, description: 'Error si las fechas son inválidas.' })
  async getEmpresasConTransferenciasUltimoMes(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<Empresa[]> {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new HttpException('Las fechas de inicio y fin deben ser fechas válidas en formato YYYY-MM-DD.', HttpStatus.BAD_REQUEST);
    }
    return this.obtenerEmpresaConTransferenciaUseCase.obtenerEmpresaConTransferenciaUltimoMes(
      inicio,
      fin,
    );
  }

  @Get('adheridas-ultimo-mes')
  @ApiOperation({
    summary: 'Obtiene las empresas adheridas en el último mes',
    description:
      'Retorna un listado de empresas que se han adherido al sistema en el último mes.',
  })
  @ApiQuery({
    name: 'fechaInicio',
    required: true,
    type: 'string',
    format: 'date',
    description: 'Fecha de inicio del rango de búsqueda (YYYY-MM-DD).',
  })
  @ApiQuery({
    name: 'fechaFin',
    required: true,
    type: 'string',
    format: 'date',
    description: 'Fecha de fin del rango de búsqueda (YYYY-MM-DD).',
  })
  @ApiResponse({ status: 200, description: 'Lista de empresas adheridas.' })
  @ApiResponse({ status: 400, description: 'Error si las fechas son inválidas.' })
  async getEmpresasAdheridasUltimoMes(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ): Promise<Empresa[]> {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new HttpException('Las fechas de inicio y fin deben ser fechas válidas en formato YYYY-MM-DD.', HttpStatus.BAD_REQUEST);
    }
    return this.obtenerEmpresaAdheridaUseCase.obtenerEmpresasAdheridasUltimoMes(
      inicio,
      fin,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada', type: Empresa })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  async obtenerEmpresa(@Param('id') id: string): Promise<Empresa | undefined> {
    const empresa = await this.obtenerEmpresaUseCase.obtenerEmpresa(+id);
    if (!empresa) {
      throw new HttpException(`Empresa with id ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return empresa;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada', type: Empresa })
  @ApiResponse({ status: 400, description: 'Error en la solicitud' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  async actualizar(
    @Param('id') id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ): Promise<Empresa | undefined> {
    try {
      const updatedEmpresa = await this.actualizarEmpresaUseCase.actualizarEmpresa(+id, updateEmpresaDto);
      return updatedEmpresa;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar empresa por ID' })
  @ApiResponse({ status: 204, description: 'Empresa eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  async eliminar(@Param('id') id: string): Promise<void> {
    try {
      await this.eliminarEmpresaUseCase.eliminarEmpresa(+id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
