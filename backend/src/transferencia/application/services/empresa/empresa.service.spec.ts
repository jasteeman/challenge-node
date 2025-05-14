import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from './empresa.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateEmpresaDto } from '../../dto/update-empresa.dto';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { Empresa } from 'src/transferencia/domain/entities/empresa.entity';
import { CreateEmpresaDto } from '../../dto/create-empresa.dto';

const mockEmpresaRepository = () => ({
  findAll: jest.fn(),
  findByCUIT: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findEmpresasConTransferenciasUltimoMes: jest.fn(),
  findEmpresasAdheridasUltimoMes: jest.fn(),
});

describe('EmpresaService', () => {
  let service: EmpresaService;
  let repository: ReturnType<typeof mockEmpresaRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        {
          provide: 'EmpresaRepositoryPort',
          useFactory: mockEmpresaRepository,
        },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
    repository = module.get('EmpresaRepositoryPort');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllEmpresas', () => {
    it('should call empresaRepository.findAll with the provided options', async () => {
      const paginationOptions: PaginationOptions = { page: 1, limit: 10 };
      const mockResult: PaginatedResult<Empresa> = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      repository.findAll.mockResolvedValue(mockResult);

      const result = await service.getAllEmpresas(paginationOptions);
      expect(repository.findAll).toHaveBeenCalledWith(paginationOptions);
      expect(result).toEqual(mockResult);
    });
  });

  describe('registrarEmpresa', () => {
    const createEmpresaDto: CreateEmpresaDto = {
      cuit: '30-12345678-9',
      razonSocial: 'Empresa de Prueba',
      fechaAdhesion: new Date().toISOString(),
    };
    const nuevaEmpresa = { ...createEmpresaDto, id: 1 } as unknown as Empresa;

    it('should successfully register a new empresa', async () => {
      repository.findByCUIT.mockResolvedValue(undefined);
      repository.create.mockResolvedValue(nuevaEmpresa);

      const result = await service.registrarEmpresa(createEmpresaDto);
      expect(repository.findByCUIT).toHaveBeenCalledWith(createEmpresaDto.cuit);
      expect(repository.create).toHaveBeenCalledWith(expect.any(Empresa));
      expect(result).toEqual(nuevaEmpresa);
    });

    it('should throw BadRequestException if CUIT is invalid', async () => {
      await expect(
        service.registrarEmpresa({ ...createEmpresaDto, cuit: '123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if razonSocial is empty', async () => {
      await expect(
        service.registrarEmpresa({ ...createEmpresaDto, razonSocial: ' ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if empresa with CUIT already exists', async () => {
      repository.findByCUIT.mockResolvedValue(nuevaEmpresa);
      await expect(service.registrarEmpresa(createEmpresaDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('obtenerEmpresa', () => {
    const empresaId = 1;
    const mockEmpresa = { id: empresaId, cuit: '...', razonSocial: '...' } as Empresa;

    it('should call empresaRepository.findById with the provided id', async () => {
      repository.findById.mockResolvedValue(mockEmpresa);
      const result = await service.obtenerEmpresa(empresaId);
      expect(repository.findById).toHaveBeenCalledWith(empresaId);
      expect(result).toEqual(mockEmpresa);
    });
  });

  describe('actualizarEmpresa', () => {
    const empresaId = 1;
    const existingEmpresa = { id: empresaId, cuit: '30-11111111-1', razonSocial: 'Empresa Antigua' } as Empresa;
    const updateEmpresaDto: UpdateEmpresaDto = { razonSocial: 'Empresa Nueva' };
    const updatedEmpresa = { ...existingEmpresa, ...updateEmpresaDto } as Empresa;

    it('should successfully update an existing empresa', async () => {
      repository.findById.mockResolvedValue(existingEmpresa);
      repository.findByCUIT.mockResolvedValue(undefined);
      repository.update.mockResolvedValue(updatedEmpresa);

      const result = await service.actualizarEmpresa(empresaId, updateEmpresaDto);
      expect(repository.findById).toHaveBeenCalledWith(empresaId);
      expect(repository.findByCUIT).not.toHaveBeenCalledWith(updateEmpresaDto.cuit);
      expect(repository.update).toHaveBeenCalledWith(empresaId, { ...existingEmpresa, ...updateEmpresaDto });
      expect(result).toEqual(updatedEmpresa);
    });

    it('should return undefined if empresa does not exist', async () => {
      repository.findById.mockResolvedValue(undefined);
      const result = await service.actualizarEmpresa(empresaId, updateEmpresaDto);
      expect(result).toBeUndefined();
    });

    it('should throw BadRequestException if id is invalid', async () => {
      await expect(service.actualizarEmpresa(0, updateEmpresaDto)).rejects.toThrow(BadRequestException);
      await expect(service.actualizarEmpresa(-1, updateEmpresaDto)).rejects.toThrow(BadRequestException);
      await expect(service.actualizarEmpresa(NaN, updateEmpresaDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if CUIT is invalid', async () => {
      repository.findById.mockResolvedValue(existingEmpresa);
      await expect(
        service.actualizarEmpresa(empresaId, { ...updateEmpresaDto, cuit: '123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if new CUIT already exists for another empresa', async () => {
      repository.findById.mockResolvedValue(existingEmpresa);
      repository.findByCUIT.mockResolvedValue({ id: 2 } as Empresa);
      await expect(
        service.actualizarEmpresa(empresaId, { ...updateEmpresaDto, cuit: '30-22222222-2' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not check for existing CUIT if CUIT is not being updated', async () => {
      repository.findById.mockResolvedValue(existingEmpresa);
      repository.update.mockResolvedValue(updatedEmpresa);
      await service.actualizarEmpresa(empresaId, updateEmpresaDto);
      expect(repository.findByCUIT).not.toHaveBeenCalledWith(updateEmpresaDto.cuit);
    });

    it('should throw BadRequestException if razonSocial is empty', async () => {
      repository.findById.mockResolvedValue(existingEmpresa);
      await expect(
        service.actualizarEmpresa(empresaId, { razonSocial: ' ' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('eliminarEmpresa', () => {
    const empresaId = 1;
    const mockEmpresa = { id: empresaId } as Empresa;

    it('should call empresaRepository.delete with the provided id', async () => {
      repository.findById.mockResolvedValue(mockEmpresa);
      repository.delete.mockResolvedValue(undefined);
      await service.eliminarEmpresa(empresaId);
      expect(repository.findById).toHaveBeenCalledWith(empresaId);
      expect(repository.delete).toHaveBeenCalledWith(empresaId);
    });

    it('should throw BadRequestException if id is invalid', async () => {
      await expect(service.eliminarEmpresa(0)).rejects.toThrow(BadRequestException);
      await expect(service.eliminarEmpresa(-1)).rejects.toThrow(BadRequestException);
      await expect(service.eliminarEmpresa(NaN)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if empresa does not exist', async () => {
      repository.findById.mockResolvedValue(undefined);
      await expect(service.eliminarEmpresa(empresaId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('obtenerEmpresaConTransferenciaUltimoMes', () => {
    it('should call empresaRepository.findEmpresasConTransferenciasUltimoMes', async () => {
      const mockResult: Empresa[] = [];
      repository.findEmpresasConTransferenciasUltimoMes.mockResolvedValue(mockResult);
      const result = await service.obtenerEmpresaConTransferenciaUltimoMes(new Date('2024-01-01'),
        new Date('2024-01-31'));
      expect(repository.findEmpresasConTransferenciasUltimoMes).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('obtenerEmpresasAdheridasUltimoMes', () => {
    it('should call empresaRepository.findEmpresasAdheridasUltimoMes', async () => {
      const mockResult: Empresa[] = [];
      repository.findEmpresasAdheridasUltimoMes.mockResolvedValue(mockResult);
      const result = await service.obtenerEmpresasAdheridasUltimoMes(new Date('2024-01-01'),
        new Date('2024-01-31'));
      expect(repository.findEmpresasAdheridasUltimoMes).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });
});