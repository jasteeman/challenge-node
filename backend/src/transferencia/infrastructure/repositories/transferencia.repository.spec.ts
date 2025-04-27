import { Test, TestingModule } from '@nestjs/testing';
import { TransferenciaRepository } from './transferencia.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transferencia } from '../../domain/entities/transferencia.entity';
import { Repository } from 'typeorm';
import { Empresa } from 'src/transferencia/domain/entities/empresa.entity';

const mockTransferenciaRepository = () => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('TransferenciaRepository', () => {
  let repository: TransferenciaRepository;
  let transferenciaRepo: ReturnType<typeof mockTransferenciaRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferenciaRepository,
        {
          provide: getRepositoryToken(Transferencia),
          useFactory: mockTransferenciaRepository,
        },
      ],
    }).compile();

    repository = module.get<TransferenciaRepository>(TransferenciaRepository);
    transferenciaRepo = module.get(getRepositoryToken(Transferencia));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should call transferenciaRepository.save with the provided transferencia', async () => {
      const mockTransferencia = {} as Transferencia;
      transferenciaRepo.save.mockResolvedValue(mockTransferencia);
      const result = await repository.create(mockTransferencia);
      expect(transferenciaRepo.save).toHaveBeenCalledWith(mockTransferencia);
      expect(result).toEqual(mockTransferencia);
    });
  });

  describe('findById', () => {
    it('should call transferenciaRepository.findOne with the correct id and relations', async () => {
      const id = 1;
      const mockTransferencia = { id } as Transferencia;
      transferenciaRepo.findOne.mockResolvedValue(mockTransferencia);
      const result = await repository.findById(id);
      expect(transferenciaRepo.findOne).toHaveBeenCalledWith({ where: { id }, relations: ['empresa'] });
      expect(result).toEqual(mockTransferencia);
    });
  });

  describe('findAllByEmpresaId', () => {
    it('should call transferenciaRepository.find with the correct idEmpresa', async () => {
      const idEmpresa = 1;
      const mockTransferencias = [{ id: 1, idEmpresa }] as Transferencia[];
      transferenciaRepo.find.mockResolvedValue(mockTransferencias);
      const result = await repository.findAllByEmpresaId(idEmpresa);
      expect(transferenciaRepo.find).toHaveBeenCalledWith({ where: { idEmpresa } });
      expect(result).toEqual(mockTransferencias);
    });
  });

  describe('update', () => {
    it('should call transferenciaRepository.update and findOne with the correct id and transferencia data', async () => {
      const id = 1;
      const mockTransferencia = { importe: 100 } as Transferencia;
      const mockUpdatedTransferencia = { ...mockTransferencia } as Transferencia;
      transferenciaRepo.update.mockResolvedValue({ affected: 1 });
      transferenciaRepo.findOne.mockResolvedValue(mockUpdatedTransferencia);

      const result = await repository.update(id, mockTransferencia);
      expect(transferenciaRepo.update).toHaveBeenCalledWith(id, mockTransferencia);
      expect(transferenciaRepo.findOne).toHaveBeenCalledWith({ where: { id }, relations: ['empresa'] });
      expect(result).toEqual(mockUpdatedTransferencia);
    });

    it('should throw an error if transferencia not found after update', async () => {
      const id = 1;
      const mockTransferencia = { importe: 100 } as Transferencia;
      transferenciaRepo.update.mockResolvedValue({ affected: 1 });
      transferenciaRepo.findOne.mockResolvedValue(undefined);

      await expect(repository.update(id, mockTransferencia)).rejects.toThrow('Transferencia not found');
    });
  });

  describe('delete', () => {
    it('should call transferenciaRepository.delete with the correct id', async () => {
      const id = 1;
      transferenciaRepo.delete.mockResolvedValue({ affected: 1 });
      await repository.delete(id);
      expect(transferenciaRepo.delete).toHaveBeenCalledWith(id);
    });
  });
});