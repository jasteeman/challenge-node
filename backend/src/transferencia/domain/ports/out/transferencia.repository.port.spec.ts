import { Transferencia } from 'src/transferencia/domain/entities/transferencia.entity';
import { Test, TestingModule } from '@nestjs/testing';

const mockTransferenciaRepository = () => ({
    create: jest.fn(),
    findById: jest.fn(),
    findAllByEmpresaId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
});

describe('TransferenciaRepositoryPort', () => {
    let transferenciaRepository: ReturnType<typeof mockTransferenciaRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: 'TransferenciaRepositoryPort',
                    useFactory: mockTransferenciaRepository,
                },
            ],
        }).compile();

        transferenciaRepository = module.get('TransferenciaRepositoryPort');
    });

    it('should be defined', () => {
        expect(transferenciaRepository).toBeDefined();
    });

    describe('create', () => {
        it('should call create with the Transferencia object', async () => {
            const transferencia: Transferencia = {
                id: 1,
                fechaTransferencia: new Date(),
                importe: 100,
                cuentaDebito: '12345',
                cuentaCredito: '67890',
                idEmpresa: 1,
                empresa: { id: 1, cuit: '', fechaAdhesion: new Date(), razonSocial: "" }
            };
            await transferenciaRepository.create(transferencia);
            expect(transferenciaRepository.create).toHaveBeenCalledWith(transferencia);
        });

        it('should return the created Transferencia', async () => {
            const transferencia: Transferencia = {
                id: 2,
                fechaTransferencia: new Date(),
                importe: 100,
                cuentaDebito: '12345',
                cuentaCredito: '67890',
                idEmpresa: 1,
                empresa: { id: 1, cuit: '', fechaAdhesion: new Date(), razonSocial: "" }

            };
            const { id, ...transferenciaData } = transferencia;
            const createdTransferencia: Transferencia = { id: 2, ...transferenciaData };
            transferenciaRepository.create.mockResolvedValue(createdTransferencia);

            const result = await transferenciaRepository.create(transferencia);
            expect(result).toEqual(createdTransferencia);
        });
    });

    describe('findById', () => {
        it('should call findById with the correct id', async () => {
            const id = 1;
            await transferenciaRepository.findById(id);
            expect(transferenciaRepository.findById).toHaveBeenCalledWith(id);
        });

        it('should return a Transferencia if found', async () => {
            const id = 1;
            const expectedTransferencia: Transferencia = {
                id,
                fechaTransferencia: new Date(),
                importe: 100,
                cuentaDebito: '12345',
                cuentaCredito: '67890',
                idEmpresa: 1,
                empresa: { id: 1, cuit: '', fechaAdhesion: new Date(), razonSocial: "" },
            };
            transferenciaRepository.findById.mockResolvedValue(expectedTransferencia);

            const result = await transferenciaRepository.findById(id);
            expect(result).toEqual(expectedTransferencia);
        });

        it('should return undefined if Transferencia is not found', async () => {
            const id = 1;
            transferenciaRepository.findById.mockResolvedValue(undefined);

            const result = await transferenciaRepository.findById(id);
            expect(result).toBeUndefined();
        });
    });

    describe('findAllByEmpresaId', () => {
        it('should call findAllByEmpresaId with the correct idEmpresa', async () => {
            const idEmpresa = 1;
            await transferenciaRepository.findAllByEmpresaId(idEmpresa);
            expect(transferenciaRepository.findAllByEmpresaId).toHaveBeenCalledWith(idEmpresa);
        });

        it('should return an array of Transferencias', async () => {
            const idEmpresa = 1;
            const expectedTransferencias: Transferencia[] = [
                { id: 1, fechaTransferencia: new Date(), importe: 100, cuentaDebito: '123', cuentaCredito: '456', idEmpresa, empresa: { id: 1, cuit: '', fechaAdhesion: new Date(), razonSocial: '' } },
                { id: 2, fechaTransferencia: new Date(), importe: 200, cuentaDebito: '789', cuentaCredito: '012', idEmpresa, empresa: { id: 1, cuit: '', fechaAdhesion: new Date(), razonSocial: '' } },
            ];
            transferenciaRepository.findAllByEmpresaId.mockResolvedValue(expectedTransferencias);

            const result = await transferenciaRepository.findAllByEmpresaId(idEmpresa);
            expect(result).toEqual(expectedTransferencias);
        });

        it('should return an empty array if no transferencias are found', async () => {
            const idEmpresa = 1;
            transferenciaRepository.findAllByEmpresaId.mockResolvedValue([]);

            const result = await transferenciaRepository.findAllByEmpresaId(idEmpresa);
            expect(result).toEqual([]);
        });
    });

    describe('update', () => {
        it('should call update with the id and Transferencia object', async () => {
            const id = 1;
            const transferencia: Transferencia = {
                id,
                fechaTransferencia: new Date(),
                importe: 100,
                cuentaDebito: '12345',
                cuentaCredito: '67890',
                idEmpresa: 1,
                empresa: { id: 1, cuit: '', fechaAdhesion: new Date(), razonSocial: '' },
            };
            await transferenciaRepository.update(id, transferencia);
            expect(transferenciaRepository.update).toHaveBeenCalledWith(id, transferencia);
        });

        it('should return the updated Transferencia', async () => {
            const id = 1;
            const transferencia: Transferencia = {
                id,
                fechaTransferencia: new Date(),
                importe: 100,
                cuentaDebito: '12345',
                cuentaCredito: '67890',
                idEmpresa: 1,
                empresa: { id: 1, cuit: '', fechaAdhesion: new Date(), razonSocial: '' },
            };
            const updatedTransferencia: Transferencia = {
                id,
                fechaTransferencia: new Date(),
                importe: 200,
                cuentaDebito: '98765',
                cuentaCredito: '54321',
                idEmpresa: 1,
                empresa: { id: 1, cuit: '', fechaAdhesion: new Date(), razonSocial: '' },
            };
            transferenciaRepository.update.mockResolvedValue(updatedTransferencia);

            const result = await transferenciaRepository.update(id, transferencia);
            expect(result).toEqual(updatedTransferencia);
        });
    });

    describe('delete', () => {
        it('should call delete with the id', async () => {
            const id = 1;
            await transferenciaRepository.delete(id);
            expect(transferenciaRepository.delete).toHaveBeenCalledWith(id);
        });

        it('should not return anything', async () => {
            const id = 1;
            transferenciaRepository.delete.mockResolvedValue(undefined);
            const result = await transferenciaRepository.delete(id);
            expect(result).toBeUndefined();
        });
    });
});
