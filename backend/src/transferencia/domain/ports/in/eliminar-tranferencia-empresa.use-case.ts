export interface EliminarTransferenciaEmpresaUseCase {
    eliminarTransferenciaEmpresa(id: number): Promise<void>;
}