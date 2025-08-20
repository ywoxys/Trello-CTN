import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções para atendentes
export const getAtendentes = async () => {
  const { data, error } = await supabase
    .from('atendentes')
    .select('*')
    .order('nome');
  
  if (error) throw error;
  return data;
};

export const createAtendente = async (nome: string) => {
  const { data, error } = await supabase
    .from('atendentes')
    .insert([{ nome }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteAtendente = async (id: string) => {
  const { error } = await supabase
    .from('atendentes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Funções para tickets
export const createTicket = async (ticket: Omit<Ticket, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('tickets')
    .insert([ticket])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getTickets = async () => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      atendentes (
        nome
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};