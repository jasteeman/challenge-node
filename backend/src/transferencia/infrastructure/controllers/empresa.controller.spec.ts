import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaController } from './empresa.controller';
import { CreateEmpresaDto } from '../../application/dto/create-empresa.dto';
import { Empresa } from '../../domain/entities/empresa.entity';
import { PaginationOptions, PaginatedResult } from 'src/common/utils/paginations.utils';
import { UpdateEmpresaDto } from '../../application/dto/update-empresa.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockRegistrarEmpresaUseCase = () => ({
  registrarEmpresa: jest.fn(),
});

const mockObtenerEmpresaUseCase = () => ({
  obtenerEmpresa: jest.fn(),
});

const mockActualizarEmpresaUseCase = () => ({
  actualizarEmpresa: jest.fn(),
});

const mockEliminarEmpresaUseCase = () => ({
  eliminarEmpresa: jest.fn(),
});

const mockListaEmpresasUseCase = () => ({
  getAllEmpresas: jest.fn(),
});

const mockObtenerEmpresaConTransferenciaUseCase = () => ({
  obtenerEmpresaConTransferenciaUltimoMes: jest.fn(),
});

const mockObtenerEmpresaAdheridaUseCase = () => ({
  obtenerEmpresasAdheridasUltimoMes: jest.fn(),
});

describe('EmpresaController', () => {
  let controller: EmpresaController;
  let registrarEmpresaUseCase: ReturnType<typeof mockRegistrarEmpresaUseCase>;
  let obtenerEmpresaUseCase: ReturnType<typeof mockObtenerEmpresaUseCase>;
  let actualizarEmpresaUseCase: ReturnType<typeof mockActualizarEmpresaUseCase>;
  let eliminarEmpresaUseCase: ReturnType<typeof mockEliminarEmpresaUseCase>;
  let listaEmpresasUseCase: ReturnType<typeof mockListaEmpresasUseCase>;
  let obtenerEmpresaConTransferenciaUseCase: ReturnType<typeof mockObtenerEmpresaConTransferenciaUseCase>;
  let obtenerEmpresaAdheridaUseCase: ReturnType<typeof mockObtenerEmpresaAdheridaUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpresaController],
      providers: [
        {
          provide: 'RegistrarEmpresaUseCase',
          useFactory: mockRegistrarEmpresaUseCase,
        },
        {
          provide: 'ObtenerEmpresaUseCase',
          useFactory: mockObtenerEmpresaUseCase,
        },
        {
          provide: 'ActualizarEmpresaUseCase',
          useFactory: mockActualizarEmpresaUseCase,
        },
        {
          provide: 'EliminarEmpresaUseCase',
          useFactory: mockEliminarEmpresaUseCase,
        },
        {
          provide: 'ListaEmpresasUseCase',
          useFactory: mockListaEmpresasUseCase,
        },
        {
          provide: 'ObtenerEmpresaConTransferenciaUseCase',
          useFactory: mockObtenerEmpresaConTransferenciaUseCase,
        },
        {
          provide: 'ObtenerEmpresaAdheridaUseCase',
          useFactory: mockObtenerEmpresaAdheridaUseCase,
        },
      ],
    }).compile();

    controller = module.get<EmpresaController>(EmpresaController);
    registrarEmpresaUseCase = module.get('RegistrarEmpresaUseCase');
    obtenerEmpresaUseCase = module.get('ObtenerEmpresaUseCase');
    actualizarEmpresaUseCase = module.get('ActualizarEmpresaUseCase');
    eliminarEmpresaUseCase = module.get('EliminarEmpresaUseCase');
    listaEmpresasUseCase = module.get('ListaEmpresasUseCase');
    obtenerEmpresaConTransferenciaUseCase = module.get('ObtenerEmpresaConTransferenciaUseCase');
    obtenerEmpresaAdheridaUseCase = module.get('ObtenerEmpresaAdheridaUseCase');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registrar', () => {
    it('should call registrarEmpresaUseCase.registrarEmpresa and return the created empresa', async () => {
      const createEmpresaDto: CreateEmpresaDto = { cuit: '12-34567890-1', razonSocial: 'Test Empresa', fechaAdhesion: new Date('2024-03-05'), };
      const expectedEmpresa: Empresa = { id: 1, ...createEmpresaDto, fechaAdhesion: new Date() };
      jest.spyOn(registrarEmpresaUseCase, 'registrarEmpresa').mockResolvedValue(expectedEmpresa);

      const result = await controller.registrar(createEmpresaDto);

      expect(registrarEmpresaUseCase.registrarEmpresa).toHaveBeenCalledWith(createEmpresaDto);
      expect(result).toEqual(expectedEmpresa);
    });

    it('should throw HttpException with BAD_REQUEST status if registrarEmpresaUseCase throws an error', async () => {
      const createEmpresaDto: CreateEmpresaDto = { cuit: '12-34567890-1', razonSocial: 'Test Empresa', fechaAdhesion: new Date('2024-03-05'), };
      jest.spyOn(registrarEmpresaUseCase, 'registrarEmpresa').mockRejectedValue(new Error('Registration failed'));

      await expect(controller.registrar(createEmpresaDto)).rejects.toThrowError(HttpException);
      await expect(controller.registrar(createEmpresaDto)).rejects.toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });

    it('should throw HttpException with INTERNAL_SERVER_ERROR status if registrarEmpresaUseCase throws an unknown error', async () => {
      const createEmpresaDto: CreateEmpresaDto = { cuit: '12-34567890-1', razonSocial: 'Test Empresa', fechaAdhesion: new Date('2024-03-05'), };
      const error = new Error('Unknown server error');
      jest.spyOn(registrarEmpresaUseCase, 'registrarEmpresa').mockRejectedValue(error);

      await expect(controller.registrar(createEmpresaDto)).rejects.toThrowError(HttpException);
    });
  });

  describe('findAll', () => {
    const paginationOptions: PaginationOptions = { page: 1, limit: 10 };
    const mockResult: PaginatedResult<Empresa> = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };

    it('should call listaEmpresasUseCase.getAllEmpresas and return the result', async () => {
      listaEmpresasUseCase.getAllEmpresas.mockResolvedValue(mockResult);
      const result = await controller.findAll(paginationOptions);
      expect(listaEmpresasUseCase.getAllEmpresas).toHaveBeenCalledWith(paginationOptions);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getEmpresasConTransferenciasUltimoMes', () => {
    it('should call obtenerEmpresaConTransferenciaUseCase.obtenerEmpresaConTransferenciaUltimoMes and return the result', async () => {
      const mockEmpresas: Empresa[] = [];
      jest.spyOn(obtenerEmpresaConTransferenciaUseCase, 'obtenerEmpresaConTransferenciaUltimoMes').mockResolvedValue(mockEmpresas);
      const result = await controller.getEmpresasConTransferenciasUltimoMes('2024-01-01', '2024-01-31');
      expect(obtenerEmpresaConTransferenciaUseCase.obtenerEmpresaConTransferenciaUltimoMes).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );
      expect(result).toEqual(mockEmpresas);
    });

    it('should throw HttpException with BAD_REQUEST if fechaInicio is invalid', async () => {
      await expect(controller.getEmpresasConTransferenciasUltimoMes('invalid', '2024-01-31')).rejects.toThrowError(HttpException);
      await expect(controller.getEmpresasConTransferenciasUltimoMes('invalid', '2024-01-31')).rejects.toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });

    it('should throw HttpException with BAD_REQUEST if fechaFin is invalid', async () => {
      await expect(controller.getEmpresasConTransferenciasUltimoMes('2024-01-01', 'invalid')).rejects.toThrowError(HttpException);
      await expect(controller.getEmpresasConTransferenciasUltimoMes('2024-01-01', 'invalid')).rejects.toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });

    it('should throw HttpException with the same error and status as the use case', async () => {
      const error = new Error('Failed to get empresas con transferencias');
      jest.spyOn(obtenerEmpresaConTransferenciaUseCase, 'obtenerEmpresaConTransferenciaUltimoMes').mockRejectedValue(error);

      await expect(controller.getEmpresasConTransferenciasUltimoMes('2024-01-01', '2024-01-31')).rejects.toThrowError(error);
    });
  });

  describe('getEmpresasAdheridasUltimoMes', () => {
    it('should call obtenerEmpresaAdheridaUseCase.obtenerEmpresasAdheridasUltimoMes and return the result', async () => {
      const mockEmpresas: Empresa[] = [];
      jest.spyOn(obtenerEmpresaAdheridaUseCase, 'obtenerEmpresasAdheridasUltimoMes').mockResolvedValue(mockEmpresas);
      const result = await controller.getEmpresasAdheridasUltimoMes('2024-01-01', '2024-01-31');
      expect(obtenerEmpresaAdheridaUseCase.obtenerEmpresasAdheridasUltimoMes).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-01-31'),
      );
      expect(result).toEqual(mockEmpresas);
    });
    it('should throw HttpException with BAD_REQUEST if fechaInicio is invalid', async () => {
      await expect(controller.getEmpresasAdheridasUltimoMes('invalid', '2024-01-31')).rejects.toThrowError(HttpException);
      await expect(controller.getEmpresasAdheridasUltimoMes('invalid', '2024-01-31')).rejects.toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });

    it('should throw HttpException with BAD_REQUEST if fechaFin is invalid', async () => {
      await expect(controller.getEmpresasAdheridasUltimoMes('2024-01-01', 'invalid')).rejects.toThrowError(HttpException);
      await expect(controller.getEmpresasAdheridasUltimoMes('2024-01-01', 'invalid')).rejects.toHaveProperty('status', HttpStatus.BAD_REQUEST);
    });

    it('should throw HttpException with the same error and status as the use case', async () => {
      const error = new Error('Failed to get empresas adheridas');
      jest.spyOn(obtenerEmpresaAdheridaUseCase, 'obtenerEmpresasAdheridasUltimoMes').mockRejectedValue(error);

      await expect(controller.getEmpresasAdheridasUltimoMes('2024-01-01', '2024-01-31')).rejects.toThrowError(error);
    });
  });

  describe('obtenerEmpresa', () => {
    it('should call obtenerEmpresaUseCase.obtenerEmpresa and return the empresa', async () => {
      const expectedEmpresa: Empresa = { id: 1, cuit: '12-34567890-1', razonSocial: 'Test Empresa', fechaAdhesion: new Date() };
      jest.spyOn(obtenerEmpresaUseCase, 'obtenerEmpresa').mockResolvedValue(expectedEmpresa);

      const result = await controller.obtenerEmpresa('1');

      expect(obtenerEmpresaUseCase.obtenerEmpresa).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedEmpresa);
    });

    it('should throw HttpException with NOT_FOUND status if obtenerEmpresaUseCase returns undefined', async () => {
      jest.spyOn(obtenerEmpresaUseCase, 'obtenerEmpresa').mockResolvedValue(undefined);

      await expect(controller.obtenerEmpresa('1')).rejects.toThrowError(HttpException);
      await expect(controller.obtenerEmpresa('1')).rejects.toHaveProperty('status', HttpStatus.NOT_FOUND);
    });
    it('should throw HttpException with the same error and status as the use case', async () => {
      const error = new Error('Failed to get empresa');
      jest.spyOn(obtenerEmpresaUseCase, 'obtenerEmpresa').mockRejectedValue(error);

      await expect(controller.obtenerEmpresa('1')).rejects.toThrowError(error);
    });
  });

  describe('actualizar', () => {
    const empresaId = '1';
    const updateEmpresaDto: UpdateEmpresaDto = { razonSocial: 'Updated Name',fechaAdhesion: new Date() };
    const updatedEmpresa = { id: 1, razonSocial: 'Updated Name' } as Empresa;

    it('should call actualizarEmpresaUseCase.actualizarEmpresa with the parsed id and dto', async () => {
      actualizarEmpresaUseCase.actualizarEmpresa.mockResolvedValue(updatedEmpresa);
      const result = await controller.actualizar(empresaId, updateEmpresaDto);
      expect(actualizarEmpresaUseCase.actualizarEmpresa).toHaveBeenCalledWith(parseInt(empresaId, 10), updateEmpresaDto);
      expect(result).toEqual(updatedEmpresa);
    });

    it('should throw HttpException with the same error and status as the use case', async () => {
      const error = new Error('Failed to update empresa');
      jest.spyOn(actualizarEmpresaUseCase, 'actualizarEmpresa').mockRejectedValue(error);

      await expect(controller.actualizar(empresaId, updateEmpresaDto)).rejects.toThrowError(error);
    });
  });

  describe('eliminar', () => {
    const empresaId = '1';

    it('should call eliminarEmpresaUseCase.eliminarEmpresa with the parsed id', async () => {
      eliminarEmpresaUseCase.eliminarEmpresa.mockResolvedValue(undefined);
      await controller.eliminar(empresaId);
      expect(eliminarEmpresaUseCase.eliminarEmpresa).toHaveBeenCalledWith(parseInt(empresaId, 10));
    });
    it('should throw HttpException with the same error and status as the use case', async () => {
      const error = new Error('Failed to delete empresa');
      jest.spyOn(eliminarEmpresaUseCase, 'eliminarEmpresa').mockRejectedValue(error);

      await expect(controller.eliminar(empresaId)).rejects.toThrowError(error);
    });
  });
});

