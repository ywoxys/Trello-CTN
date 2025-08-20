import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { TicketForm } from './components/TicketForm';
import { AtendentesPanel } from './components/AtendentesPanel';
import { HistoricoTickets } from './components/HistoricoTickets';

function App() {
  const [currentView, setCurrentView] = useState<'ticket' | 'atendentes' | 'historico'>('ticket');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'ticket':
        return <TicketForm />;
      case 'atendentes':
        return <AtendentesPanel />;
      case 'historico':
        return <HistoricoTickets />;
      default:
        return <TicketForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="py-8">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;