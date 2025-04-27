import { IsOptional, IsNumber, IsPositive, IsString } from 'class-validator';

export class UpdateTransferenciaDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  importe?: number;

  @IsOptional()
  @IsString()
  cuentaDebito?: string;

  @IsOptional()
  @IsString()
  cuentaCredito?: string;
}