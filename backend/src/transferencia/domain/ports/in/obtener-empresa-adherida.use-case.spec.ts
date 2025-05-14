import { ObtenerEmpresaAdheridaUseCase } from './obtener-empresa-adherida.use-case';
import { Empresa } from '../../entities/empresa.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from 'src/transferencia/application/services/empresa/empresa.service';

const mockEmpresaRepository = () => ({
  findEmpresasAdheridasUltimoMes: jest.fn(),
});

describe('ObtenerEmpresaAdheridaUseCase', () => {
  let obtenerEmpresaAdheridaUseCase: ObtenerEmpresaAdheridaUseCase;
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
          provide: 'ObtenerEmpresaAdheridaUseCase',
          useExisting: EmpresaService,
        },
      ],
    }).compile();

    obtenerEmpresaAdheridaUseCase = module.get<ObtenerEmpresaAdheridaUseCase>('ObtenerEmpresaAdheridaUseCase');
    empresaRepository = module.get('EmpresaRepositoryPort');
  });

  it('should return a list of empresas adheridas in the given date range', async () => {
    const fechaInicio = new Date('2024-01-01');
    const fechaFin = new Date('2024-01-31');
    const expectedResult: Empresa[] = [
      { id: 1, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion: new Date('2024-01-10') },
      { id: 2, cuit: '30-98765432-1', razonSocial: 'Empresa 2', fechaAdhesion: new Date('2024-01-20') },
    ];
    empresaRepository.findEmpresasAdheridasUltimoMes.mockResolvedValue(expectedResult);

    const result = await obtenerEmpresaAdheridaUseCase.obtenerEmpresasAdheridasUltimoMes(fechaInicio, fechaFin);

    expect(empresaRepository.findEmpresasAdheridasUltimoMes).toHaveBeenCalledWith(fechaInicio, fechaFin);
    expect(result).toEqual(expectedResult);
  });

  it('should return an empty array if no empresas were adhered in the given date range', async () => {
    const fechaInicio = new Date('2024-01-01');
    const fechaFin = new Date('2024-01-31');
    const expectedResult: Empresa[] = [];
    empresaRepository.findEmpresasAdheridasUltimoMes.mockResolvedValue(expectedResult);

    const result = await obtenerEmpresaAdheridaUseCase.obtenerEmpresasAdheridasUltimoMes(fechaInicio, fechaFin);

    expect(empresaRepository.findEmpresasAdheridasUltimoMes).toHaveBeenCalledWith(fechaInicio, fechaFin);
    expect(result).toEqual(expectedResult);
  });
});
