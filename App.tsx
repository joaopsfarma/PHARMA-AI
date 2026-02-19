
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
      setState(prev => ({ ...prev, error: "Você está sem internet. A IA precisa de conexão para processar os dados." }));
      return;
    }
    if (!state.rawInput.trim()) {
      setState(prev => ({ ...prev, error: "Por favor, insira os dados do paciente antes de gerar." }));
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
    if (confirm('Tem certeza que deseja apagar todos os dados e resultados?')) {
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
    <div className="flex flex-col h-screen max-h-screen bg-slate-50">
      {/* Offline Alert */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-center py-1 text-xs font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3 h-3" /> Você está offline. A interface funciona, mas a IA requer internet.
        </div>
      )}

      {/* Header */}
      <header className="bg-blue-800 text-white shadow-md py-4 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-800">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide leading-tight">{APP_TITLE}</h1>
            <p className="text-xs text-blue-200">{APP_SUBTITLE}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleClear}
            className="flex items-center gap-1 text-sm bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> 
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Input Panel */}
        <section className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-0">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
            <h2 className="text-md font-semibold text-slate-700 flex items-center gap-2">
              <ClipboardPaste className="w-5 h-5 text-blue-600" /> 
              Dados Brutos
            </h2>
          </div>
          
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
            <textarea 
              value={state.rawInput}
              onChange={(e) => setState(prev => ({ ...prev, rawInput: e.target.value }))}
              className="flex-1 w-full text-sm p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-sans"
              placeholder="# Cole os dados aqui..."
            />
            
            <button 
              onClick={handleGenerate}
              disabled={state.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all flex justify-center items-center gap-2 disabled:bg-slate-400 shrink-0"
            >
              {state.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <span>{state.isLoading ? 'Analisando...' : 'Gerar Evolução'}</span>
            </button>

            {state.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm flex items-start gap-2 shrink-0">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Output Panel */}
        <section className="flex flex-col bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden min-h-0">
          <div className="bg-slate-900 px-5 py-3 flex justify-between items-center border-b border-slate-700 shrink-0">
            <h3 className="text-md font-semibold text-slate-200 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" /> 
              Resultado
            </h3>
            <button 
              onClick={handleCopy}
              disabled={!state.output}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                copied ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
              } disabled:opacity-50`}
            >
              {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          
          <div className="flex-1 relative overflow-hidden bg-slate-800">
            {state.isLoading && (
              <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm z-10 flex items-center justify-center text-white">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Cruzando dados e PRMs...</p>
                </div>
              </div>
            )}

            <textarea 
              readOnly
              value={state.output}
              className="w-full h-full bg-slate-800 text-slate-200 text-sm p-6 font-mono focus:outline-none leading-relaxed resize-none overflow-y-auto"
              placeholder="Aguardando análise..."
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
