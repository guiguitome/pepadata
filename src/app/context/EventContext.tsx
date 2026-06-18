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

// Simulação do ADXL345 (Global)
const getADXL345DataGlobal = (): number => {
  const intensidades = ['Baixo', 'Moderado', 'Alto'];
  const intensidadeSorteada = intensidades[Math.floor(Math.random() * intensidades.length)];
  let simulatedG = 1.00;
  
  if (intensidadeSorteada === 'Moderado') {
    simulatedG = 1.15 + Math.random() * 0.3;
  } else if (intensidadeSorteada === 'Alto') {
    simulatedG = 1.55 + Math.random() * 0.8;
  } else {
    simulatedG = 1.00 + Math.random() * 0.08;
  }
  return Number(simulatedG.toFixed(2));
};

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<BioEvent[]>([]);
  const [medications, setMedications] = useState<MedicationLog[]>(() => {
    const localData = localStorage.getItem(MEDS_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  });
  
  const bufferRef = useRef<SensorReading[]>([]);

  // Carregamento inicial e sincronização offline
  useEffect(() => {
    const inicializarConstantes = async () => {
      if (navigator.onLine) {
        await db.sincronizarPendentes();
      }
      const dadosBanco = await db.listarEventos();
      setEvents(dadosBanco);
    };
    inicializarConstantes();
  }, []);

  // Sincronização em background ao retomar conexão
  useEffect(() => {
    const lidarComVoltaDaInternet = async () => {
      await db.sincronizarPendentes();
      const dadosAtualizados = await db.listarEventos();
      setEvents(dadosAtualizados);
    };

    window.addEventListener('online', lidarComVoltaDaInternet);
    return () => window.removeEventListener('online', lidarComVoltaDaInternet);
  }, []);

  // Motor do simulador rodando em background global
  useEffect(() => {
    const intervaloGlobal = setInterval(() => {
      const leituraInstantanea = {
        spo2: Math.floor(Math.random() * (100 - 95 + 1)) + 95,
        heartRate: Math.floor(Math.random() * (115 - 65 + 1)) + 65,
        accelerationG: getADXL345DataGlobal()
      };
      
      handleIncomingData(leituraInstantanea);
    }, 1000);

    return () => clearInterval(intervaloGlobal);
  }, []);

  const handleIncomingData = (reading: SensorReading) => {
    bufferRef.current.push(reading);
    // Mantém estritamente a janela máxima dos últimos 30 segundos salvos
    if (bufferRef.current.length > 30) {
      bufferRef.current.shift();
    }
  };

  const addEvent = async (label: string) => {
    // Coleta estritamente o histórico real contido no buffer até este exato momento
    const leiturasAtuais = [...bufferRef.current];

    // Fallback de segurança: Se o app acabou de abrir e não deu tempo de gerar nenhuma leitura
    if (leiturasAtuais.length === 0) {
      leiturasAtuais.push({
        spo2: 98,
        heartRate: 80,
        accelerationG: 1.0
      });
    }

    // Cálculos estatísticos calculados de forma dinâmica baseados no tempo decorrido real
    const avgSpo2 = Math.round(leiturasAtuais.reduce((acc, curr) => acc + curr.spo2, 0) / leiturasAtuais.length);
    const avgHr = Math.round(leiturasAtuais.reduce((acc, curr) => acc + curr.heartRate, 0) / leiturasAtuais.length);
    const maxG = Math.max(...leiturasAtuais.map(item => item.accelerationG));

    // Mapeamento sequencial para o gráfico técnico baseado apenas nos pontos reais obtidos
    const telemetriaDetalhada = leiturasAtuais.map((leitura, index) => ({
      segundo: index + 1,
      spo2: leitura.spo2,
      heartRate: leitura.heartRate,
      accelerationG: leitura.accelerationG
    }));

    const novoEventoDados = {
      timestamp: new Date().toISOString(),
      eventType: label,
      bpm: avgHr,
      spo2: avgSpo2,
      movementClass: maxG > 1.5 ? 'INTENSO' : maxG > 1.15 ? 'MODERADO' : 'BAIXO',
      accelerationMaxG: maxG,
      telemetria_detalhada: telemetriaDetalhada
    };

    const eventoSalvo = await db.salvarEvento(novoEventoDados);
    setEvents((prev) => [eventoSalvo, ...(Array.isArray(prev) ? prev : [])]);
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