import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FinishSessionDto {
  @ApiPropertyOptional({ description: 'ISO timestamp — padrão: agora' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  // Nota pós-bloco (criada junto com o fim da sessão)
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  difficulties?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keyPoints?: string;
}
