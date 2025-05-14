import { RegistrarTransferenciaEmpresaUseCase } from './registrar-transferencia-empresa.use-case';
import { Transferencia } from '../../entities/transferencia.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateTransferenciaDto } from 'src/transferencia/application/dto/create-transferencia.dto';
import { Empresa } from '../../entities/empresa.entity';
import { TransferenciaService } from 'src/transferencia/application/services/transferencia/transferencia.service';

const mockTransferenciaRepository = () => ({
    create: jest.fn(),
});

const mockEmpresaRepository = () => ({
    findById: jest.fn(),
});

describe('RegistrarTransferenciaEmpresaUseCase', () => {
    let registrarTransferenciaEmpresaUseCase: RegistrarTransferenciaEmpresaUseCase;
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
                    provide: 'RegistrarTransferenciaEmpresaUseCase',
                    useExisting: TransferenciaService,
                },
            ],
        }).compile();

        registrarTransferenciaEmpresaUseCase = module.get<RegistrarTransferenciaEmpresaUseCase>('RegistrarTransferenciaEmpresaUseCase');
        transferenciaRepository = module.get('TransferenciaRepositoryPort');
        empresaRepository = module.get('EmpresaRepositoryPort');
    });

    it('should register a new transferencia successfully with valid data', async () => {
        const createTransferenciaDto: CreateTransferenciaDto = {
            idEmpresa: 1,
            importe: 100,
            cuentaDebito: '12345',
            cuentaCredito: '67890',
        };
        const empresa: Empresa = {
            id: 1,
            cuit: '30-12345678-9',
            razonSocial: 'Empresa de Prueba',
            fechaAdhesion: new Date()

        };
        const savedTransferencia: Transferencia = {
            id: 1,
            fechaTransferencia: new Date(),
            importe: createTransferenciaDto.importe,
            cuentaDebito: createTransferenciaDto.cuentaDebito,
            cuentaCredito: createTransferenciaDto.cuentaCredito,
            idEmpresa: createTransferenciaDto.idEmpresa,
            empresa: { id: createTransferenciaDto.idEmpresa } as Empresa,
        };

        empresaRepository.findById.mockResolvedValue(empresa);
        transferenciaRepository.create.mockResolvedValue(savedTransferencia);

        const result = await registrarTransferenciaEmpresaUseCase.registrarTransferenciaEmpresa(createTransferenciaDto);

        expect(empresaRepository.findById).toHaveBeenCalledWith(createTransferenciaDto.idEmpresa);
        expect(transferenciaRepository.create).toHaveBeenCalledWith(expect.any(Transferencia));
        expect(result).toEqual(savedTransferencia);
    });

    it('should throw BadRequestException if empresa does not exist', async () => {
        const createTransferenciaDto: CreateTransferenciaDto = {
            idEmpresa: 999,
            importe: 100,
            cuentaDebito: '12345',
            cuentaCredito: '67890',
        };
        empresaRepository.findById.mockResolvedValue(undefined);

        await expect(registrarTransferenciaEmpresaUseCase.registrarTransferenciaEmpresa(createTransferenciaDto)).rejects.toThrow(BadRequestException);
        expect(transferenciaRepository.create).not.toHaveBeenCalled();
    });

    it('should if importe is invalid', async () => {
        const createTransferenciaDto1: CreateTransferenciaDto = {
            idEmpresa: 1,
            importe: 0,
            cuentaDebito: '12345',
            cuentaCredito: '67890'
        };
        const createTransferenciaDto2: CreateTransferenciaDto = {
            idEmpresa: 1,
            importe: -100,
            cuentaDebito: '12345',
            cuentaCredito: '67890'
        };
        const empresa: Empresa = {
            id: 1,
            cuit: '30-12345678-9',
            razonSocial: 'Empresa de Prueba',
            fechaAdhesion: new Date()

        };
        empresaRepository.findById.mockResolvedValue(empresa);

        expect(registrarTransferenciaEmpresaUseCase.registrarTransferenciaEmpresa(createTransferenciaDto1));
        expect(registrarTransferenciaEmpresaUseCase.registrarTransferenciaEmpresa(createTransferenciaDto2));
    });
});
