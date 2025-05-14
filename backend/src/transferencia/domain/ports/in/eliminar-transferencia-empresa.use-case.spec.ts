import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EliminarTransferenciaEmpresaUseCase } from './eliminar-tranferencia-empresa.use-case';
import { TransferenciaService } from 'src/transferencia/application/services/transferencia/transferencia.service';

const mockTransferenciaRepository = () => ({
    findById: jest.fn(),
    delete: jest.fn(),
});

const mockEmpresaRepository = () => ({
    findById: jest.fn(),
    findByCUIT: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findEmpresasConTransferenciasUltimoMes: jest.fn(),
    findEmpresasAdheridasUltimoMes: jest.fn()
});

describe('EliminarTransferenciaEmpresaUseCase', () => {
    let eliminarTransferenciaEmpresaUseCase: EliminarTransferenciaEmpresaUseCase;
    let transferenciaRepository: ReturnType<typeof mockTransferenciaRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: 'TransferenciaRepositoryPort',
                    useFactory: mockTransferenciaRepository,
                },
                TransferenciaService,
                {
                    provide: 'EliminarTransferenciaEmpresaUseCase',
                    useExisting: TransferenciaService,
                },
                {
                    provide: 'EmpresaRepositoryPort',
                    useFactory: mockEmpresaRepository,
                },
            ],
        }).compile();

        eliminarTransferenciaEmpresaUseCase = module.get<EliminarTransferenciaEmpresaUseCase>('EliminarTransferenciaEmpresaUseCase');
        transferenciaRepository = module.get('TransferenciaRepositoryPort');
    });

    it('should delete an existing transferencia successfully', async () => {
        const transferenciaId = 1;
        transferenciaRepository.findById.mockResolvedValue({ id: transferenciaId });
        transferenciaRepository.delete.mockResolvedValue(undefined);

        await eliminarTransferenciaEmpresaUseCase.eliminarTransferenciaEmpresa(transferenciaId);

        expect(transferenciaRepository.findById).toHaveBeenCalledWith(transferenciaId);
        expect(transferenciaRepository.delete).toHaveBeenCalledWith(transferenciaId);
    });

    it('should throw NotFoundException if transferencia does not exist', async () => {
        const transferenciaId = 1;
        transferenciaRepository.findById.mockResolvedValue(undefined);

        await expect(eliminarTransferenciaEmpresaUseCase.eliminarTransferenciaEmpresa(transferenciaId)).rejects.toThrow(NotFoundException);
        expect(transferenciaRepository.delete).not.toHaveBeenCalled();
    });
});
