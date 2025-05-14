import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateTransferenciaDto {
    @ApiProperty({ description: 'ID de la empresa' })
    @IsNumber()
    idEmpresa: number;

    @ApiProperty({ description: 'Importe de la transferencia' })
    @IsNumber()
    importe: number;

    @ApiProperty({ description: 'Cuenta de débito' })
    @IsString()
    @IsNotEmpty()
    cuentaDebito: string;

    @ApiProperty({ description: 'Cuenta de crédito' })
    @IsString()
    @IsNotEmpty()
    cuentaCredito: string;
}