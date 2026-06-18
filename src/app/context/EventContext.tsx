import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, Evento } from '../database/db';

interface SensorReading {
  spo2: number;
  heartRate: number;
  accelerationG: number;
}

export interface BioEvent extends Evento {}

export interface MedicationLog {
  id: string;
  timestamp: string;
  name: string;
  dosage: string;
}

interface EventContextType {
  events: BioEvent[];
  addEvent: (label: string) => Promise<void>; 
  medications: MedicationLog[];
  addMedication: (name: string, dosage: string) => void;
  handleIncomingData: (reading: SensorReading) => void;
}

export const EventContext = createContext<EventContextType>({
  events: [],
  addEvent: async () => {},
  medications: [],
  addMedication: () => {},
  handleIncomingData: () => {}
});

const MEDS_STORAGE_KEY = 'pepadata_medications';

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<BioEvent[]>([]);
  const [medications, setMedications] = useState<MedicationLog[]>(() => {
    const localData = localStorage.getItem(MEDS_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  });
  const [sensorBuffer, setSensorBuffer] = useState<SensorReading[]>([]);

  // Carregamento inicial limpo da nuvem/local
  useEffect(() => {
    const inicializarConstantes = async () => {
      const dadosBanco = await db.listarEventos();
      setEvents(dadosBanco);
    };
    inicializarConstantes();
  }, []);

  const handleIncomingData = (reading: SensorReading) => {
    setSensorBuffer(prev => {
      const updated = [...prev, reading];
      return updated.length > 30 ? updated.slice(1) : updated;
    });
  };

  const addEvent = async (label: string) => {
    const bufferInterno = sensorBuffer.length > 0 ? sensorBuffer : [{ spo2: 98, heartRate: 80, accelerationG: 1.0 }];

    const avgSpo2 = Math.round(bufferInterno.reduce((acc, curr) => acc + curr.spo2, 0) / bufferInterno.length);
    const avgHr = Math.round(bufferInterno.reduce((acc, curr) => acc + curr.heartRate, 0) / bufferInterno.length);
    const maxG = Math.max(...bufferInterno.map(item => item.accelerationG));

    const novoEventoDados = {
      timestamp: new Date().toISOString(),
      eventType: label,
      bpm: avgHr,
      spo2: avgSpo2,
      movementClass: maxG > 1.5 ? 'INTENSO' : maxG > 1.15 ? 'MODERADO' : 'BAIXO',
      accelerationMaxG: maxG
    };

    const eventoSalvo = await db.salvarEvento(novoEventoDados);
    setEvents((prev) => [eventoSalvo, ...(Array.isArray(prev) ? prev : [])]);
  };

  const addMedication = (name: string, dosage: string) => {
    const newMed: MedicationLog = {
      // Modificado aqui: Usa uma chave única gerada via milissegundos + string randômica (100% segura no Vite)
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, 
      timestamp: new Date().toISOString(),
      name,
      dosage
    };
    const updatedMeds = [newMed, ...medications];
    setMedications(updatedMeds);
    localStorage.setItem(MEDS_STORAGE_KEY, JSON.stringify(updatedMeds));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, medications, addMedication, handleIncomingData }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);