import { supabase } from './supabase';

export interface Evento {
  id: string;
  timestamp: string;
  eventType: string;
  notes?: string;
  bpm: number;
  spo2: number;
  movementClass: string;
  accelerationMaxG: number;
  synced?: boolean;
  telemetria_detalhada?: {
    segundo: number;
    spo2: number;
    heartRate: number;
    accelerationG: number;
  }[];
}

const STORAGE_KEY = 'pepadata_events';

const lerLocal = (): Evento[] => {
  const dados = localStorage.getItem(STORAGE_KEY);
  return dados ? JSON.parse(dados) : [];
};

const salvarLocal = (eventos: Evento[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos));
};

export const db = {
  // SALVAR EVENTO (Tenta nuvem primeiro; se falhar, guarda local)
  salvarEvento: async (novoEvento: Omit<Evento, 'id' | 'synced'>): Promise<Evento> => {
    const idGerado = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 1. Prepara os dados puros que o Supabase espera (sem a flag synced)
    const dadosNuvem = {
      ...novoEvento,
      id: idGerado
    };

    // 2. Prepara o objeto completo com a flag que o seu App local usa
    const eventoCompleto: Evento = {
      ...dadosNuvem,
      synced: false
    };

    try {
      // Envia APENAS as colunas que existem de verdade no banco de dados
      const { error } = await supabase.from('eventos').insert([dadosNuvem]);
      
      if (!error) {
        eventoCompleto.synced = true;
        console.log('Criado e salvo na nuvem com sucesso!');
      } else {
        console.warn('Supabase recusou o insert, salvando apenas local:', error);
      }
    } catch (err) {
      console.warn('Sem internet. O evento foi guardado localmente para sincronização posterior.');
    }

    // Atualiza o histórico local imediatamente
    const locais = lerLocal();
    locais.unshift(eventoCompleto);
    salvarLocal(locais);

    return eventoCompleto;
  },

  // SINCRONIZAR PENDENTES (Limpa o que ficou preso no modo offline)
  sincronizarPendentes: async (): Promise<void> => {
    const eventos = lerLocal();
    const pendentes = eventos.filter(e => !e.synced);

    if (pendentes.length === 0) return;

    // Remove a flag synced antes de mandar pro banco
    const payload = pendentes.map(({ synced, ...dadosNuvem }) => dadosNuvem);

    try {
      const { error } = await supabase.from('eventos').insert(payload);

      if (!error) {
        const atualizados = lerLocal().map(e => 
          pendentes.some(p => p.id === e.id) ? { ...e, synced: true } : e
        );
        salvarLocal(atualizados);
        console.log('Eventos pendentes sincronizados!');
      }
    } catch (err) {
      console.error('Falha ao tentar rodar sincronização em background:', err);
    }
  },

  // LISTAR EVENTOS (Traz tudo da nuvem e limpa o cache local)
  listarEventos: async (): Promise<Evento[]> => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const eventosNuvem = (data && Array.isArray(data)) ? data : [];
      
      // Marcar tudo que veio da nuvem como synced: true no local storage
      const nuvemFormatada = eventosNuvem.map(e => ({ ...e, synced: true }));
      
      // Mantém local apenas o que ainda não subiu por falta de rede
      const locaisPendentes = lerLocal().filter(e => !e.synced);
      
      const listaFinal = [...locaisPendentes, ...nuvemFormatada];
      salvarLocal(listaFinal);

      return listaFinal;
    } catch (error) {
      console.error("Modo offline ativo: exibindo dados do cache local.");
      return lerLocal();
    }
  },

  // BUSCA POR DATA
  buscarPorData: async (dataEscolhida: string): Promise<Evento[]> => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .like('timestamp', `${dataEscolhida}%`)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return (data as Evento[]) || [];
    } catch {
      return lerLocal().filter(e => e.timestamp.startsWith(dataEscolhida));
    }
  }
};