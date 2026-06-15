export interface Evento {
  id: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM:SS
  eventType: string;
  notes: string;
  bpm: number;
  spo2: number;
  motionLevel: number;
}

const STORAGE_KEY = 'pepadata_events';

export const db = {
  // Salvar um novo evento
  salvarEvento: (novoEvento: Omit<Evento, 'id'>): Evento => {
    const eventosAtuais = db.listarEventos();
    
    const eventoCompleto: Evento = {
      ...novoEvento,
      id: Math.random().toString(36).substr(2, 9) // Gera um ID temporário
    };

    eventosAtuais.push(eventoCompleto);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventosAtuais));
    
    return eventoCompleto;
  },

  // Listar todos os eventos (para a tela de histórico)
  listarEventos: (): Evento[] => {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
  },

  // Filtrar eventos por data (para o CalendarLog)
  buscarPorData: (dataEscolhida: string): Evento[] => {
    const todos = db.listarEventos();
    return todos.filter(evento => evento.date === dataEscolhida);
  }
};