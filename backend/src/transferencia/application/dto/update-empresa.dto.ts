import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Matches, IsDate } from 'class-validator';
export class UpdateEmpresaDto {
    @ApiProperty({ description: 'CUIT de la empresa', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^\d{2}-\d{8}-\d{1}$/, { message: 'El CUIT debe tener el formato XX-XXXXXXXX-X' })
    cuit?: string;

    @ApiProperty({ description: 'Razón social de la empresa', required: false })
    @IsOptional()
    @IsString()
    razonSocial?: string;

    @ApiProperty({ description: 'Fecha de emisión', required: false })
    @IsOptional()
    @IsString()
    fechaEmision?: string;
}