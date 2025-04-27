import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { CreateUserDto, UpdateUserDto } from 'src/users/application/dto';
import { User } from 'src/users/domain/entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let mockCreateUserUseCase: { createUser: jest.Mock };
  let mockGetAllUsersUseCase: { getAllUsers: jest.Mock };
  let mockGetUserByIdUseCase: { getUserById: jest.Mock };
  let mockUpdateUserUseCase: { updateUser: jest.Mock };
  let mockDeleteUserUseCase: { deleteUser: jest.Mock };

  beforeEach(async () => {
    mockCreateUserUseCase = { createUser: jest.fn() };
    mockGetAllUsersUseCase = { getAllUsers: jest.fn() };
    mockGetUserByIdUseCase = { getUserById: jest.fn() };
    mockUpdateUserUseCase = { updateUser: jest.fn() };
    mockDeleteUserUseCase = { deleteUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: 'CreateUserUseCase', useValue: mockCreateUserUseCase },
        { provide: 'GetAllUsersUseCase', useValue: mockGetAllUsersUseCase },
        { provide: 'GetUserByIdUseCase', useValue: mockGetUserByIdUseCase },
        { provide: 'UpdateUserUseCase', useValue: mockUpdateUserUseCase },
        { provide: 'DeleteUserUseCase', useValue: mockDeleteUserUseCase },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call createUserUseCase.createUser with the provided dto', async () => {
      const createUserDto: CreateUserDto = { username: 'test', email: 'test@test.com', nombre: 'Test', apellido: 'User',password: 'password' };
      const mockUser: User = { id: 1, ...createUserDto, createdAt: new Date(), updatedAt: new Date(),enabled: true };
      mockCreateUserUseCase.createUser.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);
      expect(mockCreateUserUseCase.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should call getAllUsersUseCase.getAllUsers with default pagination options', async () => {
      const mockUsers: User[] = [{ id: 1, username: 'test', email: 'test@test.com', nombre: 'Test', apellido: 'User', createdAt: new Date(), updatedAt: new Date(), enabled: true, password: 'password' }];
      const mockPaginatedResult = {
        data: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockGetAllUsersUseCase.getAllUsers.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll({
        page: 0,
        limit: 0
      }); 
      expect(mockGetAllUsersUseCase.getAllUsers).toHaveBeenCalledWith({ page: 0, limit: 0 });
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should call getAllUsersUseCase.getAllUsers with provided pagination options', async () => {
      const mockUsers: User[] = [{ id: 1, username: 'test', email: 'test@test.com', nombre: 'Test', apellido: 'User', createdAt: new Date(), updatedAt: new Date(), enabled: true, password: 'password' }];
      const mockPaginatedResult = {
        data: mockUsers,
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      };
      const paginationOptions = { page: 2, limit: 5 };
      mockGetAllUsersUseCase.getAllUsers.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(paginationOptions); // Pasa las opciones de paginación
      expect(mockGetAllUsersUseCase.getAllUsers).toHaveBeenCalledWith(paginationOptions);
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('findOne', () => {
    it('should call getUserByIdUseCase.getUserById with the parsed ID', async () => {
      const mockUser: User = { id: 1, username: 'test', email: 'test@test.com', nombre: 'Test', apellido: 'User', createdAt: new Date(), updatedAt: new Date(), enabled: true, password: 'password' };
      mockGetUserByIdUseCase.getUserById.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');
      expect(mockGetUserByIdUseCase.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should call updateUserUseCase.updateUser with the parsed ID and dto', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updated', email: 'updated@test.com', nombre: 'Updated', apellido: 'UserUpdated', password: 'newpassword' };
      const mockUpdatedUser: User = { id: 1, username: 'updated', email: 'updated@test.com', nombre: 'Updated', apellido: 'UserUpdated', createdAt: new Date(), updatedAt: new Date(), enabled: true, password: 'newpassword' };
      mockUpdateUserUseCase.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update('1', updateUserDto);
      expect(mockUpdateUserUseCase.updateUser).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('remove', () => {
    it('should call deleteUserUseCase.deleteUser with the ID', async () => {
      mockDeleteUserUseCase.deleteUser.mockResolvedValue(undefined);

      const result = await controller.remove(1);
      expect(mockDeleteUserUseCase.deleteUser).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Usuario con ID 1 eliminado' });
    });
  });
});