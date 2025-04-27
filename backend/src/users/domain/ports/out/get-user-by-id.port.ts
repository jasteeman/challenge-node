import { User } from '../../entities/user.entity'; 

export interface GetUserByIdPort {
  findById(id: number): Promise<User | undefined>;
}