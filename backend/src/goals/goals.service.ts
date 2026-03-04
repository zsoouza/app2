import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.goal.findMany({ where: { userId } });
  }

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({ data: { userId, ...dto } });
  }

  async remove(id: string, userId: string) {
    await this.prisma.goal.deleteMany({ where: { id, userId } });
  }

  /**
   * Calcula o progresso atual de uma meta.
   * Usado pelo DashboardService.
   */
  async getProgress(userId: string) {
    const goals = await this.prisma.goal.findMany({ where: { userId } });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // Domingo

    const [dailyMinutes, weekSessions] = await Promise.all([
      // Soma minutos do dia
      this.prisma.studySession.aggregate({
        where: { userId, startTime: { gte: startOfDay }, endTime: { not: null } },
        _sum: { durationMinutes: true },
      }),
      // Conta sessões da semana
      this.prisma.studySession.count({
        where: { userId, startTime: { gte: startOfWeek }, endTime: { not: null } },
      }),
    ]);

    const minutesToday = dailyMinutes._sum.durationMinutes ?? 0;

    return goals.map((goal) => {
      const current =
        goal.type === 'DAILY_MINUTES' ? minutesToday : weekSessions;
      return {
        ...goal,
        current,
        percentage: Math.min(100, Math.round((current / goal.targetValue) * 100)),
      };
    });
  }
}
