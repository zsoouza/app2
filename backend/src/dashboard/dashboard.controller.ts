import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('today')
  @ApiOperation({ summary: 'Dados do dia: sessões, progresso de metas e sugestões' })
  getToday(@CurrentUser() user: { id: string }) {
    return this.dashboardService.getToday(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas gerais (tempo por matéria, histórico diário)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getStats(
    @CurrentUser() user: { id: string },
    @Query('days') days?: string,
  ) {
    return this.dashboardService.getStats(user.id, days ? parseInt(days) : 30);
  }
}
