import { createClient } from '@/lib/supabase/server'
import type { TablesInsert, TablesUpdate } from '@/types/database.types'

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function createCategory(values: Omit<TablesInsert<'categories'>, 'user_id'>) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('categories')
    .insert({ ...values, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCategory(id: string, values: TablesUpdate<'categories'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}
