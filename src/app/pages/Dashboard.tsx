import { useState, useEffect } from 'react';
import { Bluetooth, BluetoothConnected, Activity, Heart, Move3d } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const generateData = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    time: i,
    spo2: 97 + Math.random() * 3,
    hr: 70 + Math.random() * 15,
    accX: Math.random() * 2 - 1,
    accY: Math.random() * 2 - 1,
    accZ: 9.8 + Math.random() * 0.5,
  }));
};

export function Dashboard() {
  const [connected, setConnected] = useState(true);
  const [data, setData] = useState(generateData(20));

  useEffect(() => {
    if (!connected) return;
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1)];
        const last = next[next.length - 1];
        next.push({
          time: last.time + 1,
          spo2: 97 + Math.random() * 3,
          hr: 70 + Math.random() * 15,
          accX: Math.random() * 2 - 1,
          accY: Math.random() * 2 - 1,
          accZ: 9.8 + Math.random() * 0.5,
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [connected]);

  const current = data[data.length - 1];
  const movementLevel = Math.abs(Math.sqrt(current.accX ** 2 + current.accY ** 2 + current.accZ ** 2) - 9.8);
  const movementBars = movementLevel < 0.3 ? 1 : movementLevel < 1.0 ? 3 : 5;

  const movementStatus = movementLevel < 0.3 ? 'Baixo' : movementLevel < 1.0 ? 'Moderado' : 'Alto';

  return (
    <div className="p-6 pb-8 space-y-5 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-2 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sinais Vitais</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Aquisição em Tempo Real</p>
        </div>
        <button 
          onClick={() => setConnected(!connected)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors shadow-sm ${connected ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-white text-slate-500 border border-slate-200'}`}
        >
          {connected ? <BluetoothConnected size={14} /> : <Bluetooth size={14} />}
          {connected ? 'Conectado' : 'Desconectado'}
        </button>
      </header>

      {/* Card de SpO2 */}
      <div className="bg-white p-5 rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 text-blue-500">
            <div className="p-2.5 bg-blue-50/80 rounded-xl">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            <span className="font-semibold tracking-tight text-slate-700">
              Oxigenação
            </span>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800">
              {current.spo2.toFixed(0)}
              <span className="text-sm font-medium text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="h-16 w-full mt-2 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <YAxis domain={[90, 100]} hide />
              <Line
                type="monotone"
                dataKey="spo2"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card de Frequência Cardíaca */}
      <div className="bg-white p-5 rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 text-rose-500">
            <div className="p-2.5 bg-rose-50/80 rounded-xl">
              <Heart size={20} strokeWidth={2.5} />
            </div>
            <span className="font-semibold tracking-tight text-slate-700">Frequência Cardíaca</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800">{Math.round(current.hr)} <span className="text-sm font-medium text-slate-400">BPM</span></div>
          </div>
        </div>
        <div className="h-16 w-full mt-2 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <YAxis domain={[50, 120]} hide />
              <Line type="monotone" dataKey="hr" stroke="#f43f5e" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card do Acelerômetro (Movimento) */}
      <div className="bg-white p-5 rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="p-2.5 bg-blue-50/80 rounded-xl">
              <Move3d size={20} strokeWidth={2.5} />
            </div>
            <span className="font-semibold tracking-tight text-slate-700">Movimento</span>
          </div>
          <div className="text-right">
            <div className="flex gap-1 justify-end mb-1">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className={`h-4 w-2 rounded-full ${
                    bar <= movementBars
                      ? 'bg-blue-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="text-sm font-semibold text-slate-700">
              {movementStatus}
            </div>
          </div>
        </div>
        <div className="h-16 w-full mt-2 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <YAxis domain={[-2, 12]} hide />
              <Line type="monotone" dataKey="accX" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="accY" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="accZ" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}