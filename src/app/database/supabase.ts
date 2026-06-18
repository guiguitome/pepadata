import { createClient } from '@supabase/supabase-js';

// Usamos 'as any' para o TypeScript ignorar a trava visual e ler o objeto do Vite
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Log para checarmos no F12 se agora ele consegue ler do seu arquivo .env
console.log('🔍 Teste de Chaves:', { url: supabaseUrl, key: supabaseKey ? 'Encontrada!' : 'Vazia!' });

if (!supabaseUrl || !supabaseKey) {
  console.error('🚨 ERRO CRÍTICO: As chaves do Supabase não foram encontradas no arquivo .env!');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url-para-nao-travar-o-app.supabase.co', 
  supabaseKey || 'placeholder-key'
);