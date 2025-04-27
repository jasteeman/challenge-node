export interface DeleteUserUseCase {
  deleteUser(id: number): Promise<void>;
  }