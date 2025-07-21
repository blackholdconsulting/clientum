'use client'

import { useState } from 'react'

export default function ClientesPage() {
  const [search, setSearch] = useState('')
  const [clientes, setClientes] = useState([
    { id: 1, nombre: 'Juan Pérez', email: 'juan@example.com' },
    { id: 2, nombre: 'María Gómez', email: 'maria@example.com' },
    { id: 3, nombre: 'Carlos Ruiz', email: 'carlos@example.com' }
  ])

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder="Buscar cliente por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button>Nuevo cliente</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientesFiltrados.map((cliente) => (
          <Card key={cliente.id}>
            <CardHeader>
              <CardTitle>{cliente.nombre}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{cliente.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
