"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { subjectsApi, topicsApi, exportApi } from "@/lib/api";
import { Subject, Topic } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SubjectPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicName, setNewTopicName] = useState("");

  useEffect(() => {
    subjectsApi.get(subjectId).then((res) => setSubject(res.data));
    topicsApi.list(subjectId).then((res) => setTopics(res.data));
  }, [subjectId]);

  const createTopic = async () => {
    if (!newTopicName.trim()) return;
    await topicsApi.create(subjectId, newTopicName.trim());
    const res = await topicsApi.list(subjectId);
    setTopics(res.data);
    setNewTopicName("");
  };

  const handleExport = async (topicId: string, format: "pdf" | "md") => {
    const res = await exportApi.topic(topicId, format);
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-topic-${topicId}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!subject) return <p className="text-gray-500 animate-pulse">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.push("/notebook")}
          className="text-sm text-gray-500 hover:text-primary-600 mb-2"
        >
          ← Caderno
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Novo assunto..."
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createTopic()}
        />
        <Button onClick={createTopic} size="sm">Criar</Button>
      </div>

      {topics.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400">Nenhum assunto ainda. Crie o primeiro acima.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => router.push(`/notebook/${subjectId}/${topic.id}`)}
                >
                  <h2 className="font-medium text-gray-900">{topic.name}</h2>
                  <Badge className="mt-1">{topic._count?.sessions ?? 0} sessões</Badge>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="ghost" onClick={() => handleExport(topic.id, "md")}>
                    .md
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleExport(topic.id, "pdf")}>
                    PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
