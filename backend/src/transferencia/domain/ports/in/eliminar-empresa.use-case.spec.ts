import { EmpresaService } from 'src/transferencia/application/services/empresa/empresa.service';
import { Empresa } from '../../entities/empresa.entity';
import { EliminarEmpresaUseCase } from './eliminar-empresa.use-case';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

// Mock del repositorio (adaptador de salida)
const mockEmpresaRepository = () => ({
  findById: jest.fn(),
  delete: jest.fn(),
});

describe('EliminarEmpresaUseCase', () => {
  let eliminarEmpresaUseCase: EliminarEmpresaUseCase;
  let empresaRepository: ReturnType<typeof mockEmpresaRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'EmpresaRepositoryPort',
          useFactory: mockEmpresaRepository,
        },
        EmpresaService,
        {
          provide: 'EliminarEmpresaUseCase',
          useExisting: EmpresaService,
        },
      ],
    }).compile();

    eliminarEmpresaUseCase = module.get<EliminarEmpresaUseCase>('EliminarEmpresaUseCase');
    empresaRepository = module.get('EmpresaRepositoryPort');
  });

  it('should delete an existing empresa successfully', async () => {
    const empresaId = 1;
    const existingEmpresa = { id: empresaId, cuit: '30-11111111-1', razonSocial: 'Empresa Antigua' } as Empresa;
 
    empresaRepository.findById.mockResolvedValue(existingEmpresa);
    empresaRepository.delete.mockResolvedValue(undefined);

    await eliminarEmpresaUseCase.eliminarEmpresa(empresaId);
    expect(empresaRepository.findById).toHaveBeenCalledWith(empresaId);
    expect(empresaRepository.delete).toHaveBeenCalledWith(empresaId);
  });

  it('should throw NotFoundException if empresa does not exist', async () => {
    const empresaId = 1;
    empresaRepository.findById.mockResolvedValue(undefined);

    await expect(eliminarEmpresaUseCase.eliminarEmpresa(empresaId)).rejects.toThrow(NotFoundException);
    expect(empresaRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if id is invalid', async () => {
    await expect(eliminarEmpresaUseCase.eliminarEmpresa(0)).rejects.toThrow(BadRequestException);
    await expect(eliminarEmpresaUseCase.eliminarEmpresa(-1)).rejects.toThrow(BadRequestException);
    await expect(eliminarEmpresaUseCase.eliminarEmpresa(NaN)).rejects.toThrow(BadRequestException);
    expect(empresaRepository.findById).not.toHaveBeenCalled();
    expect(empresaRepository.delete).not.toHaveBeenCalled();
  });
});
