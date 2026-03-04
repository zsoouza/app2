import { IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum GoalType {
  DAILY_MINUTES = 'DAILY_MINUTES',
  WEEKLY_SESSIONS = 'WEEKLY_SESSIONS',
}

export enum GoalPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

export class CreateGoalDto {
  @ApiProperty({ enum: GoalType })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiProperty({ example: 90, description: 'Minutos ou número de sessões' })
  @IsInt()
  @Min(1)
  targetValue: number;

  @ApiProperty({ enum: GoalPeriod })
  @IsEnum(GoalPeriod)
  period: GoalPeriod;
}
