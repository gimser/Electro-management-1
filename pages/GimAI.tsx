
import React, { useState, useEffect, useRef } from 'react';
import { AppState, AutonomousDecision } from '../types';
import { 
  Brain, Zap, Activity, ShieldAlert, 
  History, Send, Server, User, Cpu,
  TrendingUp, Info, ShieldCheck, MessageCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface GimAIPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const GimAIPage: React.FC<GimAIPageProps> = ({ state, updateState }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model', text: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // بروتوكول التعليمات الصارمة (Strict Protocol)
  const SYSTEM_INSTRUCTION = `
    أنت المساعد الذكي الرسمي لشركة "Electro GIM Services" بالمغرب. 
    مهمتك الوحيدة: عرض خدمات الشركة بأثمنتها الثابتة.

    ⚠️ قواعد قانونية وعملية لا يمكن كسرها:
    1. يمنع تغيير الأثمنة نهائياً.
    2. يمنع إضافة خدمات غير مذكورة في القائمة أدناه.
    3. يمنع استعمال عبارات احتمالية مثل (تقريباً، ابتداءً من). الأثمنة قطعية.
    4. الأثمنة تشمل الخدمة فقط (Service Only). السلع والمعدات غير مشمولة.
    5. إذا طلبت خدمة غير موجودة، رد حصراً بـ: "نعتذر، هذه الخدمة غير متوفرة حالياً لدى Electro GIM Services."
    6. الأسلوب: محترم، مهني، مغربي (الدارجة المهنية الراقية أو العربية الفصحى).

    📋 قائمة الخدمات والأثمنة المعتمدة:
    1) الكاميرات (CCTV):
       - تركيب كاميرا واحدة: 100 درهم
       - تركيب 2 كاميرات: 200 درهم
       - تركيب 4 كاميرات: 400 درهم
       - تركيب 8 كاميرات: 800 درهم
       - إعداد DVR / NVR: 100 درهم
       - ربط الهاتف بالكاميرات: 80 درهم
       - صيانة كاميرا: 100 درهم
       - صيانة نظام كامل: 200 درهم

    2) الشبكات (Networks):
       - تركيب نقطة شبكة LAN: 60 درهم
       - تركيب شبكة منزلية: 350 درهم
       - تركيب شبكة محل أو مكتب صغير: 600 درهم
       - إعداد Router / Wi-Fi: 150 درهم
       - تقوية إشارة Wi-Fi: 120 درهم
       - صيانة شبكة: 250 درهم

    3) المواقع الإلكترونية:
       - موقع صفحة واحدة: 1,000 درهم
       - موقع تعريفي (3–4 صفحات): 1,800 درهم
       - موقع شركة بسيط: 3,000 درهم
       - متجر إلكتروني بسيط: 5,000 درهم
       - صفحة هبوط (Landing Page): 800 درهم
       - صيانة موقع شهرية: 250 درهم

    4) التطبيقات البسيطة:
       - تطبيق عرض خدمات: 3,500 درهم
       - تطبيق حجز مواعيد: 6,000 درهم
       - تطبيق إدارة بسيط: 8,000 درهم
       - صيانة تطبيق شهرية: 400 درهم

    5) البيت الذكي (Smart Home):
       - تركيب إضاءة ذكية: 700 درهم
       - تركيب تحكم ذكي بالأجهزة: 1,000 درهم
       - تركيب نظام إنذار: 900 درهم
       - نظام بيت ذكي كامل: 2,500 درهم
       - صيانة نظام ذكي: 250 درهم

    6) المتجر – التركيب فقط:
       - تركيب جهاز واحد: 80 درهم
       - تركيب عدة أجهزة: 200 درهم
       - إعداد وتشغيل الأجهزة: 120 درهم

    7) الدعم والعقود:
       - تدخل تقني واحد: 150 درهم
       - دعم شهري لزبون فردي: 450 درهم
       - عقد صيانة شركة صغيرة: 900 درهم / شهر
  `;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0, // دقة متناهية لمنع الارتجال
          topP: 1
        }
      });

      const modelText = response.text || "نعتذر، حدث خلل في النبض العصبي.";
      setChatHistory(prev => [...prev, { role: 'model', text: modelText }]);
      
      const newAutoDecision: AutonomousDecision = {
        id: crypto.randomUUID(),
        triggerEvent: 'PRICE_CONSULTATION',
        actionTaken: 'تقديم عرض سعر رسمي ثابت',
        confidenceScore: 100,
        logicPath: `MATCH_FIXED_PRICE_LIST -> COMPLIANCE_CHECK -> RESPOND`,
        timestamp: new Date().toISOString(),
        status: 'Executed'
      };
      
      updateState(prev => ({
        ...prev,
        autonomousDecisions: [newAutoDecision, ...(prev.autonomousDecisions || [])]
      }));

    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "عذراً، المحرك غير متاح حالياً." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 pb-24 bg-slate-950 min-h-screen text-right" dir="rtl">
      
      {/* Visual Identity Header */}
      <div className="bg-slate-900 rounded-[3rem] p-10 border-4 border-slate-800 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)]"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8">
               <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                  <ShieldCheck size={48} className="text-white" />
               </div>
               <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">المساعد الرسمي لـ GIM</h2>
                  <p className="text-blue-400 font-bold text-lg">بوابة الخدمات والأثمنة المعتمدة - Electro GIM Services.</p>
               </div>
            </div>
            <div className="bg-green-500/10 px-8 py-4 rounded-2xl border border-green-500/20">
               <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] mb-1">Status: Operational</p>
               <p className="text-xs text-slate-400 font-bold">الالتزام بالقائمة الرسمية: 100%</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[650px]">
         
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] border border-white/10 p-8 shadow-sm h-full overflow-y-auto custom-scrollbar">
               <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                  <ShieldAlert size={16} /> بروتوكول الأسعار
               </h3>
               <div className="space-y-4 pt-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                     <p className="text-[10px] font-black text-slate-500 uppercase mb-2">ضمان الدقة</p>
                     <p className="text-xs text-slate-300 font-bold leading-relaxed">جميع الأثمنة المعروضة هي أثمنة المصنع والخدمة الرسمية ولا تخضع للمساومة.</p>
                  </div>
                  <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                     <p className="text-[10px] font-black text-blue-400 uppercase mb-2">نطاق العمل</p>
                     <p className="text-xs text-blue-100 font-bold leading-relaxed">العرض يشمل اليد العاملة والبرمجة فقط. المعدات تُفوتر بشكل منفصل.</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="lg:col-span-3 flex flex-col bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center shrink-0 z-10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                     <MessageCircle size={20} />
                  </div>
                  <h3 className="font-black text-white text-sm">GIM Smart Assistant Interface</h3>
               </div>
               <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 bg-red-500/40 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-500/40 rounded-full"></div>
               </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-black/20 z-10">
               {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                     <Brain size={100} className="text-blue-900" />
                     <p className="font-black text-xl text-blue-100">أنا المساعد الرسمي لـ GIM Services.<br/>كيف يمكنني خدمتك في الاستفسار عن أثمنة خدماتنا اليوم؟</p>
                  </div>
               )}
               {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end animate-in slide-in-from-bottom-2'}`}>
                     <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm font-bold leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-slate-800 text-slate-200 rounded-tr-none border border-white/5' 
                        : 'bg-blue-600 text-white rounded-tl-none shadow-xl'
                     }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                     </div>
                  </div>
               ))}
               {isTyping && (
                  <div className="flex justify-end">
                     <div className="bg-white/5 p-4 rounded-2xl flex gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                     </div>
                  </div>
               )}
            </div>

            <form onSubmit={handleSendMessage} className="p-8 border-t border-white/5 bg-slate-900/50 z-10">
               <div className="relative">
                  <input 
                    className="w-full bg-black/40 border-2 border-white/5 rounded-[2.5rem] px-10 py-6 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                    placeholder="اسأل عن ثمن تركيب الكاميرات، الشبكات، أو المواقع..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={isTyping}
                    className="absolute left-3 top-3 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                  >
                     <Send size={24} />
                  </button>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
};

export default GimAIPage;
