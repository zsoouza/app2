import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({ example: 'Funções do 2º Grau' })
  @IsString()
  @MinLength(1)
  name: string;
}
