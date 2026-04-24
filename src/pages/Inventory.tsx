import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Package, Plus, Trash2, Edit2, ShoppingCart, Loader2 } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

export function Inventory() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'product',
    price: 0,
    stock: 0,
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'inventory'));
    setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'inventory'), formData);
      setShowModal(false);
      setFormData({ name: '', type: 'product', price: 0, stock: 0, description: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter uppercase mb-4">INVENTORY.</h1>
          <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Logistics & Resource Control • Iron Core Protocol</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-lime-400 transition-all shadow-xl whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          + Añadir Item
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {items.map((item) => (
          <div key={item.id} className="bg-neutral-900 border border-neutral-800 p-10 group hover:border-lime-400 transition-all relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute -right-8 -top-8 p-4 opacity-0 group-hover:opacity-5 transition-all">
               {item.type === 'product' ? <ShoppingCart className="w-48 h-48" /> : <Package className="w-48 h-48" />}
            </div>

            <div className="absolute right-6 top-6 transition-all opacity-40 group-hover:opacity-100">
              <button 
                onClick={async () => {
                  if(confirm('Subject deletion protocol?')) {
                    await deleteDoc(doc(db, 'inventory', item.id));
                    fetchData();
                  }
                }}
                className="text-neutral-500 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-10 flex justify-between items-start relative z-10">
              <div className="w-14 h-14 bg-neutral-950 border-2 border-neutral-800 flex items-center justify-center text-neutral-500 group-hover:text-lime-400 group-hover:border-lime-400 transition-all">
                {item.type === 'product' ? <ShoppingCart className="w-7 h-7" /> : <Package className="w-7 h-7" />}
              </div>
              <span className="font-black text-[9px] uppercase px-4 py-2 bg-neutral-950 border border-neutral-800 text-neutral-500 tracking-[0.2em] group-hover:text-white transition-colors">{item.type}</span>
            </div>

            <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter italic group-hover:text-lime-400 transition-colors">{item.name}.</h3>
            <p className="text-neutral-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed mb-10 line-clamp-2">{item.description || 'NO METADATA AVAILABLE FOR THIS SPECIMEN'}</p>
            
            <div className="flex justify-between items-end border-t border-neutral-800 pt-8 mt-auto relative z-10">
              <div>
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1 italic">Value Unit</p>
                <p className="text-3xl font-black tracking-tighter">{formatCurrency(item.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1 italic">Quantity</p>
                <p className={cn(
                  "text-2xl font-black tracking-tighter transition-colors",
                  item.stock < 5 ? "text-red-500" : "group-hover:text-lime-400"
                )}>{item.stock}</p>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="col-span-full border-4 border-dashed border-neutral-900 p-32 text-center">
            <p className="text-neutral-700 font-black text-xs uppercase tracking-[0.4em] italic">Vault is currently depleted.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-xl bg-neutral-950 border-4 border-neutral-900 p-10 shadow-2xl overflow-hidden"
          >
            {/* Decorative Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-lime-400" />

            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-6xl font-black uppercase tracking-tighter italic leading-none mb-2">Item Entry.</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.4em]">Iron Core Supply Chain Protocol</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 border-2 border-neutral-800 text-neutral-400 hover:text-white transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Item Designation Name.</label>
                <input required className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-xl uppercase tracking-tighter outline-none focus:border-lime-400 transition-colors" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Classification.</label>
                  <select className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 transition-colors appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="product">Retail Product</option>
                    <option value="service">Utility Service</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Value (USD).</label>
                  <input type="number" required className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-xl tracking-tighter outline-none focus:border-lime-400 transition-colors" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Inventory Quantity.</label>
                <input type="number" required className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-xl tracking-tighter outline-none focus:border-lime-400 transition-colors" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Subject Description.</label>
                <textarea 
                  className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-bold text-sm tracking-widest uppercase outline-none focus:border-lime-400 min-h-[100px] transition-colors"
                  placeholder="ADD LOGISTICAL DETAILS..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-lime-400 transition-all shadow-2xl">Deploy to Stockroom</button>
                <p className="text-center text-[9px] font-black text-neutral-700 uppercase tracking-widest mt-6 italic">LOGISTICS PROTOCOL v1.0.9</p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
