import { User } from "../../entities/user.entity";

export interface UpdateUserPort {
    update(id: number, user: Partial<User>): Promise<User | undefined>;
  }