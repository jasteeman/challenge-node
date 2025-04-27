import { Test, TestingModule } from '@nestjs/testing';
import { TransferenciaController } from './transferencia.controller';
import { RegistrarTransferenciaEmpresaUseCase } from 'src/transferencia/domain/ports/in/registrar-transferencia-empresa.use-case';
import { ObtenerTransferenciasEmpresaUseCase } from 'src/transferencia/domain/ports/in/obtener-transferencia-empresa.use-case';
import { ActualizarTransferenciaEmpresaUseCase } from 'src/transferencia/domain/ports/in/actualizar-transferencia-empresa.use-case';
import { EliminarTransferenciaEmpresaUseCase } from 'src/transferencia/domain/ports/in/eliminar-tranferencia-empresa.use-case';
import { CreateTransferenciaDto } from 'src/transferencia/application/dto/create-transferencia.dto';
import { Transferencia } from '../../domain/entities/transferencia.entity';
import { UpdateTransferenciaDto } from 'src/transferencia/application/dto/update-transferencia.dto';

describe('TransferenciaController', () => {
  let controller: TransferenciaController;
  let mockRegistrarTransferenciaEmpresaUseCase: { registrarTransferenciaEmpresa: jest.Mock };
  let mockObtenerTransferenciasEmpresaUseCase: { obtenerTransferenciasPorEmpresa: jest.Mock };
  let mockActualizarTransferenciaEmpresaUseCase: { actualizarTransferenciaEmpresa: jest.Mock };
  let mockEliminarTransferenciaEmpresaUseCase: { eliminarTransferenciaEmpresa: jest.Mock };

  beforeEach(async () => {
    mockRegistrarTransferenciaEmpresaUseCase = { registrarTransferenciaEmpresa: jest.fn() };
    mockObtenerTransferenciasEmpresaUseCase = { obtenerTransferenciasPorEmpresa: jest.fn() };
    mockActualizarTransferenciaEmpresaUseCase = { actualizarTransferenciaEmpresa: jest.fn() };
    mockEliminarTransferenciaEmpresaUseCase = { eliminarTransferenciaEmpresa: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferenciaController],
      providers: [
        { provide: 'RegistrarTransferenciaUseCase', useValue: mockRegistrarTransferenciaEmpresaUseCase },
        { provide: 'ObtenerTransferenciasEmpresaUseCase', useValue: mockObtenerTransferenciasEmpresaUseCase },
        { provide: 'ActualizarTransferenciaUseCase', useValue: mockActualizarTransferenciaEmpresaUseCase },
        { provide: 'EliminarTransferenciaUseCase', useValue: mockEliminarTransferenciaEmpresaUseCase },
      ],
    }).compile();

    controller = module.get<TransferenciaController>(TransferenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registrar', () => {
    it('should call registrarTransferenciaUseCase.registrarTransferenciaEmpresa with the provided dto', async () => {
      const createTransferenciaDto: CreateTransferenciaDto = {
        idEmpresa: 1,
        importe: 100,
        cuentaDebito: '123',
        cuentaCredito: '456',
      };
      const nuevaTransferencia: Transferencia = { ...createTransferenciaDto, id: 1 } as Transferencia;
      mockRegistrarTransferenciaEmpresaUseCase.registrarTransferenciaEmpresa.mockResolvedValue(nuevaTransferencia);

      const result = await controller.registrar(createTransferenciaDto);
      expect(mockRegistrarTransferenciaEmpresaUseCase.registrarTransferenciaEmpresa).toHaveBeenCalledWith(createTransferenciaDto);
      expect(result).toEqual(nuevaTransferencia);
    });
  });

  describe('obtenerPorEmpresa', () => {
    it('should call obtenerTransferenciasEmpresaUseCase.obtenerTransferenciasPorEmpresa with the parsed idEmpresa', async () => {
      const idEmpresa = '1';
      const mockTransferencias: Transferencia[] = [];
      mockObtenerTransferenciasEmpresaUseCase.obtenerTransferenciasPorEmpresa.mockResolvedValue(mockTransferencias);

      const result = await controller.obtenerPorEmpresa(idEmpresa);
      expect(mockObtenerTransferenciasEmpresaUseCase.obtenerTransferenciasPorEmpresa).toHaveBeenCalledWith(parseInt(idEmpresa, 10));
      expect(result).toEqual(mockTransferencias);
    });
  });

  describe('actualizar', () => {
    it('should call actualizarTransferenciaUseCase.actualizarTransferenciaEmpresa with the parsed id and dto', async () => {
      const id = '1';
      const actualizarTransferenciaDto: UpdateTransferenciaDto = { importe: 150 };
      const updatedTransferencia: Transferencia = { id: 1, importe: 150 } as Transferencia;
      mockActualizarTransferenciaEmpresaUseCase.actualizarTransferenciaEmpresa.mockResolvedValue(updatedTransferencia);

      const result = await controller.actualizar(id, actualizarTransferenciaDto);
      expect(mockActualizarTransferenciaEmpresaUseCase.actualizarTransferenciaEmpresa).toHaveBeenCalledWith(parseInt(id, 10), actualizarTransferenciaDto);
      expect(result).toEqual(updatedTransferencia);
    });
  });

  describe('eliminar', () => {
    it('should call eliminarTransferenciaUseCase.eliminarTransferenciaEmpresa with the parsed id', async () => {
      const id = '1';
      mockEliminarTransferenciaEmpresaUseCase.eliminarTransferenciaEmpresa.mockResolvedValue(undefined);

      await controller.eliminar(id);
      expect(mockEliminarTransferenciaEmpresaUseCase.eliminarTransferenciaEmpresa).toHaveBeenCalledWith(parseInt(id, 10));
    });
  });
});