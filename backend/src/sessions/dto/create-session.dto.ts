import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SessionType {
  TEORIA = 'TEORIA',
  EXERCICIOS = 'EXERCICIOS',
  REVISAO = 'REVISAO',
}

export class CreateSessionDto {
  @ApiProperty()
  @IsString()
  subjectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topicId?: string;

  @ApiProperty({ enum: SessionType })
  @IsEnum(SessionType)
  type: SessionType;

  @ApiPropertyOptional({ description: 'ISO timestamp — padrão: agora' })
  @IsOptional()
  @IsDateString()
  startTime?: string;
}
