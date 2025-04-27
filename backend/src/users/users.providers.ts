import { Provider } from '@nestjs/common';
import { UsersRepository } from './infraestructure/repositories/users.repository';
import { UsersService } from './application/services/users.service';

export const CreateUserPortProvider: Provider = {
  provide: 'CreateUserPort',
  useClass: UsersRepository,
};

export const GetAllUsersPortProvider: Provider = {
  provide: 'GetAllUsersPort',
  useClass: UsersRepository,
};

export const GetUserByIdPortProvider: Provider = {
  provide: 'GetUserByIdPort',
  useClass: UsersRepository,
};

export const GetUserByUsernamePortProvider: Provider = {
  provide: 'GetUserByUsernamePort',
  useClass: UsersRepository,
};

export const UpdateUserPortProvider: Provider = {
  provide: 'UpdateUserPort',
  useClass: UsersRepository,
};

export const DeleteUserPortProvider: Provider = {
  provide: 'DeleteUserPort',
  useClass: UsersRepository,
};

export const CreateUserUseCaseProvider: Provider = {
  provide: 'CreateUserUseCase',
  useClass: UsersService,
};

export const GetAllUsersUseCaseProvider: Provider = {
  provide: 'GetAllUsersUseCase',
  useClass: UsersService,
};

export const GetUserByIdUseCaseProvider: Provider = {
  provide: 'GetUserByIdUseCase',
  useClass: UsersService,
};

export const UpdateUserUseCaseProvider: Provider = {
  provide: 'UpdateUserUseCase',
  useClass: UsersService,
};

export const GetUserByUsernameUseCaseProvider: Provider = {
  provide: 'GetUserByUsernameUseCase',
  useClass: UsersService,
};

export const DeleteUserUseCaseProvider: Provider = {
  provide: 'DeleteUserUseCase',
  useClass: UsersService,
};

export const UsersRepositoryProvider: Provider = {
  provide: UsersRepository,
  useClass: UsersRepository,
};

export const UsersServiceProvider: Provider = {
  provide: UsersService,
  useClass: UsersService,
};

export const userProviders: Provider[] = [
  CreateUserPortProvider,
  GetAllUsersPortProvider,
  GetUserByIdPortProvider,
  GetUserByUsernamePortProvider,
  UpdateUserPortProvider,
  DeleteUserPortProvider,
  CreateUserUseCaseProvider,
  GetUserByUsernameUseCaseProvider,
  GetAllUsersUseCaseProvider,
  GetUserByIdUseCaseProvider,
  UpdateUserUseCaseProvider,
  DeleteUserUseCaseProvider,
  UsersRepositoryProvider,
  UsersServiceProvider,
];