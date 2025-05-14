import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginAuthDto {
  @ApiProperty({ description: 'Nombre de usuario' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'Contraseña' })
  @IsNotEmpty()
  @IsString()
  password: string;
}