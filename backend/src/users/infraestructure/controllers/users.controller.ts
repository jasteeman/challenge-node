import { Controller, Post, Body, Get, Param, Patch, Delete, Inject, Query } from '@nestjs/common'; 
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { CreateUserDto, UpdateUserDto } from 'src/users/application/dto';
import { User } from 'src/users/domain/entities/user.entity';
import { CreateUserUseCase } from 'src/users/domain/ports/in/create-user.use-case';
import { DeleteUserUseCase } from 'src/users/domain/ports/in/delete-user.use-case';
import { GetAllUsersUseCase } from 'src/users/domain/ports/in/get-all-users.use-case';
import { GetUserByIdUseCase } from 'src/users/domain/ports/in/get-user-by-id.use-case';
import { UpdateUserUseCase } from 'src/users/domain/ports/in/update-user.use-case';

@Controller('users')
export class UsersController {
  constructor(
    @Inject('CreateUserUseCase') private readonly createUserUseCase: CreateUserUseCase,
    @Inject('GetAllUsersUseCase') private readonly getAllUsersUseCase: GetAllUsersUseCase,
    @Inject('GetUserByIdUseCase') private readonly getUserByIdUseCase: GetUserByIdUseCase,
    @Inject('UpdateUserUseCase') private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject('DeleteUserUseCase') private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.createUser(createUserDto);
  }

  @Get()
  async findAll(@Query() paginationOptions: PaginationOptions): Promise<PaginatedResult<User>> {
    return this.getAllUsersUseCase.getAllUsers(paginationOptions);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.getUserByIdUseCase.getUserById(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.updateUserUseCase.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.deleteUserUseCase.deleteUser(id);
    return { message: `Usuario con ID ${id} eliminado` };
  }
}