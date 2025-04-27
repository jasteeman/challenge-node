import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UsersController } from './infraestructure/controllers/users.controller';
import { userProviders } from './users.providers';
import { UsersService } from './application/services/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [...userProviders],
  exports: [
    UsersService,
    'CreateUserPort',
    'GetAllUsersPort',
    'GetUserByIdPort',
    'UpdateUserPort',
    'DeleteUserPort',
    'GetUserByUsernamePort',
    'CreateUserUseCase',
    'GetAllUsersUseCase',
    'GetUserByIdUseCase',
    'UpdateUserUseCase',
    'DeleteUserUseCase',
  ],
})
export class UsersModule {}