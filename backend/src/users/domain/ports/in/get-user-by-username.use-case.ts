import { User } from "../../entities/user.entity";

export interface GetUserByUsernameUseCase {
  getUserByUsername(username: string): Promise<User | undefined>;
}