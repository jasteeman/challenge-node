import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/services/auth.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/application/services/users.service';
import { UsersRepository } from 'src/users/infraestructure/repositories/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/domain/entities/user.entity';
import { DataSource } from 'typeorm';

describe('AuthModule', () => {
  let module: TestingModule;
  let dataSource: DataSource;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'testSecret' })],
        }),
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '1h' },
          }),
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([User]),
        UsersModule,
        AuthModule,
      ],
      providers: [
        AuthService,
        JwtStrategy,
        LocalStrategy,
        UsersService,
        UsersRepository, // Ensure UsersRepository is provided to interact with the DB
      ],
    });

    module = await moduleBuilder.compile();
    dataSource = module.get<DataSource>(DataSource);
  }, 30000);

  afterEach(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  it('debería estar definido el módulo', () => {
    expect(module).toBeDefined();
  });

  it('debería estar definido el controlador AuthController', () => {
    const controller = module.get<AuthController>(AuthController);
    expect(controller).toBeDefined();
  });

  it('debería estar definido el servicio AuthService', () => {
    const service = module.get<AuthService>(AuthService);
    expect(service).toBeDefined();
  });

  it('debería estar definida la estrategia JwtStrategy', () => {
    const strategy = module.get<JwtStrategy>(JwtStrategy);
    expect(strategy).toBeDefined();
  });

  it('debería estar definida la estrategia LocalStrategy', () => {
    const strategy = module.get<LocalStrategy>(LocalStrategy);
    expect(strategy).toBeDefined();
  });

  it('debería estar definido JwtModule', () => {
    const jwtModule = module.get(JwtModule);
    expect(jwtModule).toBeDefined();
  });

  it('debería estar definido ConfigModule', () => {
    const configModule = module.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('debería estar definido UsersModule', () => {
    const usersModule = module.get(UsersModule);
    expect(usersModule).toBeDefined();
  });

  it('debería estar definido PassportModule', () => {
    const passportModule = module.get(PassportModule);
    expect(passportModule).toBeDefined();
  });

  it('debería estar definido UsersService', () => {
    const usersService = module.get<UsersService>(UsersService);
    expect(usersService).toBeDefined();
  });
});