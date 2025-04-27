import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';

export class RegisterAuthDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string; 

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}