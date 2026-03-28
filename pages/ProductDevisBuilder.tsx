import React, { useState, useMemo } from 'react';
import { AppState, InventoryItem, DocType, Document, LineItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCart, Search, Package, Plus, Minus, Trash2, 
  User, Calculator, Save, X, ArrowLeft,
  CheckCircle2, AlertCircle, FilePlus2,
  Tag, ShieldAlert, AlertTriangle
} from 'lucide-react';
import { generateDocNumber, createRecord } from '../db';

interface ProductDevisBuilderProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onNavigate: (tab: string) => void;
}

const ProductDevisBuilder: React.FC<ProductDevisBuilderProps> = ({ state, updateState, onNavigate }) => {
  const { user: authUser } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [cart, setCart] = useState<Array<{ item: InventoryItem; quantity: number }>>([]);
  const [notes, setNotes] = useState('');

  const selectedClient = state.clients.find(c => c.id === selectedClientId);
  const isBlocked = selectedClient?.isRedFlagged === true;

  const subtotal = useMemo(() => 
    cart.reduce((acc, curr) => acc + (curr.item.sellingPrice * curr.quantity), 0)
  , [cart]);
  
  const total = subtotal;

  const filteredInventory = state.inventory.filter(item => 
    (item.name.toLowerCase().includes(search.toLowerCase()) || 
    (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()))) &&
    item.quantity > 0
  );

  const addToCart = (product: InventoryItem) => {
    if (isBlocked) return; 
    setCart(prev => {
      const existing = prev.find(p => p.item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert('الكمية المطلوبة تتجاوز المتاح في المخزن');
          return prev;
        }
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
    if (isBlocked) return alert('هذا الزبون محظور إدارياً لوجود ديون عالقة.');
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

    const newDoc = createRecord<Document>({
      clientId: selectedClientId,
      type: DocType.DEVIS,
      number: generateDocNumber(DocType.DEVIS, devisCount),
      date: new Date().toISOString().split('T')[0],
      items: lineItems,
      subtotal,
      tvaAmount: 0,
      total,
      status: 'Draft',
      notes: notes
    });

    updateState(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc],
      automationLogs: [createRecord({
         action: 'PRODUCT_DEVIS_CREATED',
         status: 'success',
         details: `تم إنشاء عرض ثمن سلع رقم ${newDoc.number} للزبون ${state.clients.find(c => c.id === selectedClientId)?.name}`,
         // manual filler for other BaseEntity fields
         timestamp: new Date().toISOString(),
         username: authUser?.fullName || 'System'
      }), ...(prev.automationLogs || [])]
    }));

    alert('تم حفظ عرض الثمن بنجاح');
    onNavigate('devis-archive');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-50 font-arabic text-right overflow-hidden" dir="rtl">
      
      {/* Right Section: Inventory Explorer */}
      <div className="w-full lg:w-1/2 flex flex-col border-l border-slate-200 bg-white">
        <div className="p-8 border-b border-slate-100 space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <Package size={28} className="text-blue-600" /> مستكشف السلع المتوفرة
              </h2>
           </div>
           
           <div className="relative">
              <Search className="absolute right-4 top-3 text-slate-400" size={20} />
              <input 
                className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold shadow-inner outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="البحث في المخزن..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
           {filteredInventory.map(product => (
              <div key={product.id} className="bg-white border-2 border-slate-50 p-6 rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all group flex justify-between items-center">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                       <Package size={30} />
                    </div>
                    <div>
                       <h3 className="font-black text-slate-800 text-lg">{product.name}</h3>
                       <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{product.category}</span>
                          <span className="text-[10px] text-slate-400">متاح: {product.quantity}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="text-left flex items-center gap-6">
                    <p className="text-xl font-black text-slate-900 font-mono">{product.sellingPrice.toLocaleString()} DH</p>
                    <button 
                       onClick={() => addToCart(product)}
                       disabled={isBlocked}
                       className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg active:scale-90 disabled:opacity-50"
                    >
                       <Plus size={24} />
                    </button>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Left Section: Cart */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-900 text-white">
         <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-2xl font-black">سلة عرض الثمن</h2>
            <button onClick={() => setCart([])} className="text-slate-500 hover:text-red-400 text-xs font-black">إفراغ السلة</button>
         </div>

         <div className="p-8 border-b border-white/5">
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">اختيار الزبون</label>
            <select 
               className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
               value={selectedClientId}
               onChange={e => setSelectedClientId(e.target.value)}
            >
               <option value="" className="text-slate-900">-- اختر زبوناً --</option>
               {state.clients.map(c => <option key={c.id} value={c.id} className="text-slate-900">{c.name}</option>)}
            </select>
         </div>

         <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
            {cart.map(item => (
               <div key={item.item.id} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <button onClick={() => removeFromCart(item.item.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={18}/></button>
                     <div>
                        <h4 className="font-black text-sm">{item.item.name}</h4>
                        <p className="text-[10px] text-blue-400">{item.item.sellingPrice.toLocaleString()} DH</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <button onClick={() => updateQty(item.item.id, -1)} className="w-8 h-8 rounded-xl bg-white/5">-</button>
                     <span className="font-black w-6 text-center">{item.quantity}</span>
                     <button onClick={() => updateQty(item.item.id, 1)} className="w-8 h-8 rounded-xl bg-white/5">+</button>
                  </div>
               </div>
            ))}
         </div>

         <div className="p-10 bg-slate-900 border-t border-white/10 space-y-8 shrink-0">
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">المبلغ الإجمالي</p>
                  <p className="text-4xl font-black text-blue-500 font-mono tracking-tighter">{total.toLocaleString()} <span className="text-lg">DH</span></p>
               </div>
               <button 
                  onClick={handleSaveDevis}
                  disabled={cart.length === 0 || !selectedClientId}
                  className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-2xl hover:bg-blue-500 transition-all flex items-center gap-3 disabled:opacity-30"
               >
                  <Save size={24} /> حفظ عرض الثمن
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProductDevisBuilder;