import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async findBySubject(subjectId: string, userId: string) {
    // Garante que a matéria pertence ao usuário
    const subject = await this.prisma.subject.findFirst({ where: { id: subjectId, userId } });
    if (!subject) throw new NotFoundException('Matéria não encontrada');

    return this.prisma.topic.findMany({
      where: { subjectId },
      include: { _count: { select: { sessions: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(subjectId: string, userId: string, dto: CreateTopicDto) {
    const subject = await this.prisma.subject.findFirst({ where: { id: subjectId, userId } });
    if (!subject) throw new NotFoundException('Matéria não encontrada');

    return this.prisma.topic.create({ data: { subjectId, name: dto.name } });
  }

  async update(id: string, userId: string, dto: Partial<CreateTopicDto>) {
    await this.assertOwner(id, userId);
    return this.prisma.topic.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);
    await this.prisma.topic.delete({ where: { id } });
  }

  private async assertOwner(topicId: string, userId: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: { subject: true },
    });
    if (!topic) throw new NotFoundException('Assunto não encontrado');
    if (topic.subject.userId !== userId) throw new ForbiddenException();
  }
}
