import { Provider } from '@nestjs/common';
import { TransferenciaRepository } from './infrastructure/repositories/transferencia.repository';
import { TransferenciaService } from './application/services/transferencia/transferencia.service';
import { EmpresaRepository } from './infrastructure/repositories/empresa.repository';
import { EmpresaService } from './application/services/empresa/empresa.service';

// Providers de Transferencia
export const TransferenciaRepositoryPortProvider: Provider = {
  provide: 'TransferenciaRepositoryPort',
  useClass: TransferenciaRepository,
};

export const RegistrarTransferenciaUseCaseProvider: Provider = {
  provide: 'RegistrarTransferenciaUseCase',
  useClass: TransferenciaService,
};

export const ObtenerTransferenciasEmpresaUseCaseProvider: Provider = {
  provide: 'ObtenerTransferenciasEmpresaUseCase',
  useClass: TransferenciaService,
};

export const ActualizarTransferenciaUseCaseProvider: Provider = {
  provide: 'ActualizarTransferenciaUseCase',
  useClass: TransferenciaService,
};

export const EliminarTransferenciaUseCaseProvider: Provider = {
  provide: 'EliminarTransferenciaUseCase',
  useClass: TransferenciaService,
};

// Providers de Empresa
export const EmpresaRepositoryPortProvider: Provider = {
  provide: 'EmpresaRepositoryPort',
  useClass: EmpresaRepository,
};

export const RegistrarEmpresaUseCaseProvider: Provider = {
  provide: 'RegistrarEmpresaUseCase',
  useClass: EmpresaService,
};

export const ObtenerEmpresaConTransferenciaUseCaseProvider: Provider = {
  provide: 'ObtenerEmpresaConTransferenciaUseCase',
  useClass: EmpresaService,
};

export const ObtenerEmpresaAdheridaUseCaseProvider: Provider = {
  provide: 'ObtenerEmpresaAdheridaUseCase',
  useClass: EmpresaService,
};

export const ObtenerEmpresaUseCaseProvider: Provider = {
  provide: 'ObtenerEmpresaUseCase',
  useClass: EmpresaService,
};

export const ActualizarEmpresaUseCaseProvider: Provider = {
  provide: 'ActualizarEmpresaUseCase',
  useClass: EmpresaService,
};

export const EliminarEmpresaUseCaseProvider: Provider = {
  provide: 'EliminarEmpresaUseCase',
  useClass: EmpresaService,
};

export const ListaEmpresasUseCaseProvider: Provider = {
  provide: 'ListaEmpresasUseCase',
  useClass: EmpresaService,
};
 
// Providers de Servicios y Repositorios (si los necesitas inyectar directamente)
export const TransferenciaServiceProvider: Provider = {
  provide: TransferenciaService,
  useClass: TransferenciaService,
};

export const TransferenciaRepositoryProvider: Provider = {
  provide: TransferenciaRepository,
  useClass: TransferenciaRepository,
};

export const EmpresaServiceProvider: Provider = {
  provide: EmpresaService,
  useClass: EmpresaService,
};

export const EmpresaRepositoryProvider: Provider = {
  provide: EmpresaRepository,
  useClass: EmpresaRepository,
};

export const transferenciaProviders: Provider[] = [
  TransferenciaRepositoryPortProvider,
  RegistrarTransferenciaUseCaseProvider,
  ObtenerTransferenciasEmpresaUseCaseProvider,
  ObtenerEmpresaAdheridaUseCaseProvider,
  ActualizarTransferenciaUseCaseProvider,
  EliminarTransferenciaUseCaseProvider,
  EmpresaRepositoryPortProvider,
  RegistrarEmpresaUseCaseProvider,
  ObtenerEmpresaUseCaseProvider,
  ObtenerEmpresaConTransferenciaUseCaseProvider,
  ActualizarEmpresaUseCaseProvider,
  ListaEmpresasUseCaseProvider,
  EliminarEmpresaUseCaseProvider,
  TransferenciaServiceProvider,
  TransferenciaRepositoryProvider,
  EmpresaServiceProvider,
  EmpresaRepositoryProvider,
];