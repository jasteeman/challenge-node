import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, IsDate } from 'class-validator';
export class CreateEmpresaDto {
    @ApiProperty({ description: 'CUIT de la empresa' })
    @IsString()
    @Matches(/^\d{2}-\d{8}-\d{1}$/, {
        message: 'El CUIT debe tener el formato XX-XXXXXXXX-X',
    })
    cuit: string;

    @ApiProperty({ description: 'Razón social de la empresa' })
    @IsString()
    razonSocial: string;

    @ApiProperty({ description: 'Fecha de adhesión' })
    @IsDate()
    fechaAdhesion: Date;
}