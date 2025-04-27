import { User } from "../../entities/user.entity";

export interface GetUserByIdUseCase {
  getUserById(id: number): Promise<User | undefined>;
}