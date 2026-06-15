import { useEvents } from '../context/EventContext';
import { Download, Calendar, Activity, Heart, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Localização para português
import { Droplets } from 'lucide-react';

export function History() {
  const { events } = useEvents();

  const handleExportCSV = () => {
    // Cabeçalhos do CSV traduzidos
    const headers = ['ID', 'Horário', 'Evento', 'Movimento', 'SpO2', 'Freq. Cardíaca'];

    const rows = events.map(e => [
      e.id,
      new Date(e.timestamp).toISOString(),
      e.label,
      e.movement,
      e.spo2,
      e.heartRate
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Nome do arquivo traduzido
    link.setAttribute('download', `historico-eventos-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 pb-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Histórico</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{events.length} Eventos Registrados</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Download size={14} className="text-slate-500" />
          Exportar CSV
        </button>
      </header>

      <div className="bg-white rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Calendar size={48} className="mb-4 opacity-20 text-slate-500" />
            <p className="text-sm font-medium">Nenhum evento registrado ainda.</p>
            <p className="text-xs mt-1">Vá para a aba de Registro para começar.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {events.map((event) => (
              <li key={event.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-800 tracking-tight text-base">{event.label}</div>
                    <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock size={12} />
                      {format(new Date(event.timestamp), "d 'de' MMM, yyyy • HH:mm:ss", { locale: ptBR })}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <div className="flex-1 bg-slate-50 rounded-xl p-2.5 flex items-center justify-between border border-slate-100/50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                      <Activity size={14} />
                      Movimento
                    </div>
                    <div className="font-bold text-sm text-slate-700">{event.movement} </div>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl p-2.5 flex items-center justify-between border border-slate-100/50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500">
                      <Droplets size={14} />
                      Oxigenação
                    </div>
                    <div className="font-bold text-sm text-slate-700">{event.spo2} <span className="font-normal text-slate-400 text-[10px]">%</span></div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100/50 mt-3">
                
                  <div className="flex items-center gap-2 text-rose-500">
                    <Heart size={18} />
                    <span className="font-semibold">
                      Frequência Cardíaca
                    </span>
                  </div>

                  <div className="font-bold text-xl text-slate-700">
                    {event.heartRate}
                    <span className="ml-1 text-sm text-slate-400">
                      BPM
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}