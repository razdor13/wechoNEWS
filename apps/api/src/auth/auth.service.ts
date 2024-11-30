import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserService } from 'src/user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { verify } from 'argon2';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService : JwtService) {}
  async registerUser(createUserDto: CreateUserDto) {
    const user = await this.userService.findByEmail(createUserDto.email);
    if (user) throw new ConflictException('User already exists!');
    return this.userService.create(createUserDto);
  }

  async validateLocalUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    
    if (!user) throw new UnauthorizedException('User not found!');
    const isPasswordMatched = await verify(user.password, password);
    console.log(isPasswordMatched)
    if (!isPasswordMatched)throw new UnauthorizedException('Invalid Credentials!');
      

    return { id: user.id, name: user.name};
  }

  async login(userId:number,name?:string) {
    const {accessToken} = await this.generateTokens(userId)
    return {
      id : userId,
      name : name,
      accessToken
    }
  }

  async generateTokens(userId:number){
    const payload: AuthJwtPayload = {sub:userId}
    const [accessToken] = await Promise.all([
      this.jwtService.signAsync(payload)
    ])
    return {
      accessToken
    }
  }
}
