import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, Evento } from '../database/db';

// Interface para as leituras que chegam do sensor a cada segundo
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

const MEDS_STORAGE_KEY = 'pepadata_medications';

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  
  //Inicializa os Eventos
  const [events, setEvents] = useState<BioEvent[]>(() => {
    const eventosSalvos = db.listarEventos();
    
    // Se o banco estiver vazio, insere os dados iniciais padrão usando o db.ts
    if (eventosSalvos.length === 0) {
      const initialEvents = [
        db.salvarEvento({
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          eventType: 'Stress',
          movementClass: 'MODERADO',
          spo2: 98,
          bpm: 85,
          accelerationMaxG: 1.32
        }),
        db.salvarEvento({
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          eventType: 'Loud Noise',
          movementClass: 'INTENSO',
          spo2: 96,
          bpm: 92,
          accelerationMaxG: 1.85
        })
      ];
      return initialEvents;
    }
    
    return eventosSalvos;
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

  const handleIncomingData = (reading: SensorReading) => {
    setSensorBuffer(prevBuffer => {
      const updated = [...prevBuffer, reading];
      if (updated.length > 30) {
        updated.shift(); // Remove o registro do tempo mais antigo (Fila FIFO)
      }
      return updated;
    });
  };

  // MODO TEMPORÁRIO: Simulador gerando telemetria a cada 1 segundo em segundo plano
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
    if (sensorBuffer.length === 0) return;

    // Processamento de Sinais Vitais (Média Móvel)
    const avgSpo2 = Math.round(sensorBuffer.reduce((acc, curr) => acc + curr.spo2, 0) / sensorBuffer.length);
    const avgHr = Math.round(sensorBuffer.reduce((acc, curr) => acc + curr.heartRate, 0) / sensorBuffer.length);

    // Processamento do Acelerômetro (Pico)
    const maxG = Math.max(...sensorBuffer.map(item => item.accelerationG));

    let movementClass = 'BAIXO';
    if (maxG > 1.50) movementClass = 'INTENSO';
    else if (maxG > 1.15) movementClass = 'MODERADO';

    // CHAMA AO BANCO DE DADOS (db.ts)
    const novoEventoDados: Omit<Evento, 'id'> = {
      timestamp: new Date().toISOString(),
      eventType: label,
      bpm: avgHr,
      spo2: avgSpo2,
      movementClass: movementClass,
      accelerationMaxG: maxG
    };

    // Salva permanentemente no LocalStorage através do arquivo DB
    const eventoSalvo = db.salvarEvento(novoEventoDados);

    // Atualiza o estado global do React instantaneamente na tela
    setEvents(prev => [eventoSalvo, ...prev]);
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