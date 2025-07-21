export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
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
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
