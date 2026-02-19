
import React, { useState, useCallback, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { generateEvolution } from './services/geminiService.ts';
import { EvolutionState } from './types.ts';
import { APP_TITLE, APP_SUBTITLE } from './constants.tsx';

// Extração segura dos ícones para evitar falhas de desestruturação em alguns módulos ESM
const { 
  Bot, Trash2, ClipboardPaste, Sparkles, AlertTriangle, 
  FileCheck2, Copy, CheckCheck, Loader2, WifiOff 
} = Lucide;

const App: React.FC = () => {
  const [state, setState] = useState<EvolutionState>({
    rawInput: '',
    output: '',
    isLoading: false,
    error: null,
  });
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleGenerate = async () => {
    if (!isOnline) {
      setState(prev => ({ ...prev, error: "Sem internet. A IA requer conexão ativa." }));
      return;
    }
    if (!state.rawInput.trim()) {
      setState(prev => ({ ...prev, error: "Insira os dados brutos antes de analisar." }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await generateEvolution(state.rawInput);
      setState(prev => ({ ...prev, output: result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    }
  };

  const handleClear = () => {
    if (confirm('Limpar todos os campos?')) {
      setState({
        rawInput: '',
        output: '',
        isLoading: false,
        error: null,
      });
    }
  };

  const handleCopy = useCallback(() => {
    if (!state.output) return;
    navigator.clipboard.writeText(state.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [state.output]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-100">
      {!isOnline && (
        <div className="bg-red-600 text-white text-center py-1 text-xs font-bold flex items-center justify-center gap-2">
          <WifiOff size={14} /> MODO OFFLINE: A IA NÃO FUNCIONARÁ
        </div>
      )}

      <header className="bg-blue-900 text-white shadow-lg py-4 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">{APP_TITLE}</h1>
            <p className="text-[10px] text-blue-300 uppercase tracking-widest mt-1">{APP_SUBTITLE}</p>
          </div>
        </div>
        <button 
          onClick={handleClear}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          title="Limpar tudo"
        >
          <Trash2 size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-hidden p-3 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <section className="flex flex-col bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-2 shrink-0">
            <ClipboardPaste size={18} className="text-blue-600" />
            <span className="text-sm font-bold text-slate-700">Entrada de Dados Clínicos</span>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-hidden">
            <textarea 
              value={state.rawInput}
              onChange={(e) => setState(prev => ({ ...prev, rawInput: e.target.value }))}
              className="flex-1 w-full text-sm p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none bg-slate-50 font-sans"
              placeholder="Cole aqui: Histórico, Exames, Prescrição ou Evolução Médica..."
            />
            <button 
              onClick={handleGenerate}
              disabled={state.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md flex justify-center items-center gap-2 disabled:bg-slate-400 transition-all active:scale-[0.98]"
            >
              {state.isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {state.isLoading ? 'PROCESSANDO...' : 'ESTRUTURAR EVOLUÇÃO'}
            </button>
            {state.error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs flex items-center gap-2 animate-bounce">
                <AlertTriangle size={14} className="shrink-0" />
                {state.error}
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden">
          <div className="bg-black/20 px-4 py-2 flex justify-between items-center border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <FileCheck2 size={18} className="text-emerald-400" />
              <span className="text-sm font-bold text-slate-300">Evolução Farmacêutica</span>
            </div>
            <button 
              onClick={handleCopy}
              disabled={!state.output}
              className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-2 ${
                copied ? 'bg-blue-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
              } disabled:opacity-30`}
            >
              {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
              {copied ? 'COPIADO' : 'COPIAR'}
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            {state.isLoading && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white p-6">
                <Loader2 size={40} className="text-blue-500 animate-spin mb-3" />
                <p className="text-sm font-bold tracking-widest text-blue-400">ANALISANDO INTERAÇÕES...</p>
                <p className="text-[10px] text-slate-500 mt-2">Isso pode levar até 10 segundos</p>
              </div>
            )}
            <textarea 
              readOnly
              value={state.output}
              className="w-full h-full bg-transparent text-slate-300 text-sm p-6 font-mono focus:outline-none leading-relaxed resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700"
              placeholder="A evolução estruturada será exibida aqui..."
            />
          </div>
        </section>
      </main>
      <footer className="py-2 text-center text-[9px] text-slate-400 font-medium">
        PHARMA AI - APOIO À DECISÃO CLÍNICA • SEMPRE REVISE AS SUGESTÕES
      </footer>
    </div>
  );
};

export default App;
