import { Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm'; 
import { CreateUserPort } from 'src/users/domain/ports/out/create-user.port';
import { GetAllUsersPort } from 'src/users/domain/ports/out/get-all-users.port';
import { GetUserByIdPort } from 'src/users/domain/ports/out/get-user-by-id.port';
import { UpdateUserPort } from 'src/users/domain/ports/out/update-user.port';
import { DeleteUserPort } from 'src/users/domain/ports/out/delete-user.port';
import { User } from 'src/users/domain/entities/user.entity';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';

@Injectable()
export class UsersRepository implements
  CreateUserPort,
  GetAllUsersPort,
  GetUserByIdPort,
  UpdateUserPort,
  DeleteUserPort
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
 
  async findById(id: number): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ?? undefined;
  }

  async loadUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user ?? undefined;
  }

  async update(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) {
      return undefined;
    }

    await this.userRepository.update(id, userData);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    return updatedUser ?? undefined;
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<User>> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;
    const q = options?.q ?? '';

    const where: any = {};
    if (q) {
      where.username = Like(`%${q}%`);
      where.nombre = Like(`%${q}%`);
      where.apellido = Like(`%${q}%`);
    }

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      where,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages,
    };
  }
}