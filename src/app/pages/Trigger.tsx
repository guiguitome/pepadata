import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Mic, MapPin, Activity, AlertCircle, Dumbbell } from 'lucide-react';
import { useEvents } from '../context/EventContext';

const LABELS = [
  { id: 'noise', label: 'Ruído Alto', icon: Mic },
  { id: 'env', label: 'Ambiente Novo', icon: MapPin },
  { id: 'stim', label: 'Estereotipia', icon: Activity },
  { id: 'stress', label: 'Estresse', icon: AlertCircle },
  { id: 'exercise', label: 'Exercício Físico', icon: Dumbbell },
];

// ============================================================================
// FUNÇÃO DE MAPEAMENTO DO ADXL345 (TEMPORÁRIO)
// ============================================================================
const getADXL345Data = (movementIntensity: string): number => {
  let simulatedG = 1.00;
  
  if (movementIntensity === 'Moderado') {
    simulatedG = 1.15 + Math.random() * 0.3; // 1.15g a 1.45g
  } else if (movementIntensity === 'Alto' || movementIntensity === 'Intenso') {
    simulatedG = 1.55 + Math.random() * 0.8; // 1.55g a 2.35g
  } else {
    simulatedG = 1.00 + Math.random() * 0.08; // Baixo ou Repouso (1g)
  }
  
  return Number(simulatedG.toFixed(2));
};

export function Trigger() {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);
  
  const { addEvent, handleIncomingData } = useEvents();

  // ============================================================================
  // SIMULADOR DE TELEMETRIA
  // ============================================================================
  useEffect(() => {
    const intervaloSensor = setInterval(() => {
      // Sorteia uma intensidade genérica para manter o acelerômetro simulado oscilando
      const intensidades = ['Baixo', 'Moderado', 'Alto'];
      const intensidadeSorteada = intensidades[Math.floor(Math.random() * intensidades.length)];

      // Payload dinâmico e direto. Ponto central perfeito para plugar o hardware depois.
      const leituraInstantanea = {
        spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95,        // Variando de 95% a 100%
        heartRate: Math.floor(Math.random() * (115 - 65 + 1)) + 65,   // Variando de 65 a 115 BPM
        accelerationG: getADXL345Data(intensidadeSorteada)
      };

      handleIncomingData(leituraInstantanea);
    }, 1000);

    return () => clearInterval(intervaloSensor);
  }, [handleIncomingData]); // Totalmente isolado do estado do componente

  const handleRecord = async () => {
    if (!selectedLabel) return;
    
    await addEvent(selectedLabel); 

    setRecorded(true);

    setTimeout(() => {
      setRecorded(false);
      setSelectedLabel(null);
    }, 2000);
  };

  return (
    <div className="p-6 h-full min-h-[85vh] flex flex-col animate-in fade-in duration-500">
      
      <div className="w-full text-center mt-6 mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Registrar Evento</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-[240px] mx-auto">
          Selecione uma categoria para os dados de biomarcadores atuais.
        </p>
      </div>

      <div className="w-full grid grid-cols-2 gap-3 mb-8">
        {LABELS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedLabel === item.label;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedLabel(item.label)}
              className={`flex flex-col items-center justify-center p-5 rounded-[1.25rem] border transition-all duration-200 ${
                isSelected 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-[0_2px_12px_rgba(37,99,235,0.12)]' 
                  : 'bg-white border-slate-100 text-slate-600 hover:border-blue-100 hover:bg-slate-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
              } ${item.id === 'exercise' ? 'col-span-2' : ''}`}
            >
              <Icon size={26} className={`mb-3 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} strokeWidth={2} />
              <span className="text-sm font-semibold text-center">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="w-full mt-auto mb-4">
        <button
          onClick={handleRecord}
          disabled={!selectedLabel || recorded}
          className={`w-full py-4 rounded-[1.5rem] font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            !selectedLabel 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : recorded
                ? 'bg-teal-500 text-white shadow-[0_8px_20px_rgba(20,184,166,0.3)]'
                : 'bg-blue-700 text-white shadow-[0_8px_20px_rgba(29,78,216,0.3)] hover:bg-blue-800 hover:shadow-[0_8px_20px_rgba(29,78,216,0.4)] transform hover:-translate-y-0.5'
          }`}
        >
          <AnimatePresence mode="wait">
            {recorded ? (
              <motion.div
                key="recorded"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={24} />
                <span>Registrado com sucesso</span>
              </motion.div>
            ) : (
              <motion.div
                key="record"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                Gravar Evento
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

    </div>
  );
}