import { useEvents } from '../context/EventContext';
import { Download, Calendar, Activity, Heart, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Droplets } from 'lucide-react';

export function History() {
  const { events } = useEvents();

  const handleExportCSV = () => {
    const headers = [
      'event_id', 
      'timestamp_utc', 
      'local_date', 
      'local_time', 
      'event_label', 
      'movement_class',      
      'acceleration_max_g',  
      'spo2_percentage', 
      'heart_rate_bpm'
    ];

    const rows = events.map(e => {
      const dateObj = new Date(e.timestamp);
      
      const localDate = dateObj.getFullYear() + '-' + 
                        String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(dateObj.getDate()).padStart(2, '0');
      
      const localTime = dateObj.toLocaleTimeString('pt-BR');
      
      // Corrigido para ler eventType e movementClass
      const cleanLabel = `"${(e.eventType || '').replace(/"/g, '""')}"`;
      const technicalMovement = `"${(e.movementClass || '').replace(/"/g, '').toUpperCase().trim()}"`;
      
      let standardizedId = String(e.id).trim();
      if (!isNaN(Number(standardizedId))) {
        standardizedId = `evt_${standardizedId.padStart(3, '0')}`;
      }
      const cleanId = `"${standardizedId}"`;

      const rawGForce = e.accelerationMaxG 
        ? String(Number(e.accelerationMaxG).toFixed(2)).replace('.', ',') 
        : "1,00";

      return [
        cleanId,
        dateObj.toISOString(), 
        localDate,
        localTime,
        cleanLabel,
        technicalMovement,
        rawGForce,            
        Number(e.spo2),       
        Number(e.bpm) // Corrigido para ler bpm
      ];
    });
    
    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileTimestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    link.setAttribute('download', `telemetry_report_${fileTimestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                    {/* Corrigido para ler eventType */}
                    <div className="font-semibold text-slate-800 tracking-tight text-base">{event.eventType}</div>
                    <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock size={12} />
                      {format(new Date(event.timestamp), "d 'de' MMM, yyyy • HH:mm:ss", { locale: ptBR })}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1 w-full">
                  <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between gap-2 border border-slate-100/50 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                      <Activity size={14} className="shrink-0" />
                      <span>Movimento</span>
                    </div>
                    
                    <div className="flex justify-start">
                      {(() => {
                        // Corrigido para ler movementClass
                        const text = (event.movementClass || '').replace(/"/g, '').trim();
                        let badgeColors = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
                        
                        if (text === 'MODERADO') {
                          badgeColors = "bg-amber-50 text-amber-700 border-amber-200/60";
                        } else if (text === 'INTENSO') {
                          badgeColors = "bg-rose-50 text-rose-700 border-rose-200/60";
                        }

                        return (
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColors} whitespace-nowrap`}>
                            {text}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between gap-2 border border-slate-100/50 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500">
                      <Droplets size={14} className="shrink-0" />
                      <span>Oxigenação</span>
                    </div>
                    <div className="font-bold text-sm text-slate-700 pt-0.5">
                      {event.spo2} <span className="font-normal text-slate-400 text-[10px]">%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100/50 w-full mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                    <Heart size={14} className="shrink-0" />
                    <span>Frequência Cardíaca</span>
                  </div>

                  <div className="font-bold text-sm text-slate-700">
                    {/* Corrigido para ler bpm */}
                    {event.bpm} <span className="font-normal text-slate-400 text-[10px]">BPM</span>
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