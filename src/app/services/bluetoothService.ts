import { BleClient } from '@capacitor-community/bluetooth-le';

export interface BiosensoresData {
  spo2: number;
  heartRate: number;
  accX: number;
  accY: number;
  accZ: number;
}

const SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
const CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

// 🚀 VARIÁVEIS GLOBAIS DE ESCALA NATIVA (Imunes a qualquer mudança de rota do React)
let dispositivoId: string | null = null;
let dadosGraficoGlobais: BiosensoresData[] = Array.from({ length: 20 }).map((_, i) => ({
  spo2: 0, heartRate: 0, accX: 0, accY: 0, accZ: 9.8
}));
let ouvintesAtivos: ((dados: BiosensoresData) => void)[] = [];
let escutandoNotificacoes = false;

export const MobileBluetoothService = {
  
  // Métodos auxiliares para expor o estado real do Bluetooth para os componentes React
  obterHistoricoGrafico() {
    return dadosGraficoGlobais;
  },

  isConectado() {
    return dispositivoId !== null;
  },

  // Remove um componente específico da lista de transmissão sem desligar o Bluetooth
  removerOuvinte(callbackParaRemover: (dados: BiosensoresData) => void) {
    ouvintesAtivos = ouvintesAtivos.filter(cb => cb !== callbackParaRemover);
    console.log(`Ouvinte removido. Total de ouvintes segurando o canal: ${ouvintesAtivos.length}`);
  },

  async conectar(onDadosRecebidos: (dados: BiosensoresData) => void) {
    // 💡 SACADA DE ENGENHARIA: Se o aparelho já está conectado nativamente, 
    // apenas adicionamos a nova página/contexto na fila de distribuição de dados
    if (dispositivoId && escutandoNotificacoes) {
      if (!ouvintesAtivos.includes(onDadosRecebidos)) {
        ouvintesAtivos.push(onDadosRecebidos);
      }
      // Entrega o último ponto imediatamente para o gráfico não renderizar vazio
      onDadosRecebidos(dadosGraficoGlobais[dadosGraficoGlobais.length - 1]);
      return;
    }

    // Se é a primeira conexão, registra o ouvinte inicial
    if (!ouvintesAtivos.includes(onDadosRecebidos)) {
      ouvintesAtivos.push(onDadosRecebidos);
    }

    try {
      // 1. Inicializa o Bluetooth
      await BleClient.initialize();

      try {
        await BleClient.enable(); 
      } catch (e) {
        console.log("Bluetooth já ativado ou ativação direta não suportada.");
      }

      // 2. Solicita o dispositivo mostrando tudo
      const device = await BleClient.requestDevice({
        namePrefix: '', 
        optionalServices: [SERVICE_UUID]
      });

      dispositivoId = device.deviceId;
      console.log("Dispositivo selecionado:", device.name, dispositivoId);

      // Conecta fisicamente na ESP32-H2 Mini
      await BleClient.connect(dispositivoId, () => {
        console.log("ESP32 desconectou inesperadamente.");
        dispositivoId = null;
        escutandoNotificacoes = false;
        ouvintesAtivos = [];
        try {
          (BleClient as any).stopForegroundService?.();
          (BleClient as any).stopForegroundAction?.();
        } catch (err) {
          console.error("Erro ao parar serviço em desconexão forçada:", err);
        }
      });
      console.log("Conectado ao dispositivo:", dispositivoId);

      // INICIA O SERVIÇO DE PRIMEIRO PLANO
      try {
        await (BleClient as any).startForegroundService?.({
          notificationTitle: "Pepadata Monitoramento",
          notificationText: "Conectado à ESP32 colhendo dados de saúde...",
          smallIcon: "ic_launcher",
          channelId: "pepadata_ble_channel"
        });
        console.log("Tentativa de iniciar serviço de primeiro plano enviada.");
      } catch (foregroundError) {
        console.warn("Foreground service não pôde ser iniciado:", foregroundError);
      }

      // 3. Inicia as notificações globais de dados
      escutandoNotificacoes = true;
      await BleClient.startNotifications(
        dispositivoId,
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (value) => {
          const decoder = new TextDecoder('utf-8');
          const stringDados = decoder.decode(value);
          
          try {
            const objetoDados: BiosensoresData = JSON.parse(stringDados);
            
            // 🚀 Salva os dados na memória estável (Fora do alcance de destruição do React)
            dadosGraficoGlobais = [...dadosGraficoGlobais.slice(1)];
            dadosGraficoGlobais.push(objetoDados);

            // Transmite o dado para todas as telas que estiverem escutando (Layout, Dashboard, etc.)
            ouvintesAtivos.forEach(ouvinte => {
              try { ouvinte(objetoDados); } catch(e) { console.error("Erro no ouvinte:", e); }
            });

          } catch (e) {
            console.warn("Erro ao processar JSON da ESP:", stringDados);
          }
        }
      );

    } catch (error) {
      console.error("Erro no Bluetooth do celular:", error);
      ouvintesAtivos = ouvintesAtivos.filter(cb => cb !== onDadosRecebidos);
      throw error;
    }
  },

  async desconectar() {
    if (dispositivoId) {
      try {
        await BleClient.stopNotifications(dispositivoId, SERVICE_UUID, CHARACTERISTIC_UUID);
        await BleClient.disconnect(dispositivoId);
      } catch (e) {
        console.error("Erro ao tentar desconectar de forma limpa:", e);
      } finally {
        try {
          (BleClient as any).stopForegroundService?.();
          (BleClient as any).stopForegroundAction?.();
        } catch (serviceErr) {
          console.error("Erro ao parar o Foreground Service:", serviceErr);
        }
        dispositivoId = null;
        escutandoNotificacoes = false;
        ouvintesAtivos = [];
        console.log("Dispositivo desconectado.");
      }
    }
  }
};