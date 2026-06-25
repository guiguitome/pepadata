import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db, Evento } from '../database/db';
import { MobileBluetoothService, BiosensoresData } from '../services/bluetoothService';

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

export interface GraficoData {
  time: number;
  spo2: number;
  heartRate: number;
  accX: number;
  accY: number;
  accZ: number;
}

interface EventContextType {
  events: BioEvent[];
  addEvent: (label: string) => Promise<void>; 
  medications: MedicationLog[];
  addMedication: (name: string, dosage: string) => void;
  handleIncomingData: (reading: SensorReading) => void;
  connected: boolean;
  chartData: GraficoData[];
  alternarConexaoGlobal: () => Promise<void>;
}

export const EventContext = createContext<EventContextType>({
  events: [],
  addEvent: async () => {},
  medications: [],
  addMedication: () => {},
  handleIncomingData: () => {},
  connected: false,
  chartData: [],
  alternarConexaoGlobal: async () => {}
});

const MEDS_STORAGE_KEY = 'pepadata_medications';

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<BioEvent[]>([]);
  const [medications, setMedications] = useState<MedicationLog[]>(() => {
    const localData = localStorage.getItem(MEDS_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  });
  
  // 🚀 Puxa o estado de conexão e dados diretamente da memória estática nativa do serviço
  const [connected, setConnected] = useState(() => MobileBluetoothService.isConectado());
  const [chartData, setChartData] = useState<GraficoData[]>(() => MobileBluetoothService.obterHistoricoGrafico() as any);
  const bufferRef = useRef<SensorReading[]>([]);

  useEffect(() => {
    const inicializarConstantes = async () => {
      if (navigator.onLine) await db.sincronizarPendentes();
      const dadosBanco = await db.listarEventos();
      setEvents(dadosBanco);
    };
    inicializarConstantes();
  }, []);

  // 🚀 HOOK DE RE-INSCRIÇÃO: Sempre que este componente remontar devido às rotas,
  // se o Bluetooth nativo já estiver ativo, ele apenas se re-inscreve para voltar a receber dados
  useEffect(() => {
    const escutarBluetoothContinuo = () => {
      // Força a atualização do gráfico lendo a cópia idêntica da memória persistente
      setChartData([...MobileBluetoothService.obterHistoricoGrafico()] as any);
    };

    if (MobileBluetoothService.isConectado()) {
      setConnected(true);
      MobileBluetoothService.conectar(escutarBluetoothContinuo);
    }

    return () => {
      // Evita vazamento de memória e listeners duplicados ao mudar de rota
      MobileBluetoothService.removerOuvinte(escutarBluetoothContinuo);
    };
  }, [connected]);

  const handleIncomingData = (reading: SensorReading) => {
    bufferRef.current.push(reading);
    if (bufferRef.current.length > 30) bufferRef.current.shift();
  };

  const alternarConexaoGlobal = async () => {
    if (connected) {
      try {
        await MobileBluetoothService.desconectar();
        setConnected(false);
        setChartData(MobileBluetoothService.obterHistoricoGrafico() as any);
      } catch (error) {
        console.error("Erro ao desconectar:", error);
      }
    } else {
      try {
        const escutarBluetoothContinuo = (novosDados: BiosensoresData) => {
          // Atualiza o gráfico reativo com base no array estático global do arquivo de serviço
          setChartData([...MobileBluetoothService.obterHistoricoGrafico()] as any);

          const x = novosDados.accX;
          const y = novosDados.accY;
          const z = novosDados.accZ;
          const gResultante = Number(Math.sqrt(x*x + y*y + z*z).toFixed(2));

          handleIncomingData({
            spo2: novosDados.spo2,
            heartRate: novosDados.heartRate,
            accelerationG: gResultante
          });
        };

        await MobileBluetoothService.conectar(escutarBluetoothContinuo);
        setConnected(true);
      } catch (error: any) {
        alert("Erro na conexão: " + error.message);
        setConnected(false);
      }
    }
  };

  const addEvent = async (label: string) => {
    let leiturasAtuais = [...bufferRef.current];
    
    // Se mudou de aba e o buffer temporário do React esvaziou, puxamos a telemetria do gráfico estático
    if (leiturasAtuais.length === 0) {
      const dadosGlobais = MobileBluetoothService.obterHistoricoGrafico();
      leiturasAtuais = dadosGlobais.map(ponto => ({
        spo2: ponto.spo2,
        heartRate: ponto.heartRate,
        accelerationG: Number(Math.sqrt(ponto.accX**2 + ponto.accY**2 + ponto.accZ**2).toFixed(2))
      }));
    }

    const avgSpo2 = Math.round(leiturasAtuais.reduce((acc, curr) => acc + curr.spo2, 0) / leiturasAtuais.length);
    const avgHr = Math.round(leiturasAtuais.reduce((acc, curr) => acc + curr.heartRate, 0) / leiturasAtuais.length);
    const maxG = Math.max(...leiturasAtuais.map(item => item.accelerationG));

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
      movementClass: maxG > 15.0 ? 'INTENSO' : maxG > 10.0 ? 'MODERADO' : 'BAIXO',
      accelerationMaxG: maxG,
      telemetria_detalhada: telemetriaDetalhada
    };

    const eventoSalvo = await db.salvarEvento(novoEventoDados);
    setEvents((prev) => [eventoSalvo, ...(Array.isArray(prev) ? prev : [])]);
  };

  const addMedication = (name: string, dosage: string) => {
    const newMed = {
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
    <EventContext.Provider value={{ 
      events, addEvent, medications, addMedication, handleIncomingData,
      connected, chartData, alternarConexaoGlobal 
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => useContext(EventContext);