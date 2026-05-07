import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importação para datas em português
import { useEvents } from '../context/EventContext';
import { Pill, Activity, Plus, FileText, AlertCircle, MapPin, Mic, Dumbbell, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';

export function CalendarLog() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  
  // ESTADOS PARA O FORMULÁRIO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medUnit, setMedUnit] = useState('mg');

  const { events, medications, addMedication } = useEvents();
  const navigate = useNavigate();

  const combinedItems = [
    ...events.map(e => ({ ...e, type: 'bio' as const })),
    ...medications.map(m => ({ ...m, type: 'medication' as const }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const selectedDayItems = combinedItems.filter(item => 
    isSameDay(new Date(item.timestamp), selectedDate)
  );

  const getEventIcon = (label: string) => {
    switch (label) {
      case 'Loud Noise': 
      case 'Ruído Alto': return <Mic size={14} className="text-blue-500" />;
      case 'New Environment': 
      case 'Ambiente Novo': return <MapPin size={14} className="text-teal-500" />;
      case 'Stimming': 
      case 'Estereotipia': return <Activity size={14} className="text-indigo-500" />;
      case 'Stress': 
      case 'Estresse': return <AlertCircle size={14} className="text-rose-500" />;
      case 'Physical Exercise': 
      case 'Exercício Físico': return <Dumbbell size={14} className="text-orange-500" />;
      default: return <FileText size={14} className="text-slate-500" />;
    }
  };

  const handleSaveMedication = () => {
    if (medName.trim() && medDosage.trim()) {
      addMedication(medName, `${medDosage}${medUnit}`);
      setMedName('');
      setMedDosage('');
      setMedUnit('mg');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="relative max-w-[450px] mx-auto h-screen overflow-hidden bg-slate-50 flex flex-col border-x border-slate-200">
      
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {/* Seção do Calendário */}
        <div className="bg-white rounded-[1.5rem] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 mb-8">
          <DayPicker
            mode="single"
            locale={ptBR} // Calendário em português
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiersClassNames={{
              selected: "bg-teal-500 text-white rounded-full",
              today: "text-teal-600 font-bold"
            }}
            components={{
              DayContent: (props) => {
                const { date } = props;
                const hasItem = combinedItems.some(item => isSameDay(new Date(item.timestamp), date));
                return (
                  <div className="relative flex items-center justify-center w-full h-full">
                    <span>{date.getDate()}</span>
                    {hasItem && (
                      <div className="absolute bottom-0 w-1 h-1 bg-teal-400 rounded-full" />
                    )}
                  </div>
                );
              }
            }}
          />
        </div>

        {/* Seção da Linha do Tempo (Timeline) */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 capitalize">
            {isSameDay(selectedDate, new Date()) 
              ? 'Hoje' 
              : format(selectedDate, "d 'de' MMMM, yyyy", { locale: ptBR })}
          </h2>
          
          {selectedDayItems.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-400">
              <p>Nenhum registro para este dia.</p>
            </div>
          ) : (
            <div className="relative pl-[1.125rem] space-y-6 before:absolute before:inset-y-2 before:left-[1.0625rem] before:w-[2px] before:bg-slate-200">
              {selectedDayItems.map((item) => (
                <div key={`${item.type}-${item.id}`} className="relative pl-6">
                  <div className="absolute -left-2.5 top-1 bg-white p-1.5 rounded-full border-2 border-slate-200 z-10">
                    {item.type === 'bio' ? getEventIcon(item.label) : <Pill size={14} className="text-purple-500" />}
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        {format(new Date(item.timestamp), 'HH:mm')}
                     </p>
                    {item.type === 'bio' ? (
                      <div>
                        <h3 className="font-semibold text-slate-800">{item.label}</h3>
                        <p className="text-xs text-slate-500">{item.gsr} μS | {item.heartRate} BPM</p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-slate-800">{item.name}</h3>
                        <p className="text-sm text-slate-500">Dosagem: {item.dosage}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE ENTRADA DE MEDICAMENTO */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-[2rem] p-8 z-[70] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Novo Medicamento</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24}/>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Medicamento</label>
                  <input 
                    type="text" 
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="Ex: Lexapro"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Dosagem</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      placeholder="Ex: 10"
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                    
                    <div className="relative min-w-[90px]">
                      <select 
                        value={medUnit}
                        onChange={(e) => setMedUnit(e.target.value)}
                        className="w-full h-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                      >
                        <option value="mg">mg</option>
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                        <option value="gotas">gotas</option>
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveMedication}
                  className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-purple-700 transition-all active:scale-[0.98]"
                >
                  Salvar Medicamento
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MENU FLUTUANTE (FAB) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="absolute bottom-30 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex flex-col gap-3 mb-2">
              <button 
                onClick={() => { setMenuOpen(false); setIsModalOpen(true); }}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-lg border border-slate-100"
              >
                <span className="text-sm font-semibold text-slate-700">Adicionar Medicamento</span>
                <div className="bg-purple-100 text-purple-600 p-2 rounded-full"><Pill size={18} /></div>
              </button>
              <button 
                onClick={() => { setMenuOpen(false); navigate('/trigger'); }}
                className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-lg border border-slate-100"
              >
                <span className="text-sm font-semibold text-slate-700">Registrar Evento</span>
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Activity size={18} /></div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setMenuOpen(!menuOpen)} className={`w-[3.5rem] h-[3.5rem] rounded-full shadow-lg flex items-center justify-center transition-all ${menuOpen ? 'bg-slate-800 rotate-45' : 'bg-teal-600'}`}>
          <Plus size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}