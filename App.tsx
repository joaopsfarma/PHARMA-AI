
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
  WifiOff,
  Settings,
  X,
  ExternalLink,
  Key,
  RefreshCw,
  Github,
  CloudDownload
} from 'lucide-react';
import { generateEvolution } from './services/geminiService.ts';
import { EvolutionState } from './types.ts';
import { APP_TITLE, APP_SUBTITLE, DEFAULT_SYNC_URL } from './constants.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<EvolutionState>({
    rawInput: '',
    output: '',
    isLoading: false,
    error: null,
  });
  
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [tempKey, setTempKey] = useState(localStorage.getItem('PHARMA_API_KEY') || '');
  const [syncUrl, setSyncUrl] = useState(localStorage.getItem('PHARMA_SYNC_URL') || DEFAULT_SYNC_URL);
  const [lastSync, setLastSync] = useState(localStorage.getItem('PHARMA_LAST_SYNC') || 'Nunca');

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

  const handleSync = async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    try {
      const response = await fetch(syncUrl);
      if (!response.ok) throw new Error("Falha ao acessar repositório.");
      const newPrompt = await response.text();
      
      localStorage.setItem('PHARMA_CUSTOM_PROMPT', newPrompt);
      const now = new Date().toLocaleString('pt-BR');
      localStorage.setItem('PHARMA_LAST_SYNC', now);
      setLastSync(now);
      
      // Feedback de sucesso
      const originalTitle = document.title;
      document.title = "✅ Sincronizado!";
      setTimeout(() => document.title = originalTitle, 2000);
    } catch (err: any) {
      alert("Erro na sincronização: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('PHARMA_API_KEY', tempKey);
    localStorage.setItem('PHARMA_SYNC_URL', syncUrl);
    setIsSettingsOpen(false);
    setState(prev => ({ ...prev, error: null }));
  };

  const handleGenerate = async () => {
    const savedKey = localStorage.getItem('PHARMA_API_KEY');
    if (!savedKey) {
      setIsSettingsOpen(true);
      return;
    }
    if (!state.rawInput.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await generateEvolution(state.rawInput);
      setState(prev => ({ ...prev, output: result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    }
  };

  const handleCopy = useCallback(() => {
    if (!state.output) return;
    navigator.clipboard.writeText(state.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [state.output]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-xl py-4 px-6 md:px-10 flex justify-between items-center shrink-0 z-40 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-900/50">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none flex items-center gap-2">
              {APP_TITLE} 
              <span className="bg-emerald-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Cloud Sync</span>
            </h1>
            <p className="text-[10px] text-blue-300 uppercase tracking-[0.2em] mt-1.5 font-bold opacity-80">{APP_SUBTITLE}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
              isSyncing ? 'bg-slate-700 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-emerald-900/20'
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">SINCRONIZAR</span>
          </button>

          <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-all relative border border-white/5"
            title="Configurações"
          >
            <Settings className="w-5 h-5 text-blue-100" />
            {!localStorage.getItem('PHARMA_API_KEY') && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-blue-900 animate-bounce"></span>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-hidden p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Input Card */}
        <section className="flex flex-col bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden group">
          <div className="bg-slate-50/80 px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <span className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">Input Clínico</span>
            </div>
            <button onClick={() => setState(p => ({...p, rawInput: ''}))} className="text-slate-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-hidden">
            <textarea 
              value={state.rawInput}
              onChange={(e) => setState(prev => ({ ...prev, rawInput: e.target.value }))}
              className="flex-1 w-full text-sm md:text-base p-6 bg-slate-50/50 border-2 border-transparent rounded-3xl focus:border-blue-500/20 focus:bg-white outline-none transition-all resize-none font-medium text-slate-700 placeholder:text-slate-300 leading-relaxed shadow-inner"
              placeholder="Exemplo: Paciente estável em D2 de Piperacilina/Tazobactam. Creatinina 1.8. Em uso de Amiodarona e Fluconazol..."
            />
            
            <button 
              onClick={handleGenerate}
              disabled={state.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-black py-5 px-8 rounded-2xl shadow-2xl shadow-blue-600/30 transition-all flex justify-center items-center gap-4 disabled:bg-slate-300 disabled:shadow-none shrink-0 uppercase tracking-widest text-sm"
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                  <span>Processando IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 fill-white/20" />
                  <span>Gerar Evolução</span>
                </>
              )}
            </button>

            {state.error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 text-xs font-bold flex items-center gap-3 animate-pulse shrink-0">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <span>{state.error}</span>
              </div>
            )}
          </div>
        </section>

        {/* Output Card */}
        <section className="flex flex-col bg-slate-900 rounded-[2rem] shadow-2xl shadow-blue-900/20 overflow-hidden relative border border-slate-800">
          <div className="bg-slate-950/50 px-8 py-5 flex justify-between items-center border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Relatório Farmacoterapêutico</span>
            </div>
            <button 
              onClick={handleCopy}
              disabled={!state.output}
              className={`text-[10px] uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl font-black transition-all flex items-center gap-3 ${
                copied ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              } disabled:opacity-20`}
            >
              {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
          
          <div className="flex-1 relative overflow-hidden bg-slate-900/50">
            <textarea 
              readOnly
              value={state.output}
              className="w-full h-full bg-transparent text-slate-300 text-xs md:text-sm p-8 md:p-10 font-mono focus:outline-none leading-loose resize-none overflow-y-auto selection:bg-blue-500/40"
              placeholder="O resultado será exibido aqui em formato estruturado pronto para o prontuário..."
            />
          </div>
        </section>
      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-slate-100">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 opacity-50" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">Preferências</h3>
                </div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest opacity-70">Configuração de Sincronia e Segurança</p>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              {/* API Key Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Key className="w-3 h-3 text-blue-500" /> Google Gemini API Key
                  </label>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] font-bold text-blue-600 hover:underline">Obter Chave Grátis</a>
                </div>
                <input 
                  type="password"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Paste your API key here..."
                  className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-sm focus:border-blue-500 outline-none font-mono"
                />
              </div>

              {/* Sync URL Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Github className="w-3 h-3 text-slate-900" /> URL de Sincronia (GitHub Rules)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={syncUrl}
                    onChange={(e) => setSyncUrl(e.target.value)}
                    placeholder="URL do arquivo RAW no GitHub..."
                    className="flex-1 bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl text-sm focus:border-blue-500 outline-none font-medium text-slate-600"
                  />
                </div>
                <div className="flex justify-between items-center px-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Último Sync: <span className="text-emerald-600">{lastSync}</span></p>
                </div>
              </div>

              <button 
                onClick={saveSettings}
                className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 uppercase tracking-widest text-sm active:scale-[0.98]"
              >
                Salvar e Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="py-3 px-8 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">© 2024 Clinical Pharma</span>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-1.5">
            <CloudDownload className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] text-slate-500 font-bold uppercase">Rules v1.02</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
          <span className="text-[10px] text-slate-700 font-black uppercase tracking-tighter">Engine: Gemini-3-Flash</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
