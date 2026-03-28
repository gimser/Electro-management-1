
import React, { useState, useEffect, useMemo, useRef, ChangeEvent } from 'react';
import { AppState, Visit, MissionPhase, DocType, Document, LineItem, Task } from '../types';
import { 
  MapPin, Camera, Clock, CheckCircle2, 
  Navigation, Send, Phone, 
  ChevronRight, ArrowLeft, ImagePlus, Mic,
  Wrench, ShieldCheck, X, Hourglass, Calendar, FileText, StopCircle, 
  Wallet, AlertOctagon, PlayCircle, StickyNote, PenTool, Eraser, CreditCard, Banknote,
  ClipboardList, Check, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateDocNumber, createRecord } from '../db';

interface VisitsPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

const VisitsPage: React.FC<VisitsPageProps> = ({ state, updateState, onNavigate }) => {
  const { user } = useAuth();
  
  // --- STATE ---
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [diagnosisNote, setDiagnosisNote] = useState('');
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [priceEstimate, setPriceEstimate] = useState<number>(0); 
  const [diagnosisFee, setDiagnosisFee] = useState<number>(150);
  
  // Verification / Closing State
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [paymentCollected, setPaymentCollected] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Check'>('Cash');
  const [isClosing, setIsClosing] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); 
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeMission = useMemo(() => 
    state.visits.find(v => v.id === activeMissionId), 
  [state.visits, activeMissionId]);

  const currentPhase: MissionPhase = activeMission?.phase || 'DISPATCHED';
  const client = state.clients.find(c => c.id === activeMission?.clientId);
  const linkedDevis = state.documents.find(d => d.id === activeMission?.linkedDevisId);

  // --- SIGNATURE PAD LOGIC ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setIsSigning(true);
      const { offsetX, offsetY } = getCoordinates(e, canvas);
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      ctx.strokeStyle = '#2563eb'; // Blue Ink
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isSigning) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { offsetX, offsetY } = getCoordinates(e, canvas);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
  };

  const endDrawing = () => {
      if (!isSigning) return;
      setIsSigning(false);
      const canvas = canvasRef.current;
      if (canvas) {
          setSignatureData(canvas.toDataURL()); // Save as Base64
      }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
      let clientX, clientY;
      if ('touches' in e) {
          const touch = e.touches[0];
          clientX = touch.clientX;
          clientY = touch.clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
      }
      
      const rect = canvas.getBoundingClientRect();
      return {
          offsetX: clientX - rect.left,
          offsetY: clientY - rect.top
      };
  };

  const clearSignature = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          setSignatureData(null);
      }
  };

  // --- AUTOMATION: Watch for Client Approval ---
  useEffect(() => {
    if (activeMission && currentPhase === 'APPROVAL_WAIT' && linkedDevis) {
       const checkApproval = setInterval(() => {
          const currentDoc = state.documents.find(d => d.id === linkedDevis.id);
          if (currentDoc?.status === 'Accepted') {
             clearInterval(checkApproval);
             updatePhase(activeMission.id, 'WORKING', {
                proofOfWork: { ...activeMission.proofOfWork, startTime: new Date().toISOString() }
             });
             alert("✅ تمت الموافقة من طرف الزبون! ابدأ العمل الآن.");
          } else if (currentDoc?.status === 'Rejected') {
             clearInterval(checkApproval);
             updatePhase(activeMission.id, 'DIAGNOSIS_BILLING');
             alert("❌ قام الزبون برفض الإصلاح. المرجو استخلاص مصاريف التشخيص فقط.");
          }
       }, 2000);
       return () => clearInterval(checkApproval);
    }
  }, [activeMission, currentPhase, linkedDevis, state.documents]);

  // Timer Logic
  useEffect(() => {
    if (activeMission && currentPhase === 'WORKING') {
        const startTime = new Date(activeMission.proofOfWork?.startTime || Date.now()).getTime();
        timerRef.current = setInterval(() => {
            const now = Date.now();
            setElapsedTime(Math.floor((now - startTime) / 1000));
        }, 1000);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setElapsedTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentPhase, activeMission]);

  // --- ACTIONS ---

  const triggerCamera = () => fileInputRef.current?.click();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (event.target?.result) setProofPhoto(event.target.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const updatePhase = (visitId: string, newPhase: MissionPhase, extraData: Partial<Visit> = {}) => {
      updateState(prev => ({
          ...prev,
          visits: prev.visits.map(v => v.id === visitId ? { 
              ...v, 
              phase: newPhase,
              status: newPhase === 'COMPLETED' ? 'Completed' : 
                      newPhase === 'APPROVAL_WAIT' ? 'Waiting-Approval' : 
                      newPhase === 'DIAGNOSIS_BILLING' ? 'On-Site' : 'On-Site',
              ...extraData
          } : v)
      }));
  };

  const initializeMissionFromTask = (task: Task) => {
      const existingVisit = state.visits.find(v => v.taskId === task.id);
      if (existingVisit) {
          setActiveMissionId(existingVisit.id);
      } else {
          const newVisit = createRecord<Visit>({
              taskId: task.id,
              clientId: task.clientId,
              technicianId: user?.id || 'unknown',
              status: 'Planned',
              phase: 'DISPATCHED',
              proofOfWork: {
                  technicianName: user?.fullName || 'Unknown'
              },
              notes: task.title
          });
          updateState(prev => ({
              ...prev,
              visits: [...prev.visits, newVisit],
              tasks: prev.tasks.map(t => t.id === task.id ? { ...t, status: 'In-Progress' } : t)
          }));
          setActiveMissionId(newVisit.id);
      }
  };

  const submitDiagnosisAndCreateQuote = () => {
      if (!diagnosisNote.trim()) return alert("⚠️ يجب وصف المشكل بدقة.");
      if (!proofPhoto) return alert("⚠️ صورة العطل (قبل) إجبارية.");
      if (priceEstimate <= 0) return alert("⚠️ يجب تحديد السعر التقديري للإصلاح.");
      if (!activeMission) return;

      const docCount = state.documents.filter(d => d.type === DocType.DEVIS).length;
      
      const lineItems: LineItem[] = [{
          id: crypto.randomUUID(),
          description: `تشخيص وإصلاح: ${diagnosisNote}`,
          quantity: 1,
          unitPrice: priceEstimate,
          total: priceEstimate
      }];

      const newDevis = createRecord<Document>({
          clientId: activeMission.clientId,
          type: DocType.DEVIS,
          number: generateDocNumber(DocType.DEVIS, docCount),
          date: new Date().toISOString().split('T')[0],
          items: lineItems,
          subtotal: priceEstimate,
          tvaAmount: 0, 
          total: priceEstimate,
          status: 'Sent', 
          notes: `تشخيص ميداني من طرف: ${user?.fullName}`,
          interventionDetails: diagnosisNote
      });

      updateState(prev => ({
          ...prev,
          documents: [...prev.documents, newDevis],
          visits: prev.visits.map(v => v.id === activeMission.id ? {
              ...v,
              phase: 'APPROVAL_WAIT',
              status: 'Waiting-Approval',
              linkedDevisId: newDevis.id,
              proofOfWork: {
                  ...v.proofOfWork,
                  photoBefore: proofPhoto, 
                  technicianNotes: diagnosisNote,
                  diagnosisFee: diagnosisFee
              }
          } : v),
          activityLogs: [createRecord({
              userId: user?.id || 'tech',
              username: user?.fullName || 'Tech',
              action: 'DIAGNOSIS_SUBMITTED',
              module: 'TECHNICAL',
              timestamp: new Date().toISOString(),
              details: `تم إنشاء عرض ثمن ${newDevis.number} بقيمة ${priceEstimate} DH.`,
              severity: 'Info'
          }), ...(prev.activityLogs || [])]
      }));
      setProofPhoto(null);
  };

  // STEP 6 -> 7: Complete Mission (Repair Done)
  const closeMissionSuccess = () => {
      if (!proofPhoto) return alert("⚠️ صورة النتيجة النهائية (بعد) إجبارية للإغلاق.");
      if (!signatureData) return alert("⚠️ توقيع الزبون إجباري للإغلاق.");
      if (!activeMission) return;

      setIsClosing(true);

      // Simulate network request and state update
      setTimeout(() => {
          // If payment was collected, update invoice status
          const updatedDocs = paymentCollected && linkedDevis ? state.documents.map(d => d.id === linkedDevis.id ? {
              ...d, 
              status: 'Paid',
              paidAmount: d.total,
              notes: d.notes ? d.notes + `\n[System] تم استلام الدفع (${paymentMethod}) ميدانياً.` : `[System] تم استلام الدفع (${paymentMethod}) ميدانياً.`
          } : d) : state.documents;

          updateState(prev => ({
              ...prev,
              documents: updatedDocs,
              visits: prev.visits.map(v => v.id === activeMission.id ? { 
                  ...v, 
                  phase: 'COMPLETED', 
                  status: 'Completed', 
                  proofOfWork: { 
                      ...v.proofOfWork, 
                      photoAfter: proofPhoto, 
                      clientSignature: signatureData,
                      endTime: new Date().toISOString()
                  } 
              } : v),
              tasks: prev.tasks.map(t => t.id === activeMission.taskId ? { ...t, status: 'Completed' } : t),
              activityLogs: [createRecord({
                  userId: user?.id || 'tech',
                  username: user?.fullName || 'Tech',
                  action: 'MISSION_COMPLETED',
                  module: 'TECHNICAL',
                  timestamp: new Date().toISOString(),
                  details: `تم إغلاق المهمة بنجاح. الدفع: ${paymentCollected ? 'نعم (' + paymentMethod + ')' : 'آجل'}.`,
                  severity: 'Info'
              }), ...(prev.activityLogs || [])]
          }));
          
          setIsClosing(false);
          setActiveMissionId(null);
          setProofPhoto(null);
          setSignatureData(null);
          setPaymentCollected(false);
      }, 1000);
  };

  const closeMissionDiagnosisOnly = () => {
      if (!activeMission) return;
      if (confirm(`تأكيد استلام مبلغ التشخيص (${activeMission.proofOfWork?.diagnosisFee} DH) وإغلاق الملف؟`)) {
          const ticketCount = state.documents.filter(d => d.type === DocType.TICKET).length;
          const diagFee = activeMission.proofOfWork?.diagnosisFee || 150;
          
          const diagTicket = createRecord<Document>({
              clientId: activeMission.clientId,
              type: DocType.TICKET,
              number: generateDocNumber(DocType.TICKET, ticketCount),
              date: new Date().toISOString().split('T')[0],
              items: [{
                  id: crypto.randomUUID(),
                  description: 'مصاريف التنقل والتشخيص (Intervention & Diagnostic)',
                  quantity: 1,
                  unitPrice: diagFee,
                  total: diagFee
              }],
              subtotal: diagFee,
              tvaAmount: 0,
              total: diagFee,
              status: 'Paid',
              paidAmount: diagFee,
              notes: `تم رفض الإصلاح. استخلاص مصاريف التشخيص.`
          });

          updateState(prev => ({
              ...prev,
              documents: [...prev.documents, diagTicket],
              visits: prev.visits.map(v => v.id === activeMission.id ? { 
                  ...v, 
                  phase: 'COMPLETED', 
                  status: 'Completed', 
                  notes: 'تم رفض الإصلاح من طرف الزبون. تم استخلاص واجب التشخيص.',
                  proofOfWork: { ...v.proofOfWork, endTime: new Date().toISOString() } 
              } : v),
              tasks: prev.tasks.map(t => t.id === activeMission.taskId ? { ...t, status: 'Completed' } : t)
          }));
          setActiveMissionId(null);
      }
  };

  const MissionCard: React.FC<{ task: Task }> = ({ task }) => {
      const taskClient = state.clients.find(c => c.id === task.clientId);
      const existingVisit = state.visits.find(v => v.taskId === task.id);
      const isStarted = !!existingVisit;
      return (
          <div onClick={() => initializeMissionFromTask(task)} className="bg-slate-800 rounded-3xl p-6 mb-4 active:scale-95 transition-all border border-slate-700 shadow-lg cursor-pointer relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-2 h-full ${isStarted ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
              <div className="flex justify-between items-start mb-3 pl-4">
                  <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-2 ${isStarted ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-blue-500/20 border-blue-500 text-blue-500'}`}>
                          {task.time}
                      </div>
                      <div>
                          <h3 className="text-lg font-black text-white line-clamp-1">{taskClient?.name}</h3>
                          <p className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-1"><MapPin size={12}/> {taskClient?.address || taskClient?.city}</p>
                      </div>
                  </div>
                  <div className="bg-slate-700 rounded-full p-3 group-hover:bg-blue-600 transition-colors">
                      <PlayCircle size={20} className="text-white" />
                  </div>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 flex justify-between items-center border border-slate-700/50">
                  <div className="flex items-center gap-2">
                      <StickyNote size={14} className="text-slate-500" />
                      <p className="text-xs text-slate-300 font-bold">{task.title}</p>
                  </div>
                  {isStarted && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded border border-amber-500/30 font-black uppercase">{existingVisit?.phase || 'IN PROGRESS'}</span>}
              </div>
          </div>
      );
  };

  if (!activeMission) {
      const myTasks = state.tasks.filter(t => 
          t.status !== 'Completed' && 
          t.status !== 'Cancelled' && 
          (user?.role !== 'Technician' || t.technician === user?.fullName)
      );
      return (
          <div className="min-h-screen bg-[#0B1120] text-white p-6 pb-24 font-arabic text-right" dir="rtl">
              <div className="flex justify-between items-center mb-8">
                  <div>
                      <h1 className="text-2xl font-black flex items-center gap-2"><ShieldCheck className="text-blue-500"/> غرفة العمليات</h1>
                      <p className="text-slate-400 text-xs font-bold mt-1">لديك {myTasks.length} مهام نشطة اليوم</p>
                  </div>
                  <button onClick={() => onNavigate('scheduler')} className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-slate-700">
                      <Clock size={20} />
                  </button>
              </div>
              <div className="space-y-4">
                  {myTasks.length > 0 ? myTasks.map(task => (<MissionCard key={task.id} task={task} />)) : (
                      <div className="text-center py-20 opacity-50 border-2 border-dashed border-slate-700 rounded-[2rem]">
                          <CheckCircle2 size={64} className="mx-auto mb-4 text-green-500" />
                          <p className="font-bold text-lg text-slate-300">لا توجد مهام مجدولة</p>
                          <button onClick={() => onNavigate('scheduler')} className="mt-6 px-6 py-3 bg-blue-600 rounded-xl font-bold text-sm">فتح الأجندة</button>
                      </div>
                  )}
              </div>
          </div>
      );
  }

  return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-arabic text-right relative" dir="rtl">
          <div className="bg-slate-900 p-6 flex justify-between items-center shadow-md z-10 border-b border-slate-800">
              <button onClick={() => setActiveMissionId(null)} className="p-2 bg-slate-800 rounded-xl text-slate-300 hover:bg-slate-700"><ArrowLeft /></button>
              <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">العميل الحالي</p>
                  <h2 className="text-white font-black text-lg">{client?.name}</h2>
              </div>
              <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                  currentPhase === 'WORKING' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-blue-500/20 text-blue-500'
              }`}>
                  {currentPhase}
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-32">
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

              {(currentPhase === 'TRAVELING' || currentPhase === 'DISPATCHED') && (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in zoom-in">
                      <div className="relative">
                          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                          <Navigation size={80} className="text-blue-500 relative z-10" />
                      </div>
                      <div className="text-center space-y-2">
                          <h3 className="text-2xl font-black text-white">الانتقال للموقع</h3>
                          <p className="text-slate-400 text-sm font-bold">{client?.address}</p>
                      </div>
                      <div className="w-full space-y-4 pt-10">
                          <a href={`https://maps.google.com/?q=${client?.lat},${client?.lng}`} target="_blank" className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 border border-slate-700">
                              <MapPin size={20} /> فتح الخريطة
                          </a>
                          <button onClick={() => updatePhase(activeMission.id, 'DIAGNOSIS')} className="w-full bg-green-600 text-white py-5 rounded-2xl font-black shadow-[0_0_30px_rgba(22,163,74,0.4)] text-lg">
                              وصلت للموقع (Check-In)
                          </button>
                      </div>
                  </div>
              )}

              {currentPhase === 'DIAGNOSIS' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-10">
                      <div className="text-white mb-4">
                          <h3 className="text-xl font-black mb-1 flex items-center gap-2"><Camera className="text-amber-500"/> 1. التشخيص وتحديد السعر</h3>
                          <p className="text-slate-400 text-xs">قم بتشخيص المشكل، تصويره، وتحديد سعر الإصلاح.</p>
                      </div>
                      <div onClick={triggerCamera} className={`border-2 border-dashed rounded-3xl h-48 flex flex-col items-center justify-center cursor-pointer transition-all ${proofPhoto ? 'border-green-500 bg-slate-900' : 'border-slate-700 bg-slate-800 hover:bg-slate-750'}`}>
                          {proofPhoto ? (
                              <img src={proofPhoto} className="h-full w-full object-cover rounded-3xl opacity-80" />
                          ) : (
                              <>
                                  <Camera size={40} className="text-slate-500 mb-2" />
                                  <span className="text-slate-400 font-bold text-sm">التقاط صورة العطل (إجباري)</span>
                              </>
                          )}
                      </div>
                      <textarea 
                          className="w-full bg-slate-800 text-white border border-slate-700 rounded-3xl p-5 font-bold text-sm h-32 focus:border-blue-500 outline-none"
                          placeholder="وصف المشكل..."
                          value={diagnosisNote}
                          onChange={e => setDiagnosisNote(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-4">
                          <input type="number" className="w-full bg-slate-800 text-white border border-slate-700 rounded-2xl p-5 font-black text-2xl" placeholder="سعر الإصلاح" value={priceEstimate || ''} onChange={e => setPriceEstimate(parseFloat(e.target.value))} />
                          <input type="number" className="w-full bg-slate-900 text-amber-500 border border-slate-700 rounded-2xl p-5 font-black text-2xl" value={diagnosisFee} onChange={e => setDiagnosisFee(parseFloat(e.target.value))} />
                      </div>
                      <button onClick={submitDiagnosisAndCreateQuote} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-xl mt-4 flex items-center justify-center gap-2">
                          <Send size={20} /> إرسال العرض للزبون
                      </button>
                  </div>
              )}

              {currentPhase === 'APPROVAL_WAIT' && (
                  <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse">
                      <Hourglass size={80} className="text-amber-500" />
                      <div className="text-center space-y-2">
                          <h3 className="text-2xl font-black text-white">بانتظار موافقة الزبون...</h3>
                          <button onClick={() => onNavigate('client-portal')} className="px-6 py-3 bg-slate-800 rounded-xl text-blue-400 text-xs font-black border border-slate-700 hover:bg-slate-700 transition-all">فتح بوابة الزبون (للتجربة)</button>
                      </div>
                  </div>
              )}

              {currentPhase === 'DIAGNOSIS_BILLING' && (
                  <div className="h-full flex flex-col items-center justify-center pb-20 space-y-10 animate-in zoom-in">
                      <div className="w-24 h-24 bg-red-900/30 rounded-full flex items-center justify-center border-4 border-red-500 text-red-500"><X size={48} /></div>
                      <h3 className="text-3xl font-black text-white">تم رفض الإصلاح</h3>
                      <button onClick={closeMissionDiagnosisOnly} className="w-full bg-slate-700 text-white py-6 rounded-3xl font-black uppercase text-lg hover:bg-green-600 transition-all shadow-xl flex items-center justify-center gap-3">
                          <Wallet size={24} /> تأكيد استلام {activeMission.proofOfWork?.diagnosisFee || 150} DH وإغلاق
                      </button>
                  </div>
              )}

              {currentPhase === 'WORKING' && (
                  <div className="h-full flex flex-col items-center justify-center pb-20 space-y-10">
                      <div className="w-64 h-64 rounded-full border-8 border-slate-800 flex items-center justify-center relative z-10 bg-slate-900 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                          <div className="text-center">
                              <Wrench size={32} className="mx-auto mb-4 text-green-500 animate-bounce" />
                              <span className="text-5xl font-black text-white font-mono">{Math.floor(elapsedTime / 60).toString().padStart(2, '0')}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                          </div>
                      </div>
                      <button onClick={() => updatePhase(activeMission.id, 'VERIFICATION')} className="w-full bg-red-600 text-white py-6 rounded-3xl font-black uppercase text-lg shadow-xl hover:bg-red-700 transition-all">
                          <StopCircle className="inline ml-2" /> إيقاف وإنهاء العمل
                      </button>
                  </div>
              )}

              {/* STEP 5: STRICT VERIFICATION & CLOSING */}
              {currentPhase === 'VERIFICATION' && (
                  <div className="space-y-6 animate-in slide-in-from-right-10 pb-24">
                      
                      {/* Step 1: Evidence */}
                      <div className={`p-5 rounded-3xl border-2 transition-all ${proofPhoto ? 'bg-green-900/10 border-green-500/30' : 'bg-slate-800 border-slate-700'}`}>
                          <div className="flex justify-between items-center mb-3">
                              <h3 className="text-white font-black flex items-center gap-2 text-sm"><ImagePlus size={18} className={proofPhoto ? 'text-green-500' : 'text-blue-500'} /> 1. توثيق النتيجة</h3>
                              {proofPhoto && <CheckCircle2 size={20} className="text-green-500" />}
                          </div>
                          <div onClick={triggerCamera} className={`h-32 flex flex-col items-center justify-center cursor-pointer transition-all rounded-2xl ${proofPhoto ? 'bg-slate-900' : 'bg-slate-700/50 hover:bg-slate-700'}`}>
                              {proofPhoto ? (
                                  <div className="relative w-full h-full">
                                      <img src={proofPhoto} className="h-full w-full object-cover rounded-2xl opacity-70" />
                                      <div className="absolute inset-0 flex items-center justify-center">
                                          <p className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">اضغط للتغيير</p>
                                      </div>
                                  </div>
                              ) : (
                                  <>
                                      <Camera size={32} className="text-slate-400 mb-2" />
                                      <span className="text-slate-400 font-bold text-xs">صورة الإصلاح (إجباري)</span>
                                  </>
                              )}
                          </div>
                      </div>

                      {/* Step 2: Payment */}
                      <div className={`p-5 rounded-3xl border-2 transition-all ${paymentCollected ? 'bg-green-900/10 border-green-500/30' : 'bg-slate-800 border-slate-700'}`}>
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-white font-black flex items-center gap-2 text-sm"><Wallet size={18} className={paymentCollected ? 'text-green-500' : 'text-amber-500'} /> 2. التحصيل المالي</h3>
                              {paymentCollected && <CheckCircle2 size={20} className="text-green-500" />}
                          </div>
                          
                          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 mb-4">
                              <div className="flex justify-between items-center">
                                  <p className="text-slate-400 text-[10px] font-bold uppercase">المبلغ الإجمالي (TTC)</p>
                                  <p className="text-2xl font-black text-white font-mono">{linkedDevis?.total || 0} <span className="text-xs text-slate-500">DH</span></p>
                              </div>
                          </div>

                          {!paymentCollected ? (
                              <div className="grid grid-cols-2 gap-3">
                                  <button onClick={() => { setPaymentMethod('Cash'); setPaymentCollected(true); }} className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                                      <Banknote size={16} /> نقداً (Cash)
                                  </button>
                                  <button onClick={() => { setPaymentMethod('Card'); setPaymentCollected(true); }} className="bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                                      <CreditCard size={16} /> بطاقة / تحويل
                                  </button>
                              </div>
                          ) : (
                              <div className="flex justify-between items-center bg-green-500/20 p-3 rounded-xl border border-green-500/30">
                                  <span className="text-green-400 text-xs font-bold">تم تأكيد الدفع ({paymentMethod})</span>
                                  <button onClick={() => setPaymentCollected(false)} className="text-slate-400 hover:text-white text-[10px] underline">تعديل</button>
                              </div>
                          )}
                      </div>

                      {/* Step 3: Signature */}
                      <div className={`p-5 rounded-3xl border-2 transition-all ${signatureData ? 'bg-green-900/10 border-green-500/30' : 'bg-slate-800 border-slate-700'}`}>
                          <div className="flex justify-between items-center mb-3">
                              <h3 className="text-white font-black flex items-center gap-2 text-sm"><PenTool size={18} className={signatureData ? 'text-green-500' : 'text-purple-500'} /> 3. توقيع الزبون</h3>
                              {signatureData ? <CheckCircle2 size={20} className="text-green-500" /> : <button onClick={clearSignature} className="text-slate-400 hover:text-white text-[10px]"><Eraser size={14}/></button>}
                          </div>
                          <div className="bg-white rounded-2xl overflow-hidden h-32 relative touch-none">
                              <canvas 
                                  ref={canvasRef}
                                  width={window.innerWidth - 80} 
                                  height={128}
                                  className="w-full h-full cursor-crosshair active:cursor-grabbing"
                                  onMouseDown={startDrawing}
                                  onMouseMove={draw}
                                  onMouseUp={endDrawing}
                                  onMouseLeave={endDrawing}
                                  onTouchStart={startDrawing}
                                  onTouchMove={draw}
                                  onTouchEnd={endDrawing}
                              />
                              {!signatureData && !isSigning && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300">
                                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50">توقيع هنا</p>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Final Action - BIG BUTTON */}
                      <div className="pt-4 pb-8">
                          <button 
                              onClick={closeMissionSuccess} 
                              disabled={!proofPhoto || !signatureData || isClosing} 
                              className={`w-full py-6 rounded-3xl font-black text-lg shadow-[0_0_40px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                                  !proofPhoto || !signatureData 
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                                  : isClosing
                                    ? 'bg-green-700 text-white cursor-wait'
                                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                              }`}
                          >
                              {isClosing ? (
                                  <>جاري الإغلاق والحفظ...</>
                              ) : !proofPhoto || !signatureData ? (
                                  <><Lock size={20} /> أكمل الخطوات للإغلاق</>
                              ) : (
                                  <><ShieldCheck size={24} /> إغلاق الملف نهائياً</>
                              )}
                          </button>
                      </div>

                  </div>
              )}

          </div>
      </div>
  );
};

export default VisitsPage;
