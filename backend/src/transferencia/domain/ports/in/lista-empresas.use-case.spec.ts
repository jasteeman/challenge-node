import { ListaEmpresasUseCase } from './lista-empresas.use-case';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { Empresa } from '../../entities/empresa.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from 'src/transferencia/application/services/empresa/empresa.service';

const mockEmpresaRepository = () => ({
  findAll: jest.fn(),
});

describe('ListaEmpresasUseCase', () => {
  let listaEmpresasUseCase: ListaEmpresasUseCase;
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
          provide: 'ListaEmpresasUseCase',
          useExisting: EmpresaService,
        },
      ],
    }).compile();

    listaEmpresasUseCase = module.get<ListaEmpresasUseCase>('ListaEmpresasUseCase');
    empresaRepository = module.get('EmpresaRepositoryPort');
  });

  it('should return a paginated list of empresas', async () => { 
    const paginationOptions: PaginationOptions = { page: 1, limit: 10 };
    const expectedResult: PaginatedResult<Empresa> = {
      data: [
        { id: 1, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion:new Date() },
        { id: 2, cuit: '30-98765432-1', razonSocial: 'Empresa 2', fechaAdhesion: new Date() },
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
    empresaRepository.findAll.mockResolvedValue(expectedResult);
    const result = await listaEmpresasUseCase.getAllEmpresas(paginationOptions);
    
    expect(empresaRepository.findAll).toHaveBeenCalledWith(paginationOptions);
    expect(result).toEqual(expectedResult);
  });

  it('should handle different pagination options', async () => {
    const paginationOptions: PaginationOptions = { page: 2, limit: 5 };
    const expectedResult: PaginatedResult<Empresa> = {
      data: [
        { id: 6, cuit: '30-11111111-1', razonSocial: 'Empresa 6', fechaAdhesion: new Date() },
        { id: 7, cuit: '30-22222222-2', razonSocial: 'Empresa 7', fechaAdhesion: new Date() },
      ],
      total: 7,
      page: 2,
      limit: 5,
      totalPages: 2,
    };
    empresaRepository.findAll.mockResolvedValue(expectedResult);
    const result = await listaEmpresasUseCase.getAllEmpresas(paginationOptions);
    expect(empresaRepository.findAll).toHaveBeenCalledWith(paginationOptions);
    expect(result).toEqual(expectedResult);
  });

  it('should handle no pagination options provided', async () => { 
    const expectedResult: PaginatedResult<Empresa> = {
      data: [
        { id: 1, cuit: '30-12345678-9', razonSocial: 'Empresa 1', fechaAdhesion: new Date() },
        { id: 2, cuit: '30-98765432-1', razonSocial: 'Empresa 2', fechaAdhesion: new Date() },
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
    empresaRepository.findAll.mockResolvedValue(expectedResult);

    const result = await listaEmpresasUseCase.getAllEmpresas({});

    expect(empresaRepository.findAll).toHaveBeenCalledWith({});
    expect(result).toEqual(expectedResult);
  });
});
