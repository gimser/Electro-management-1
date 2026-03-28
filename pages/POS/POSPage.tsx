import React, { useState, useMemo } from 'react';
import { AppState, InventoryItem, DocType, Document, LineItem } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingCart, Search, Package, Plus, Minus, Trash2, 
  User, Calculator, Save, X, Printer, CreditCard, Banknote,
  ScanBarcode, LayoutGrid, RotateCcw
} from 'lucide-react';
import { generateDocNumber, createRecord } from '../../db';

interface POSPageProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  onPrint: (doc: Document) => void;
}

const POSPage: React.FC<POSPageProps> = ({ state, updateState, onPrint }) => {
  const { user: authUser } = useAuth();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Array<{ item: InventoryItem; quantity: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card'>('Cash');

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set(state.inventory.map(i => i.category));
    return ['All', ...Array.from(cats)];
  }, [state.inventory]);

  // Filtering products
  const filteredProducts = useMemo(() => {
    return state.inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.inventory, search, selectedCategory]);

  // Cart Logic
  const addToCart = (product: InventoryItem) => {
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

  const subtotal = cart.reduce((acc, curr) => acc + (curr.item.sellingPrice * curr.quantity), 0);
  const total = subtotal; // Can add tax logic here if needed

  const handleCheckout = () => {
    if (cart.length === 0) return alert('السلة فارغة!');

    // Create Invoice (Receipt)
    const receiptCount = state.documents.filter(d => d.type === DocType.TICKET).length;
    const lineItems: LineItem[] = cart.map(p => ({
      id: crypto.randomUUID(),
      inventoryId: p.item.id,
      description: p.item.name,
      quantity: p.quantity,
      unitPrice: p.item.sellingPrice,
      total: p.item.sellingPrice * p.quantity
    }));

    const newDoc = createRecord<Document>({
      clientId: 'WALK_IN', // Default walk-in client
      type: DocType.TICKET,
      number: `TKT-${new Date().getFullYear()}-${(receiptCount + 1).toString().padStart(5, '0')}`,
      date: new Date().toISOString().split('T')[0],
      items: lineItems,
      subtotal,
      tvaAmount: 0,
      total,
      status: 'Paid',
      notes: `POS Sale - ${paymentMethod}`,
      paidAmount: total
    });

    // Update Inventory & State
    updateState(prev => {
      const newInventory = prev.inventory.map(invItem => {
        const cartItem = cart.find(c => c.item.id === invItem.id);
        if (cartItem) {
          return { ...invItem, quantity: invItem.quantity - cartItem.quantity };
        }
        return invItem;
      });

      return {
        ...prev,
        inventory: newInventory,
        documents: [...prev.documents, newDoc],
        activityLogs: [createRecord({
          userId: authUser?.id || 'cashier',
          username: authUser?.fullName || 'Cashier',
          action: 'POS_SALE',
          module: 'POS',
          timestamp: new Date().toISOString(),
          details: `بيع POS بقيمة ${total} DH (Ticket: ${newDoc.number})`,
          severity: 'Info'
        }), ...(prev.activityLogs || [])]
      };
    });

    onPrint(newDoc);
    setCart([]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-100 font-arabic text-right overflow-hidden" dir="rtl">
      
      {/* Left Section: Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
           <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-lg">
                 <Search className="absolute right-4 top-3.5 text-slate-400" size={20} />
                 <input 
                   className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="بحث بالباركود أو الاسم..."
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   autoFocus
                 />
                 <ScanBarcode className="absolute left-4 top-3.5 text-slate-400" size={20} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-xl custom-scrollbar">
                 {categories.map(cat => (
                    <button 
                       key={cat}
                       onClick={() => setSelectedCategory(cat)}
                       className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-200'}`}
                    >
                       {cat}
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                 <button 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.quantity <= 0}
                    className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all flex flex-col justify-between h-48 group disabled:opacity-50 disabled:cursor-not-allowed text-right relative overflow-hidden"
                 >
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right"></div>
                    <div>
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase">{product.category}</span>
                          <span className={`text-[10px] font-bold ${product.quantity < 5 ? 'text-red-500' : 'text-slate-400'}`}>x{product.quantity}</span>
                       </div>
                       <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{product.name}</h3>
                    </div>
                    <div>
                       <p className="text-xs text-slate-400 font-mono mb-1">{product.sku}</p>
                       <p className="text-xl font-black text-blue-600 font-mono">{product.sellingPrice} <span className="text-xs text-slate-400">DH</span></p>
                    </div>
                 </button>
              ))}
           </div>
        </div>
      </div>

      {/* Right Section: Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white border-r border-slate-200 flex flex-col shadow-2xl z-20">
         <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
            <h2 className="text-xl font-black flex items-center gap-2"><ShoppingCart /> سلة المبيعات</h2>
            <button onClick={() => setCart([])} className="bg-white/10 p-2 rounded-lg hover:bg-red-500 transition-colors"><RotateCcw size={18}/></button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                  <Package size={64} className="mb-4" />
                  <p className="font-bold">السلة فارغة</p>
                  <p className="text-xs">اضغط على المنتجات لإضافتها</p>
               </div>
            ) : (
               cart.map((item) => (
                  <div key={item.item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                     <div>
                        <h4 className="font-bold text-slate-800 text-xs mb-1 line-clamp-1">{item.item.name}</h4>
                        <p className="text-blue-600 font-black font-mono text-sm">{(item.item.sellingPrice * item.quantity).toLocaleString()} DH</p>
                     </div>
                     <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button onClick={() => updateQty(item.item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-red-500 font-bold">-</button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-green-500 font-bold">+</button>
                     </div>
                  </div>
               ))
            )}
         </div>

         <div className="p-6 bg-white border-t border-slate-200 space-y-4">
            <div className="flex justify-between items-center text-sm font-bold text-slate-500">
               <span>عدد المواد</span>
               <span>{cart.reduce((a, c) => a + c.quantity, 0)}</span>
            </div>
            <div className="flex justify-between items-end">
               <span className="text-lg font-black text-slate-800">الإجمالي (TTC)</span>
               <span className="text-3xl font-black text-blue-600 font-mono">{total.toLocaleString()} <span className="text-sm">DH</span></span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
               <button 
                  onClick={() => setPaymentMethod('Cash')}
                  className={`py-3 rounded-xl font-black flex items-center justify-center gap-2 border-2 transition-all ${paymentMethod === 'Cash' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
               >
                  <Banknote size={18} /> نقداً
               </button>
               <button 
                  onClick={() => setPaymentMethod('Card')}
                  className={`py-3 rounded-xl font-black flex items-center justify-center gap-2 border-2 transition-all ${paymentMethod === 'Card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
               >
                  <CreditCard size={18} /> بطاقة
               </button>
            </div>

            <button 
               onClick={handleCheckout}
               disabled={cart.length === 0}
               className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               <Printer size={24} /> إتمام وطباعة التذكرة
            </button>
         </div>
      </div>
    </div>
  );
};

export default POSPage;