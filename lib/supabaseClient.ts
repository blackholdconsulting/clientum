'use client'
// lib/supabaseClient.ts

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { type SupabaseClient } from '@supabase/supabase-js'
import type { Database as DB } from './database.types'

export const createClient = () => createBrowserSupabaseClient<DB>()
export type Database = DB

export const supabase: SupabaseClient<Database> = createBrowserSupabaseClient<Database>()
