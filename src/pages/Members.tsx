import React, { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, Plus, UserPlus, Filter, X, Check, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';

export function Members() {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    age: 20,
    planId: '',
    status: 'active'
  });

  const fetchData = async () => {
    setLoading(true);
    const membersSnap = await getDocs(collection(db, 'members'));
    setMembers(membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    const plansSnap = await getDocs(collection(db, 'plans'));
    const pData = plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPlans(pData);
    if (pData.length > 0 && !formData.planId) setFormData(prev => ({ ...prev, planId: pData[0].id }));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'members'), {
        ...formData,
        enrolledAt: new Date().toISOString(),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', gender: 'male', age: 20, planId: plans[0]?.id || '', status: 'active' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter uppercase mb-4">MEMBERS.</h1>
          <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Database Access • Active Session: {members.length}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-lime-400 transition-all shadow-xl whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          + Registrar Miembro
        </button>
      </header>

      {/* Tools Section */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-lime-400 transition-colors" />
          <input 
            type="text" 
            placeholder="BUSCAR IDENTIDAD EN BASE DE DATOS..."
            className="w-full bg-neutral-900 border border-neutral-800 px-14 py-5 font-bold text-[10px] uppercase tracking-widest text-white focus:border-white outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-8 py-5 border-2 border-white flex items-center justify-center gap-3 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Members Table */}
      <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-neutral-800 bg-neutral-950">
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">ID/Status</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Identidad / Contacto</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Protocolo Plan</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Demographics</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Enlistment</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-neutral-950/50 transition-colors group">
                  <td className="p-6 text-center w-24">
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-3 h-3 rounded-sm rotate-45 transition-all group-hover:scale-125",
                        member.status === 'active' ? "bg-lime-400 group-hover:shadow-[0_0_15px_rgba(163,230,53,0.5)]" : "bg-neutral-700"
                      )} />
                      <span className="font-mono text-[9px] text-neutral-600 uppercase tracking-tight font-bold">{member.id.substring(0, 6)}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-xl mb-1 tracking-tight group-hover:text-lime-400 transition-colors uppercase">{member.name}.</p>
                    <p className="font-bold text-[10px] text-neutral-500 uppercase tracking-widest">{member.email}</p>
                  </td>
                  <td className="p-6">
                    <span className="px-4 py-2 bg-neutral-950 border border-neutral-800 font-black text-[9px] uppercase tracking-widest text-neutral-400 group-hover:border-lime-400 group-hover:text-white transition-all">
                      {plans.find(p => p.id === member.planId)?.name || 'Sin Protocolo'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="font-black text-sm uppercase tracking-tighter italic">
                      {member.age}Y • {member.gender === 'male' ? 'ALPHA' : member.gender === 'female' ? 'BETA' : 'GAMMA'}
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-[10px] text-neutral-500 uppercase tracking-widest">{formatDate(member.enrolledAt)}</p>
                    <p className="text-[9px] font-black italic text-neutral-700 mt-1">RECORD VERIFIED</p>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 text-neutral-600 hover:text-white transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && !loading && (
          <div className="p-24 text-center border-t border-neutral-800">
            <UserPlus className="w-16 h-16 text-neutral-800 mx-auto mb-6" />
            <p className="font-black text-sm text-neutral-600 uppercase tracking-[0.3em] italic">No match found in current directory.</p>
          </div>
        )}
      </div>

      {/* Modal Registry */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-neutral-950 border-4 border-neutral-900 shadow-2xl p-10 overflow-hidden"
            >
              {/* Decorative Accent */}
              <div className="absolute top-0 left-0 w-full h-2 bg-lime-400" />
              
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="text-6xl font-black uppercase tracking-tighter leading-none mb-2 italic">Enlistment.</h3>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.4em]">Iron Core Protocol • Subject Entry</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 border-2 border-neutral-800 text-neutral-500 hover:text-white hover:border-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-3 italic">Subject Full Name.</label>
                    <input 
                      required
                      className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-bold text-xl uppercase tracking-tighter outline-none focus:border-lime-400 transition-colors"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-3 italic">Comm. Frequency (Email).</label>
                    <input 
                      type="email"
                      required
                      className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-bold text-sm outline-none focus:border-lime-400 transition-colors"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-3 italic">Direct Line.</label>
                    <input 
                      className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-bold text-sm tracking-[0.2em] outline-none focus:border-lime-400 transition-colors"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-3 italic">Identity Profile.</label>
                      <select 
                        className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 appearance-none transition-colors"
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value})}
                      >
                        <option value="male">Alpha (M)</option>
                        <option value="female">Beta (F)</option>
                        <option value="other">Gamma (X)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-3 italic">Cycle Age.</label>
                      <input 
                        type="number"
                        className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-sm outline-none focus:border-lime-400 transition-colors"
                        value={formData.age}
                        min={0}
                        onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-3 italic">Selected Program Protocol.</label>
                    <select 
                      className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 appearance-none transition-colors"
                      value={formData.planId}
                      onChange={e => setFormData({...formData, planId: e.target.value})}
                    >
                      {plans.map(p => (
                        <option key={p.id} value={p.id}>{p.name} • ${p.price}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-6">
                    <button 
                      type="submit"
                      className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-lime-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Initialize Enrollment
                    </button>
                    <p className="text-center text-[9px] font-black text-neutral-700 uppercase tracking-widest mt-4 italic">IRON CORE CORE SECURE REGISTRATION PANEL v4.2</p>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
