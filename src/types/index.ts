export interface Atendente {
  id: string;
  nome: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  atendente_id: string;
  matricula: string;
  nome: string;
  valor: number;
  qtd_mensalidades: number;
  telefone: string;
  categoria: 'Link' | 'Pix';
  created_at: string;
}

export interface TicketFormData {
  atendente_id: string;
  matricula: string;
  nome: string;
  valor: string;
  qtd_mensalidades: string;
  telefone: string;
  categoria: 'Link' | 'Pix';
}