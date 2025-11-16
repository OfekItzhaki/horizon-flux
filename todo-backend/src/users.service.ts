import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from './prisma.service';

@Injectable()
class UsersService {
    constructor(private prisma: PrismaService) {}

    getAllUsers() {
        return this.prisma.user.findMany();
    }

    async getUser(id: number) {
        this.prisma.user.findUnique({ where: { id } });
    }

    async createUser(data: CreateUserDto) {
        this.prisma.user.create({ data });
    }
}
export default UsersService;

