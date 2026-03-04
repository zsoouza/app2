import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalsService } from '../goals/goals.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private goalsService: GoalsService,
  ) {}

  async getToday(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 86400000);

    const [sessionsToday, goalsProgress, subjectSummary, recentTopics] = await Promise.all([
      // Sessões de hoje
      this.prisma.studySession.findMany({
        where: { userId, startTime: { gte: startOfDay, lt: endOfDay } },
        include: { subject: true, topic: true, note: true },
        orderBy: { startTime: 'asc' },
      }),

      // Progresso das metas
      this.goalsService.getProgress(userId),

      // Tempo total por matéria (últimos 7 dias — para "sugestões")
      this.prisma.studySession.groupBy({
        by: ['subjectId'],
        where: {
          userId,
          startTime: { gte: new Date(Date.now() - 7 * 86400000) },
          durationMinutes: { not: null },
        },
        _sum: { durationMinutes: true },
        orderBy: { _sum: { durationMinutes: 'asc' } }, // Menos estudadas primeiro
      }),

      // Últimos tópicos estudados (sugestões de continuidade)
      this.prisma.studySession.findMany({
        where: { userId, topicId: { not: null } },
        include: { topic: true, subject: true },
        orderBy: { startTime: 'desc' },
        take: 5,
        distinct: ['topicId'],
      }),
    ]);

    const minutesToday = sessionsToday.reduce(
      (acc, s) => acc + (s.durationMinutes ?? 0),
      0,
    );

    return {
      date: startOfDay.toISOString().split('T')[0],
      minutesToday,
      sessionsToday: sessionsToday.length,
      sessions: sessionsToday,
      goals: goalsProgress,
      suggestions: {
        recentTopics: recentTopics.map((s) => ({
          topicId: s.topicId,
          topicName: s.topic?.name,
          subjectName: s.subject.name,
          lastStudied: s.startTime,
        })),
        // Matérias com menos tempo nos últimos 7 dias (precisam de atenção)
        subjectsByMinutes: subjectSummary.map((s) => ({
          subjectId: s.subjectId,
          totalMinutes: s._sum.durationMinutes ?? 0,
        })),
      },
    };
  }

  async getStats(userId: string, days = 30) {
    const since = new Date(Date.now() - days * 86400000);

    const [bySubject, dailyTotals] = await Promise.all([
      this.prisma.studySession.groupBy({
        by: ['subjectId'],
        where: { userId, startTime: { gte: since }, durationMinutes: { not: null } },
        _sum: { durationMinutes: true },
        _count: true,
      }),

      // Minutos por dia
      this.prisma.$queryRaw<{ date: string; minutes: number }[]>`
        SELECT
          DATE("startTime") as date,
          SUM("durationMinutes") as minutes
        FROM study_sessions
        WHERE "userId" = ${userId}
          AND "startTime" >= ${since}
          AND "durationMinutes" IS NOT NULL
        GROUP BY DATE("startTime")
        ORDER BY date ASC
      `,
    ]);

    return {
      period: { days, since: since.toISOString() },
      bySubject,
      dailyTotals,
    };
  }
}
