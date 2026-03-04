"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sessionsApi, exportApi } from "@/lib/api";
import { StudySession } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const typeLabel: Record<string, string> = {
  TEORIA: "Teoria",
  EXERCICIOS: "Exercícios",
  REVISAO: "Revisão",
};

export default function TopicPage() {
  const { subjectId, topicId } = useParams<{ subjectId: string; topicId: string }>();
  const router = useRouter();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsApi
      .list({ subjectId, topicId })
      .then((res) => { setSessions(res.data); setLoading(false); });
  }, [subjectId, topicId]);

  const handleExport = async (format: "pdf" | "md") => {
    const res = await exportApi.topic(topicId, format);
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-topic-${topicId}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-gray-500 animate-pulse">Carregando...</p>;

  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push(`/notebook/${subjectId}`)}
          className="text-sm text-gray-500 hover:text-primary-600 mb-2"
        >
          ← Voltar
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {sessions[0]?.topic?.name || "Assunto"}
            </h1>
            <p className="text-sm text-gray-500">
              {sessions.length} sessões · {totalMinutes} min totais
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleExport("md")}>
              Exportar .md
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleExport("pdf")}>
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400">Nenhuma sessão registrada neste assunto.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2 items-center">
                  <Badge variant="primary">{typeLabel[session.type]}</Badge>
                  <span className="text-sm text-gray-500">
                    {format(new Date(session.startTime), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </span>
                </div>
                {session.durationMinutes && (
                  <span className="text-sm font-medium text-primary-600">
                    {session.durationMinutes} min
                  </span>
                )}
              </div>

              {session.note ? (
                <div className="space-y-2">
                  {session.note.content && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        O que aprendi
                      </p>
                      <p className="text-sm text-gray-800 mt-0.5">{session.note.content}</p>
                    </div>
                  )}
                  {session.note.keyPoints && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Pontos-chave
                      </p>
                      <p className="text-sm text-gray-800 mt-0.5">{session.note.keyPoints}</p>
                    </div>
                  )}
                  {session.note.difficulties && (
                    <div>
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                        Dificuldades
                      </p>
                      <p className="text-sm text-gray-800 mt-0.5">{session.note.difficulties}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Sem anotações registradas.</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
