import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaController } from './empresa.controller'; 
import { CreateEmpresaDto } from '../../application/dto/create-empresa.dto';
import { Empresa } from '../../domain/entities/empresa.entity';
import { PaginationOptions, PaginatedResult } from 'src/common/utils/paginations.utils';
import { UpdateEmpresaDto } from '../../application/dto/update-empresa.dto';

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
    const createEmpresaDto: CreateEmpresaDto = {
      cuit: '30-12345678-9',
      razonSocial: 'Empresa de Prueba',
      fechaAdhesion: new Date().toISOString(),
    };
    const nuevaEmpresa = { ...createEmpresaDto, id: 1 } as unknown as Empresa;

    it('should call registrarEmpresaUseCase.registrarEmpresa and return the result', async () => {
      registrarEmpresaUseCase.registrarEmpresa.mockResolvedValue(nuevaEmpresa);
      const result = await controller.registrar(createEmpresaDto);
      expect(registrarEmpresaUseCase.registrarEmpresa).toHaveBeenCalledWith(createEmpresaDto);
      expect(result).toEqual(nuevaEmpresa);
    });

    it('should throw an error if registrarEmpresaUseCase.registrarEmpresa fails', async () => {
      registrarEmpresaUseCase.registrarEmpresa.mockResolvedValue(null);
      await expect(controller.registrar(createEmpresaDto)).rejects.toThrow('Failed to register Empresa');
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
    const mockEmpresas: Empresa[] = [];
    it('should call obtenerEmpresaConTransferenciaUseCase.obtenerEmpresaConTransferenciaUltimoMes and return the result', async () => {
      obtenerEmpresaConTransferenciaUseCase.obtenerEmpresaConTransferenciaUltimoMes.mockResolvedValue(mockEmpresas);
      const result = await controller.getEmpresasConTransferenciasUltimoMes();
      expect(obtenerEmpresaConTransferenciaUseCase.obtenerEmpresaConTransferenciaUltimoMes).toHaveBeenCalled();
      expect(result).toEqual(mockEmpresas);
    });
  });

  describe('getEmpresasAdheridasUltimoMes', () => {
    const mockEmpresas: Empresa[] = [];
    it('should call obtenerEmpresaAdheridaUseCase.obtenerEmpresasAdheridasUltimoMes and return the result', async () => {
      obtenerEmpresaAdheridaUseCase.obtenerEmpresasAdheridasUltimoMes.mockResolvedValue(mockEmpresas);
      const result = await controller.getEmpresasAdheridasUltimoMes();
      expect(obtenerEmpresaAdheridaUseCase.obtenerEmpresasAdheridasUltimoMes).toHaveBeenCalled();
      expect(result).toEqual(mockEmpresas);
    });
  });

  describe('obtenerEmpresa', () => {
    const empresaId = '1';
    const mockEmpresa = { id: 1 } as Empresa;

    it('should call obtenerEmpresaUseCase.obtenerEmpresa with the parsed id and return the result', async () => {
      obtenerEmpresaUseCase.obtenerEmpresa.mockResolvedValue(mockEmpresa);
      const result = await controller.obtenerEmpresa(empresaId);
      expect(obtenerEmpresaUseCase.obtenerEmpresa).toHaveBeenCalledWith(parseInt(empresaId, 10));
      expect(result).toEqual(mockEmpresa);
    });

    it('should throw an error if obtenerEmpresaUseCase.obtenerEmpresa fails', async () => {
      obtenerEmpresaUseCase.obtenerEmpresa.mockResolvedValue(undefined);
      await expect(controller.obtenerEmpresa(empresaId)).rejects.toThrow('Failed to register Empresa');
    });
  });

  describe('actualizar', () => {
    const empresaId = '1';
    const updateEmpresaDto: UpdateEmpresaDto = { razonSocial: 'Updated Name' };
    const updatedEmpresa = { id: 1, razonSocial: 'Updated Name' } as Empresa;

    it('should call actualizarEmpresaUseCase.actualizarEmpresa with the parsed id and dto', async () => {
      actualizarEmpresaUseCase.actualizarEmpresa.mockResolvedValue(updatedEmpresa);
      const result = await controller.actualizar(empresaId, updateEmpresaDto);
      expect(actualizarEmpresaUseCase.actualizarEmpresa).toHaveBeenCalledWith(parseInt(empresaId, 10), updateEmpresaDto);
      expect(result).toEqual(updatedEmpresa);
    });
  });

  describe('eliminar', () => {
    const empresaId = '1';

    it('should call eliminarEmpresaUseCase.eliminarEmpresa with the parsed id', async () => {
      eliminarEmpresaUseCase.eliminarEmpresa.mockResolvedValue(undefined);
      await controller.eliminar(empresaId);
      expect(eliminarEmpresaUseCase.eliminarEmpresa).toHaveBeenCalledWith(parseInt(empresaId, 10));
    });
  });
});