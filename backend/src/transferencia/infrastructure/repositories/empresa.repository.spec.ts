import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaRepository } from './empresa.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Empresa } from '../../domain/entities/empresa.entity';
import { Transferencia } from 'src/transferencia/domain/entities/transferencia.entity';
import { Like, Between, In, Repository } from 'typeorm';
import { PaginationOptions } from 'src/common/utils/paginations.utils';
import { groupBy } from 'rxjs';

const mockEmpresaRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
  find: jest.fn(),
  search: jest.fn(),
  count: jest.fn(),
  findBy: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  }),
});

const mockTransferenciaRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  }),
});

describe('EmpresaRepository', () => {
  let repository: EmpresaRepository;
  let empresaRepo: ReturnType<typeof mockEmpresaRepository>;
  let transferenciaRepo: ReturnType<typeof mockTransferenciaRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaRepository,
        {
          provide: getRepositoryToken(Empresa),
          useFactory: mockEmpresaRepository,
        },
        {
          provide: getRepositoryToken(Transferencia),
          useFactory: mockTransferenciaRepository,
        },
      ],
    }).compile();

    repository = module.get<EmpresaRepository>(EmpresaRepository);
    empresaRepo = module.get(getRepositoryToken(Empresa));
    transferenciaRepo = module.get(getRepositoryToken(Transferencia));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should call empresaRepository.findOne with the correct id', async () => {
      const id = 1;
      const mockEmpresa = { id } as Empresa;
      empresaRepo.findOne.mockResolvedValue(mockEmpresa);
      const result = await repository.findById(id);
      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockEmpresa);
    });
  });

  describe('findByCUIT', () => {
    it('should call empresaRepository.findOne with the correct cuit', async () => {
      const cuit = '30-12345678-9';
      const mockEmpresa = { cuit } as Empresa;
      empresaRepo.findOne.mockResolvedValue(mockEmpresa);
      const result = await repository.findByCUIT(cuit);
      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { cuit } });
      expect(result).toEqual(mockEmpresa);
    });
  });

  describe('create', () => {
    it('should call empresaRepository.save with the provided empresa', async () => {
      const mockEmpresa = {} as Empresa;
      empresaRepo.save.mockResolvedValue(mockEmpresa);
      const result = await repository.create(mockEmpresa);
      expect(empresaRepo.save).toHaveBeenCalledWith(mockEmpresa);
      expect(result).toEqual(mockEmpresa);
    });
  });

  describe('update', () => {
    it('should call empresaRepository.findOne and empresaRepository.update with the correct id and empresa data', async () => {
      const id = 1;
      const mockExistingEmpresa = { id } as Empresa;
      const mockEmpresa = { razonSocial: 'Updated' } as Empresa;
      const mockUpdatedEmpresa = { ...mockExistingEmpresa, ...mockEmpresa } as Empresa;
      empresaRepo.findOne.mockResolvedValue(mockExistingEmpresa);
      empresaRepo.update.mockResolvedValue({ affected: 1 });
      empresaRepo.findOne.mockResolvedValue(mockUpdatedEmpresa);

      const result = await repository.update(id, mockEmpresa);
      expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(empresaRepo.update).toHaveBeenCalledWith(id, mockEmpresa);
      expect(result).toEqual(mockUpdatedEmpresa);
    });

    it('should throw an error if empresa not found during update', async () => {
      const id = 1;
      const mockEmpresa = { razonSocial: 'Updated' } as Empresa;
      empresaRepo.findOne.mockResolvedValue(undefined);
      await expect(repository.update(id, mockEmpresa)).rejects.toThrow(`Empresa with id ${id} not found`);
    });

    it('should throw an error if failed to retrieve updated empresa', async () => {
      const id = 1;
      const mockExistingEmpresa = { id } as Empresa;
      const mockEmpresa = { razonSocial: 'Updated' } as Empresa;
      empresaRepo.findOne.mockResolvedValueOnce(mockExistingEmpresa);
      empresaRepo.update.mockResolvedValue({ affected: 1 });
      empresaRepo.findOne.mockResolvedValueOnce(undefined);

      await expect(repository.update(id, mockEmpresa)).rejects.toThrow(`Failed to retrieve updated Empresa with id ${id}`);
    });
  });

  describe('delete', () => {
    it('should call empresaRepository.delete with the correct id', async () => {
      const id = 1;
      empresaRepo.delete.mockResolvedValue({ affected: 1 });
      await repository.delete(id);
      expect(empresaRepo.delete).toHaveBeenCalledWith(id);
    });
  });

  describe('findAll', () => {
    it('should call empresaRepository.findAndCount with the correct pagination and search parameters', async () => {
      const options: PaginationOptions = { page: 2, limit: 15, q: 'test' };
      const mockEmpresas: Empresa[] = [];
      const mockTotal = 0;
      empresaRepo.findAndCount.mockResolvedValue([mockEmpresas, mockTotal]);

      const result = await repository.findAll(options);
      expect(empresaRepo.findAndCount).toHaveBeenCalledWith({
        skip: 15,
        take: 15,
        where: {
          cuit: Like('%test%'),
          razonSocial: Like('%test%'),
        },
      });
      expect(result).toEqual({
        data: mockEmpresas,
        total: mockTotal,
        page: 2,
        limit: 15,
        totalPages: 0,
      });
    });

    it('should use default pagination if options are not provided', async () => {
      const mockEmpresas: Empresa[] = [];
      const mockTotal = 0;
      empresaRepo.findAndCount.mockResolvedValue([mockEmpresas, mockTotal]);

      await repository.findAll({});
      expect(empresaRepo.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
      });
    });
  });

  describe('findEmpresasConTransferenciasUltimoMes', () => {
    it('should use createQueryBuilder to find empresas with transfers in the last month and map transfer data', async () => {
      const mockRawResults = [
        { empresaId: 1, importe: 1000, ultimaTransferencia: new Date('2024-04-01') },
        { empresaId: 2, importe: 2000, ultimaTransferencia: new Date('2024-04-02') }
      ];
  
      const mockEmpresas = [
        { id: 1, razonSocial: 'Empresa 1', cuit: '123', fechaAdhesion: new Date('2023-01-01') },
        { id: 2, razonSocial: 'Empresa 2', cuit: '456', fechaAdhesion: new Date('2023-02-01') }
      ] as Empresa[];
  
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockRawResults),
      };
      transferenciaRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      empresaRepo.findBy.mockResolvedValue(mockEmpresas);
  
      const result = await repository.findEmpresasConTransferenciasUltimoMes();
  
      expect(transferenciaRepo.createQueryBuilder).toHaveBeenCalledWith('transferencias');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'transferencias.idEmpresa AS empresaId',
        'SUM(transferencias.importe) AS importe',
        'MAX(transferencias.fechaTransferencia) AS ultimaTransferencia'
      ]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'transferencias.fechaTransferencia BETWEEN :ultimoMesInicio AND :ultimoMesFin',
        expect.any(Object)
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('transferencias.idEmpresa');
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
      expect(empresaRepo.findBy).toHaveBeenCalledWith({ id: In([1, 2]) });
  
      // Acá ahora esperás empresa + importe + ultimaTransferencia
      expect(result).toEqual([
        {
          ...mockEmpresas[0],
          importe: 1000,
          ultimaTransferencia: new Date('2024-04-01')
        },
        {
          ...mockEmpresas[1],
          importe: 2000,
          ultimaTransferencia: new Date('2024-04-02')
        }
      ]);
    });
  
    it('should return an empty array if no transfers in the last month', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      transferenciaRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  
      const result = await repository.findEmpresasConTransferenciasUltimoMes();
      expect(result).toEqual([]);
    });
  });
  

  describe('findEmpresasAdheridasUltimoMes', () => {
    it('should find empresas adhered within the last month', async () => {
      empresaRepo.count.mockResolvedValue(1); // Mock count to avoid empty array early return
      const mockEmpresas = [{ id: 1 }] as Empresa[];
      empresaRepo.find.mockResolvedValue(mockEmpresas);

      const result = await repository.findEmpresasAdheridasUltimoMes();
      expect(empresaRepo.find).toHaveBeenCalledWith({
        where: {
          fechaAdhesion: Between(expect.any(Date), expect.any(Date)),
        },
      });
      expect(result).toEqual(mockEmpresas);
    });

    it('should return an empty array if no empresas exist', async () => {
      empresaRepo.count.mockResolvedValue(0);
      const result = await repository.findEmpresasAdheridasUltimoMes();
      expect(empresaRepo.find).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
 
});