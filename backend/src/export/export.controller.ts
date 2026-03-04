import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExportService } from './export.service';

type ExportFormat = 'pdf' | 'md';

@ApiTags('export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('subject/:id')
  @ApiOperation({ summary: 'Exportar matéria inteira (PDF ou Markdown)' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'md'], required: false })
  async exportSubject(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Query('format') format: ExportFormat = 'md',
    @Res() res: Response,
  ) {
    return this.sendExport(res, user.id, 'subject', id, format);
  }

  @Get('topic/:id')
  @ApiOperation({ summary: 'Exportar assunto específico (PDF ou Markdown)' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'md'], required: false })
  async exportTopic(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Query('format') format: ExportFormat = 'md',
    @Res() res: Response,
  ) {
    return this.sendExport(res, user.id, 'topic', id, format);
  }

  private async sendExport(
    res: Response,
    userId: string,
    type: 'subject' | 'topic',
    id: string,
    format: ExportFormat,
  ) {
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="nexus-${type}-${id}.pdf"`);
      await this.exportService.generatePdf(userId, type, id, res);
    } else {
      const md = await this.exportService.generateMarkdown(userId, type, id);
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="nexus-${type}-${id}.md"`);
      res.send(md);
    }
  }
}
