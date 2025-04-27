export interface EliminarEmpresaUseCase {
  eliminarEmpresa(id: number): Promise<void>;
  }