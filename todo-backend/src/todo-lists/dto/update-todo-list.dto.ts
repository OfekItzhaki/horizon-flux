import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ListType } from './create-todo-list.dto';

export class UpdateToDoListDto {
  @ApiPropertyOptional({
    description: 'Name of the to-do list',
    example: 'Updated List Name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Type of the list',
    enum: ListType,
    example: ListType.WEEKLY,
  })
  @IsEnum(ListType)
  @IsOptional()
  type?: ListType;
}
