import { ObtenerEmpresaConTransferenciaUseCase } from './obtener-empresa-con-transferencia.use-case';
import { Empresa } from '../../entities/empresa.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from 'src/transferencia/application/services/empresa/empresa.service';

const mockEmpresaRepository = () => ({
    findEmpresasConTransferenciasUltimoMes: jest.fn(),
});

describe('ObtenerEmpresaConTransferenciaUseCase', () => {
    let obtenerEmpresaConTransferenciaUseCase: ObtenerEmpresaConTransferenciaUseCase;
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
                    provide: 'ObtenerEmpresaConTransferenciaUseCase',
                    useExisting: EmpresaService,
                },
            ],
        }).compile();

        obtenerEmpresaConTransferenciaUseCase = module.get<ObtenerEmpresaConTransferenciaUseCase>('ObtenerEmpresaConTransferenciaUseCase');
        empresaRepository = module.get('EmpresaRepositoryPort');
    });

    it('should return a list of empresas with transferencias in the given date range', async () => {
        const fechaInicio = new Date('2024-01-01');
        const fechaFin = new Date('2024-01-31');
        const expectedResult: Empresa[] = [
            { id: 1, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion: new Date() },
            { id: 2, cuit: '30-98765432-1', razonSocial: 'Empresa 2', fechaAdhesion: new Date() },
        ];
        empresaRepository.findEmpresasConTransferenciasUltimoMes.mockResolvedValue(expectedResult);

        const result = await obtenerEmpresaConTransferenciaUseCase.obtenerEmpresaConTransferenciaUltimoMes(fechaInicio, fechaFin);

        expect(empresaRepository.findEmpresasConTransferenciasUltimoMes).toHaveBeenCalledWith(fechaInicio, fechaFin);
        expect(result).toEqual(expectedResult);
    });

    it('should return an empty array if no empresas have transferencias in the given date range', async () => {
        const fechaInicio = new Date('2024-01-01');
        const fechaFin = new Date('2024-01-31');
        const expectedResult: Empresa[] = [];
        empresaRepository.findEmpresasConTransferenciasUltimoMes.mockResolvedValue(expectedResult);

        const result = await obtenerEmpresaConTransferenciaUseCase.obtenerEmpresaConTransferenciaUltimoMes(fechaInicio, fechaFin);

        expect(empresaRepository.findEmpresasConTransferenciasUltimoMes).toHaveBeenCalledWith(fechaInicio, fechaFin);
        expect(result).toEqual(expectedResult);
    });
});
