import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';
export class RegisterAuthDto {
  @ApiProperty({ description: 'Nombre de usuario' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'Correo electrónico' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Nombre' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Apellido' })
  @IsNotEmpty()
  @IsString()
  apellido: string;

  @ApiProperty({ description: 'Contraseña' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
