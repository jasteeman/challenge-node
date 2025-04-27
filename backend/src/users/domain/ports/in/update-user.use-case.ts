import { UpdateUserDto } from '../../../application/dto/update-user.dto';
import { User } from '../../entities/user.entity';

export interface UpdateUserUseCase {
  updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User | undefined>;
}