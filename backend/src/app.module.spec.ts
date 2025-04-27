import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DynamicModule } from '@nestjs/common';

const mockTypeOrmModule = {
  forRoot: jest.fn().mockReturnValue({}),
  forFeature: jest.fn().mockReturnValue({}),
};

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [
        ConfigModule,
        UsersModule,
        AuthModule,
        AppModule,
      ],
    })
    .overrideProvider(TypeOrmModule)
    .useValue(mockTypeOrmModule);

    appModule = await moduleBuilder.compile();
  }, 30000);

  it('should compile the module', () => {
    expect(appModule).toBeDefined();
  });

  it('should have ConfigModule imported', () => {
    const configModule = appModule.get(ConfigModule);
    expect(configModule).toBeDefined();
  });

  it('should have TypeOrmModule "imported" (mocked)', () => {
    const typeOrmModule = appModule.get(TypeOrmModule);
    expect(typeOrmModule).toBe(mockTypeOrmModule);
  });

  it('should have UsersModule imported', () => {
    const usersModule = appModule.get(UsersModule);
    expect(usersModule).toBeDefined();
  });

  it('should have AuthModule imported', () => {
    const authModule = appModule.get(AuthModule);
    expect(authModule).toBeDefined();
  });
});