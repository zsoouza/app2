import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: 'O que você aprendeu nesse bloco?' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Onde travou? O que foi difícil?' })
  @IsOptional()
  @IsString()
  difficulties?: string;

  @ApiPropertyOptional({ description: 'Fórmulas, conceitos e ideias principais' })
  @IsOptional()
  @IsString()
  keyPoints?: string;
}
