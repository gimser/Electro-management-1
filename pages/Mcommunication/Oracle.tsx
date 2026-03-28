
import React, { useState } from 'react';
import { AppState } from '../../types';
import { 
  Sparkles, Send, User, MessageCircle, 
  HelpCircle, Scale
} from 'lucide-react';

interface OracleProps {
  state: AppState;
}

const Oracle: React.FC<OracleProps> = ({ state }) => {
  const [messages, setMessages] = useState([
    { role: 'oracle', text: 'مرحباً. أنا المستشار الآلي للمنصة. دوري هو التوجيه وتقديم الاقتراحات القانونية والإدارية بصيغة مغربية محترمة، دون إصدار أوامر.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
     if(!input.trim()) return;
     setMessages([...messages, { role: 'user', text: input }]);
     setInput('');
     // Mock response
     setTimeout(() => {
        setMessages(prev => [...prev, { role: 'oracle', text: 'فهمت الوضع. من الأفضل في هذه الحالة التواصل بأسلوب "الصلح خير" قبل اللجوء للمساطر الرسمية. النظام يقترح عليك صياغة رسالة ودية أولاً.' }]);
     }, 1000);
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 text-right font-arabic h-[calc(100vh-100px)] flex flex-col" dir="rtl">
      <div className="mb-6 flex justify-between items-center shrink-0">
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Sparkles className="text-purple-600" size={32} /> Oracle (The Advisor)
           </h2>
           <p className="text-slate-500 font-medium">التوجيه الذكي، لا السيطرة. نصائح مبنية على القانون والأعراف.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
         <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] p-6 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm ${
                     msg.role === 'user' 
                     ? 'bg-slate-50 text-slate-800 rounded-tr-none' 
                     : 'bg-purple-600 text-white rounded-tl-none'
                  }`}>
                     <div className="flex items-center gap-2 mb-2 opacity-70 text-[10px] font-black uppercase">
                        {msg.role === 'oracle' ? <Sparkles size={12} /> : <User size={12} />}
                        {msg.role === 'oracle' ? 'GIM Oracle' : 'Admin'}
                     </div>
                     {msg.text}
                  </div>
               </div>
            ))}
         </div>

         <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="relative">
               <input 
                  className="w-full bg-white border-2 border-slate-200 rounded-[2rem] pr-6 pl-14 py-4 font-bold text-slate-700 outline-none focus:border-purple-500 transition-all shadow-inner"
                  placeholder="اطلب استشارة أو توجيه..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
               />
               <button 
                  onClick={handleSend}
                  className="absolute left-2 top-2 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all active:scale-90"
               >
                  <Send size={18} className={input ? 'ml-1' : ''} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Oracle;
