import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersService } from './application/services/users.service';
import { UsersRepository } from './infraestructure/repositories/users.repository';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './domain/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

describe('UsersModule', () => {
  let service: UsersService;
  let repository: UsersRepository;
  let userRepository: Repository<User>;
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
          database: ':memory:', // Esto crea la base de datos en memoria
          entities: [User], // Asegúrate de incluir tus entidades
          synchronize: true, // Esto sincroniza el esquema en cada prueba (¡cuidado en producción!)
          dropSchema: true,   // Esto elimina el esquema antes de cada prueba
        }),
        TypeOrmModule.forFeature([User]),
        UsersModule,
      ],
      providers: [UsersService, UsersRepository], // No necesitamos mocks aquí
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.destroy(); // Cierra la conexión después de cada prueba
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide UsersService', () => {
    expect(service).toBeDefined();
  });

  it('should provide UsersRepository', () => {
    expect(repository).toBeDefined();
  });

  it('should be able to interact with the in-memory database', async () => {
    const newUser = new User();
    newUser.username = 'test';
    newUser.email = 'test@test.com';
    newUser.password = 'password';
    newUser.nombre = 'Test Nombre';
    newUser.apellido = 'Test Apellido';

    const savedUser = await repository.create(newUser);
    expect(savedUser.id).toBeDefined();

    const foundUser = await repository.findById(savedUser.id);
    expect(foundUser?.username).toBe('test');
    expect(foundUser?.nombre).toBe('Test Nombre');
  });
});