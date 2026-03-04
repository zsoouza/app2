import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { FinishSessionDto } from './dto/finish-session.dto';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar sessões (com filtros opcionais)' })
  @ApiQuery({ name: 'subjectId', required: false })
  @ApiQuery({ name: 'topicId', required: false })
  findAll(
    @CurrentUser() user: { id: string },
    @Query('subjectId') subjectId?: string,
    @Query('topicId') topicId?: string,
  ) {
    return this.sessionsService.findAll(user.id, { subjectId, topicId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma sessão' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.sessionsService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Iniciar nova sessão de estudo' })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(user.id, dto);
  }

  @Patch(':id/finish')
  @ApiOperation({ summary: 'Finalizar sessão e registrar nota pós-bloco' })
  finish(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: FinishSessionDto,
  ) {
    return this.sessionsService.finish(id, user.id, dto);
  }
}
