import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterAuthDto } from '../../application/dto/register-auth.dto';
import { AuthService } from 'src/auth/application/services/auth.service';
import { LoginAuthDto } from 'src/auth/application/dto/login-auth.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

const mockAuthService = {
  login: jest.fn().mockImplementation((user) => ({ access_token: 'jwt_token', user })),
  register: jest.fn().mockImplementation((dto) => ({ id: 1, ...dto })),
};

// Mock de LocalAuthGuard (ya no lo usaremos para la aserción directamente)
const MockLocalAuthGuard = { canActivate: () => true };

// Mock de JwtAuthGuard (ya no lo usaremos para la aserción directamente)
const MockJwtAuthGuard = { canActivate: () => true };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue(MockLocalAuthGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(MockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token and user', async () => {
      const user: LoginAuthDto = { username: 'testuser', password: '123456' };
      const result = await controller.login(user);
      expect(result).toEqual({ access_token: 'jwt_token', user });
      expect(mockAuthService.login).toHaveBeenCalledWith(user);
    });

    it('should apply LocalAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AuthController.prototype.login);
      // Verificamos si la CLASE LocalAuthGuard está presente
      expect(guards.some(guard => guard === LocalAuthGuard)).toBeTruthy();
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: RegisterAuthDto = { username: 'testuser', password: '123456', nombre: 'test', apellido: 'testApellido', email: 'noreply@.com' };
      const result = await controller.register(dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('protectedRoute', () => {
    it('should return protected message and user', async () => {
      const user = { id: 1, username: 'protectedUser' };
      const result = await controller.protectedRoute({ user });
      expect(result).toEqual({
        message: 'Esta ruta está protegida y solo accesible con un token JWT válido.',
        user,
      });
    });

    it('should apply JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', AuthController.prototype.protectedRoute);
      // Verificamos si la CLASE JwtAuthGuard está presente
      expect(guards.some(guard => guard === JwtAuthGuard)).toBeTruthy();
    });
  });
});