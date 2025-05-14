import { Test, TestingModule } from '@nestjs/testing';
import { TransferenciaService } from './transferencia.service'; 
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateTransferenciaDto } from '../../dto/update-transferencia.dto';
import { Empresa } from 'src/transferencia/domain/entities/empresa.entity';
import { CreateTransferenciaDto } from '../../dto/create-transferencia.dto';
import { Transferencia } from 'src/transferencia/domain/entities/transferencia.entity';

const mockTransferenciaRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findAllByEmpresaId: jest.fn(),
});

const mockEmpresaRepository = () => ({
  findById: jest.fn(),
});

describe('TransferenciaService', () => {
  let service: TransferenciaService;
  let transferenciaRepository: ReturnType<typeof mockTransferenciaRepository>;
  let empresaRepository: ReturnType<typeof mockEmpresaRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferenciaService,
        {
          provide: 'TransferenciaRepositoryPort',
          useFactory: mockTransferenciaRepository,
        },
        {
          provide: 'EmpresaRepositoryPort',
          useFactory: mockEmpresaRepository,
        },
      ],
    }).compile();

    service = module.get<TransferenciaService>(TransferenciaService);
    transferenciaRepository = module.get('TransferenciaRepositoryPort');
    empresaRepository = module.get('EmpresaRepositoryPort');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registrarTransferenciaEmpresa', () => {
    const createTransferenciaDto: CreateTransferenciaDto = {
      idEmpresa: 1,
      importe: 100,
      cuentaDebito: '123',
      cuentaCredito: '456',
    };
    const mockEmpresa = { id: 1 } as Empresa;
    const nuevaTransferencia = { ...createTransferenciaDto, id: 1, empresa: mockEmpresa } as Transferencia;

    it('should register a new transferencia for an existing empresa', async () => {
      empresaRepository.findById.mockResolvedValue(mockEmpresa);
      transferenciaRepository.create.mockResolvedValue(nuevaTransferencia);

      const result = await service.registrarTransferenciaEmpresa(createTransferenciaDto);
      expect(empresaRepository.findById).toHaveBeenCalledWith(createTransferenciaDto.idEmpresa);
      expect(transferenciaRepository.create).toHaveBeenCalledWith(expect.any(Transferencia));
      expect(result).toEqual(nuevaTransferencia);
    });

    it('should throw BadRequestException if empresa does not exist', async () => {
      empresaRepository.findById.mockResolvedValue(undefined);
      await expect(service.registrarTransferenciaEmpresa(createTransferenciaDto)).rejects.toThrow(BadRequestException);
      expect(transferenciaRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('actualizarTransferenciaEmpresa', () => {
    const transferenciaId = 1;
    const existingTransferencia = { id: transferenciaId, importe: 50 } as Transferencia;
    const updateTransferenciaDto: UpdateTransferenciaDto = { 
      importe: 75, 
      idEmpresa: 1, 
      cuentaDebito: '123', 
      cuentaCredito: '456' 
    };
    const updatedTransferencia = { ...existingTransferencia, ...updateTransferenciaDto } as Transferencia;

    it('should update an existing transferencia', async () => {
      transferenciaRepository.findById.mockResolvedValue(existingTransferencia);
      transferenciaRepository.update.mockResolvedValue(updatedTransferencia);

      const result = await service.actualizarTransferenciaEmpresa(transferenciaId, updateTransferenciaDto);
      expect(transferenciaRepository.findById).toHaveBeenCalledWith(transferenciaId);
      expect(transferenciaRepository.update).toHaveBeenCalledWith(transferenciaId, { ...existingTransferencia, ...updateTransferenciaDto });
      expect(result).toEqual(updatedTransferencia);
    });

    it('should return undefined if transferencia does not exist', async () => {
      transferenciaRepository.findById.mockResolvedValue(undefined);
      const result = await service.actualizarTransferenciaEmpresa(transferenciaId, updateTransferenciaDto);
      expect(result).toBeUndefined();
    });
  });

  describe('eliminarTransferenciaEmpresa', () => {
    const transferenciaId = 1;
    const existingTransferencia = { id: transferenciaId } as Transferencia;

    it('should delete an existing transferencia', async () => {
      transferenciaRepository.findById.mockResolvedValue(existingTransferencia);
      transferenciaRepository.delete.mockResolvedValue(undefined);

      await service.eliminarTransferenciaEmpresa(transferenciaId);
      expect(transferenciaRepository.findById).toHaveBeenCalledWith(transferenciaId);
      expect(transferenciaRepository.delete).toHaveBeenCalledWith(transferenciaId);
    });

    it('should throw NotFoundException if transferencia does not exist', async () => {
      transferenciaRepository.findById.mockResolvedValue(undefined);
      await expect(service.eliminarTransferenciaEmpresa(transferenciaId)).rejects.toThrow(NotFoundException);
      expect(transferenciaRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('obtenerTransferenciasPorEmpresa', () => {
    const empresaId = 1;
    const mockEmpresa = { id: empresaId } as Empresa;
    const mockTransferencias = [{ id: 1, importe: 100, empresa: mockEmpresa }] as Transferencia[];

    it('should return all transferencias for a given empresa', async () => {
      empresaRepository.findById.mockResolvedValue(mockEmpresa);
      transferenciaRepository.findAllByEmpresaId.mockResolvedValue(mockTransferencias);

      const result = await service.obtenerTransferenciasPorEmpresa(empresaId);
      expect(empresaRepository.findById).toHaveBeenCalledWith(empresaId);
      expect(transferenciaRepository.findAllByEmpresaId).toHaveBeenCalledWith(empresaId);
      expect(result).toEqual(mockTransferencias);
    });

    it('should throw BadRequestException if empresa does not exist', async () => {
      empresaRepository.findById.mockResolvedValue(undefined);
      await expect(service.obtenerTransferenciasPorEmpresa(empresaId)).rejects.toThrow(BadRequestException);
      expect(transferenciaRepository.findAllByEmpresaId).not.toHaveBeenCalled();
    });
  });
});