import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TransferenciaService } from './application/services/transferencia/transferencia.service';
import { EmpresaService } from './application/services/empresa/empresa.service';
import { EmpresaRepository } from './infrastructure/repositories/empresa.repository';
import { TransferenciaRepository } from './infrastructure/repositories/transferencia.repository';
import { Empresa } from './domain/entities/empresa.entity';
import { Transferencia } from './domain/entities/transferencia.entity';
import { TransferenciaModule } from './transferencia.module';
import { CreateEmpresaDto } from './application/dto/create-empresa.dto';
import { CreateTransferenciaDto } from './application/dto/create-transferencia.dto';
import { transferenciaProviders } from './transferencia.providers';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('TransferenciaModule Integration Test', () => {
  let transferenciaService: TransferenciaService;
  let empresaService: EmpresaService;
  let empresaRepository: Repository<Empresa>;
  let transferenciaRepository: Repository<Transferencia>;
  let module: TestingModule;
  let dataSource: DataSource;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Empresa, Transferencia],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([Empresa, Transferencia]),
        TransferenciaModule,
      ],
      providers: [
        EmpresaService,
        TransferenciaService,
        EmpresaRepository,
        TransferenciaRepository,
        ...transferenciaProviders,
      ],
    }).compile();

    transferenciaService = module.get<TransferenciaService>(TransferenciaService);
    empresaService = module.get<EmpresaService>(EmpresaService);
    empresaRepository = module.get<Repository<Empresa>>(getRepositoryToken(Empresa));
    transferenciaRepository = module.get<Repository<Transferencia>>(
      getRepositoryToken(Transferencia),
    );
    dataSource = module.get<DataSource>(getDataSourceToken());
  });

  afterEach(async () => {
    if (dataSource) {
      try {
        await dataSource.destroy();
      } catch (error) {
        console.error('Error al destruir la base de datos:', error);
      }
    }
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  describe('EmpresaService', () => {
    it('should create a new empresa', async () => {
      const createEmpresaDto: CreateEmpresaDto = {
        cuit: '30-12345678-9',
        razonSocial: 'Empresa de Prueba',
        fechaAdhesion: new Date(),
      };

      const empresa = await empresaService.registrarEmpresa(createEmpresaDto);
      expect(empresa).toBeDefined();
      expect(empresa.cuit).toBe(createEmpresaDto.cuit);
      expect(empresa.razonSocial).toBe(createEmpresaDto.razonSocial);
      expect(empresa.id).toBeGreaterThan(0);
    });

    it('should find empresa by id', async () => {
      const createEmpresaDto: CreateEmpresaDto = {
        cuit: '30-98765432-1',
        razonSocial: 'Empresa Test',
        fechaAdhesion: new Date(),
      };
      const createdEmpresa = await empresaService.registrarEmpresa(createEmpresaDto);

      const foundEmpresa = await empresaService.obtenerEmpresa(createdEmpresa.id);
      expect(foundEmpresa).toBeDefined();
      expect(foundEmpresa?.id).toBe(createdEmpresa.id);
    });
  });

  describe('TransferenciaService', () => {
    it('should create a new transferencia', async () => {
      const createEmpresaDto: CreateEmpresaDto = {
        cuit: '30-11111111-1',
        razonSocial: 'Empresa para Transferencia',
        fechaAdhesion: new Date(),
      };
      const empresa = await empresaService.registrarEmpresa(createEmpresaDto);

      const createTransferenciaDto: CreateTransferenciaDto = {
        idEmpresa: empresa.id,
        importe: 100,
        cuentaDebito: '123456',
        cuentaCredito: '789012',
      };

      const transferencia = await transferenciaService.registrarTransferenciaEmpresa(createTransferenciaDto);
      expect(transferencia).toBeDefined();
      expect(transferencia.importe).toBe(createTransferenciaDto.importe);
      expect(transferencia.empresa.id).toBe(empresa.id);
    });
  });
});

