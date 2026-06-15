import React, { createContext, useContext, useState } from 'react';

export interface BioEvent {
  id: string;
  timestamp: string;
  label: string;
  spo2: number;
  heartRate: number;
  movement: string;
}

export interface MedicationLog {
  id: string;
  timestamp: string;
  name: string;
  dosage: string;
}

interface EventContextType {
  events: BioEvent[];
  addEvent: (label: string, movement: string, spo2: number, heartRate: number) => void;
  medications: MedicationLog[];
  addMedication: (name: string, dosage: string) => void;
}

export const EventContext = createContext<EventContextType>({
  events: [],
  addEvent: () => {},
  medications: [],
  addMedication: () => {}
});

// Chaves para salvar no LocalStorage
const EVENTS_STORAGE_KEY = 'pepadata_events';
const MEDS_STORAGE_KEY = 'pepadata_medications';

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  
  // 1. Inicializa os Eventos buscando do LocalStorage ou usando seus dados padrão
  const [events, setEvents] = useState<BioEvent[]>(() => {
    const localData = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (localData) return JSON.parse(localData);

    // Se o banco estiver vazio, coloca seus dados iniciais para teste
    const initialEvents = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        label: 'Stress',
        movement: 'Moderado',
        spo2: 98,
        heartRate: 85
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        label: 'Loud Noise',
        movement: 'Intenso',
        spo2: 96,
        heartRate: 92
      }
    ];
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initialEvents));
    return initialEvents;
  });

  // 2. Inicializa os Medicamentos buscando do LocalStorage ou usando seus dados padrão
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

  // 3. Adiciona o evento no estado E atualiza o banco local
  const addEvent = (
    label: string,
    movement: string,
    spo2: number,
    heartRate: number
  ) => {
    const newEvent: BioEvent = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      label,
      movement,
      spo2,
      heartRate
    };
    
    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents)); // Salva no banco
  };

  // 4. Adiciona o medicamento no estado E atualiza o banco local
  const addMedication = (name: string, dosage: string) => {
    const newMed: MedicationLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      name,
      dosage
    };
    
    const updatedMeds = [newMed, ...medications];
    setMedications(updatedMeds);
    localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(updatedMeds)); // Salva no banco
  };

  return (
    <EventContext.Provider value={{ events, addEvent, medications, addMedication }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext);