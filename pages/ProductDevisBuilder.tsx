
import React, { useState, useMemo } from 'react';
import { AppState, InventoryItem, DocType, Document, LineItem, Client } from '../types';
// Added AlertTriangle to the imports from lucide-react
import { 
  ShoppingCart, Search, Package, Plus, Minus, Trash2, 
  User, Calculator, Save, X, ArrowLeft, ArrowRight,
  TrendingUp, CheckCircle2, AlertCircle, FilePlus2,
  ChevronLeft, LayoutPanelLeft, Tag, ShieldAlert, AlertTriangle
} from 'lucide-react';
import { generateDocNumber } from '../db';

interface ProductDevisBuilderProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

const ProductDevisBuilder: React.FC<ProductDevisBuilderProps> = ({ state, updateState, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [cart, setCart] = useState<Array<{ item: InventoryItem; quantity: number }>>([]);
  const [notes, setNotes] = useState('');

  // فحص حالة الزبون المختار (الديون)
  const selectedClient = state.clients.find(c => c.id === selectedClientId);
  const isBlocked = selectedClient?.isRedFlagged === true;

  // Calculations
  const subtotal = useMemo(() => 
    cart.reduce((acc, curr) => acc + (curr.item.sellingPrice * curr.quantity), 0)
  , [cart]);
  
  const tva = subtotal * 0.20;
  const total = subtotal + tva;

  const filteredInventory = state.inventory.filter(item => 
    (item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku?.toLowerCase().includes(search.toLowerCase())) &&
    item.quantity > 0
  );

  const addToCart = (product: InventoryItem) => {
    if (isBlocked) return; // منع الإضافة للسلة إذا كان محظوراً
    setCart(prev => {
      const existing = prev.find(p => p.item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev; 
        return prev.map(p => p.item.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { item: product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.item.id === id) {
        const newQty = Math.max(1, Math.min(p.item.quantity, p.quantity + delta));
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.item.id !== id));
  };

  const handleSaveDevis = () => {
    if (!selectedClientId) return alert('الرجاء اختيار زبون أولاً');
    if (isBlocked) return alert('🚨 عذراً، لا يمكن إصدار عرض ثمن لهذا الزبون لوجود ديون عالقة (Red Flag). يرجى تسوية الوضعية أولاً.');
    if (cart.length === 0) return alert('السلة فارغة');

    const devisCount = state.documents.filter(d => d.type === DocType.DEVIS).length;
    
    const lineItems: LineItem[] = cart.map(p => ({
      id: crypto.randomUUID(),
      inventoryId: p.item.id,
      description: p.item.name,
      quantity: p.quantity,
      unitPrice: p.item.sellingPrice,
      total: p.item.sellingPrice * p.quantity
    }));

    const newDoc: Document = {
      id: crypto.randomUUID(),
      clientId: selectedClientId,
      type: DocType.DEVIS,
      number: generateDocNumber(DocType.DEVIS, devisCount),
      date: new Date().toISOString().split('T')[0],
      items: lineItems,
      subtotal,
      tva: 20,
      total,
      status: 'Draft',
      notes: notes
    };

    updateState(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc],
      automationLogs: [{
         id: crypto.randomUUID(),
         timestamp: new Date().toISOString(),
         action: 'PRODUCT_DEVIS_CREATED',
         status: 'success',
         details: `تم إنشاء عرض ثمن سلع رقم ${newDoc.number} للزبون ${state.clients.find(c => c.id === selectedClientId)?.name}`
      }, ...(prev.automationLogs || [])]
    }));

    alert('تم حفظ عرض الثمن بنجاح');
    onNavigate('devis');
  };

  return (
    <div className="flex h-full bg-slate-50 font-arabic text-right overflow-hidden" dir="rtl">
      
      {/* Right Section: Inventory Explorer */}
      <div className="w-1/2 flex flex-col border-l border-slate-200 bg-white">
        <div className="p-8 border-b border-slate-100 space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <Package size={28} className="text-blue-600" /> مستودع السلع المتاحة
              </h2>
              <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">
                 {filteredInventory.length} صنف متوفر
              </span>
           </div>
           <div className="relative">
              <Search className="absolute right-4 top-3.5 text-slate-400" size={20} />
              <input 
                 className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                 placeholder="ابحث بالاسم أو رمز SKU..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className={`flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar ${isBlocked ? 'opacity-50 grayscale' : ''}`}>
           {filteredInventory.map(item => (
              <button 
                key={item.id}
                disabled={isBlocked}
                onClick={() => addToCart(item)}
                className="w-full bg-white border border-slate-100 p-5 rounded-[2rem] flex items-center justify-between hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all group disabled:cursor-not-allowed"
              >
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                       <Package size={24} />
                    </div>
                    <div className="text-right">
                       <p className="font-black text-slate-800 text-lg">{item.name}</p>
                       <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">SKU: {item.sku || 'N/A'}</p>
                       <div className="flex items-center gap-3 mt-2">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${item.quantity < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                             المتوفر: {item.quantity} {item.unit}
                          </span>
                       </div>
                    </div>
                 </div>
                 <div className="text-left">
                    <p className="text-xl font-black text-blue-600 font-mono">{item.sellingPrice.toLocaleString()} <span className="text-[10px]">DH</span></p>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">سعر الوحدة HT</span>
                 </div>
              </button>
           ))}
        </div>
      </div>

      {/* Left Section: Devis Builder / Cart */}
      <div className="w-1/2 flex flex-col bg-slate-50/50">
         <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Client Selection */}
            <div className={`bg-white p-6 rounded-[2.5rem] border-2 shadow-sm space-y-4 transition-all ${isBlocked ? 'border-red-500 bg-red-50 animate-pulse' : 'border-slate-200'}`}>
               <div className="flex justify-between items-center">
                  <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isBlocked ? 'text-red-600' : 'text-slate-400'}`}>
                     <User size={14} className={isBlocked ? 'text-red-600' : 'text-blue-500'} /> اختيار الزبون المستهدف
                  </h3>
                  {isBlocked && (
                    <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
                       <ShieldAlert size={12} /> الحساب محظور
                    </div>
                  )}
               </div>
               <select 
                  className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedClientId}
                  onChange={e => { setSelectedClientId(e.target.value); if(isBlocked) setCart([]); }}
               >
                  <option value="">-- اختر الزبون من القائمة --</option>
                  {state.clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.clientType === 'Company' ? 'شركة' : 'فرد'})</option>)}
               </select>

               {isBlocked && (
                 <div className="p-4 bg-white border border-red-200 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
                    <div className="p-3 bg-red-50 rounded-xl text-red-600"><AlertTriangle size={20} /></div>
                    <p className="text-[10px] font-bold text-red-800 leading-relaxed">
                       هذا الزبون لديه فواتير متأخرة لأكثر من 20 يوماً. النظام يمنع أي تعامل جديد حتى يتم تحصيل المبالغ العالقة.
                    </p>
                 </div>
               )}
            </div>

            {/* Cart Items */}
            <div className={`space-y-4 ${isBlocked ? 'opacity-40 pointer-events-none' : ''}`}>
               <div className="flex justify-between items-center px-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <ShoppingCart size={14} className="text-blue-500" /> بنود عرض الثمن
                  </h3>
                  <button onClick={() => setCart([])} className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase">مسح السلة</button>
               </div>
               
               {cart.length > 0 ? cart.map(entry => (
                  <div key={entry.item.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between animate-in slide-in-from-left-4">
                     <div className="flex items-center gap-4">
                        <button onClick={() => removeFromCart(entry.item.id)} className="text-slate-200 hover:text-red-500 transition-colors">
                           <Trash2 size={18} />
                        </button>
                        <div>
                           <p className="font-black text-slate-800 text-sm">{entry.item.name}</p>
                           <p className="text-[10px] text-blue-500 font-bold">{entry.item.sellingPrice.toLocaleString()} DH / للوحدة</p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                           <button onClick={() => updateQty(entry.item.id, -1)} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-600 shadow-sm transition-all"><Minus size={14}/></button>
                           <span className="w-10 text-center font-black text-slate-800">{entry.quantity}</span>
                           <button onClick={() => updateQty(entry.item.id, 1)} className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:bg-green-50 hover:text-green-600 shadow-sm transition-all"><Plus size={14}/></button>
                        </div>
                        <div className="text-left min-w-[80px]">
                           <p className="font-black text-slate-900 font-mono">{(entry.item.sellingPrice * entry.quantity).toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
               )) : (
                  <div className="py-20 text-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-white/50 space-y-4">
                     <ShoppingCart size={60} className="mx-auto text-slate-200" />
                     <p className="text-slate-400 font-black text-lg">بانتظار إضافة السلع...</p>
                  </div>
               )}
            </div>

            {/* Extra Notes */}
            <div className={`bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-3 ${isBlocked ? 'opacity-40 pointer-events-none' : ''}`}>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FilePlus2 size={14} className="text-blue-500" /> ملاحظات أو شروط إضافية
               </h3>
               <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold resize-none h-24 focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                  placeholder="مثال: هذا العرض صالح لمدة 15 يوماً، الدفع نقداً عند التسليم..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
               />
            </div>
         </div>

         {/* Summary & Save Action */}
         <div className="bg-slate-900 text-white p-10 space-y-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[4rem]">
            <div className="grid grid-cols-3 gap-10">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">المجموع (HT)</p>
                  <p className="text-2xl font-black font-mono">{subtotal.toLocaleString()} <span className="text-xs">DH</span></p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">الضريبة (TVA 20%)</p>
                  <p className="text-2xl font-black font-mono text-amber-400">{tva.toLocaleString()} <span className="text-xs">DH</span></p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">الإجمالي (TTC)</p>
                  <p className="text-3xl font-black font-mono text-green-400">{total.toLocaleString()} <span className="text-xs">DH</span></p>
               </div>
            </div>
            
            <button 
               disabled={isBlocked || cart.length === 0}
               onClick={handleSaveDevis}
               className={`w-full py-6 rounded-[2rem] font-black text-sm flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-2xl ${
                 isBlocked || cart.length === 0 
                 ? 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none' 
                 : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/30'
               }`}
            >
               {isBlocked ? <ShieldAlert size={24} /> : <Save size={24} />}
               {isBlocked ? 'العملية محظورة - ديون عالقة' : 'اعتماد عرض الثمن وإضافته للأرشيف'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default ProductDevisBuilder;
