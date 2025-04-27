import { IsDate, IsOptional, isString, IsString, Matches } from 'class-validator';

export class UpdateEmpresaDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}-\d{8}-\d{1}$/, { message: 'El CUIT debe tener el formato XX-XXXXXXXX-X' })
  cuit?: string;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsString()
  fechaEmision?: string;
}