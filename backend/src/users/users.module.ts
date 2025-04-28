import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UsersController } from './infraestructure/controllers/users.controller';
import { userProviders } from './users.providers';
import { UsersService } from './application/services/users.service';
import { AuthModule } from 'src/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [...userProviders,
  // {
  //   provide: APP_GUARD,
  //   useClass: JwtAuthGuard,
  // },
  ],
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
export class UsersModule { }