
import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { GoogleGenAI } from "@google/genai";
import { 
  Send, BrainCircuit, AlertCircle, RefreshCw, 
  ShieldCheck, Eye, Search, FlaskConical,
  TrendingUp, AlertTriangle, FileSearch, Sparkles,
  Radio, Lock, Construction, Siren
} from 'lucide-react';

interface GimAIPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

type AIMode = 'ADVISOR' | 'AUDITOR' | 'SIMULATION';
type Environment = 'LIVE' | 'SIMULATION';

const GimAIPage: React.FC<GimAIPageProps> = ({ state, updateState }) => {
  const [chatInput, setChatInput] = useState('');
  
  // Split state into Environment (Big Switch) and Sub-Mode
  const [environment, setEnvironment] = useState<Environment>('LIVE');
  const [liveSubMode, setLiveSubMode] = useState<'ADVISOR' | 'AUDITOR'>('AUDITOR'); // Default to Auditor for this request

  const currentMode: AIMode = environment === 'SIMULATION' ? 'SIMULATION' : liveSubMode;
  
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model', text: string }>>([
    { role: 'model', text: 'أهلاً بك في وحدة الرقابة المركزية (GIM Compliance Core). \n\nأنا جاهز لتدقيق العمليات، كشف المخاطر، وضمان الامتثال للقوانين الداخلية.' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Clear chat when switching environments to prevent context pollution
  const handleEnvironmentSwitch = (env: Environment) => {
      if (env !== environment) {
          setEnvironment(env);
          setChatHistory([{ 
              role: 'model', 
              text: env === 'LIVE' 
                ? '🔴 النظام الآن في الوضع الحي (LIVE). أراقب البيانات الحقيقية للشركة.' 
                : '🟠 النظام الآن في وضع المحاكاة (SIMULATION). هذا مختبر تجارب معزول.' 
          }]);
      }
  };

  // --- MODE SPECIFIC INSTRUCTIONS ---
  const getModeInstruction = (mode: AIMode) => {
    switch (mode) {
      case 'ADVISOR':
        return `
          **MODE: ADVISOR (Strategic Consultant)**
          - ROLE: Business Growth Partner.
          - TONE: Professional, Constructive, Forward-looking.
          - GOAL: Optimize revenue, suggest marketing strategies, improve customer retention.
        `;
      case 'AUDITOR':
        return `
          **MODE: COMPLIANCE OFFICER (The Strict Auditor)**
          - ROLE: Internal Auditor & Risk Manager.
          - TONE: Strict, Direct, Fact-based, No-nonsense. Use emojis like 🚨, ⚠️, 🔍.
          - GOAL: Detect fraud, laziness, low margins, and policy violations.
          - POLICIES TO ENFORCE:
            1. **No Photo, No Closure:** Any 'Completed' visit MUST have a 'photoAfter'. If not, flag it immediately as "Procedural Violation".
            2. **Minimum Margin:** Any product sold with < 15% profit margin is a "Financial Risk".
            3. **Recurring Issues:** If a client has > 3 tickets in 30 days, suggest a "Maintenance Contract" (Upsell Opportunity).
            4. **Stock Discrepancy:** Highlight items with high stock but zero sales in the log.
          - OUTPUT FORMAT: Start with a clear "Status Verdict" (e.g., "⚠️ Violations Found" or "✅ All Clear"). Then list findings bulleted.
        `;
      case 'SIMULATION':
        return `
          **MODE: SIMULATION (The Sandbox)**
          - ROLE: Future Scenario Simulator.
          - TONE: Analytical, Hypothetical.
          - GOAL: Run "What-If" scenarios.
          - RULES: Calculate projected outcomes based on user input. State clearly: "PROJECTION ONLY."
        `;
    }
  };

  const generateSystemInstruction = () => {
    // 1. Snapshot of Data (Simplified for Token Limit)
    // Inventory Snapshot
    const inventoryList = state.inventory.map(i => 
      `- Item: ${i.name} | Qty: ${i.quantity} | Buy: ${i.purchasePrice} | Sell: ${i.sellingPrice}`
    ).join('\n');

    // Visits/Tasks Snapshot (Critical for Auditor)
    const visitsLog = state.visits.map(v => {
        const tech = state.technicians.find(t => t.id === v.technicianId)?.name || 'Unknown';
        const client = state.clients.find(c => c.id === v.clientId)?.name || 'Unknown';
        return `- VisitID: ${v.id.substr(0,4)} | Client: ${client} | Tech: ${tech} | Status: ${v.status} | PhotoBefore: ${v.proofOfWork?.photoBefore ? 'YES' : 'NO'} | PhotoAfter: ${v.proofOfWork?.photoAfter ? 'YES' : 'NO'}`;
    }).join('\n');

    // Financial Documents
    const invoices = state.documents.filter(d => d.type === 'FACTURE').map(d => 
      `- Inv #${d.number} | Total: ${d.total} | Status: ${d.status} | Date: ${d.date}`
    ).join('\n');

    // 2. Construct the PROMPT
    return `
      ${getModeInstruction(currentMode)}

      === LIVE SYSTEM DATA SNAPSHOT ===
      
      [INVENTORY & PRICING]
      ${inventoryList || 'No inventory items.'}

      [FIELD OPERATIONS LOG]
      ${visitsLog || 'No visits recorded.'}

      [FINANCIAL RECORDS]
      ${invoices || 'No invoices.'}

      === UNIVERSAL RULES ===
      1. You are a "Second Brain" inside the GIM-OS.
      2. Analyze the provided SNAPSHOT data to answer.
      3. If in AUDITOR mode, be extremely critical about the 'FIELD OPERATIONS LOG'.
    `;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsProcessing(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key missing");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: generateSystemInstruction(),
          temperature: currentMode === 'AUDITOR' ? 0.2 : 0.7, // Low temp for strict auditing
        }
      });

      const responseText = response.text || "لم أستطع تكوين استجابة.";

      setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
      
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "⚠️ خطأ في الاتصال بمحرك التحليل المركزي." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLive = environment === 'LIVE';

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700 pb-24 bg-[#f8fafc] min-h-screen text-right font-arabic" dir="rtl">
      
      {/* 1. SAFETY SWITCH HEADER */}
      <div className="flex justify-center mb-6">
          <div className="bg-slate-200 p-1.5 rounded-full flex shadow-inner border border-slate-300">
              <button 
                  onClick={() => handleEnvironmentSwitch('LIVE')}
                  className={`px-8 py-3 rounded-full font-black text-xs flex items-center gap-2 transition-all ${isLive ? 'bg-white text-slate-800 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Radio size={16} className={isLive ? 'text-red-600 animate-pulse' : ''} />
                  <span>🔴 LIVE AUDIT</span>
              </button>
              <button 
                  onClick={() => handleEnvironmentSwitch('SIMULATION')}
                  className={`px-8 py-3 rounded-full font-black text-xs flex items-center gap-2 transition-all ${!isLive ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <FlaskConical size={16} className={!isLive ? 'text-white' : ''} />
                  <span>🟠 SIMULATION</span>
              </button>
          </div>
      </div>

      {/* Header Card - Context Aware */}
      <div className={`rounded-[2.5rem] p-8 border transition-all relative overflow-hidden shadow-xl ${isLive ? 'bg-[#0f172a] border-slate-800' : 'bg-amber-950 border-amber-600'}`}>
         {/* Striped Background for Simulation */}
         {!isLive && (
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25px, #000 50px, transparent 50px, transparent 75px)' }}></div>
         )}

         <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border-2 ${isLive ? 'bg-blue-600 border-blue-400/30' : 'bg-amber-600 border-amber-400/30'}`}>
                      {currentMode === 'AUDITOR' ? <Siren size={32} className="text-white animate-pulse" /> : <BrainCircuit size={32} className="text-white" />}
                   </div>
                   <div>
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-1">GIM Mind 4.0</h2>
                      <p className={`font-bold text-xs ${isLive ? 'text-blue-200' : 'text-amber-200'}`}>
                          {isLive ? 'مركز الامتثال والعمليات (Compliance Core)' : 'بيئة تجريبية معزولة (Sandbox)'}
                      </p>
                   </div>
                </div>
                
                {/* SUB-MODE SWITCHER (ONLY FOR LIVE) */}
                {isLive ? (
                    <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-600">
                        <button 
                            onClick={() => setLiveSubMode('ADVISOR')}
                            className={`px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all ${liveSubMode === 'ADVISOR' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Sparkles size={14} />
                            <span className="text-[10px] font-black uppercase">Advisor</span>
                        </button>
                        
                        <button 
                            onClick={() => setLiveSubMode('AUDITOR')}
                            className={`px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all ${liveSubMode === 'AUDITOR' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase">Auditor</span>
                        </button>
                    </div>
                ) : (
                    <div className="bg-amber-900/50 px-4 py-2 rounded-xl border border-amber-500/30">
                        <p className="text-amber-400 text-[10px] font-black uppercase flex items-center gap-2">
                            <AlertTriangle size={14} /> Disconnected from Database Write
                        </p>
                    </div>
                )}
            </div>

            {/* Context Banner */}
            <div className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${
                isLive 
                ? (liveSubMode === 'ADVISOR' ? 'bg-blue-900/20 border-blue-500/30 text-blue-200' : 'bg-red-900/20 border-red-500/30 text-red-200')
                : 'bg-white/10 border-amber-500/50 text-amber-100'
            }`}>
                {currentMode === 'ADVISOR' && <Sparkles className="shrink-0 mt-1" size={20} />}
                {currentMode === 'AUDITOR' && <Siren className="shrink-0 mt-1" size={20} />}
                {currentMode === 'SIMULATION' && <FlaskConical className="shrink-0 mt-1" size={20} />}
                
                <div>
                    <h4 className="font-black text-sm uppercase mb-1">
                        {currentMode === 'ADVISOR' ? 'Advisor Mode: المستشار الاستراتيجي' : 
                         currentMode === 'AUDITOR' ? 'Compliance Officer: مدقق الامتثال (شرطي العمليات)' : 
                         'Simulation Mode: مختبر المحاكاة (تخيل النتائج)'}
                    </h4>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">
                        {currentMode === 'ADVISOR' ? 'تحليل البيانات الحية للإجابة على الاستفسارات العامة.' : 
                         currentMode === 'AUDITOR' ? 'فحص دقيق لكشف: التدخلات بدون صور، هوامش الربح المنخفضة، وتكرار الأعطال.' : 
                         'تجارب افتراضية "ماذا لو" دون المساس ببيانات الشركة الحقيقية.'}
                    </p>
                </div>
            </div>
         </div>
      </div>

      {/* Main Chat Area */}
      <div className={`max-w-5xl mx-auto flex flex-col rounded-[3rem] border shadow-xl h-[550px] overflow-hidden relative transition-all ${
          isLive ? 'bg-white border-slate-200' : 'bg-[#fffbf0] border-amber-200'
      }`}>
         
         {/* GIANT WATERMARK */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden select-none">
             <h1 className={`text-[8rem] font-black -rotate-12 whitespace-nowrap ${isLive ? 'text-slate-900' : 'text-amber-600'}`}>
                 {currentMode}
             </h1>
         </div>

         {/* Chat Header */}
         <div className={`p-6 border-b flex items-center justify-between backdrop-blur-sm sticky top-0 z-20 ${
             isLive ? 'bg-slate-50/80 border-slate-100' : 'bg-amber-50/80 border-amber-100'
         }`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                    currentMode === 'ADVISOR' ? 'bg-blue-600' : currentMode === 'AUDITOR' ? 'bg-red-600' : 'bg-amber-600'
                }`}>
                   {currentMode === 'AUDITOR' ? <ShieldCheck size={20}/> : <BrainCircuit size={20} />}
                </div>
                <div>
                   <h3 className="font-black text-slate-800 text-sm">GIM Neural Interface</h3>
                   <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">
                           {isLive ? 'Connected: Production DB' : 'Connected: Virtual Sandbox'}
                       </p>
                   </div>
                </div>
            </div>
            {!process.env.API_KEY && (
               <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 border border-red-100 animate-pulse">
                  <AlertCircle size={14} /> API Key Missing
               </div>
            )}
         </div>

         {/* Messages List */}
         <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
            {chatHistory.map((msg, i) => (
               <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] md:max-w-[75%] p-6 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm relative group transition-all ${
                     msg.role === 'user' 
                     ? 'bg-white text-slate-800 rounded-tr-sm border border-slate-100' 
                     : !isLive 
                        ? 'bg-amber-100 text-amber-900 rounded-tl-sm border border-amber-200 shadow-md' // Sim style
                        : currentMode === 'AUDITOR' 
                            ? 'bg-red-50 text-red-900 rounded-tl-sm border border-red-100' // Auditor style
                            : 'bg-[#1e293b] text-slate-100 rounded-tl-sm shadow-md' // Advisor style
                  }`}>
                     <div className="flex items-center gap-2 mb-3 opacity-50 text-[9px] font-black uppercase tracking-widest">
                        {msg.role === 'user' 
                           ? <span className="flex items-center gap-1">Admin <UserIcon size={10}/></span> 
                           : <span className="flex items-center gap-1"><BrainCircuit size={10}/> {currentMode} Response</span>
                        }
                     </div>
                     <div className="whitespace-pre-wrap markdown-body">{msg.text}</div>
                  </div>
               </div>
            ))}
            
            {/* Thinking Indicator */}
            {isProcessing && (
               <div className="flex justify-end">
                  <div className={`p-4 rounded-[2rem] rounded-tl-sm shadow-xl flex items-center gap-3 animate-pulse border ${
                      isLive ? 'bg-[#1e293b] border-slate-700' : 'bg-amber-600 border-amber-500'
                  }`}>
                     <RefreshCw size={14} className={`animate-spin ${isLive ? 'text-blue-400' : 'text-white'}`} />
                     <span className={`${isLive ? 'text-slate-300' : 'text-white'} text-xs font-black`}>جاري المعالجة والتحليل...</span>
                  </div>
               </div>
            )}
         </div>

         {/* Input Area */}
         <form onSubmit={handleSendMessage} className={`p-6 border-t z-20 ${isLive ? 'bg-white border-slate-100' : 'bg-[#fffbf0] border-amber-100'}`}>
            {/* Quick Actions for Auditor */}
            {currentMode === 'AUDITOR' && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                    <button type="button" onClick={() => setChatInput("افحص سجل التدخلات: هل توجد مهام مكتملة بدون صور؟")} className="whitespace-nowrap px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black border border-red-100 hover:bg-red-100 transition-colors">
                        🚨 كشف المهام بدون صور
                    </button>
                    <button type="button" onClick={() => setChatInput("حلل هوامش الربح في المخزون: هل هناك مواد تباع بخسارة أو ربح ضعيف؟")} className="whitespace-nowrap px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black border border-red-100 hover:bg-red-100 transition-colors">
                        📉 هوامش الربح الضعيفة
                    </button>
                    <button type="button" onClick={() => setChatInput("هل يوجد زبائن لديهم تكرار في الأعطال؟ اقترح عقود صيانة.")} className="whitespace-nowrap px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black border border-red-100 hover:bg-red-100 transition-colors">
                        🔄 تكرار الأعطال (Upsell)
                    </button>
                </div>
            )}

            <div className="relative group">
               <input 
                 className={`w-full border-2 rounded-[2rem] pr-6 pl-16 py-5 text-sm font-bold text-slate-800 outline-none transition-all shadow-inner placeholder:font-normal disabled:opacity-50 ${
                     isLive 
                     ? 'bg-slate-50 border-slate-100 focus:border-blue-500 focus:bg-white placeholder:text-slate-400' 
                     : 'bg-amber-50 border-amber-200 focus:border-amber-500 focus:bg-white placeholder:text-amber-700/50'
                 }`}
                 placeholder={
                    currentMode === 'AUDITOR' ? "اطلب تدقيقاً (مثال: هل هناك تلاعب في الفواتير؟)..." : 
                    !isLive ? "أدخل سيناريو افتراضي للتجربة..." : 
                    "اسأل المستشار عن حالة العمل الحالية..."
                 }
                 value={chatInput}
                 onChange={e => setChatInput(e.target.value)}
                 disabled={isProcessing}
               />
               <button 
                 type="submit" 
                 disabled={isProcessing || !chatInput.trim()}
                 className={`absolute left-3 top-3 w-12 h-12 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 disabled:bg-slate-200 disabled:scale-100 disabled:shadow-none ${
                    currentMode === 'ADVISOR' ? 'bg-blue-600 hover:bg-blue-700' : 
                    currentMode === 'AUDITOR' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                 }`}
               >
                  {isProcessing ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} className={chatInput.trim() ? 'ml-1' : ''} />}
               </button>
            </div>
            <div className="text-center mt-3 flex items-center justify-center gap-2 text-slate-400">
                <ShieldCheck size={10} />
                <p className="text-[9px] font-black">
                    {isLive ? 'Live Environment: Decisions here affect real business data.' : 'Simulation Environment: Safe sandbox. No changes saved.'}
                </p>
            </div>
         </form>
      </div>
    </div>
  );
};

const UserIcon = ({size}: {size: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default GimAIPage;
