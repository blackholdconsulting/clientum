// lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: number
          nombre: string
          email: string
          nif: string
          domicilio: string
          razon_social: string
          localidad: string
          provincia: string
          pais: string
          telefono: number | null
          codigo_postal: number | null
          created_at: string
        }
        Insert: {
          nombre: string
          email: string
          nif: string
          domicilio: string
          razon_social: string
          localidad: string
          provincia: string
          pais: string
          telefono?: number | null
          codigo_postal?: number | null
        }
        Update: Partial<Database['public']['Tables']['clientes']['Insert']>
      }

      licenses: {
        Row: {
          key: string
          created_at: string
        }
        Insert: {
          key: string
        }
        Update: Partial<Database['public']['Tables']['licenses']['Insert']>
      }

      facturas: {
        Row: {
          id: string
          user_id: string
          cliente_id: string
          numero: string | null
          fecha_emisor: string
          fecha_vencim: string | null
          concepto: string
          base_imponib: number
          iva_percent: number
          iva_total: number
          total: number
          estado: 'borrador' | 'emitida' | 'pagada' | 'vencida'
          json_factura: Record<string, any> | null
          enlace_pdf: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          cliente_id: string
          numero?: string
          fecha_emisor: string
          fecha_vencim?: string | null
          concepto: string
          base_imponib: number
          iva_percent: number
          iva_total: number
          total: number
          estado: 'borrador' | 'emitida' | 'pagada' | 'vencida'
          json_factura?: Record<string, any> | null
          enlace_pdf?: string | null
        }
        Update: Partial<Database['public']['Tables']['facturas']['Insert']>
      }

      empleados: {
        Row: {
          id: number
          first_name: string
          last_name: string
          email: string
          position: string
          salary: number
          status: string
          hired_at: string
        }
        Insert: {
          first_name: string
          last_name: string
          email: string
          position: string
          salary: number
          status?: string
          hired_at?: string
        }
        Update: Partial<Database['public']['Tables']['empleados']['Insert']>
      }

      nominas: {
        Row: {
          id: number
          empleado_id: number
          fecha_emision: string
          salario_bruto: number
          estado: 'pendiente' | 'pagada'
          created_at: string
        }
        Insert: {
          empleado_id: number
          fecha_emision: string
          salario_bruto: number
          estado: 'pendiente' | 'pagada'
        }
        Update: Partial<Database['public']['Tables']['nominas']['Insert']>
      }

      // Tablas nuevas de CRM
      contacts: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Partial<Record<string, any>>
      }

      reservas: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Partial<Record<string, any>>
      }

      meetings: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Partial<Record<string, any>>
      }

      funnels: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Partial<Record<string, any>>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
