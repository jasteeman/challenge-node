import { UpdateEmpresaDto } from 'src/transferencia/application/dto/update-empresa.dto';
import { Empresa } from '../../entities/empresa.entity';
import { ActualizarEmpresaUseCase } from './actualizar-empresa.use-case';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from 'src/transferencia/application/services/empresa/empresa.service';

const mockEmpresaRepository = () => ({
  findById: jest.fn(),
  findByCUIT: jest.fn(),
  update: jest.fn()
});

describe('ActualizarEmpresaUseCase', () => {
  let actualizarEmpresaUseCase: ActualizarEmpresaUseCase;
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
          provide: 'ActualizarEmpresaUseCase',
          useExisting: EmpresaService,
        },
      ],
    }).compile();

    actualizarEmpresaUseCase = module.get<ActualizarEmpresaUseCase>('ActualizarEmpresaUseCase');
    empresaRepository = module.get('EmpresaRepositoryPort');
  });

  it('should update the CUIT when a valid CUIT is provided in the DTO', async () => {
    const empresaId = 1;
    const existingEmpresa = { id: empresaId, cuit: '30-11111111-1', razonSocial: 'Empresa Antigua' } as Empresa;
    const newCuit = '30-98765432-1';
    const updateDtoWithCuit: UpdateEmpresaDto = { razonSocial: 'Empresa Nueva', cuit: newCuit, fechaAdhesion: new Date()};
    const updatedEmpresaWithCuit = { ...existingEmpresa, ...updateDtoWithCuit };

    empresaRepository.findById.mockResolvedValue(existingEmpresa);
    empresaRepository.findByCUIT.mockResolvedValue(undefined);
    empresaRepository.update.mockResolvedValue(updatedEmpresaWithCuit);

    const result = await actualizarEmpresaUseCase.actualizarEmpresa(empresaId, updateDtoWithCuit);

    expect(empresaRepository.update).toHaveBeenCalledWith(empresaId, { ...existingEmpresa, ...updateDtoWithCuit });
    expect(result).toEqual(updatedEmpresaWithCuit);
  });

  it('should update razonSocial', async () => {
    const empresaId = 1;
    const existingEmpresa = { id: empresaId, cuit: '30-11111111-1', razonSocial: 'Empresa Antigua' } as Empresa;
    const updateDto = { razonSocial: 'Nueva Razon Social', cuit: '20-38063313-3', fechaAdhesion: new Date() };
    const updatedEmpresa = { ...existingEmpresa, ...updateDto };

    empresaRepository.findById.mockResolvedValue(existingEmpresa);
    empresaRepository.update.mockResolvedValue(updatedEmpresa);

    const result = await actualizarEmpresaUseCase.actualizarEmpresa(empresaId, updateDto);

    expect(empresaRepository.update).toHaveBeenCalledWith(empresaId, updatedEmpresa);
    expect(result).toEqual(updatedEmpresa);
  });

  it('should update cuit', async () => {
    const empresaId = 1;
    const existingEmpresa = { id: empresaId, cuit: '30-11111111-1', razonSocial: 'Empresa Antigua' } as Empresa;
    const updateDto = { cuit: '30-99999999-9', razonSocial: 'Empresa Nueva', fechaAdhesion: new Date() };
    const updatedEmpresa = { ...existingEmpresa, ...updateDto };

    empresaRepository.findById.mockResolvedValue(existingEmpresa);
    empresaRepository.findByCUIT.mockResolvedValue(undefined);
    empresaRepository.update.mockResolvedValue(updatedEmpresa);

    const result = await actualizarEmpresaUseCase.actualizarEmpresa(empresaId, updateDto);

    expect(empresaRepository.update).toHaveBeenCalledWith(empresaId, updatedEmpresa);
    expect(result).toEqual(updatedEmpresa);
  });

  it('should throw BadRequestException if id is invalid', async () => {
    const updateDto = { razonSocial: 'Nueva Razon Social', cuit: '12-38063313-5', fechaAdhesion: new Date() };
    await expect(actualizarEmpresaUseCase.actualizarEmpresa(0, updateDto)).rejects.toThrow(BadRequestException);
    await expect(actualizarEmpresaUseCase.actualizarEmpresa(-1, updateDto)).rejects.toThrow(BadRequestException);
    await expect(actualizarEmpresaUseCase.actualizarEmpresa(NaN, updateDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if CUIT is invalid', async () => {
    const empresaId = 1;
    const existingEmpresa = { id: empresaId, cuit: '30-11111111-1', razonSocial: 'Empresa Antigua' } as Empresa;
    const updateDto = { cuit: 'invalido', razonSocial: 'Empresa Nueva', fechaAdhesion: new Date() };
    empresaRepository.findById.mockResolvedValue(existingEmpresa);

    await expect(actualizarEmpresaUseCase.actualizarEmpresa(empresaId, updateDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if razonSocial is empty', async () => {
    const empresaId = 1;
    const existingEmpresa = { id: empresaId, cuit: '30-11111111-1', razonSocial: 'Empresa Antigua' } as Empresa;
    const updateDto = { cuit: '121212121', razonSocial: '', fechaAdhesion: new Date() };
    empresaRepository.findById.mockResolvedValue(existingEmpresa);

    await expect(actualizarEmpresaUseCase.actualizarEmpresa(empresaId, updateDto)).rejects.toThrow(BadRequestException);
  });

  it('should return undefined if empresa does not exist', async () => {
    const empresaId = 1;
    const updateDto = { cuit: '212121212', razonSocial: 'Empresa Nueva', fechaAdhesion: new Date() };
    empresaRepository.findById.mockResolvedValue(undefined);

    const result = await actualizarEmpresaUseCase.actualizarEmpresa(empresaId, updateDto);

    expect(result).toBeUndefined();
  });

  it('should throw BadRequestException if new CUIT already exists for another empresa', async () => {
    const empresaId = 1;
    const existingEmpresa = { id: empresaId, cuit: '30-11111111-1', razonSocial: 'Empresa Antigua' } as Empresa;
    const newCuit = '30-22222222-2';
    const updateDto: UpdateEmpresaDto = { cuit: newCuit, razonSocial: 'Empresa Nueva', fechaAdhesion: new Date() };
    const existingEmpresaWithNewCuit = { id: 2, cuit: newCuit } as Empresa;

    empresaRepository.findById.mockResolvedValue(existingEmpresa);
    empresaRepository.findByCUIT.mockResolvedValue(existingEmpresaWithNewCuit);

    await expect(actualizarEmpresaUseCase.actualizarEmpresa(empresaId, updateDto)).rejects.toThrow(BadRequestException);
  });
});

