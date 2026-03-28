
import React, { useState } from 'react';
import { 
  Eye, Trash2, CheckCircle, AlertTriangle, 
  User, Calendar, Flag, ShieldOff, Ghost 
} from 'lucide-react';

// Mock Data for Moderation Queue
const mockQueue: any[] = [];

const ContentModeration: React.FC = () => {
  const [queue, setQueue] = useState(mockQueue);

  const handleAction = (id: string, action: string) => {
    // Simulate API call
    setQueue(prev => prev.filter(p => p.id !== id));
    console.log(`Action ${action} taken on ${id}`);
  };

  return (
    <div className="animate-in slide-in-from-bottom-4">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
           <ShieldOff className="text-red-600" size={32} /> Content Moderation Queue
        </h2>
        <p className="text-slate-500 font-medium">مراجعة المحتوى المبلغ عنه. القرارات هنا نهائية.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {queue.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] border border-slate-200 text-center shadow-sm">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-black text-slate-800">Queue Cleared</h3>
                <p className="text-slate-400 font-bold">No flagged content pending review.</p>
            </div>
         ) : (
            queue.map(post => (
               <div key={post.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
                  
                  {/* Risk Indicator */}
                  <div className="w-full md:w-48 bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-slate-100 shrink-0">
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl mb-2 ${
                        post.riskScore > 80 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                     }`}>
                        {post.riskScore}
                     </div>
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">AI Risk Score</p>
                     <div className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border">
                        <Flag size={12} /> {post.reports} Reports
                     </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <h4 className="font-black text-slate-800 flex items-center gap-2">
                              <User size={16} className="text-blue-500" /> {post.author}
                           </h4>
                           <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                              <Calendar size={10} /> {post.timestamp} • ID: {post.id}
                           </p>
                        </div>
                        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black border border-red-100 uppercase flex items-center gap-2">
                           <AlertTriangle size={12} /> {post.reportReason}
                        </div>
                     </div>
                     
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 leading-relaxed">
                        {post.content}
                        {post.hasImage && (
                           <div className="mt-3 h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 font-mono text-xs">
                              [BLURRED MEDIA CONTENT]
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full md:w-48 flex flex-col gap-3 justify-center">
                     <button onClick={() => handleAction(post.id, 'APPROVE')} className="bg-green-50 text-green-700 py-3 rounded-xl font-black text-xs hover:bg-green-100 transition-all flex items-center justify-center gap-2">
                        <CheckCircle size={16} /> Ignore (Safe)
                     </button>
                     <button onClick={() => handleAction(post.id, 'SHADOWBAN')} className="bg-slate-100 text-slate-600 py-3 rounded-xl font-black text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                        <Ghost size={16} /> Shadowban
                     </button>
                     <button onClick={() => handleAction(post.id, 'DELETE')} className="bg-red-600 text-white py-3 rounded-xl font-black text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200">
                        <Trash2 size={16} /> Remove Post
                     </button>
                  </div>

               </div>
            ))
         )}
      </div>
    </div>
  );
};

export default ContentModeration;
