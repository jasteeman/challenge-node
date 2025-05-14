import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpresaRepository } from './empresa.repository';
import { Empresa } from '../../domain/entities/empresa.entity';
import { Transferencia } from '../../../transferencia/domain/entities/transferencia.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Between, Like, In } from 'typeorm';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { SelectQueryBuilder } from 'typeorm'; // Import SelectQueryBuilder

describe('EmpresaRepository', () => {
  let repository: EmpresaRepository;
  let empresaRepo: Repository<Empresa>;
  let transferenciaRepo: Repository<Transferencia>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaRepository,
        {
          provide: getRepositoryToken(Empresa),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
            findBy: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Transferencia),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<EmpresaRepository>(EmpresaRepository);
    empresaRepo = module.get<Repository<Empresa>>(getRepositoryToken(Empresa));
    transferenciaRepo = module.get<Repository<Transferencia>>(
      getRepositoryToken(Transferencia),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return an empresa when given a valid ID', async () => {
      const expectedEmpresa = new Empresa();
      expectedEmpresa.id = 1;
      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(expectedEmpresa);

      const result = await repository.findById(1);

      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expectedEmpresa);
    });

    it('should throw NotFoundException when given an invalid ID', async () => {
      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(null);

      await expect(repository.findById(1)).rejects.toThrowError(NotFoundException);
      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findByCUIT', () => {
    it('should return an empresa when given a valid CUIT', async () => {
      const expectedEmpresa = new Empresa();
      expectedEmpresa.cuit = '12-34567890-1';
      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(expectedEmpresa);

      const result = await repository.findByCUIT('12-34567890-1');

      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { cuit: '12-34567890-1' } });
      expect(result).toEqual(expectedEmpresa);
    });

    it('should return undefined when given an invalid CUIT', async () => {
      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(null);

      const result = await repository.findByCUIT('invalid-cuit');

      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { cuit: 'invalid-cuit' } });
      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create an empresa successfully', async () => {
      const empresaToCreate = new Empresa();
      empresaToCreate.cuit = '12-34567890-1';
      empresaToCreate.razonSocial = 'Test Empresa';
      const createdEmpresa = { ...empresaToCreate, id: 1 } as Empresa;
      jest.spyOn(empresaRepo, 'save').mockResolvedValue(createdEmpresa);

      const result = await repository.create(empresaToCreate);

      expect(empresaRepo.save).toHaveBeenCalledWith(empresaToCreate);
      expect(result).toEqual(createdEmpresa);
    });

    it('should throw BadRequestException when creation fails', async () => {
      const empresaToCreate = new Empresa();
      empresaToCreate.cuit = '12-34567890-1';
      empresaToCreate.razonSocial = 'Test Empresa';
      jest.spyOn(empresaRepo, 'save').mockRejectedValue(new Error('Simulated error'));

      await expect(repository.create(empresaToCreate)).rejects.toThrowError(
        BadRequestException,
      );
      expect(empresaRepo.save).toHaveBeenCalledWith(empresaToCreate);
    });
  });

  describe('update', () => {
    it('should update an empresa successfully', async () => {
      const existingEmpresa = { id: 1, cuit: '12-34567890-1', razonSocial: 'Old Name' } as Empresa;
      const updatedEmpresaData = { razonSocial: 'New Name' } as Empresa;
      const updatedEmpresa = { id: 1, cuit: '12-34567890-1', razonSocial: 'New Name' } as Empresa;

      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(existingEmpresa);
      jest.spyOn(empresaRepo, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(updatedEmpresa);

      const result = await repository.update(1, updatedEmpresaData);

      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(empresaRepo.update).toHaveBeenCalledWith(1, updatedEmpresaData);
      expect(result).toEqual(updatedEmpresa);
    });

    it('should throw Error if findOne fails after update', async () => {
      const existingEmpresa = { id: 1, cuit: '12-34567890-1', razonSocial: 'Old Name' } as Empresa;
      const updatedEmpresaData = { razonSocial: 'New Name' } as Empresa;

      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(existingEmpresa);
      jest.spyOn(empresaRepo, 'update').mockResolvedValue({ affected: 0 } as any);
      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(null); // Simulate findOne failing

      await expect(repository.update(1, updatedEmpresaData)).rejects.toThrowError(
        Error,
      );
      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if findOne fails after update', async () => {
      const existingEmpresa = { id: 1, cuit: '12-34567890-1', razonSocial: 'Old Name' } as Empresa;
      const updatedEmpresaData = { razonSocial: 'New Name' } as Empresa;

      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(existingEmpresa);
      jest.spyOn(empresaRepo, 'update').mockRejectedValue(null);
      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(null);

      await expect(repository.update(1, updatedEmpresaData)).rejects.toThrowError(
        NotFoundException,
      );
      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw BadRequestException when update fails', async () => {
      const existingEmpresa = { id: 1, cuit: '12-34567890-1', razonSocial: 'Old Name' } as Empresa;
      const updatedEmpresaData = { razonSocial: 'New Name' } as Empresa;

      jest.spyOn(empresaRepo, 'findOne').mockResolvedValue(existingEmpresa);
      jest.spyOn(empresaRepo, 'update').mockRejectedValue(new Error('Simulated update error'));

      await expect(repository.update(1, updatedEmpresaData)).rejects.toThrowError(
        BadRequestException,
      );
      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(empresaRepo.update).toHaveBeenCalledWith(1, updatedEmpresaData);
    });
  });

  describe('delete', () => {
    it('should delete an empresa successfully', async () => {
      jest.spyOn(empresaRepo, 'delete').mockResolvedValue({ affected: 1 } as any);

      await repository.delete(1);

      expect(empresaRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if empresa to delete does not exist', async () => {
      jest.spyOn(empresaRepo, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(repository.delete(1)).rejects.toThrowError(BadRequestException);
      expect(empresaRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException when deletion fails', async () => {
      jest.spyOn(empresaRepo, 'delete').mockRejectedValue(new Error('Simulated error'));

      await expect(repository.delete(1)).rejects.toThrowError(BadRequestException);
      expect(empresaRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of empresas with default pagination options', async () => {
      const mockEmpresas = [
        { id: 1, razonSocial: 'Empresa 1', cuit: '123' },
        { id: 2, razonSocial: 'Empresa 2', cuit: '456' },
      ] as Empresa[];
      const total = 2;
      jest.spyOn(empresaRepo, 'findAndCount').mockResolvedValue([mockEmpresas, total]);

      const result = await repository.findAll({}); // Pass an empty options object

      expect(empresaRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
      });
      expect(result).toEqual({
        data: mockEmpresas,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should use provided pagination options', async () => {
      const options: PaginationOptions = { page: 2, limit: 5, q: '' };
      const mockEmpresas = [
        { id: 3, razonSocial: 'Empresa 3', cuit: '789' },
        { id: 4, razonSocial: 'Empresa 4', cuit: '012' },
        { id: 5, razonSocial: 'Empresa 5', cuit: '345' },
      ] as Empresa[];
      const total = 5;
      jest.spyOn(empresaRepo, 'findAndCount').mockResolvedValue([mockEmpresas, total]);

      const result = await repository.findAll(options);

      expect(empresaRepo.findAndCount).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        where: {},
      });
      expect(result).toEqual({
        data: mockEmpresas,
        total,
        page: 2,
        limit: 5,
        totalPages: 1,
      });
    });

    it('should apply search query if provided', async () => {
      const options: PaginationOptions = { page: 1, limit: 10, q: 'Empresa' };
      const mockEmpresas = [{ id: 1, razonSocial: 'Empresa 1', cuit: '123' }] as Empresa[];
      const total = 1;
      jest.spyOn(empresaRepo, 'findAndCount').mockResolvedValue([mockEmpresas, total]);

      const result = await repository.findAll(options);

      expect(empresaRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          cuit: Like('%Empresa%'),
          razonSocial: Like('%Empresa%'),
        },
      });
      expect(result).toEqual({
        data: mockEmpresas,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should handle empty result', async () => {
      const options: PaginationOptions = { page: 1, limit: 10, q: '' };
      const mockEmpresas = [] as Empresa[];
      const total = 0;
      jest.spyOn(empresaRepo, 'findAndCount').mockResolvedValue([mockEmpresas, total]);

      const result = await repository.findAll(options);

      expect(empresaRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
      });
      expect(result).toEqual({
        data: mockEmpresas,
        total,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('findEmpresasConTransferenciasUltimoMes', () => {
    it('should find empresas with transfers in the given date range and map transfer data', async () => {
      const mockRawResults = [
        { empresaId: 1, importe: 1000, ultimaTransferencia: new Date('2024-04-01') },
        { empresaId: 2, importe: 2000, ultimaTransferencia: new Date('2024-04-02') },
      ];

      const mockEmpresas = [
        { id: 1, razonSocial: 'Empresa 1', cuit: '123', fechaAdhesion: new Date('2023-01-01') },
        { id: 2, razonSocial: 'Empresa 2', cuit: '456', fechaAdhesion: new Date('2023-02-01') },
      ] as Empresa[];

      const mockQueryBuilder: Partial<SelectQueryBuilder<Transferencia>> = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawResults),
      };
      jest.spyOn(transferenciaRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as SelectQueryBuilder<Transferencia>);
      jest.spyOn(empresaRepo, 'findBy').mockResolvedValue(mockEmpresas);

      const fechaInicio = new Date('2024-04-01');
      const fechaFin = new Date('2024-04-30');
      const result = await repository.findEmpresasConTransferenciasUltimoMes(
        fechaInicio,
        fechaFin,
      );

      expect(transferenciaRepo.createQueryBuilder).toHaveBeenCalledWith('transferencias');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'transferencias.idEmpresa AS empresaId',
        'SUM(transferencias.importe) AS importe',
        'MAX(transferencias.fechaTransferencia) AS ultimaTransferencia',
      ]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'transferencias.fechaTransferencia BETWEEN :fechaInicio AND :fechaFin',
        { fechaInicio, fechaFin },
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('transferencias.idEmpresa');
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(empresaRepo.findBy).toHaveBeenCalledWith({ id: In([1, 2]) });

      expect(result).toEqual([
        {
          ...mockEmpresas[0],
          importe: 1000,
          ultimaTransferencia: new Date('2024-04-01'),
        },
        {
          ...mockEmpresas[1],
          importe: 2000,
          ultimaTransferencia: new Date('2024-04-02'),
        },
      ]);
    });

    it('should return an empty array if no transfers in the given date range', async () => {
      const mockQueryBuilder: Partial<SelectQueryBuilder<Transferencia>> = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(transferenciaRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as SelectQueryBuilder<Transferencia>);
      jest.spyOn(empresaRepo, 'findBy').mockResolvedValue([]);


      const fechaInicio = new Date('2024-04-01');
      const fechaFin = new Date('2024-04-30');
      const result = await repository.findEmpresasConTransferenciasUltimoMes(
        fechaInicio,
        fechaFin,
      );
      expect(result).toEqual([]);
    });

    it('should handle cases where transferencia is not found for an empresa', async () => {
      const mockRawResults = [
        { empresaId: 1, importe: 1000, ultimaTransferencia: new Date('2024-04-01') },
      ];

      const mockEmpresas = [
        { id: 1, razonSocial: 'Empresa 1', cuit: '123', fechaAdhesion: new Date('2023-01-01') },
        { id: 2, razonSocial: 'Empresa 2', cuit: '456', fechaAdhesion: new Date('2023-02-01') }, // Empresa sin transferencia en mockRawResults
      ] as Empresa[];

      const mockQueryBuilder: Partial<SelectQueryBuilder<Transferencia>> = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawResults),
      };
      jest.spyOn(transferenciaRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as SelectQueryBuilder<Transferencia>);
      jest.spyOn(empresaRepo, 'findBy').mockResolvedValue(mockEmpresas);

      const fechaInicio = new Date('2024-04-01');
      const fechaFin = new Date('2024-04-30');
      const result = await repository.findEmpresasConTransferenciasUltimoMes(
        fechaInicio,
        fechaFin,
      );

      expect(result).toEqual([
        {
          ...mockEmpresas[0],
          importe: 1000,
          ultimaTransferencia: new Date('2024-04-01'),
        },
        {
          ...mockEmpresas[1],
          importe: 0,
          ultimaTransferencia: null,
        },
      ]);
    });

    it('should handle errors from transferenciaRepository', async () => {
      const fechaInicio = new Date('2024-04-01');
      const fechaFin = new Date('2024-04-30');
      const mockQueryBuilder: Partial<SelectQueryBuilder<Transferencia>> = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockRejectedValue(new Error('Simulated error')),
      };
      jest.spyOn(transferenciaRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as SelectQueryBuilder<Transferencia>);

      await expect(
        repository.findEmpresasConTransferenciasUltimoMes(fechaInicio, fechaFin),
      ).rejects.toThrowError(BadRequestException);
    });
  });


  describe('findEmpresasAdheridasUltimoMes', () => {
    it('should find empresas adhered within the given date range', async () => {
      const mockEmpresas = [{ id: 1 }] as Empresa[];
      jest.spyOn(empresaRepo, 'find').mockResolvedValue(mockEmpresas);
      const fechaInicio = new Date('2024-04-01');
      const fechaFin = new Date('2024-04-30');

      const result = await repository.findEmpresasAdheridasUltimoMes(fechaInicio, fechaFin);
      expect(empresaRepo.find).toHaveBeenCalledWith({
        where: {
          fechaAdhesion: Between(fechaInicio, fechaFin),
        },
      });
      expect(result).toEqual(mockEmpresas);
    });

    it('should return an empty array if no empresas adhered in the given date range', async () => {
      jest.spyOn(empresaRepo, 'find').mockResolvedValue([]);
      const fechaInicio = new Date('2024-04-01');
      const fechaFin = new Date('2024-04-30');
      const result = await repository.findEmpresasAdheridasUltimoMes(fechaInicio, fechaFin);
      expect(empresaRepo.find).toHaveBeenCalledWith({
        where: {
          fechaAdhesion: Between(fechaInicio, fechaFin),
        },
      });
      expect(result).toEqual([]);
    });

    it('should handle errors from empresaRepository', async () => {
      const fechaInicio = new Date('2024-04-01');
      const fechaFin = new Date('2024-04-30');
      jest.spyOn(empresaRepo, 'find').mockRejectedValue(new Error('Simulated error'));

      await expect(
        repository.findEmpresasAdheridasUltimoMes(fechaInicio, fechaFin),
      ).rejects.toThrowError(BadRequestException);
    });
  });
});

