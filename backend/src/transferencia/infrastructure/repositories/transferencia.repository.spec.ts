import { Test, TestingModule } from '@nestjs/testing';
import { TransferenciaRepository } from './transferencia.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transferencia } from '../../domain/entities/transferencia.entity';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Empresa } from 'src/transferencia/domain/entities/empresa.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

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

    it('should throw InternalServerErrorException if transferenciaRepository.save throws an error', async () => {
      const mockTransferencia = {} as Transferencia;
      const error = new Error('Simulated error');
      transferenciaRepo.save.mockRejectedValue(error);
      await expect(repository.create(mockTransferencia)).rejects.toThrowError(
        InternalServerErrorException,
      );
      await expect(repository.create(mockTransferencia)).rejects.toHaveProperty(
        'message',
        'Failed to create transferencia',
      );
    });
  });

  describe('findById', () => {
    it('should call transferenciaRepository.findOne with the correct id and relations', async () => {
      const id = 1;
      const mockTransferencia = { id } as Transferencia;
      transferenciaRepo.findOne.mockResolvedValue(mockTransferencia);
      const result = await repository.findById(id);
      expect(transferenciaRepo.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['empresa'],
      });
      expect(result).toEqual(mockTransferencia);
    });

    it('should return undefined if transferenciaRepository.findOne returns null', async () => {
      const id = 1;
      transferenciaRepo.findOne.mockResolvedValue(null);
      const result = await repository.findById(id);
      expect(result).toBeUndefined();
    });

    it('should throw InternalServerErrorException if transferenciaRepository.findOne throws an error', async () => {
      const id = 1;
      const error = new Error('Simulated error');
      transferenciaRepo.findOne.mockRejectedValue(error);
      await expect(repository.findById(id)).rejects.toThrowError(
        InternalServerErrorException,
      );
      await expect(repository.findById(id)).rejects.toHaveProperty(
        'message',
        'Failed to find transferencia by id',
      );
    });
  });

  describe('findAllByEmpresaId', () => {
    it('should call transferenciaRepository.find with the correct idEmpresa', async () => {
      const idEmpresa = 1;
      const mockTransferencias = [{ id: 1, idEmpresa }] as Transferencia[];
      transferenciaRepo.find.mockResolvedValue(mockTransferencias);
      const result = await repository.findAllByEmpresaId(idEmpresa);
      expect(transferenciaRepo.find).toHaveBeenCalledWith({
        where: { idEmpresa },
      });
      expect(result).toEqual(mockTransferencias);
    });

    it('should throw InternalServerErrorException if transferenciaRepository.find throws an error', async () => {
      const idEmpresa = 1;
      const error = new Error('Simulated error');
      transferenciaRepo.find.mockRejectedValue(error);
      await expect(repository.findAllByEmpresaId(idEmpresa)).rejects.toThrowError(
        InternalServerErrorException,
      );
      await expect(repository.findAllByEmpresaId(idEmpresa)).rejects.toHaveProperty(
        'message',
        'Failed to find transferencias by empresa id',
      );
    });
  });

  describe('update', () => {
    it('should call transferenciaRepository.update and findOne with the correct id and transferencia data', async () => {
      const id = 1;
      const mockTransferencia = { importe: 100 } as Transferencia;
      const mockUpdatedTransferencia = { ...mockTransferencia, id } as Transferencia;
      const updateResult: UpdateResult = { affected: 1, raw: {}, generatedMaps: [] };
      transferenciaRepo.update.mockResolvedValue(updateResult);
      transferenciaRepo.findOne.mockResolvedValue(mockUpdatedTransferencia);

      const result = await repository.update(id, mockTransferencia);
      expect(transferenciaRepo.update).toHaveBeenCalledWith(id, mockTransferencia);
      expect(transferenciaRepo.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['empresa'],
      });
      expect(result).toEqual(mockUpdatedTransferencia);
    });

    it('should throw NotFoundException if transferencia not found after update', async () => {
      const id = 1;
      const mockTransferencia = { importe: 100 } as Transferencia;
      const updateResult: UpdateResult = { affected: 0, raw: {}, generatedMaps: [] };
      transferenciaRepo.update.mockResolvedValue(updateResult);
      transferenciaRepo.findOne.mockResolvedValue(undefined);

      await expect(repository.update(id, mockTransferencia)).rejects.toThrowError(
        NotFoundException,
      );
      expect(transferenciaRepo.update).toHaveBeenCalledWith(id, mockTransferencia);
    });

    it('should throw InternalServerErrorException if transferenciaRepository.update throws an error', async () => {
      const id = 1;
      const mockTransferencia = { importe: 100 } as Transferencia;
      const error = new Error('Simulated error');
      transferenciaRepo.update.mockRejectedValue(error);

      await expect(repository.update(id, mockTransferencia)).rejects.toThrowError(
        InternalServerErrorException,
      );
      expect(transferenciaRepo.update).toHaveBeenCalledWith(id, mockTransferencia);
    });
  });

  describe('delete', () => {
    it('should call transferenciaRepository.delete with the correct id', async () => {
      const id = 1;
      const deleteResult: DeleteResult = { affected: 1, raw: {} };
      transferenciaRepo.delete.mockResolvedValue(deleteResult);
      await repository.delete(id);
      expect(transferenciaRepo.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if transferencia not found for deletion', async () => {
      const id = 1;
      const deleteResult: DeleteResult = { affected: 0, raw: {} };
      transferenciaRepo.delete.mockResolvedValue(deleteResult);
      await expect(repository.delete(id)).rejects.toThrowError(NotFoundException);
      expect(transferenciaRepo.delete).toHaveBeenCalledWith(id);
    });

    it('should throw InternalServerErrorException if transferenciaRepository.delete throws an error', async () => {
      const id = 1;
      const error = new Error('Simulated error');
      transferenciaRepo.delete.mockRejectedValue(error);
      await expect(repository.delete(id)).rejects.toThrowError(
        InternalServerErrorException,
      );
      expect(transferenciaRepo.delete).toHaveBeenCalledWith(id);
    });
  });
});
