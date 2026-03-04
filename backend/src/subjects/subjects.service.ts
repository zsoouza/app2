import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.subject.findMany({
      where: { userId },
      include: { _count: { select: { topics: true, sessions: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, userId },
      include: { topics: { orderBy: { name: 'asc' } } },
    });
    if (!subject) throw new NotFoundException('Matéria não encontrada');
    return subject;
  }

  async create(userId: string, dto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: { userId, name: dto.name },
    });
  }

  async update(id: string, userId: string, dto: Partial<CreateSubjectDto>) {
    await this.assertOwner(id, userId);
    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.assertOwner(id, userId);
    await this.prisma.subject.delete({ where: { id } });
  }

  private async assertOwner(id: string, userId: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundException('Matéria não encontrada');
    if (subject.userId !== userId) throw new ForbiddenException();
  }
}
