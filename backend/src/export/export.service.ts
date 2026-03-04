import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Gera Markdown com todas as sessões + notas de um tópico ou matéria.
   */
  async generateMarkdown(
    userId: string,
    type: 'subject' | 'topic',
    id: string,
  ): Promise<string> {
    const data = await this.fetchData(userId, type, id);
    return this.buildMarkdown(data);
  }

  /**
   * Gera PDF e escreve no WriteStream fornecido.
   */
  async generatePdf(
    userId: string,
    type: 'subject' | 'topic',
    id: string,
    stream: NodeJS.WritableStream,
  ): Promise<void> {
    const data = await this.fetchData(userId, type, id);
    const markdown = this.buildMarkdown(data);

    // Gera PDF simples com PDFKit (conteúdo em texto)
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(stream);

    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text(data.title, { align: 'center' })
      .moveDown();

    doc.font('Helvetica').fontSize(11).text(markdown, { lineBreak: true });

    doc.end();
  }

  private async fetchData(userId: string, type: 'subject' | 'topic', id: string) {
    if (type === 'topic') {
      const topic = await this.prisma.topic.findFirst({
        where: { id, subject: { userId } },
        include: {
          subject: true,
          sessions: {
            include: { note: true },
            orderBy: { startTime: 'asc' },
          },
        },
      });
      if (!topic) throw new NotFoundException('Assunto não encontrado');

      return {
        title: `${topic.subject.name} — ${topic.name}`,
        sections: [
          {
            heading: topic.name,
            sessions: topic.sessions,
          },
        ],
      };
    }

    // type === 'subject'
    const subject = await this.prisma.subject.findFirst({
      where: { id, userId },
      include: {
        topics: {
          include: {
            sessions: {
              include: { note: true },
              orderBy: { startTime: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
        // Sessões sem tópico
        sessions: {
          where: { topicId: null },
          include: { note: true },
          orderBy: { startTime: 'asc' },
        },
      },
    });
    if (!subject) throw new NotFoundException('Matéria não encontrada');

    const sections = subject.topics.map((t) => ({
      heading: t.name,
      sessions: t.sessions,
    }));

    if (subject.sessions.length > 0) {
      sections.push({ heading: 'Sem assunto específico', sessions: subject.sessions });
    }

    return { title: subject.name, sections };
  }

  private buildMarkdown(data: {
    title: string;
    sections: { heading: string; sessions: any[] }[];
  }): string {
    const lines: string[] = [`# ${data.title}`, ''];

    for (const section of data.sections) {
      lines.push(`## ${section.heading}`, '');

      for (const session of section.sessions) {
        const date = new Date(session.startTime).toLocaleDateString('pt-BR');
        const duration = session.durationMinutes ? `${session.durationMinutes} min` : 'em andamento';
        const typeLabel: Record<string, string> = {
          TEORIA: 'Teoria',
          EXERCICIOS: 'Exercícios',
          REVISAO: 'Revisão',
        };

        lines.push(`### ${date} — ${typeLabel[session.type] ?? session.type} (${duration})`);

        if (session.note) {
          if (session.note.content) {
            lines.push('', '**O que aprendi:**', session.note.content);
          }
          if (session.note.keyPoints) {
            lines.push('', '**Pontos-chave:**', session.note.keyPoints);
          }
          if (session.note.difficulties) {
            lines.push('', '**Dificuldades:**', session.note.difficulties);
          }
        } else {
          lines.push('', '_Nenhuma anotação registrada._');
        }

        lines.push('', '---', '');
      }
    }

    return lines.join('\n');
  }
}
