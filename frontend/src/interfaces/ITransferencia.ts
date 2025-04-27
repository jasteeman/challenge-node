import { Empresa } from "./IEmpresa";

export interface Transferencia {
    id?: number; 
    importe: number;
    empresa?: Empresa;
    idEmpresa: number;
    cuentaDebito: string;
    cuentaCredito: string;
    fechaTransferencia?: Date; 
  }
  