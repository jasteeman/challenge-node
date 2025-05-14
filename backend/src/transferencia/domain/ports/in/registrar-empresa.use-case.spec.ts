import { RegistrarEmpresaUseCase } from './registrar-empresa.use-case';
import { Empresa } from '../../entities/empresa.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common'; 
import { EmpresaService } from 'src/transferencia/application/services/empresa/empresa.service';
import { CreateEmpresaDto } from 'src/transferencia/application/dto/create-empresa.dto';

const mockEmpresaRepository = () => ({
  findByCUIT: jest.fn(),
  create: jest.fn(),
});

describe('RegistrarEmpresaUseCase', () => {
  let registrarEmpresaUseCase: RegistrarEmpresaUseCase;
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
          provide: 'RegistrarEmpresaUseCase',
          useExisting: EmpresaService,
        },
      ],
    }).compile();

    registrarEmpresaUseCase = module.get<RegistrarEmpresaUseCase>('RegistrarEmpresaUseCase');
    empresaRepository = module.get('EmpresaRepositoryPort');
  });

  it('should register a new empresa successfully with valid data', async () => {
    const createEmpresaDto: CreateEmpresaDto = {
      cuit: '30-12345678-9',
      razonSocial: 'Empresa de Prueba',
      fechaAdhesion: new Date('2024-03-05'),
    };
    const savedEmpresa: Empresa = {
      id: 1,
      cuit: createEmpresaDto.cuit,
      razonSocial: createEmpresaDto.razonSocial,
      fechaAdhesion: new Date(createEmpresaDto.fechaAdhesion),
    };

    empresaRepository.findByCUIT.mockResolvedValue(undefined);
    empresaRepository.create.mockResolvedValue(savedEmpresa);

    const result = await registrarEmpresaUseCase.registrarEmpresa(createEmpresaDto);

    expect(empresaRepository.findByCUIT).toHaveBeenCalledWith(createEmpresaDto.cuit);
    expect(empresaRepository.create).toHaveBeenCalledWith(expect.any(Empresa));
    expect(result).toEqual(savedEmpresa);
  });

  it('should throw BadRequestException if CUIT is invalid', async () => {
    const createEmpresaDto: CreateEmpresaDto = {
      cuit: 'invalid-cuit',
      razonSocial: 'Empresa de Prueba',
      fechaAdhesion: new Date('2024-03-05'),
    };

    await expect(registrarEmpresaUseCase.registrarEmpresa(createEmpresaDto)).rejects.toThrow(BadRequestException);
    expect(empresaRepository.findByCUIT).not.toHaveBeenCalled();
    expect(empresaRepository.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if razonSocial is empty', async () => {
    const createEmpresaDto: CreateEmpresaDto = {
      cuit: '30-12345678-9',
      razonSocial: '',
      fechaAdhesion: new Date('2024-03-05'),
    };

    await expect(registrarEmpresaUseCase.registrarEmpresa(createEmpresaDto)).rejects.toThrow(BadRequestException);
    expect(empresaRepository.findByCUIT).not.toHaveBeenCalled();
    expect(empresaRepository.create).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if CUIT already exists', async () => {
    const createEmpresaDto: CreateEmpresaDto = {
      cuit: '30-12345678-9',
      razonSocial: 'Empresa de Prueba',
      fechaAdhesion: new Date('2024-03-05'),
    };
    const existingEmpresa: Empresa = {
      id: 1,
      cuit: createEmpresaDto.cuit,
      razonSocial: 'Otra Empresa',
      fechaAdhesion: new Date(),
    };
    empresaRepository.findByCUIT.mockResolvedValue(existingEmpresa);

    await expect(registrarEmpresaUseCase.registrarEmpresa(createEmpresaDto)).rejects.toThrow(BadRequestException);
    expect(empresaRepository.findByCUIT).toHaveBeenCalledWith(createEmpresaDto.cuit);
    expect(empresaRepository.create).not.toHaveBeenCalled();
  });
});
