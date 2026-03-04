"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { sessionsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface NoteForm {
  content: string;
  keyPoints: string;
  difficulties: string;
}

export default function PostSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<NoteForm>();

  const onSubmit = async (data: NoteForm) => {
    await sessionsApi.finish(id, {
      content: data.content || undefined,
      keyPoints: data.keyPoints || undefined,
      difficulties: data.difficulties || undefined,
    });
    router.push("/today");
  };

  const skip = async () => {
    await sessionsApi.finish(id, {});
    router.push("/today");
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Como foi o bloco?</h1>
        <p className="text-gray-500 text-sm mt-1">Registre o que aprendeu para consultar depois</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* O que aprendeu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              O que você estudou/aprendeu? *
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-none"
              placeholder="Resuma o que foi visto no bloco de estudo..."
              {...register("content")}
            />
          </div>

          {/* Pontos-chave */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pontos-chave (fórmulas, conceitos, definições)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px] resize-none"
              placeholder="Escreva as ideias mais importantes..."
              {...register("keyPoints")}
            />
          </div>

          {/* Dificuldades */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dificuldades (onde travou?)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px] resize-none"
              placeholder="O que ficou dúvida? O que precisa revisar?"
              {...register("difficulties")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" loading={isSubmitting}>
              Salvar e voltar
            </Button>
            <Button type="button" variant="ghost" onClick={skip}>
              Pular
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
