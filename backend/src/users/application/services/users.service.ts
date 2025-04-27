import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { CreateUserPort } from '../../domain/ports/out/create-user.port';
import { GetAllUsersPort } from '../../domain/ports/out/get-all-users.port';
import { GetUserByIdPort } from '../../domain/ports/out/get-user-by-id.port';
import { UpdateUserPort } from '../../domain/ports/out/update-user.port';
import { DeleteUserPort } from '../../domain/ports/out/delete-user.port';
import { GetUserByUsernamePort } from 'src/users/domain/ports/out/get-user-by-username.port';
import { DeleteUserUseCase } from 'src/users/domain/ports/in/delete-user.use-case';
import { UpdateUserUseCase } from 'src/users/domain/ports/in/update-user.use-case';
import { GetUserByIdUseCase } from 'src/users/domain/ports/in/get-user-by-id.use-case';
import { GetAllUsersUseCase } from 'src/users/domain/ports/in/get-all-users.use-case';
import { CreateUserUseCase } from 'src/users/domain/ports/in/create-user.use-case';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';

@Injectable()
export class UsersService implements
  CreateUserUseCase,
  GetAllUsersUseCase,
  GetUserByIdUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase {
  constructor(
    @Inject('CreateUserPort') private readonly createUserPort: CreateUserPort,
    @Inject('GetAllUsersPort') private readonly getAllUsersPort: GetAllUsersPort,
    @Inject('GetUserByIdPort') private readonly getUserByIdPort: GetUserByIdPort,
    @Inject('UpdateUserPort') private readonly updateUserPort: UpdateUserPort,
    @Inject('DeleteUserPort') private readonly deleteUserPort: DeleteUserPort,
    @Inject('GetUserByUsernamePort') private readonly getUserByUsernamePort: GetUserByUsernamePort,
  ) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {

    const existingUser = await this.getUserByUsernamePort.loadUserByUsername(createUserDto.username);
    if (existingUser) {
      throw new BadRequestException(`El nombre de usuario "${createUserDto.username}" ya existe.`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new User();
    Object.assign(user, createUserDto);
    user.password = hashedPassword;
    return this.createUserPort.create(user);
  }

  async getAllUsers(options: PaginationOptions): Promise<PaginatedResult<User>> {
    return this.getAllUsersPort.findAll(options);
  }

  async getUserById(id: number): Promise<User | undefined> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('El ID de usuario debe ser un entero positivo.');
    }
    return this.getUserByIdPort.findById(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username || username.trim() === '') {
      throw new BadRequestException('El nombre de usuario no puede estar vacío.');
    }
    return this.getUserByUsernamePort.loadUserByUsername(username);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User | undefined> {


    const user = await this.getUserByIdPort.findById(id);
    if (!user) {
      return undefined;
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.getUserByUsernamePort.loadUserByUsername(updateUserDto.username);
      if (existingUser) {
        throw new BadRequestException(`El nombre de usuario "${updateUserDto.username}" ya existe.`);
      }
    }

    const updatedUserData: Partial<User> = { ...updateUserDto };
    Object.entries(updateUserDto).filter(([key]) => key !== 'password');

    if (updateUserDto.password) {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      updatedUserData.password = hashedPassword;
    }

    return this.updateUserPort.update(id, updatedUserData);
  }

  async deleteUser(id: number): Promise<void> {

    const user = await this.getUserByIdPort.findById(id);

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.deleteUserPort.delete(id);
  }
}