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

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<BioEvent[]>([
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
  ]);

  const [medications, setMedications] = useState<MedicationLog[]>([
    { id: 'm1', timestamp: new Date(Date.now() - 10800000).toISOString(), name: 'Adderall', dosage: '10mg' },
    { id: 'm2', timestamp: new Date(Date.now() - 86400000).toISOString(), name: 'Adderall', dosage: '10mg' },
  ]);

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
    setEvents([newEvent, ...events]);
  };

  const addMedication = (name: string, dosage: string) => {
    const newMed: MedicationLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      name,
      dosage
    };
    setMedications([newMed, ...medications]);
  };

  return (
    <EventContext.Provider value={{ events, addEvent, medications, addMedication }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext);
