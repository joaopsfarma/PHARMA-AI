
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Bot, 
  Trash2, 
  ClipboardPaste, 
  Sparkles, 
  AlertTriangle, 
  FileCheck2, 
  Copy, 
  CheckCheck,
  Loader2,
  WifiOff
} from 'lucide-react';
import { generateEvolution } from './services/geminiService.ts';
import { EvolutionState } from './types.ts';
import { APP_TITLE, APP_SUBTITLE } from './constants.tsx';

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
      setState(prev => ({ ...prev, error: "Sem conexão com a internet." }));
      return;
    }
    if (!state.rawInput.trim()) {
      setState(prev => ({ ...prev, error: "Insira os dados brutos para análise." }));
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
    if (confirm('Limpar todos os dados?')) {
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
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 font-sans">
      {!isOnline && (
        <div className="bg-amber-600 text-white text-center py-1.5 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <WifiOff className="w-4 h-4" /> VOCÊ ESTÁ OFFLINE
        </div>
      )}

      <header className="bg-blue-800 text-white shadow-lg py-4 px-6 flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{APP_TITLE}</h1>
            <p className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">{APP_SUBTITLE}</p>
          </div>
        </div>
        <button 
          onClick={handleClear}
          className="p-2 hover:bg-blue-700 rounded-full transition-colors group"
          title="Limpar tudo"
        >
          <Trash2 className="w-5 h-5 text-blue-200 group-hover:text-white" />
        </button>
      </header>

      <main className="flex-1 overflow-hidden p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-100">
        <section className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-200 flex items-center gap-2 shrink-0">
            <ClipboardPaste className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Entrada de Dados</span>
          </div>
          
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
            <textarea 
              value={state.rawInput}
              onChange={(e) => setState(prev => ({ ...prev, rawInput: e.target.value }))}
              className="flex-1 w-full text-sm p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none font-sans leading-relaxed"
              placeholder="Ex: Paciente 70 anos, ClCr 40. Uso de: Meropenem 2g 8/8h, Amiodarona..."
            />
            
            <button 
              onClick={handleGenerate}
              disabled={state.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-blue-200 shadow-lg transition-all flex justify-center items-center gap-3 disabled:bg-slate-300 disabled:shadow-none shrink-0"
            >
              {state.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-blue-200" />
              )}
              <span>{state.isLoading ? 'PROCESSANDO ANÁLISE...' : 'GERAR EVOLUÇÃO CLÍNICA'}</span>
            </button>

            {state.error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 text-xs flex items-start gap-3 animate-in slide-in-from-bottom-2 shrink-0 overflow-y-auto max-h-32">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <span className="leading-relaxed font-medium">{state.error}</span>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-950 px-5 py-3 flex justify-between items-center border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Evolução Estruturada</span>
            </div>
            <button 
              onClick={handleCopy}
              disabled={!state.output}
              className={`text-[10px] uppercase tracking-tighter px-4 py-2 rounded-lg font-black transition-all flex items-center gap-2 ${
                copied ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              } disabled:opacity-30`}
            >
              {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          
          <div className="flex-1 relative overflow-hidden bg-slate-900">
            {state.isLoading && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-10 flex items-center justify-center text-white">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
                  <p className="text-xs font-bold text-blue-200 tracking-widest uppercase">Analisando Farmacoterapia</p>
                </div>
              </div>
            )}

            <textarea 
              readOnly
              value={state.output}
              className="w-full h-full bg-slate-900 text-emerald-50/90 text-[13px] p-6 font-mono focus:outline-none leading-7 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700"
              placeholder="O resultado será exibido aqui..."
            />
          </div>
        </section>
      </main>
      
      <footer className="bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-tighter shrink-0">
        <span>PharmaAI v1.2</span>
        <span>Uso restrito a profissionais de saúde</span>
      </footer>
    </div>
  );
};

export default App;
