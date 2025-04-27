import { User } from '../../entities/user.entity'; 

export interface GetUserByUsernamePort {
    loadUserByUsername(username: string): Promise<User | undefined>;
}