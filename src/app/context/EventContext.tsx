import React, { createContext, useContext, useState, useEffect } from 'react';

//Interface para as leituras que chegam do sensor a cada segundo
interface SensorReading {
  spo2: number;
  heartRate: number;
  accelerationG: number;
}

export interface BioEvent {
  id: string;
  timestamp: string;
  label: string;
  spo2: number;
  heartRate: number;
  movement: string;
  accelerationMaxG?: number;
}

export interface MedicationLog {
  id: string;
  timestamp: string;
  name: string;
  dosage: string;
}

interface EventContextType {
  events: BioEvent[];
  addEvent: (label: string) => void; 
  medications: MedicationLog[];
  addMedication: (name: string, dosage: string) => void;
}

export const EventContext = createContext<EventContextType>({
  events: [],
  addEvent: () => {},
  medications: [],
  addMedication: () => {}
});

const EVENTS_STORAGE_KEY = 'pepadata_events';
const MEDS_STORAGE_KEY = 'pepadata_medications';

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  
  // Inicializa os Eventos buscando do LocalStorage ou usando dados padrão
  const [events, setEvents] = useState<BioEvent[]>(() => {
    const localData = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (localData) return JSON.parse(localData);

    const initialEvents: BioEvent[] = [
      {
        id: 'evt_001',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        label: 'Stress',
        movement: 'MODERADO',
        spo2: 98,
        heartRate: 85,
        accelerationMaxG: 1.32
      },
      {
        id: 'evt_002',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        label: 'Loud Noise',
        movement: 'INTENSO',
        spo2: 96,
        heartRate: 92,
        accelerationMaxG: 1.85
      }
    ];
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initialEvents));
    return initialEvents;
  });

  // Inicializa os Medicamentos buscando do LocalStorage ou usando dados padrão
  const [medications, setMedications] = useState<MedicationLog[]>(() => {
    const localData = localStorage.getItem(MEDS_STORAGE_KEY);
    if (localData) return JSON.parse(localData);

    const initialMeds = [
      { id: 'm1', timestamp: new Date(Date.now() - 10800000).toISOString(), name: 'Adderall', dosage: '10mg' },
      { id: 'm2', timestamp: new Date(Date.now() - 86400000).toISOString(), name: 'Adderall', dosage: '10mg' },
    ];
    localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(initialMeds));
    return initialMeds;
  });

  // ============================================================================
  // BUFFER TEMPORÁRIO EM MEMÓRIA RAM (Últimos 30 segundos)
  // ============================================================================
  const [sensorBuffer, setSensorBuffer] = useState<SensorReading[]>([]);

  // Garante que o buffer seja atualizado de forma controlada
  const handleIncomingData = (reading: SensorReading) => {
    setSensorBuffer(prevBuffer => {
      const updated = [...prevBuffer, reading];
      if (updated.length > 30) {
        updated.shift(); // Remove o tempo mais antigo (FIFO)
      }
      return updated;
    });
  };

  // MODO ATUAL: Simulador gerando telemetria a cada 1 segundo em segundo plano
  useEffect(() => {
    const interval = setInterval(() => {
      const fakeReading: SensorReading = {
        spo2: Math.round(95 + Math.random() * 4),
        heartRate: Math.round(70 + Math.random() * 30),
        accelerationG: Number((1.0 + Math.random() * 0.8).toFixed(2))
      };
      
      handleIncomingData(fakeReading);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  // ============================================================================

  const addEvent = (label: string) => {
    // Segurança caso o buffer esteja vazio no primeiro milissegundo
    if (sensorBuffer.length === 0) return;

    // 1. Processamento de Sinais Vitais: Média Aritmética Móvel
    const avgSpo2 = Math.round(sensorBuffer.reduce((acc, curr) => acc + curr.spo2, 0) / sensorBuffer.length);
    const avgHr = Math.round(sensorBuffer.reduce((acc, curr) => acc + curr.heartRate, 0) / sensorBuffer.length);

    // 2. Processamento do ADXL345: Extração do Valor Máximo de Pico (G-Force)
    const maxG = Math.max(...sensorBuffer.map(item => item.accelerationG));

    let movementClass = 'BAIXO';
    if (maxG > 1.50) movementClass = 'INTENSO';
    else if (maxG > 1.15) movementClass = 'MODERADO';

    const randomHash = Math.random().toString(36).substring(2, 7);
    
    const newEvent: BioEvent = {
      id: `evt_${randomHash}`,
      timestamp: new Date().toISOString(),
      label,
      movement: movementClass,
      spo2: avgSpo2,
      heartRate: avgHr,
      accelerationMaxG: maxG
    };
    
    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
  };

  // Adiciona o medicamento no estado E atualiza o banco local
  const addMedication = (name: string, dosage: string) => {
    const newMed: MedicationLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      name,
      dosage
    };
    
    const updatedMeds = [newMed, ...medications];
    setMedications(updatedMeds);
    localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(updatedMeds));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, medications, addMedication }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);