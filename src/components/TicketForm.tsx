import React, { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';
import { getAtendentes, createTicket, createSolicitacao } from '../lib/supabase';
import type { Atendente, TicketFormData, Usuario } from '../types';

interface TicketFormProps {
  user: Usuario;
}

export function TicketForm({ user }: TicketFormProps) {
  const [atendentes, setAtendentes] = useState<Atendente[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<TicketFormData>({
    atendente_id: '',
    matricula: '',
    nome: '',
    valor: '',
    qtd_mensalidades: '',
    telefone: '',
    categoria: 'Link',
  });

  useEffect(() => {
    loadAtendentes();
  }, []);

  const loadAtendentes = async () => {
    try {
      const data = await getAtendentes();
      setAtendentes(data);
    } catch (err) {
      console.error('Erro ao carregar atendentes:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.atendente_id || !formData.matricula || !formData.nome || !formData.valor || !formData.qtd_mensalidades || !formData.telefone) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Criar ticket no Supabase
      const ticketData = {
        atendente_id: formData.atendente_id,
        matricula: formData.matricula,
        nome: formData.nome,
        valor: parseFloat(formData.valor),
        qtd_mensalidades: parseInt(formData.qtd_mensalidades),
        telefone: formData.telefone,
        categoria: formData.categoria,
      };

      await createTicket(ticketData);

      const newTicket = await createTicket(ticketData);

      // Se for equipe Ligação e categoria Link, criar solicitação para aprovação
      if (user.equipe === 'ligacao' && formData.categoria === 'Link') {
        await createSolicitacao(newTicket.id);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        // Para categoria Pix, enviar direto para webhook
        const atendente = atendentes.find(a => a.id === formData.atendente_id);
        const atendenteNome = atendente?.nome || '';

        const webhookUrl = `http://fuzymc.com.br:5678/webhook/trello-ctn?atendente=${encodeURIComponent(atendenteNome)}&matricula=${encodeURIComponent(formData.matricula)}&nome=${encodeURIComponent(formData.nome)}&valor=${formData.valor}&qtd=${formData.qtd_mensalidades}&telefone=${formData.telefone}&categoria=${formData.categoria}`;
        
        await fetch(webhookUrl, {
          method: 'GET',
          mode: 'no-cors'
        });

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }

      setFormData({
        atendente_id: '',
        matricula: '',
        nome: '',
        valor: '',
        qtd_mensalidades: '',
        telefone: '',
        categoria: 'Link',
      });
    } catch (err) {
      console.error('Erro ao criar ticket:', err);
      setError('Erro ao criar ticket. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
          <h2 className="text-2xl font-bold text-white">Novo Ticket</h2>
          <p className="text-blue-100 mt-1">Preencha os dados para criar um novo ticket</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>
                {user.equipe === 'whatsapp' && formData.categoria === 'Link' 
                  ? 'Ticket criado! Aguardando aprovação para envio.'
                  : 'Ticket criado com sucesso!'
                }
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Atendente *
              </label>
              <select
                value={formData.atendente_id}
                onChange={(e) => handleInputChange('atendente_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                required
              >
                <option value="">Selecione um atendente</option>
                {atendentes.map((atendente) => (
                  <option key={atendente.id} value={atendente.id}>
                    {atendente.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Matrícula *
              </label>
              <input
                type="text"
                value={formData.matricula}
                onChange={(e) => handleInputChange('matricula', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Digite a matrícula"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Valor *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => handleInputChange('valor', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="0,00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qtd. Mensalidades *
              </label>
              <input
                type="number"
                min="1"
                value={formData.qtd_mensalidades}
                onChange={(e) => handleInputChange('qtd_mensalidades', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value as 'Link' | 'Pix')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                required
              >
                <option value="Link">Link</option>
                <option value="Pix">Pix</option>
              </select>
              {user.equipe === 'whatsapp' && formData.categoria === 'Link' && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Links da equipe Ligação passam por aprovação da equipe WhatsApp antes do envio
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>{loading ? 'Criando...' : 'Criar Ticket'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
