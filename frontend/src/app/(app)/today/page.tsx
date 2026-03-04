"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardApi } from "@/lib/api";
import { DashboardToday } from "@/types";
import { GoalProgress } from "@/components/GoalProgress";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TodayPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardToday | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getToday().then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-gray-500 animate-pulse">Carregando...</p>;
  if (!data) return null;

  const todayLabel = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 capitalize">{todayLabel}</p>
          <h1 className="text-2xl font-bold text-gray-900">Hoje</h1>
        </div>
        <Button onClick={() => router.push("/session/new")}>
          + Novo bloco de estudo
        </Button>
      </div>

      {/* Resumo do dia */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Minutos estudados</p>
          <p className="text-3xl font-bold text-primary-600">{data.minutesToday}</p>
          <p className="text-xs text-gray-400">de hoje</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Sessões feitas</p>
          <p className="text-3xl font-bold text-primary-600">{data.sessionsToday}</p>
          <p className="text-xs text-gray-400">de hoje</p>
        </Card>
      </div>

      {/* Metas */}
      {data.goals.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-700 mb-3">Metas</h2>
          <div className="space-y-3">
            {data.goals.map((goal) => (
              <GoalProgress key={goal.id} goal={goal} />
            ))}
          </div>
        </Card>
      )}

      {/* Sessões de hoje */}
      {data.sessions.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-700 mb-3">Blocos de hoje</h2>
          <div className="space-y-2">
            {data.sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{session.subject?.name}</p>
                  {session.topic && (
                    <p className="text-xs text-gray-500">{session.topic.name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-600">
                    {session.durationMinutes ? `${session.durationMinutes} min` : "Em andamento"}
                  </p>
                  <p className="text-xs text-gray-400">{session.type}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sugestões */}
      {data.suggestions.recentTopics.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-700 mb-3">Continuar de onde parou</h2>
          <div className="space-y-2">
            {data.suggestions.recentTopics.map((s) => (
              <div key={s.topicId} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{s.topicName || s.subjectName}</p>
                  <p className="text-xs text-gray-500">{s.subjectName}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/session/new?topicId=${s.topicId}`)}
                >
                  Estudar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
