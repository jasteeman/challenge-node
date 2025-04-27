import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { UsersRepository } from './users.repository';
import { User } from 'src/users/domain/entities/user.entity';
import { UpdateUserDto } from 'src/users/application/dto';

describe('UsersRepository', () => {
    let repository: UsersRepository;
    let userRepository: Repository<User>;

    const mockUsuario: User = new User();
    mockUsuario.username = 'testuser';
    mockUsuario.email = 'test@test.com';
    mockUsuario.password = 'hashedpassword';
    mockUsuario.nombre = 'testName';
    mockUsuario.apellido = 'testApe';
    mockUsuario.createdAt = new Date();
    mockUsuario.updatedAt = new Date();

    const mockUpdatedUsuario: Partial<User> = {
        id: 1,
        username: 'updateduser',
        email: 'updated@test.com',
        password: 'newhashedpassword',
        nombre: 'updatedName',
        apellido: 'updatedApe',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUpdateUserDto: UpdateUserDto = {
        username: 'updateduser',
        email: 'updated@test.com',
        password: 'newpassword',
        nombre: 'updatedName',
        apellido: 'updatedApe',
    };

    const mockFindAndCount = jest.fn<Promise<[User[], number]>, [FindManyOptions<User>?]>();
    mockFindAndCount.mockResolvedValue([[mockUsuario], 1]);

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersRepository,
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        save: jest.fn().mockResolvedValue(mockUsuario),
                        find: jest.fn().mockResolvedValue([mockUsuario]),
                        findOne: jest.fn().mockResolvedValue(mockUsuario),
                        update: jest.fn().mockResolvedValue({ affected: 1 }),
                        delete: jest.fn().mockResolvedValue({ affected: 1 }),
                        findAndCount: mockFindAndCount,
                    },
                },
            ],
        }).compile();

        repository = module.get<UsersRepository>(UsersRepository);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('create', () => {
        it('should call userRepository.save with the provided user', async () => {
            await repository.create(mockUsuario);
            expect(userRepository.save).toHaveBeenCalledWith(mockUsuario);
        });

        it('should return the saved user', async () => {
            const result = await repository.create(mockUsuario);
            expect(result).toEqual(mockUsuario);
        });
    });

   describe('findAll', () => {
    it('should call userRepository.findAndCount with skip and take', async () => {
      const paginationOptions = {};
      await repository.findAll(paginationOptions);
      expect(userRepository.findAndCount).toHaveBeenCalledWith({skip:0,take:10,where:{}});
    });

    it('should return a PaginatedResult with an array of users and total count', async () => {
      const paginationOptions = { page: 1, limit: 10 };
      const mockUsers = [mockUsuario];
      const mockTotal = 1;
      (userRepository.findAndCount as jest.Mock).mockResolvedValue([mockUsers, mockTotal]);

      const result = await repository.findAll(paginationOptions);
      expect(result).toEqual({
        data: mockUsers,
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should use default pagination options if none are provided', async () => {
      const mockUsers = [mockUsuario];
      const mockTotal = 1;
      (userRepository.findAndCount as jest.Mock).mockResolvedValue([mockUsers, mockTotal]);

      await repository.findAll({});

      const result = await repository.findAll({});
      expect(result).toEqual({
        data: mockUsers,
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

    describe('findById', () => {
        it('should call userRepository.findOne with the correct ID', async () => {
            await repository.findById(1);
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
        });

        it('should return the user if found', async () => {
            const result = await repository.findById(1);
            expect(result).toEqual(mockUsuario);
        });

        it('should return undefined if user is not found', async () => {
            (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);
            const result = await repository.findById(99);
            expect(result).toBeUndefined();
        });
    });

    describe('loadUserByUsername', () => {
        it('should call userRepository.findOne with the correct username', async () => {
            await repository.loadUserByUsername('testuser');
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
        });

        it('should return the user if found', async () => {
            const result = await repository.loadUserByUsername('testuser');
            expect(result).toEqual(mockUsuario);
        });

        it('should return undefined if user is not found', async () => {
            (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);
            const result = await repository.loadUserByUsername('nonexistent');
            expect(result).toBeUndefined();
        });
    });

    describe('update', () => {
        it('should call userRepository.update with the correct ID and user data', async () => {
            await repository.update(1, mockUpdateUserDto);
            expect(userRepository.update).toHaveBeenCalledWith(1, mockUpdateUserDto);
        });

        it('should call userRepository.findOne to return the updated user', async () => {
            (userRepository.findOne as jest.Mock).mockResolvedValue(mockUpdatedUsuario);
            const result = await repository.update(1, mockUpdateUserDto);
            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toEqual(mockUpdatedUsuario);
        });

        it('should return undefined if update fails or user is not found after update', async () => {
            (userRepository.update as jest.Mock).mockResolvedValue({ affected: 0 });
            (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);
            const result = await repository.update(1, mockUpdateUserDto);
            expect(result).toBeUndefined();
          });
    });

    describe('delete', () => {
        it('should call userRepository.delete with the correct ID', async () => {
            await repository.delete(1);
            expect(userRepository.delete).toHaveBeenCalledWith(1);
        });

        it('should not throw an error on successful deletion', async () => {
            await expect(repository.delete(1)).resolves.toBeUndefined();
        });
    });
});