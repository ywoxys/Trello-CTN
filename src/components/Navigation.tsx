import React from 'react';
import { Users, FileText, Home } from 'lucide-react';

interface NavigationProps {
  currentView: 'ticket' | 'atendentes' | 'historico';
  onViewChange: (view: 'ticket' | 'atendentes' | 'historico') => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'ticket' as const, label: 'Novo Ticket', icon: FileText },
    { id: 'atendentes' as const, label: 'Atendentes', icon: Users },
    { id: 'historico' as const, label: 'Histórico', icon: Home },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Sistema de Tickets</h1>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}