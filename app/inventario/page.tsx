"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Producto {
  id: number;
  codigo_barras: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export default function InventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(0);
  const [cantidad, setCantidad] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchProductos(user.id);
      }
    };
    loadUser();
  }, []);

  const fetchProductos = async (uid: string) => {
    const { data } = await supabase.from("productos").select("*").eq("user_id", uid);
    setProductos(data || []);
  };

  const addProducto = async () => {
    if (!userId) return;
    await supabase.from("productos").insert([{ codigo_barras: codigo, nombre, precio, cantidad, user_id: userId }]);
    setCodigo("");
    setNombre("");
    setPrecio(0);
    setCantidad(0);
    fetchProductos(userId);
  };

  const venderProducto = async (id: number, precio: number) => {
    if (!userId) return;

    const producto = productos.find((p) => p.id === id);
    if (!producto || producto.cantidad <= 0) return;

    const nuevaCantidad = producto.cantidad - 1;

    const { error: updateError } = await supabase
      .from("productos")
      .update({ cantidad: nuevaCantidad })
      .eq("id", id)
      .eq("user_id", userId);

    if (!updateError) {
      await supabase.from("ventas").insert([{
        producto_id: id,
        cantidad: 1,
        total: precio,
        user_id: userId
      }]);
      fetchProductos(userId);
    }
  };

  const valorTotalStock = productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventario y Almacén</h1>
      <p className="mb-4 text-gray-700">Valor total en stock: <strong>{valorTotalStock.toFixed(2)} €</strong></p>

      {/* Input para código de barras */}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Código de barras"
          className="border px-2 py-1 rounded"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre del producto"
          className="border px-2 py-1 rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          type="number"
          placeholder="Precio"
          className="border px-2 py-1 rounded"
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Cantidad"
          className="border px-2 py-1 rounded"
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
        />
        <button onClick={addProducto} className="px-3 py-1 bg-green-600 text-white rounded">
          Añadir Producto
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-3 py-2">Código</th>
            <th className="border px-3 py-2">Nombre</th>
            <th className="border px-3 py-2">Cantidad</th>
            <th className="border px-3 py-2">Precio</th>
            <th className="border px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td className="border px-3 py-2">{p.codigo_barras}</td>
              <td className="border px-3 py-2">{p.nombre}</td>
              <td className="border px-3 py-2">{p.cantidad}</td>
              <td className="border px-3 py-2">{p.precio} €</td>
              <td className="border px-3 py-2">
                <button
                  onClick={() => venderProducto(p.id, p.precio)}
                  className="px-2 py-1 bg-blue-600 text-white rounded"
                >
                  Vender
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
