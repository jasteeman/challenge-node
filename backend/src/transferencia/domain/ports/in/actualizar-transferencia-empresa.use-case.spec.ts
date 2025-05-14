import { UpdateTransferenciaDto } from 'src/transferencia/application/dto/update-transferencia.dto';
import { Transferencia } from '../../entities/transferencia.entity';
import { ActualizarTransferenciaEmpresaUseCase } from './actualizar-transferencia-empresa.use-case';
import { Test, TestingModule } from '@nestjs/testing';
import { TransferenciaService } from 'src/transferencia/application/services/transferencia/transferencia.service';

const mockTransferenciaRepository = () => ({
    findById: jest.fn(),
    update: jest.fn(),
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

describe('ActualizarTransferenciaEmpresaUseCase', () => {
    let actualizarTransferenciaEmpresaUseCase: ActualizarTransferenciaEmpresaUseCase;
    let transferenciaRepository: ReturnType<typeof mockTransferenciaRepository>;

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
                    provide: 'ActualizarTransferenciaEmpresaUseCase',
                    useExisting: TransferenciaService,
                },
            ],
        }).compile();

        actualizarTransferenciaEmpresaUseCase = module.get<ActualizarTransferenciaEmpresaUseCase>('ActualizarTransferenciaEmpresaUseCase');
        transferenciaRepository = module.get('TransferenciaRepositoryPort');
    });

    it('should update an existing transferencia successfully', async () => {
        const transferenciaId = 1;
        const existingTransferencia: Transferencia = {
            id: transferenciaId,
            fechaTransferencia: new Date('2024-01-15'),
            importe: 100,
            idEmpresa: 10,
            cuentaCredito: '',
            cuentaDebito: '',
            empresa: { id: 1, cuit: '', fechaAdhesion: new Date(), razonSocial: "" }
        };
        const updateTransferenciaDto: UpdateTransferenciaDto = { 
            importe: 200, 
            idEmpresa: 10, 
            cuentaDebito: '123456', 
            cuentaCredito: '654321' 
        };
        const updatedTransferencia: Transferencia = { ...existingTransferencia, ...updateTransferenciaDto };

        transferenciaRepository.findById.mockResolvedValue(existingTransferencia);
        transferenciaRepository.update.mockResolvedValue(updatedTransferencia);

        const result = await actualizarTransferenciaEmpresaUseCase.actualizarTransferenciaEmpresa(transferenciaId, updateTransferenciaDto);

        expect(transferenciaRepository.findById).toHaveBeenCalledWith(transferenciaId);
        expect(transferenciaRepository.update).toHaveBeenCalledWith(transferenciaId, { ...existingTransferencia, ...updateTransferenciaDto });
        expect(result).toEqual(updatedTransferencia);
    });

    it('should return undefined if transferencia does not exist', async () => {
        const transferenciaId = 1;
        const updateTransferenciaDto: UpdateTransferenciaDto = { 
            importe: 200, 
            idEmpresa: 10, 
            cuentaDebito: '123456', 
            cuentaCredito: '654321' 
        };
        transferenciaRepository.findById.mockResolvedValue(undefined);

        const result = await actualizarTransferenciaEmpresaUseCase.actualizarTransferenciaEmpresa(transferenciaId, updateTransferenciaDto);

        expect(transferenciaRepository.findById).toHaveBeenCalledWith(transferenciaId);
        expect(result).toBeUndefined();
    });
});
