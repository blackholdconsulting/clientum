// components/Header.tsx
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Clientum</h1>
        <nav className="flex gap-4 text-indigo-600">
          <Link href="/">📊 Dashboard</Link>
          <Link href="/clientes">👥 Clientes</Link>
          <Link href="/facturas">📄 Facturas</Link>
          <Link href="/contabilidad">📊 Contabilidad</Link>
          <Link href="/chat-ia">💬 Chat IA</Link>
        </nav>
      </div>
    </header>
  );
}
