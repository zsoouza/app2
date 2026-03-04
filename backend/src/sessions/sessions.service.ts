import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { FinishSessionDto } from './dto/finish-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateSessionDto) {
    // Valida que o subject pertence ao usuário
    const subject = await this.prisma.subject.findFirst({
      where: { id: dto.subjectId, userId },
    });
    if (!subject) throw new NotFoundException('Matéria não encontrada');

    return this.prisma.studySession.create({
      data: {
        userId,
        subjectId: dto.subjectId,
        topicId: dto.topicId,
        type: dto.type,
        startTime: dto.startTime ? new Date(dto.startTime) : new Date(),
      },
      include: { subject: true, topic: true },
    });
  }

  async finish(id: string, userId: string, dto: FinishSessionDto) {
    const session = await this.assertOwner(id, userId);
    if (session.endTime) throw new BadRequestException('Sessão já finalizada');

    const endTime = dto.endTime ? new Date(dto.endTime) : new Date();
    const durationMinutes = Math.round(
      (endTime.getTime() - session.startTime.getTime()) / 60000,
    );

    // Atualiza a sessão e cria a nota em uma transaction
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.studySession.update({
        where: { id },
        data: { endTime, durationMinutes },
        include: { subject: true, topic: true },
      });

      // Cria nota se houver conteúdo
      if (dto.content) {
        await tx.note.create({
          data: {
            sessionId: id,
            content: dto.content,
            difficulties: dto.difficulties,
            keyPoints: dto.keyPoints,
          },
        });
      }

      return updated;
    });
  }

  async findAll(
    userId: string,
    filters: { subjectId?: string; topicId?: string },
  ) {
    return this.prisma.studySession.findMany({
      where: {
        userId,
        ...(filters.subjectId && { subjectId: filters.subjectId }),
        ...(filters.topicId && { topicId: filters.topicId }),
      },
      include: { subject: true, topic: true, note: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    return this.assertOwner(id, userId);
  }

  private async assertOwner(id: string, userId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: { id, userId },
      include: { subject: true, topic: true, note: true },
    });
    if (!session) throw new NotFoundException('Sessão não encontrada');
    return session;
  }
}
