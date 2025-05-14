import { ObtenerEmpresaUseCase } from './obtener-empresa.use-case';
import { Empresa } from '../../entities/empresa.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmpresaService } from 'src/transferencia/application/services/empresa/empresa.service';

const mockEmpresaRepository = () => ({
  findById: jest.fn(),
});

describe('ObtenerEmpresaUseCase', () => {
  let obtenerEmpresaUseCase: ObtenerEmpresaUseCase;
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
          provide: 'ObtenerEmpresaUseCase',
          useExisting: EmpresaService,
        },
      ],
    }).compile();

    obtenerEmpresaUseCase = module.get<ObtenerEmpresaUseCase>('ObtenerEmpresaUseCase');
    empresaRepository = module.get('EmpresaRepositoryPort');
  });

  it('should return an empresa when a valid idEmpresa is provided', async () => {
    const empresaId = 1;
    const expectedEmpresa: Empresa = { 
        id: empresaId, 
        cuit: '30-12345678-9', 
        razonSocial: 'Empresa 1',
        fechaAdhesion:new Date()
    };
    empresaRepository.findById.mockResolvedValue(expectedEmpresa);

    const result = await obtenerEmpresaUseCase.obtenerEmpresa(empresaId);

    expect(empresaRepository.findById).toHaveBeenCalledWith(empresaId);
    expect(result).toEqual(expectedEmpresa);
  });

  it('should return undefined when the empresa does not exist', async () => {
    const empresaId = 999; 
    empresaRepository.findById.mockResolvedValue(undefined);

    const result = await obtenerEmpresaUseCase.obtenerEmpresa(empresaId);

    expect(empresaRepository.findById).toHaveBeenCalledWith(empresaId);
    expect(result).toBeUndefined();
  });

  it('should throw NotFoundException when the empresa does not exist and the service throws', async () => {
      const empresaId = 999;
      empresaRepository.findById.mockRejectedValue(new NotFoundException(`Empresa with id ${empresaId} not found`));

      await expect(obtenerEmpresaUseCase.obtenerEmpresa(empresaId)).rejects.toThrow(NotFoundException);
  });
});
