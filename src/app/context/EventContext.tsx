import React, { createContext, useContext, useState } from 'react';

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
  addEvent: (label: string, movement: string, spo2: number, heartRate: number, accelerationMaxG?: number) => void;
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
  
  const [events, setEvents] = useState<BioEvent[]>(() => {
    const localData = localStorage.getItem(EVENTS_STORAGE_KEY);
    if (localData) return JSON.parse(localData);

    const initialEvents: BioEvent[] = [
      {
        id: 'evt_001', // Padronizado
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        label: 'Stress',
        movement: 'Moderado',
        spo2: 98,
        heartRate: 85,
        accelerationMaxG: 1.32
      },
      {
        id: 'evt_002', // Padronizado
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        label: 'Loud Noise',
        movement: 'Intenso',
        spo2: 96,
        heartRate: 92,
        accelerationMaxG: 1.85
      }
    ];
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initialEvents));
    return initialEvents;
  });

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

  const addEvent = (
    label: string,
    movement: string,
    spo2: number,
    heartRate: number,
    accelerationMaxG?: number
  ) => {
    const randomHash = Math.random().toString(36).substring(2, 7);
    
    const newEvent: BioEvent = {
      id: `evt_${randomHash}`,
      timestamp: new Date().toISOString(),
      label,
      movement,
      spo2,
      heartRate,
      accelerationMaxG: accelerationMaxG !== undefined ? accelerationMaxG : 1.00
    };
    
    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedEvents));
  };

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