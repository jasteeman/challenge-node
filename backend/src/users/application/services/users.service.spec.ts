import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { UsersRepository } from 'src/users/infraestructure/repositories/users.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;
  const mockUsuario: Partial<User> = { id: 1, username: 'test', email: 'test@test.com', password: 'hashedpass', nombre: 'testName', apellido: 'testApe', createdAt: new Date(), updatedAt: new Date() };
  const mockUsersRepository = { create: jest.fn().mockResolvedValue(mockUsuario), findAll: jest.fn().mockResolvedValue([mockUsuario]), findById: jest.fn().mockResolvedValue(mockUsuario), loadUserByUsername: jest.fn().mockResolvedValue(mockUsuario), update: jest.fn().mockResolvedValue(mockUsuario), delete: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ providers: [UsersService, { provide: UsersRepository, useValue: mockUsersRepository }, { provide: 'CreateUserPort', useValue: mockUsersRepository }, { provide: 'GetAllUsersPort', useValue: mockUsersRepository }, { provide: 'GetUserByIdPort', useValue: mockUsersRepository }, { provide: 'UpdateUserPort', useValue: mockUsersRepository }, { provide: 'DeleteUserPort', useValue: mockUsersRepository }, { provide: 'GetUserByUsernamePort', useValue: mockUsersRepository }] }).compile();
    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should hash the password and create a user', async () => {
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashed123');
      mockUsersRepository.loadUserByUsername.mockResolvedValue(undefined);
      const dto: CreateUserDto = { username: 'test', email: 'test@test.com', password: '1234', apellido: 'testApe', nombre: 'testName' };
      const result = await service.createUser(dto);
      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed123' }));
      expect(result).toEqual(mockUsuario);
    });

    it('should throw BadRequestException if username already exists', async () => {
      mockUsersRepository.loadUserByUsername.mockResolvedValue(mockUsuario);
      const dto: CreateUserDto = { username: 'test', email: 'another@test.com', password: '5678', apellido: 'testApe2', nombre: 'testName2' };
      await expect(service.createUser(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAllUsers', () => {
    it('should call the getAllUsersPort.findAll method with the provided options', async () => {
      const paginationOptions: PaginationOptions = { page: 2, limit: 10 };
      const mockUsers: User[] = [];
      const mockPaginatedResult: PaginatedResult<User> = {
        data: mockUsers,
        total: 0,
        page: paginationOptions.page??2,
        limit: paginationOptions.limit??10,
        totalPages: 0,
      };
      mockUsersRepository.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await service.getAllUsers(paginationOptions);

      expect(mockUsersRepository.findAll).toHaveBeenCalledWith(paginationOptions);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should call getAllUsersPort.findAll with default pagination options if none are provided', async () => {
      const defaultPaginationOptions: PaginationOptions = { page: 1, limit: 10 };
      const mockUsers: User[] = [];
      const mockPaginatedResult: PaginatedResult<User> = {
        data: mockUsers,
        total: 0,
        page: defaultPaginationOptions.page??1,
        limit: defaultPaginationOptions.limit??10,
        totalPages: 0,
      };
      mockUsersRepository.findAll.mockResolvedValue(mockPaginatedResult);

      await service.getAllUsers({});

      expect(mockUsersRepository.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const result = await service.getUserById(1);
      expect(result).toEqual(mockUsuario);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should return undefined if not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(undefined);
      const result = await service.getUserById(99);
      expect(result).toBeUndefined();
      expect(repository.findById).toHaveBeenCalledWith(99);
    });

    it('should throw BadRequestException if id is not a positive integer', async () => {
      await expect(service.getUserById(0)).rejects.toThrow(BadRequestException);
      await expect(service.getUserById(-1)).rejects.toThrow(BadRequestException);
      await expect(service.getUserById(1.5)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserByUsername', () => {
    it('should return user by username', async () => {
      const result = await service.getUserByUsername('test');
      expect(result).toEqual(mockUsuario);
      expect(repository.loadUserByUsername).toHaveBeenCalledWith('test');
    });

    it('should return undefined if not found', async () => {
      mockUsersRepository.loadUserByUsername.mockResolvedValue(undefined);
      const result = await service.getUserByUsername('notfound');
      expect(result).toBeUndefined();
      expect(repository.loadUserByUsername).toHaveBeenCalledWith('notfound');
    });

    it('should throw BadRequestException if username is empty', async () => {
      await expect(service.getUserByUsername('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateUser', () => {
    it('should hash password and update user', async () => {
      const updatedUser: UpdateUserDto = { password: 'newPassword' };
      const mockUpdatedUsuario = { ...mockUsuario, ...updatedUser, password: 'hashedNewPassword' };
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockUsersRepository.findById.mockResolvedValue(mockUsuario);
      mockUsersRepository.update.mockResolvedValue(mockUpdatedUsuario);
      const result = await service.updateUser(1, updatedUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(repository.update).toHaveBeenCalledWith(1, expect.objectContaining({ password: 'hashedNewPassword' }));
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUpdatedUsuario);
    });

    it('should return undefined if user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(undefined);
      const result = await service.updateUser(99, { username: 'new' });
      expect(result).toBeUndefined();
      expect(repository.findById).toHaveBeenCalledWith(99);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if new username already exists', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUsuario);
      mockUsersRepository.loadUserByUsername.mockResolvedValue({ id: 2, username: 'newTest' } as User);
      await expect(service.updateUser(1, { username: 'newTest' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteUser', () => {
    it('should call delete on the repository if user exists', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUsuario);
      const result = await service.deleteUser(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(undefined);
      await expect(service.deleteUser(99)).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
      expect(repository.findById).toHaveBeenCalledWith(99);
    });
  });
});