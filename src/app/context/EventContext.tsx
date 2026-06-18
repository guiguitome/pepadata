import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  // Mantemos o useRef para o buffer não causar lags no app
  const bufferRef = useRef<SensorReading[]>([]);

  // 1. Carregamento inicial e verificação de pendentes
  useEffect(() => {
    const inicializarConstantes = async () => {
      // Se tiver internet ao abrir o app, limpa o que ficou pendente antes
      if (navigator.onLine) {
        await db.sincronizarPendentes();
      }
      const dadosBanco = await db.listarEventos();
      setEvents(dadosBanco);
    };
    inicializarConstantes();
  }, []);

  // 2. MOTOR DE ESCUTA DA REDE (Sincronização em Background)
  useEffect(() => {
    const lidarComVoltaDaInternet = async () => {
      console.log('📡 Conexão restabelecida! Sincronizando dados pendentes com a nuvem...');
      await db.sincronizarPendentes();
      
      // Atualiza a lista da tela para trocar as flags locais de synced: false para true
      const dadosAtualizados = await db.listarEventos();
      setEvents(dadosAtualizados);
    };

    window.addEventListener('online', lidarComVoltaDaInternet);
    return () => window.removeEventListener('online', lidarComVoltaDaInternet);
  }, []);

  const handleIncomingData = (reading: SensorReading) => {
    bufferRef.current.push(reading);
    if (bufferRef.current.length > 30) {
      bufferRef.current.shift();
    }
  };

  const addEvent = async (label: string) => {
    const bufferInterno = bufferRef.current.length > 0 
      ? [...bufferRef.current] 
      : [{ spo2: 98, heartRate: 80, accelerationG: 1.0 }];

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

    // Seu db.salvarEvento já cuida de tentar nuvem ou falhar de forma resiliente!
    const eventoSalvo = await db.salvarEvento(novoEventoDados);
    setEvents((prev) => [eventoSalvo, ...(Array.isArray(prev) ? prev : [])]);

    // Reseta o buffer local
    bufferRef.current = [];
  };

  const addMedication = (name: string, dosage: string) => {
    const newMed: MedicationLog = {
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