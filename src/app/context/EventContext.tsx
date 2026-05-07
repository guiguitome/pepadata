import React, { createContext, useContext, useState } from 'react';

export interface BioEvent {
  id: string;
  timestamp: string;
  label: string;
  gsr: number;
  heartRate: number;
}

export interface MedicationLog {
  id: string;
  timestamp: string;
  name: string;
  dosage: string;
}

interface EventContextType {
  events: BioEvent[];
  addEvent: (label: string, gsr: number, hr: number) => void;
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
    { id: '1', timestamp: new Date(Date.now() - 3600000).toISOString(), label: 'Stress', gsr: 12.4, heartRate: 85 },
    { id: '2', timestamp: new Date(Date.now() - 7200000).toISOString(), label: 'Loud Noise', gsr: 14.1, heartRate: 92 },
  ]);

  const [medications, setMedications] = useState<MedicationLog[]>([
    { id: 'm1', timestamp: new Date(Date.now() - 10800000).toISOString(), name: 'Adderall', dosage: '10mg' },
    { id: 'm2', timestamp: new Date(Date.now() - 86400000).toISOString(), name: 'Adderall', dosage: '10mg' }, // Yesterday
  ]);

  const addEvent = (label: string, gsr: number, heartRate: number) => {
    const newEvent: BioEvent = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      label,
      gsr,
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
