import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async create(sessionId: string, userId: string, dto: CreateNoteDto) {
    // Garante que a sessão pertence ao usuário
    const session = await this.prisma.studySession.findFirst({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException('Sessão não encontrada');

    const existing = await this.prisma.note.findUnique({ where: { sessionId } });
    if (existing) throw new ConflictException('Nota já existe para essa sessão');

    return this.prisma.note.create({ data: { sessionId, ...dto } });
  }

  async findBySession(sessionId: string, userId: string) {
    const session = await this.prisma.studySession.findFirst({ where: { id: sessionId, userId } });
    if (!session) throw new NotFoundException('Sessão não encontrada');

    return this.prisma.note.findUnique({ where: { sessionId } });
  }

  async update(sessionId: string, userId: string, dto: Partial<CreateNoteDto>) {
    const session = await this.prisma.studySession.findFirst({ where: { id: sessionId, userId } });
    if (!session) throw new ForbiddenException();

    return this.prisma.note.update({ where: { sessionId }, data: dto });
  }
}
