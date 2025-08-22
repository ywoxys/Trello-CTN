import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { TicketForm } from './components/TicketForm';
import { AtendentesPanel } from './components/AtendentesPanel';
import { HistoricoTickets } from './components/HistoricoTickets';
import { UsuariosPanel } from './components/UsuariosPanel';
import { SolicitacoesPanel } from './components/SolicitacoesPanel';
import { getCurrentUser, signOut, supabase } from './lib/supabase';
import type { Usuario } from './types';

function App() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'ticket' | 'atendentes' | 'historico' | 'usuarios' | 'solicitacoes'>('ticket');

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadUser();
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      await signOut();
    }
  };

  const handleLogin = async () => {
    await loadUser();
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setCurrentView('ticket');
  };

  const renderCurrentView = () => {
    if (!user) return null;

    switch (currentView) {
      case 'ticket':
        return <TicketForm user={user} />;
      case 'atendentes':
        return user.equipe === 'supervisao' ? <AtendentesPanel /> : <div>Acesso negado</div>;
      case 'historico':
        return <HistoricoTickets />;
      case 'usuarios':
        return user.equipe === 'supervisao' ? <UsuariosPanel /> : <div>Acesso negado</div>;
      case 'solicitacoes':
        return ['whatsapp', 'supervisao', 'ligacao'].includes(user.equipe) ? <SolicitacoesPanel user={user} /> : <div>Acesso negado</div>;
      default:
        return <TicketForm user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        user={user}
        onLogout={handleLogout}
      />
      <main className="py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;