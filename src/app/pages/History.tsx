import { useEvents } from '../context/EventContext';
import { Download, Calendar, Activity, Heart, Clock, Droplets } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function History() {
  const { events } = useEvents();

  const handleExportCSV = () => {
    // Garante que só exporta se houver uma estrutura válida de array
    if (!Array.isArray(events)) return;

    const headers = [
      'event_id', 'timestamp_utc', 'local_date', 'local_time', 
      'event_label', 'movement_class', 'acceleration_max_g', 
      'spo2_percentage', 'heart_rate_bpm'
    ];

    const rows = events.map(e => {
      const dateObj = new Date(e.timestamp);
      const localDate = format(dateObj, 'yyyy-MM-dd');
      const localTime = format(dateObj, 'HH:mm:ss');
      
      return [
        `"${String(e.id).replace(/"/g, '""')}"`,
        dateObj.toISOString(),
        localDate,
        localTime,
        `"${(e.eventType || '').replace(/"/g, '""')}"`,
        `"${(e.movementClass || '').toUpperCase().trim()}"`,
        String(e.accelerationMaxG || 0).replace('.', ','),
        Number(e.spo2 || 0),
        Number(e.bpm || 0)
      ];
    });
    
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `telemetry_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Validação estrita se 'events' é de fato uma array válida
  const isEventsArray = Array.isArray(events);

  return (
    <div className="p-6 pb-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-6 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Histórico</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            {isEventsArray ? events.length : 0} Eventos Registrados
          </p>
        </div>
        {/* <button 
          onClick={handleExportCSV}
          disabled={!isEventsArray || events.length === 0}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} className="text-slate-500" />
          Exportar CSV
        </button> */}
      </header>

      <div className="bg-white rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        {!isEventsArray || events.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center">
            <Calendar size={48} className="mb-4 opacity-20 text-slate-500" />
            <p className="text-sm font-medium">
              {!isEventsArray ? 'Carregando ou buscando dados...' : 'Nenhum evento registrado ainda.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {events.map((event) => (
              <li key={event.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-800 text-base">{event.eventType}</div>
                    <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock size={12} />
                      {event.timestamp ? format(new Date(event.timestamp), "d 'de' MMM, yyyy • HH:mm:ss", { locale: ptBR }) : ''}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1 w-full">
                  {/* Card de Movimento */}
                  <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between gap-2 border border-slate-100/50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                      <Activity size={14} /> <span>Movimento</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border w-fit ${
                      event.movementClass === 'INTENSO' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      event.movementClass === 'MODERADO' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {event.movementClass || 'BAIXO'}
                    </span>
                  </div>

                  {/* Card de Oxigenação */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 mb-2">
                      <Droplets size={14} /> <span>Oxigenação</span>
                    </div>
                    <div className="font-bold text-sm text-slate-700">{event.spo2 || 0} <span className="text-[10px] text-slate-400 font-normal">%</span></div>
                  </div>
                </div>

                {/* Card de Frequência Cardíaca */}
                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100/50 w-full mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                    <Heart size={14} /> <span>Frequência Cardíaca</span>
                  </div>
                  <div className="font-bold text-sm text-slate-700">{event.bpm || 0} <span className="text-[10px] text-slate-400 font-normal">BPM</span></div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}