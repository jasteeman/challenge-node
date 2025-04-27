export interface DeleteUserPort {
    delete(id: number): Promise<void>;
}