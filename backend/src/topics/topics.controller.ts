import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';

@ApiTags('topics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subjects/:subjectId/topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar assuntos de uma matéria' })
  findAll(
    @Param('subjectId') subjectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.topicsService.findBySubject(subjectId, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar assunto em uma matéria' })
  create(
    @Param('subjectId') subjectId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateTopicDto,
  ) {
    return this.topicsService.create(subjectId, user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Partial<CreateTopicDto>,
  ) {
    return this.topicsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.topicsService.remove(id, user.id);
  }
}
