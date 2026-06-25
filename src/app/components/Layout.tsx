import { Activity, PlusCircle, History, CalendarDays } from 'lucide-react';
import { Dashboard } from '../pages/Dashboard';
import { CalendarLog } from '../pages/CalendarLog';
import { Trigger } from '../pages/Trigger';
import { History as HistoryPage } from '../pages/History';
import { useState } from 'react';

export function Layout() {
  // 🚀 O SEGREDO: Controlamos as abas puramente por estado do React.
  // Sem alterar a URL, o Android não congela o canal de dados!
  const [abaAtiva, setAbaAtiva] = useState('/');

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100 max-w-md mx-auto relative shadow-2xl overflow-hidden sm:border-x sm:border-slate-200">
      
      {/* Conteúdo das páginas gerenciado por abas invisíveis */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className={abaAtiva === '/' ? 'block' : 'hidden'}>
          <Dashboard />
        </div>

        <div className={abaAtiva === '/calendar' ? 'block' : 'hidden'}>
          <CalendarLog />
        </div>

        <div className={abaAtiva === '/trigger' ? 'block' : 'hidden'}>
          <Trigger />
        </div>

        <div className={abaAtiva === '/history' ? 'block' : 'hidden'}>
          <HistoryPage />
        </div>
      </main>
      
      {/* Menu Inferior usando botões normais com o mesmo estilo do seu NavLink */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-5 py-3 flex justify-between items-center z-50 pb-safe">
        
        {/* Aba Dashboard */}
        <button 
          onClick={() => setAbaAtiva('/')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${abaAtiva === '/' ? 'text-teal-600' : 'text-slate-400 hover:text-teal-500'}`}
        >
          <Activity size={24} strokeWidth={abaAtiva === '/' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Dashboard</span>
        </button>
        
        {/* Aba Log */}
        <button 
          onClick={() => setAbaAtiva('/calendar')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${abaAtiva === '/calendar' ? 'text-teal-600' : 'text-slate-400 hover:text-teal-500'}`}
        >
          <CalendarDays size={24} strokeWidth={abaAtiva === '/calendar' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Log</span>
        </button>

        {/* Aba Record (Central) */}
        <button 
          onClick={() => setAbaAtiva('/trigger')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all duration-300 relative ${abaAtiva === '/trigger' ? 'text-blue-700 transform -translate-y-2' : 'text-slate-400 hover:text-blue-600'}`}
        >
          <div className={`p-3.5 rounded-full shadow-sm ${abaAtiva === '/trigger' ? 'bg-blue-100 shadow-blue-100/50' : 'bg-slate-50 border border-slate-100'}`}>
            <PlusCircle size={28} className={abaAtiva === '/trigger' ? "text-blue-700" : ""} strokeWidth={abaAtiva === '/trigger' ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-medium transition-opacity ${abaAtiva === '/trigger' ? 'opacity-100' : 'opacity-0'} absolute -bottom-3`}>
            Record
          </span>
        </button>
        
        {/* Aba History */}
        <button 
          onClick={() => setAbaAtiva('/history')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${abaAtiva === '/history' ? 'text-teal-600' : 'text-slate-400 hover:text-teal-500'}`}
        >
          <History size={24} strokeWidth={abaAtiva === '/history' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">History</span>
        </button>
      </nav>
    </div>
  );
}