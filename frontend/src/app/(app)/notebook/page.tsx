"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { subjectsApi } from "@/lib/api";
import { Subject } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { exportApi } from "@/lib/api";

export default function NotebookPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    subjectsApi.list().then((res) => { setSubjects(res.data); setLoading(false); });
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await subjectsApi.create(newName.trim());
    const res = await subjectsApi.list();
    setSubjects(res.data);
    setNewName("");
  };

  const handleExport = async (id: string, format: "pdf" | "md") => {
    const res = await exportApi.subject(id, format);
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexus-subject-${id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-gray-500 animate-pulse">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Caderno</h1>
        <div className="flex gap-2">
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Nova matéria..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} size="sm">Criar</Button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400">Nenhuma matéria criada ainda.</p>
          <p className="text-sm text-gray-400 mt-1">Crie sua primeira matéria acima.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => router.push(`/notebook/${subject.id}`)}
                >
                  <h2 className="font-semibold text-gray-900">{subject.name}</h2>
                  <div className="flex gap-2 mt-1">
                    <Badge>{subject._count?.topics ?? 0} assuntos</Badge>
                    <Badge variant="secondary">{subject._count?.sessions ?? 0} sessões</Badge>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="ghost" onClick={() => handleExport(subject.id, "md")}>
                    .md
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleExport(subject.id, "pdf")}>
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
