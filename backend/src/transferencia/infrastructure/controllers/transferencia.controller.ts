import { Controller, Post, Body, Get, Param, Put, Delete, Inject } from '@nestjs/common';
import { Transferencia } from '../../domain/entities/transferencia.entity';
import { UpdateTransferenciaDto } from 'src/transferencia/application/dto/update-transferencia.dto';
import { EliminarTransferenciaEmpresaUseCase } from 'src/transferencia/domain/ports/in/eliminar-tranferencia-empresa.use-case';
import { ActualizarTransferenciaEmpresaUseCase } from 'src/transferencia/domain/ports/in/actualizar-transferencia-empresa.use-case';
import { ObtenerTransferenciasEmpresaUseCase } from 'src/transferencia/domain/ports/in/obtener-transferencia-empresa.use-case';
import { RegistrarTransferenciaEmpresaUseCase } from 'src/transferencia/domain/ports/in/registrar-transferencia-empresa.use-case';
import { CreateTransferenciaDto } from 'src/transferencia/application/dto/create-transferencia.dto';

@Controller('transferencias')
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
  async registrar(@Body() registrarTransferenciaDto: CreateTransferenciaDto): Promise<Transferencia> {
    return this.registrarTransferenciaUseCase.registrarTransferenciaEmpresa(registrarTransferenciaDto);
  }

  @Get('empresa/:idEmpresa')
  async obtenerPorEmpresa(@Param('idEmpresa') idEmpresa: string): Promise<Transferencia[]> {
    return this.obtenerTransferenciasEmpresaUseCase.obtenerTransferenciasPorEmpresa(+idEmpresa);
  }

  @Put(':id')
  async actualizar(
    @Param('id') id: string,
    @Body() actualizarTransferenciaDto: UpdateTransferenciaDto,
  ): Promise<Transferencia | undefined> {
    return this.actualizarTransferenciaUseCase.actualizarTransferenciaEmpresa(+id, actualizarTransferenciaDto);
  }

  @Delete(':id')
  async eliminar(@Param('id') id: string): Promise<void> {
    return this.eliminarTransferenciaUseCase.eliminarTransferenciaEmpresa(+id);
  }
}