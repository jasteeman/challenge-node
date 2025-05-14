import { Transferencia } from '../../entities/transferencia.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ObtenerTransferenciasEmpresaUseCase } from './obtener-transferencia-empresa.use-case';
import { TransferenciaService } from 'src/transferencia/application/services/transferencia/transferencia.service';

const mockTransferenciaRepository = () => ({
    findAllByEmpresaId: jest.fn(),
});

const mockEmpresaRepository = () => ({
    findById: jest.fn(),
});

describe('ObtenerTransferenciasEmpresaUseCase', () => {
    let obtenerTransferenciasEmpresaUseCase: ObtenerTransferenciasEmpresaUseCase;
    let transferenciaRepository: ReturnType<typeof mockTransferenciaRepository>;
    let empresaRepository: ReturnType<typeof mockEmpresaRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: 'TransferenciaRepositoryPort',
                    useFactory: mockTransferenciaRepository,
                },
                {
                    provide: 'EmpresaRepositoryPort',
                    useFactory: mockEmpresaRepository,
                },
                TransferenciaService,
                {
                    provide: 'ObtenerTransferenciasEmpresaUseCase',
                    useExisting: TransferenciaService,
                },
            ],
        }).compile();

        obtenerTransferenciasEmpresaUseCase = module.get<ObtenerTransferenciasEmpresaUseCase>('ObtenerTransferenciasEmpresaUseCase');
        transferenciaRepository = module.get('TransferenciaRepositoryPort');
        empresaRepository = module.get('EmpresaRepositoryPort');
    });

    it('should return a list of transferencias for a given empresa ID', async () => {
        const empresaId = 1;
        const expectedTransferencias: Transferencia[] = [
            {
                id: 1, fechaTransferencia: new Date(), importe: 100, idEmpresa: empresaId, cuentaCredito: '', cuentaDebito: '', empresa: { id: empresaId, cuit: '', fechaAdhesion: new Date(), razonSocial: "" }
            },
            { id: 2, fechaTransferencia: new Date(), importe: 200, idEmpresa: empresaId, cuentaCredito: '', cuentaDebito: '', empresa: { id: empresaId, cuit: '', fechaAdhesion: new Date(), razonSocial: "" } }
        ];

        empresaRepository.findById.mockResolvedValue({ id: empresaId });
        transferenciaRepository.findAllByEmpresaId.mockResolvedValue(expectedTransferencias);

        const result = await obtenerTransferenciasEmpresaUseCase.obtenerTransferenciasPorEmpresa(empresaId);

        expect(empresaRepository.findById).toHaveBeenCalledWith(empresaId);
        expect(transferenciaRepository.findAllByEmpresaId).toHaveBeenCalledWith(empresaId);
        expect(result).toEqual(expectedTransferencias);
    });

    it('should throw BadRequestException if the empresa does not exist', async () => {
        const empresaId = 999;
        empresaRepository.findById.mockResolvedValue(undefined);

        await expect(obtenerTransferenciasEmpresaUseCase.obtenerTransferenciasPorEmpresa(empresaId)).rejects.toThrow(BadRequestException);
        expect(transferenciaRepository.findAllByEmpresaId).not.toHaveBeenCalled();
    });
});
