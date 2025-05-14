import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Inject,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Transferencia } from '../../domain/entities/transferencia.entity';
import { UpdateTransferenciaDto } from 'src/transferencia/application/dto/update-transferencia.dto';
import {
  EliminarTransferenciaEmpresaUseCase
} from 'src/transferencia/domain/ports/in/eliminar-tranferencia-empresa.use-case';
import { ObtenerTransferenciasEmpresaUseCase } from 'src/transferencia/domain/ports/in/obtener-transferencia-empresa.use-case';
import { RegistrarTransferenciaEmpresaUseCase } from 'src/transferencia/domain/ports/in/registrar-transferencia-empresa.use-case';
import {
  CreateTransferenciaDto,
  CreateTransferenciaDto as RegistrarTransferenciaDto,
} from 'src/transferencia/application/dto/create-transferencia.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';
import { ActualizarTransferenciaEmpresaUseCase } from 'src/transferencia/domain/ports/in/actualizar-transferencia-empresa.use-case';

@Controller('transferencias')
@UsePipes(new ValidationPipe({ transform: true }))
export class TransferenciaController {
  constructor(
    @Inject('RegistrarTransferenciaUseCase')
    private readonly registrarTransferenciaUseCase: RegistrarTransferenciaEmpresaUseCase,
    @Inject('ObtenerTransferenciasEmpresaUseCase')
    private readonly obtenerTransferenciasEmpresaUseCase: ObtenerTransferenciasEmpresaUseCase,
    @Inject('ActualizarTransferenciaUseCase')
    private readonly actualizarTransferenciaUseCase: ActualizarTransferenciaEmpresaUseCase,
    @Inject('EliminarTransferenciaUseCase')
    private readonly eliminarTransferenciaUseCase: EliminarTransferenciaEmpresaUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva transferencia' })
  @ApiCreatedResponse({ description: 'Transferencia creada exitosamente', type: Transferencia })
  @ApiBadRequestResponse({ description: 'Error de validación o entrada de datos' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiBody({ type: CreateTransferenciaDto, description: 'Datos para la creación de la transferencia' })
  async registrar(
    @Body() registrarTransferenciaDto: RegistrarTransferenciaDto,
  ): Promise<Transferencia> {
    try {
      return await this.registrarTransferenciaUseCase.registrarTransferenciaEmpresa(
        registrarTransferenciaDto,
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('empresa/:idEmpresa')
  @ApiOperation({ summary: 'Obtener transferencias por ID de empresa' })
  @ApiOkResponse({ description: 'Lista de transferencias de la empresa', type: [Transferencia] })
  @ApiBadRequestResponse({ description: 'ID de empresa inválido' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiParam({ name: 'idEmpresa', type: 'number', description: 'ID de la empresa' })
  async obtenerPorEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number, // Use ParseIntPipe for validation and transformation
  ): Promise<Transferencia[]> {
    try {
      return await this.obtenerTransferenciasEmpresaUseCase.obtenerTransferenciasPorEmpresa(
        idEmpresa,
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una transferencia existente' })
  @ApiOkResponse({ description: 'Transferencia actualizada exitosamente', type: Transferencia })
  @ApiNotFoundResponse({ description: 'Transferencia no encontrada' })
  @ApiBadRequestResponse({ description: 'Error de validación o entrada de datos' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la transferencia a actualizar' })
  @ApiBody({ type: UpdateTransferenciaDto, description: 'Datos para la actualización de la transferencia' })
  async actualizar(
    @Param('id', ParseIntPipe) id: number, // Use ParseIntPipe
    @Body() actualizarTransferenciaDto: UpdateTransferenciaDto,
  ): Promise<Transferencia | undefined> {
    try {
      const result = await this.actualizarTransferenciaUseCase.actualizarTransferenciaEmpresa(
        id,
        actualizarTransferenciaDto,
      );
      if (!result) {
        throw new HttpException('Transferencia not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una transferencia' })
  @ApiOkResponse({ description: 'Transferencia eliminada exitosamente' })
  @ApiNotFoundResponse({ description: 'Transferencia no encontrada' })
  @ApiBadRequestResponse({ description: 'ID de transferencia inválido' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la transferencia a eliminar' })
  async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> { // Use ParseIntPipe
    try {
      await this.eliminarTransferenciaUseCase.eliminarTransferenciaEmpresa(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

