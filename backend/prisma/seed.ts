import { PrismaClient, SessionType, GoalType, GoalPeriod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Cria usuário de demonstração
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@nexusstudy.com' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'demo@nexusstudy.com',
      passwordHash,
    },
  });

  // Cria matérias
  const math = await prisma.subject.upsert({
    where: { userId_name: { userId: user.id, name: 'Matemática' } },
    update: {},
    create: { userId: user.id, name: 'Matemática' },
  });

  const port = await prisma.subject.upsert({
    where: { userId_name: { userId: user.id, name: 'Português' } },
    update: {},
    create: { userId: user.id, name: 'Português' },
  });

  // Cria assuntos
  const funcoes = await prisma.topic.upsert({
    where: { subjectId_name: { subjectId: math.id, name: 'Funções' } },
    update: {},
    create: { subjectId: math.id, name: 'Funções' },
  });

  const trig = await prisma.topic.upsert({
    where: { subjectId_name: { subjectId: math.id, name: 'Trigonometria' } },
    update: {},
    create: { subjectId: math.id, name: 'Trigonometria' },
  });

  const gram = await prisma.topic.upsert({
    where: { subjectId_name: { subjectId: port.id, name: 'Gramática' } },
    update: {},
    create: { subjectId: port.id, name: 'Gramática' },
  });

  // Cria uma sessão de exemplo com nota
  const session = await prisma.studySession.create({
    data: {
      userId: user.id,
      subjectId: math.id,
      topicId: funcoes.id,
      type: SessionType.TEORIA,
      startTime: new Date(Date.now() - 50 * 60 * 1000),
      endTime: new Date(),
      durationMinutes: 50,
      note: {
        create: {
          content: 'Estudei funções de 1º e 2º grau. Entendi o conceito de domínio e imagem.',
          difficulties: 'Tive dificuldade com funções compostas.',
          keyPoints: 'f(x) = ax + b (1º grau); f(x) = ax² + bx + c (2º grau); vértice = (-b/2a, -Δ/4a)',
        },
      },
    },
  });

  // Cria metas
  await prisma.goal.createMany({
    data: [
      { userId: user.id, type: GoalType.DAILY_MINUTES, targetValue: 90, period: GoalPeriod.DAILY },
      { userId: user.id, type: GoalType.WEEKLY_SESSIONS, targetValue: 10, period: GoalPeriod.WEEKLY },
    ],
    skipDuplicates: true,
  });

  console.log('Seed concluído!');
  console.log(`Usuário demo: demo@nexusstudy.com / demo1234`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
