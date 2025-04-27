import { PaginatedResult, PaginationOptions } from "src/common/utils/paginations.utils";
import { User } from "../../entities/user.entity";

export interface GetAllUsersUseCase {
  getAllUsers(options: PaginationOptions): Promise<PaginatedResult<User>>;
}