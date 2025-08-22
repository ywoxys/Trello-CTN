import { createClient } from '@supabase/supabase-js';
import type { Usuario, Solicitacao } from '../types';

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

// Funções de autenticação
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', user.email)
    .single();
  
  if (error) throw error;
  return data;
};

// Funções para usuários (apenas supervisores)
export const getUsuarios = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('nome');
  
  if (error) throw error;
  return data;
};

export const createUsuario = async (usuario: Omit<Usuario, 'id' | 'created_at'>) => {
  // Primeiro criar o usuário no auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: usuario.email,
    password: 'temp123456', // Senha temporária
    email_confirm: true,
  });
  
  if (authError) throw authError;
  
  // Depois criar o registro na tabela usuarios
  const { data, error } = await supabase
    .from('usuarios')
    .insert([usuario])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateUsuario = async (id: string, updates: Partial<Usuario>) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Funções para solicitações
export const createSolicitacao = async (ticketId: string) => {
  const { data, error } = await supabase
    .from('solicitacoes')
    .insert([{ ticket_id: ticketId }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getSolicitacoes = async () => {
  const { data, error } = await supabase
    .from('solicitacoes')
    .select(`
      *,
      ticket:tickets(*),
      aprovador:usuarios!aprovado_por(nome)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateSolicitacao = async (
  id: string, 
  status: 'aprovado' | 'rejeitado', 
  observacoes?: string,
  link?: string
) => {
  const currentUser = await getCurrentUser();
  
  const { data, error } = await supabase
    .from('solicitacoes')
    .update({
      status,
      aprovado_por: currentUser?.id,
      observacoes,
      ...(link && { link }),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};