import { BioEvent } from '../context/EventContext';

export const exportService = {
  
  /**
   * 1. EXPORTAR PARA JSON (Formato nativo, ótimo para backups e outros bancos)
   */
  exportToJSON: () => {
    const events = localStorage.getItem('pepadata_events') || '[]';
    const medications = localStorage.getItem('pepadata_medications') || '[]';
    
    // Une tudo em um objeto só de exportação
    const databaseCompleto = {
      exportadoEm: new Date().toISOString(),
      dados: {
        eventosBiosensoriais: JSON.parse(events),
        medicamentos: JSON.parse(medications)
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(databaseCompleto, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pepadata_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  /**
   * 2. EXPORTAR PARA CSV (Abre direto no Excel ou Python para análise estatística)
   */
  exportEventsToCSV: () => {
    const localData = localStorage.getItem('pepadata_events');
    if (!localData) return alert('Nenhum dado encontrado para exportar!');

    const eventos: BioEvent[] = JSON.parse(localData);
    
    // Cabeçalhos das colunas na tabela do Excel
    const headers = ['ID', 'Timestamp_UTC', 'Data_Local', 'Hora_Local', 'Gatilho_Evento', 'SpO2', 'BPM_Frequencia', 'Nivel_Movimento'];
    
    // Transforma cada evento em uma linha de texto separada por vírgulas
    const linhasCSV = eventos.map(event => {
      const dataObjeto = new Date(event.timestamp);
      const dataLocal = dataObjeto.toLocaleDateString('pt-BR');
      const horaLocal = dataObjeto.toLocaleTimeString('pt-BR');
      
      // Remove vírgulas internas dos textos digitados para não quebrar as colunas do CSV
      const labelLimpo = `"${event.label.replace(/"/g, '""')}"`;
      const movimentoLimpo = `"${event.movement.replace(/"/g, '""')}"`;

      return [
        event.id,
        event.timestamp,
        dataLocal,
        horaLocal,
        labelLimpo,
        event.spo2,
        event.heartRate,
        movimentoLimpo
      ].join(',');
    });

    // O '\uFEFF' força o Excel a abrir o arquivo com acentuação correta (UTF-8)
    const conteudoCSV = '\uFEFF' + [headers.join(','), ...linhasCSV].join('\n');
    
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `analise_sinais_vitais_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  }
};