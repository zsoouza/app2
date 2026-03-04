import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';

@ApiTags('subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as matérias do usuário' })
  findAll(@CurrentUser() user: { id: string }) {
    return this.subjectsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de uma matéria (com tópicos)' })
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.subjectsService.findOne(id, user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova matéria' })
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateSubjectDto) {
    return this.subjectsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: Partial<CreateSubjectDto>,
  ) {
    return this.subjectsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.subjectsService.remove(id, user.id);
  }
}
