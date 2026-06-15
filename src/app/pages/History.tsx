import { useEvents } from '../context/EventContext';
import { Download, Calendar, Activity, Heart, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Localização para português
import { Droplets } from 'lucide-react';

export function History() {
  const { events } = useEvents();

  const handleExportCSV = () => {
  // Cabeçalhos do CSV traduzidos
  const headers = ['ID', 'Horário_ISO', 'Data_Local', 'Hora_Local', 'Evento', 'Movimento', 'SpO2', 'Freq_Cardiaca_BPM'];

  const rows = events.map(e => {
    const dateObj = new Date(e.timestamp);
    const localDate = dateObj.toLocaleDateString('pt-BR');
    const localTime = dateObj.toLocaleTimeString('pt-BR');
    
    // Envelopa os textos em aspas e duplica aspas internas se existirem
    const cleanLabel = `"${e.label.replace(/"/g, '""')}"`;
    const cleanMovement = `"${e.movement.replace(/"/g, '""')}"`;

    return [
      e.id,
      dateObj.toISOString(),
      localDate,
      localTime,
      cleanLabel,
      cleanMovement,
      e.spo2,
      e.heartRate
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
    
    // Nome do arquivo traduzido
    link.setAttribute('download', `historico-eventos-${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
                {/* Cabeçalho do Card: Evento e Horário */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-800 tracking-tight text-base">{event.label}</div>
                    <div className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock size={12} />
                      {format(new Date(event.timestamp), "d 'de' MMM, yyyy • HH:mm:ss", { locale: ptBR })}
                    </div>
                  </div>
                </div>
                
                {/* Container das Métricas: Mantém sempre dois blocos lado a lado */}
                <div className="grid grid-cols-2 gap-3 pt-1 w-full">
                  
                  {/* Bloco de Movimento */}
                  <div className="bg-slate-50 rounded-xl p-3 flex flex-col justify-between gap-2 border border-slate-100/50 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                      <Activity size={14} className="shrink-0" />
                      <span>Movimento</span>
                    </div>
                    
                    {/* Badge Dinâmico centralizado e com largura total controlada */}
                    <div className="flex justify-start">
                      {(() => {
                        const text = event.movement.replace(/"/g, '').trim();
                        let badgeColors = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
                        
                        if (text === 'Moderado') {
                          badgeColors = "bg-amber-50 text-amber-700 border-amber-200/60";
                        } else if (text === 'Intenso') {
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

                  {/* Bloco de Oxigenação */}
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

                {/* Bloco de Frequência Cardíaca */}
                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100/50 w-full mt-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                    <Heart size={14} className="shrink-0" />
                    <span>Frequência Cardíaca</span>
                  </div>

                  <div className="font-bold text-sm text-slate-700">
                    {event.heartRate} <span className="font-normal text-slate-400 text-[10px]">BPM</span>
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