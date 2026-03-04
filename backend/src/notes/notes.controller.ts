import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions/:sessionId/note')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @ApiOperation({ summary: 'Obter nota de uma sessão' })
  findOne(@Param('sessionId') sessionId: string, @CurrentUser() user: { id: string }) {
    return this.notesService.findBySession(sessionId, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nota para uma sessão' })
  create(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(sessionId, user.id, dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar nota de uma sessão' })
  update(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Partial<CreateNoteDto>,
  ) {
    return this.notesService.update(sessionId, user.id, dto);
  }
}
