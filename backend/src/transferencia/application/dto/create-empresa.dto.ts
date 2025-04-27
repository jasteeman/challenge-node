import { IsDate, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateEmpresaDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{2}-\d{8}-\d{1}$/, { message: 'El CUIT debe tener el formato XX-XXXXXXXX-X' })
  cuit: string;

  @IsNotEmpty()
  @IsString()
  razonSocial: string;

  @IsNotEmpty()
  @IsString()
  fechaAdhesion: string;
}