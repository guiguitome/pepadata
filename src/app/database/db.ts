export interface Evento {
  id: string;
  timestamp: string;
  eventType: string;       // Ex: 'Estereotipia', 'Stress'
  notes?: string;          // Observações adicionais, como contexto do evento ou comportamento específico  
  bpm: number;             // Média dos últimos 30s
  spo2: number;            // Média dos últimos 30s
  movementClass: string;   // 'BAIXO', 'MODERADO', 'INTENSO'
  accelerationMaxG: number; // Valor máximo de aceleração em G registrado nos últimos 30s
}

const STORAGE_KEY = 'pepadata_events';

export const db = {
  salvarEvento: (novoEvento: Omit<Evento, 'id'>): Evento => {
    const eventosAtuais = db.listarEventos();
    
    const eventoCompleto: Evento = {
      ...novoEvento,
      id: `evt_${Math.random().toString(36).substring(2, 7)}`
    };

    eventosAtuais.unshift(eventoCompleto);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventosAtuais));
    
    return eventoCompleto;
  },

  listarEventos: (): Evento[] => {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  },

  buscarPorData: (dataEscolhida: string): Evento[] => {
    const todos = db.listarEventos();
    return todos.filter(evento => evento.timestamp.startsWith(dataEscolhida));
  }
};