import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Matemática' })
  @IsString()
  @MinLength(1)
  name: string;
}
