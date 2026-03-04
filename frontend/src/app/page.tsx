import { redirect } from 'next/navigation';

// Rota raiz redireciona para o dashboard ou login
export default function RootPage() {
  redirect('/today');
}
