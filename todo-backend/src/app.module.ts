import { Module } from '@nestjs/common';
import AppService from './app.service';
import AppController from './app.controller';
import UsersController from './users.controller';

@Module({
  imports: [],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
