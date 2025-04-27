import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateTransferenciaDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  idEmpresa: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  importe: number;

  @IsNotEmpty()
  @IsString()
  cuentaDebito: string;

  @IsNotEmpty()
  @IsString()
  cuentaCredito: string;
}