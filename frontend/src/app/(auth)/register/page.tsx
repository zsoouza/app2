"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface RegisterForm { name: string; email: string; password: string; }

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    try {
      const res = await authApi.register(data);
      login(res.data.user, res.data.token);
      router.push("/today");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao criar conta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">Nexus Study</h1>
          <p className="text-gray-500 mt-1">Crie sua conta gratuita</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nome" placeholder="João Silva" {...register("name", { required: true })} />
          <Input label="E-mail" type="email" placeholder="seu@email.com" {...register("email", { required: true })} />
          <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" {...register("password", { required: true, minLength: 6 })} />
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full" loading={isSubmitting}>Criar conta</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}