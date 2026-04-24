import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { CreditCard, History, Search, Download, Plus, Filter, ArrowUpRight } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';

export function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    amount: 0,
    type: 'membership',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const paymentsSnap = await getDocs(query(collection(db, 'payments'), orderBy('date', 'desc'), limit(50)));
    setPayments(paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    const membersSnap = await getDocs(collection(db, 'members'));
    setMembers(membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'payments'), {
        ...formData,
        date: new Date().toISOString(),
        cashierId: auth.currentUser?.uid || 'anonymous'
      });
      setShowModal(false);
      setFormData({ memberId: '', amount: 0, type: 'membership', description: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter uppercase mb-4">PAYMENTS.</h1>
          <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Financial Integrity Panel • Iron Core Protocol</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-lime-400 transition-all shadow-xl whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          + Nueva Transacción
        </button>
      </header>

      {/* Metric strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Recaudado Hoy', value: formatCurrency(payments.filter(p => new Date(p.date).toDateString() === new Date().toDateString()).reduce((s, p) => s + p.amount, 0)), accent: true },
          { label: 'Transacciones Sesión', value: payments.length, accent: false },
          { label: 'Membresías Activas', value: members.filter(m => m.status === 'active').length, accent: false },
        ].map((metric, i) => (
          <div key={i} className={cn("border-l-4 pl-6 py-2 transition-all", metric.accent ? "border-lime-400" : "border-neutral-800")}>
            <p className="font-bold text-[10px] text-neutral-500 uppercase tracking-widest mb-1">{metric.label}</p>
            <p className={cn("text-5xl font-black tracking-tight", metric.label === 'Membresías Activas' && "text-lime-400")}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="p-8 border-b-2 border-neutral-800 bg-neutral-950 flex justify-between items-center">
          <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-4 italic font-sans">
            <History className="w-4 h-4" /> RECENT TRANSACTION HISTORY
          </h3>
          <button className="p-2 border border-neutral-800 text-neutral-500 hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950">
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Timestamp</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Identidad Miembro</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Concept</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Volume (Price)</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Status / Auth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-neutral-950/50 transition-colors group">
                  <td className="p-6 font-bold text-[10px] uppercase text-neutral-500 tracking-widest">{formatDate(payment.date)}</td>
                  <td className="p-6">
                    <p className="text-xl font-black uppercase tracking-tight group-hover:text-lime-400 transition-colors italic">
                      {members.find(m => m.id === payment.memberId)?.name || 'Anónimo'}
                    </p>
                    <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1">ID: {payment.memberId.substring(0, 12)}</p>
                  </td>
                  <td className="p-6">
                    <span className={cn(
                      "px-3 py-1 bg-neutral-950 border border-neutral-800 font-black text-[9px] uppercase tracking-widest",
                      payment.type === 'membership' ? "text-lime-400 border-lime-400/20" : "text-neutral-500"
                    )}>
                      {payment.type}
                    </span>
                  </td>
                  <td className="p-6 font-black text-2xl tracking-tighter">{formatCurrency(payment.amount)}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border border-lime-400 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                      </div>
                      <span className="font-black text-[10px] text-neutral-400 uppercase tracking-widest">Verified Transaction</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="p-24 text-center border-t border-neutral-800">
            <CreditCard className="w-16 h-16 text-neutral-800 mx-auto mb-6" />
            <p className="font-black text-xs text-neutral-600 uppercase tracking-widest italic">No transaction records found in ledger.</p>
          </div>
        )}
      </div>

      {/* Modal Payment */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-xl bg-neutral-950 border-4 border-neutral-900 p-10 shadow-2xl overflow-hidden"
          >
            {/* Decorative Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-lime-400" />

            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-6xl font-black uppercase tracking-tighter italic leading-none mb-2">Checkout.</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.4em]">Iron Core Secure Payment v2.1</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 border-2 border-neutral-800 text-neutral-400 hover:text-white transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-10">
              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Identify Payer Instance.</label>
                <select 
                  required
                  className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 transition-colors appearance-none"
                  value={formData.memberId}
                  onChange={e => setFormData({...formData, memberId: e.target.value})}
                >
                  <option value="">Select Member Identity...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} • {m.email}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Volume (USD Amount).</label>
                  <input 
                    type="number"
                    required
                    className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-xl tracking-tighter outline-none focus:border-lime-400 transition-colors"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Ledger Category.</label>
                  <select 
                    className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 transition-colors appearance-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="membership">Membership Program</option>
                    <option value="product">Retail Inventory</option>
                    <option value="service">Personal Tuning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Transaction Annotations.</label>
                <textarea 
                  className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-bold text-sm tracking-widest uppercase outline-none focus:border-lime-400 min-h-[100px] transition-colors"
                  placeholder="ADD ANY RELEVANT METADATA..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-lime-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-white/5"
                >
                  Initialize Transaction
                </button>
                <p className="text-center text-[9px] font-black text-neutral-700 uppercase tracking-widest mt-6">AUTHORIZED TERMINAL: {auth.currentUser?.uid?.substring(0, 8) || 'SYSTEM_CORE'}</p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
