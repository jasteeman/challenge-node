import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { Test, TestingModule } from '@nestjs/testing';
import { Empresa } from '../../entities/empresa.entity';

// Mock del repositorio (adaptador de salida)
const mockEmpresaRepository = () => ({
    findById: jest.fn(),
    findByCUIT: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findEmpresasConTransferenciasUltimoMes: jest.fn(),
    findEmpresasAdheridasUltimoMes: jest.fn(),
});

describe('EmpresaRepositoryPort', () => {
    let empresaRepository: ReturnType<typeof mockEmpresaRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: 'EmpresaRepositoryPort', // Usa el token/nombre del PORT
                    useFactory: mockEmpresaRepository,
                },
            ],
        }).compile();

        empresaRepository = module.get('EmpresaRepositoryPort');
    });

    it('should be defined', () => {
        expect(empresaRepository).toBeDefined();
    });

    describe('findById', () => {
        it('should call findById with the correct id', async () => {
            const id = 1;
            await empresaRepository.findById(id);
            expect(empresaRepository.findById).toHaveBeenCalledWith(id);
        });

        it('should return an Empresa if found', async () => {
            const id = 1;
            const expectedEmpresa: Empresa = { id, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion: new Date() };
            empresaRepository.findById.mockResolvedValue(expectedEmpresa);

            const result = await empresaRepository.findById(id);
            expect(result).toEqual(expectedEmpresa);
        });

        it('should return undefined if Empresa is not found', async () => {
            const id = 1;
            empresaRepository.findById.mockResolvedValue(undefined);

            const result = await empresaRepository.findById(id);
            expect(result).toBeUndefined();
        });
    });

    describe('findByCUIT', () => {
        it('should call findByCUIT with the correct CUIT', async () => {
            const cuit = '30-12345678-9';
            await empresaRepository.findByCUIT(cuit);
            expect(empresaRepository.findByCUIT).toHaveBeenCalledWith(cuit);
        });

        it('should return an Empresa if found', async () => {
            const cuit = '30-12345678-9';
            const expectedEmpresa: Empresa = { id: 1, cuit, razonSocial: 'Empresa 1', fechaAdhesion: new Date() };
            empresaRepository.findByCUIT.mockResolvedValue(expectedEmpresa);

            const result = await empresaRepository.findByCUIT(cuit);
            expect(result).toEqual(expectedEmpresa);
        });

        it('should return undefined if Empresa is not found', async () => {
            const cuit = '30-12345678-9';
            empresaRepository.findByCUIT.mockResolvedValue(undefined);

            const result = await empresaRepository.findByCUIT(cuit);
            expect(result).toBeUndefined();
        });
    });

    describe('create', () => {
        it('should call create with the Empresa object', async () => {
            const empresa: Empresa = { id: 1, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion: new Date() };
            await empresaRepository.create(empresa);
            expect(empresaRepository.create).toHaveBeenCalledWith(empresa);
        });

        it('should return the created Empresa', async () => {
            const empresa: Empresa = { id: 1, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion: new Date() };
            const createdEmpresa: Empresa = { ...empresa };
            empresaRepository.create.mockResolvedValue(createdEmpresa);

            const result = await empresaRepository.create(empresa);
            expect(result).toEqual(createdEmpresa);
        });
    });

    describe('findAll', () => {
        it('should call findAll with the pagination options', async () => {
            const options: PaginationOptions = { page: 1, limit: 10 };
            await empresaRepository.findAll(options);
            expect(empresaRepository.findAll).toHaveBeenCalledWith(options);
        });

        it('should return a PaginatedResult of Empresas', async () => {
            const options: PaginationOptions = { page: 1, limit: 10 };
            const expectedResult: PaginatedResult<Empresa> = {
                data: [{ id: 1, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion: new Date() }],
                total: 1,
                page: 1,
                limit: 10,
                totalPages: 1,
            };
            empresaRepository.findAll.mockResolvedValue(expectedResult);

            const result = await empresaRepository.findAll(options);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('update', () => {
        it('should call update with the id and Empresa object', async () => {
            const id = 1;
            const empresa: Empresa = { id, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion: new Date() };
            await empresaRepository.update(id, empresa);
            expect(empresaRepository.update).toHaveBeenCalledWith(id, empresa);
        });

        it('should return the updated Empresa', async () => {
            const id = 1;
            const empresa: Empresa = { id, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion: new Date() };
            const updatedEmpresa: Empresa = { id, cuit: '30-98765432-1', razonSocial: 'Empresa Actualizada', fechaAdhesion: new Date() };
            empresaRepository.update.mockResolvedValue(updatedEmpresa);

            const result = await empresaRepository.update(id, empresa);
            expect(result).toEqual(updatedEmpresa);
        });
    });

    describe('delete', () => {
        it('should call delete with the id', async () => {
            const id = 1;
            await empresaRepository.delete(id);
            expect(empresaRepository.delete).toHaveBeenCalledWith(id);
        });

        it('should not return anything', async () => {
            const id = 1;
            empresaRepository.delete.mockResolvedValue(undefined); // Simulate void return
            const result = await empresaRepository.delete(id);
            expect(result).toBeUndefined();
        });
    });

    describe('findEmpresasConTransferenciasUltimoMes', () => {
        it('should call findEmpresasConTransferenciasUltimoMes with the dates', async () => {
            const fechaInicio = new Date('2024-01-01');
            const fechaFin = new Date('2024-01-31');
            await empresaRepository.findEmpresasConTransferenciasUltimoMes(fechaInicio, fechaFin);
            expect(empresaRepository.findEmpresasConTransferenciasUltimoMes).toHaveBeenCalledWith(fechaInicio, fechaFin);
        });

        it('should return an array of Empresas', async () => {
            const fechaInicio = new Date('2024-01-01');
            const fechaFin = new Date('2024-01-31');
            const expectedEmpresas: Empresa[] = [{ id: 1, cuit: '30-123', razonSocial: 'Empresa 1', fechaAdhesion: new Date() }];
            empresaRepository.findEmpresasConTransferenciasUltimoMes.mockResolvedValue(expectedEmpresas);

            const result = await empresaRepository.findEmpresasConTransferenciasUltimoMes(fechaInicio, fechaFin);
            expect(result).toEqual(expectedEmpresas);
        });
    });

    describe('findEmpresasAdheridasUltimoMes', () => {
        it('should call findEmpresasAdheridasUltimoMes with the dates', async () => {
            const fechaInicio = new Date('2024-01-01');
            const fechaFin = new Date('2024-01-31');
            await empresaRepository.findEmpresasAdheridasUltimoMes(fechaInicio, fechaFin);
            expect(empresaRepository.findEmpresasAdheridasUltimoMes).toHaveBeenCalledWith(fechaInicio, fechaFin);
        });

        it('should return an array of Empresas', async () => {
            const fechaInicio = new Date('2024-01-01');
            const fechaFin = new Date('2024-01-31');
            const expectedEmpresas: Empresa[] = [{ id: 1, cuit: '30-123', razonSocial: 'Empresa 1', fechaAdhesion: new Date() }];
            empresaRepository.findEmpresasAdheridasUltimoMes.mockResolvedValue(expectedEmpresas);

            const result = await empresaRepository.findEmpresasAdheridasUltimoMes(fechaInicio, fechaFin);
            expect(result).toEqual(expectedEmpresas);
        });
    });
});
