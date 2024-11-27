import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class UserService {
constructor( private readonly prisma:PrismaService ) {

}

  async create(createUserDto: CreateUserDto) {
    const {password, ...user} = createUserDto
    const hashedPassword = await hash(password)
    return await this.prisma.user.create({
      data:{
        password: hashedPassword,
        ...user
      }
    })
  }

  async findByEmail(email:string) {
    this.prisma.user.findUnique({
      where: {
        email,
      }
    })
  }
}
