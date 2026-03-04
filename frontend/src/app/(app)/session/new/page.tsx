"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { subjectsApi, topicsApi, sessionsApi } from "@/lib/api";
import { Subject, Topic } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Timer } from "@/components/Timer";

interface SessionForm {
  subjectId: string;
  topicId: string;
  type: "TEORIA" | "EXERCICIOS" | "REVISAO";
}

export default function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<SessionForm>({
    defaultValues: { type: "TEORIA" },
  });

  const selectedSubject = watch("subjectId");

  useEffect(() => {
    subjectsApi.list().then((res) => setSubjects(res.data));
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      topicsApi.list(selectedSubject).then((res) => setTopics(res.data));
    }
  }, [selectedSubject]);

  const startSession = async (data: SessionForm) => {
    const res = await sessionsApi.create({
      subjectId: data.subjectId,
      topicId: data.topicId || undefined,
      type: data.type,
    });
    setSessionId(res.data.id);
    setStarted(true);
  };

  const finishSession = () => {
    if (sessionId) router.push(`/session/${sessionId}/post`);
  };

  const typeLabels = { TEORIA: "Teoria", EXERCICIOS: "Exercícios", REVISAO: "Revisão" };

  if (started && sessionId) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">Bloco em andamento</h1>
        <Card className="text-center">
          <Timer onFinish={finishSession} />
          <Button variant="outline" className="mt-6" onClick={finishSession}>
            Encerrar bloco
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Novo bloco de estudo</h1>

      <Card>
        <form onSubmit={handleSubmit(startSession)} className="space-y-4">
          {/* Matéria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matéria *</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...register("subjectId", { required: true })}
            >
              <option value="">Selecione a matéria...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Assunto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assunto (opcional)</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...register("topicId")}
              disabled={!selectedSubject}
            >
              <option value="">Nenhum / Geral</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de estudo *</label>
            <div className="grid grid-cols-3 gap-2">
              {(["TEORIA", "EXERCICIOS", "REVISAO"] as const).map((type) => (
                <label key={type} className="relative">
                  <input type="radio" value={type} {...register("type")} className="peer sr-only" />
                  <span className="block text-center py-2 px-3 border rounded-lg text-sm cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 peer-checked:text-primary-700 hover:border-gray-400 transition-colors">
                    {typeLabels[type]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>
            Iniciar bloco
          </Button>
        </form>
      </Card>
    </div>
  );
}
