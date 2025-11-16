import { Controller, Get, Post, Delete, Put, Body, Param } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import UsersService from './users.service';

@Controller('users')
class UsersController {
    constructor(private userService: UsersService) {}

    @Get()
    async getUsers() { 
        return this.userService.getAllUsers();
    }

    @Get(':id')
    async getUser(@Param('id') id: number) { 
        return this.userService.getUser(id);
    }

    @Post()
    async createUser(@Body() data: CreateUserDto) {
        return this.userService.createUser(data);
    }
}
export default UsersController;

