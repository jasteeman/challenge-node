import { CreateUserDto } from '../../../application/dto/create-user.dto';
import { User } from '../../entities/user.entity';

export interface CreateUserUseCase {
  createUser(createUserDto: CreateUserDto): Promise<User>;
}