import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs'; 
import { UsersService } from 'src/users/application/services/users.service';
import { User } from 'src/users/domain/entities/user.entity';
import { RegisterAuthDto } from '../dto/register-auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usuariosService: UsersService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usuariosService.getUserByUsername(username);
        
        if (!user) {
            return null;
        }
        if (await bcrypt.compare(pass, user.password)) { 
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { sub: user.id, username: user.username };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(registerAuthDto: RegisterAuthDto): Promise<User> {
        return this.usuariosService.createUser(registerAuthDto);
    }
}