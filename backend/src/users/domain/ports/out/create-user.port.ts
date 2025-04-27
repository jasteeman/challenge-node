import { User } from "../../entities/user.entity";

export interface CreateUserPort {
  create(user: User): Promise<User>;
}